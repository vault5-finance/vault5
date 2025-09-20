const mongoose = require('mongoose');
const { Account, Transaction, User } = require('../models');
const PaymentIntent = require('../models/PaymentIntent');
const { allocateIncome } = require('./accountsController');

// Utility: build safe public response
function toPublic(intent) {
  return intent.toPublicJSON ? intent.toPublicJSON() : {
    id: String(intent._id),
    type: intent.type,
    amount: intent.amount,
    currency: intent.currency,
    targetAccount: intent.targetAccount,
    provider: intent.provider,
    status: intent.status,
    providerRef: intent.providerRef || null,
    createdAt: intent.createdAt,
    updatedAt: intent.updatedAt,
  };
}

// Helper: finalize successful deposit -> create Transaction + run allocation
async function finalizeDeposit(intent) {
  // Idempotency: if we've already processed success (e.g., allocation marker), skip
  // Using providerMeta.processedAt as basic marker
  if (intent.providerMeta && intent.providerMeta.processedAt) return;

  // Create allocation via existing allocateIncome service
  const userId = intent.user;
  const amount = intent.amount;
  const description = `Deposit via ${intent.provider.toUpperCase()}`;

  // Determine target
  const options = {};
  if (intent.targetAccount === 'wallet') {
    options.target = 'wallet';
  } else if (intent.targetAccount) {
    // Assume this is an Account _id string
    options.accountId = intent.targetAccount;
  } else {
    options.target = 'auto';
  }

  try {
    await allocateIncome(userId, amount, description, '', options);
  } catch (e) {
    // Allocation failure should not roll back payment success
    console.error('Deposit allocation failed:', e.message);
  }

  // Mark processed in providerMeta
  intent.providerMeta = Object.assign({}, intent.providerMeta, { processedAt: new Date().toISOString() });
  await intent.save();
}

// POST /api/payments/deposits/initiate
// body: { provider, amount, currency, targetAccount, phone }
async function initiateDeposit(req, res) {
  try {
    const userId = req.user._id;
    const {
      provider = 'mpesa',
      amount,
      currency = 'KES',
      targetAccount = 'wallet',
      phone = ''
    } = req.body || {};

    if (!(amount > 0)) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }

    const allowedProviders = ['mpesa', 'airtel', 'bank', 'simulation'];
    if (!allowedProviders.includes(provider)) {
      return res.status(400).json({ success: false, message: 'Invalid provider' });
    }

    // Validate account target if not 'wallet'
    if (targetAccount !== 'wallet') {
      if (!mongoose.Types.ObjectId.isValid(targetAccount)) {
        return res.status(400).json({ success: false, message: 'Invalid target account' });
      }
      const acct = await Account.findOne({ _id: targetAccount, user: userId }).select('_id');
      if (!acct) {
        return res.status(404).json({ success: false, message: 'Target account not found' });
      }
    }

    // Determine effective provider in dev: if mpesa/airtel selected but no keys or sandbox, we still proceed
    let effectiveProvider = provider;
    if (process.env.NODE_ENV !== 'production') {
      // Allow forced simulation via env
      if (process.env.PAYMENTS_FORCE_SIMULATION === 'true') {
        effectiveProvider = 'simulation';
      }
    }

    const intent = await PaymentIntent.create({
      user: userId,
      type: 'deposit',
      amount,
      currency,
      targetAccount,
      provider: effectiveProvider,
      status: 'awaiting_user',
      phone: phone || undefined,
      providerMeta: {
        initiatedAt: new Date().toISOString(),
        requestedProvider: provider,
        env: process.env.MPESA_ENV || process.env.AIRTEL_ENV || process.env.NODE_ENV || 'development'
      }
    });

    // Create a providerRef (for simulation now; for mpesa later from CheckoutRequestID)
    if (!intent.providerRef) {
      intent.providerRef = `${effectiveProvider}_${String(intent._id)}`;
      await intent.save();
    }

    // Optional: auto-complete in dev to simulate callbacks
    const auto = (process.env.SIMULATE_AUTO_CONFIRM || 'true').toLowerCase() !== 'false';
    if (effectiveProvider === 'simulation' && auto) {
      const delayMs = Number(process.env.SIMULATE_SUCCESS_DELAY_MS || 6000);
      setTimeout(async () => {
        try {
          // Re-read latest status to avoid double transitions
          const latest = await PaymentIntent.findById(intent._id);
          if (!latest || latest.status !== 'awaiting_user') return;
          latest.status = 'success';
          latest.providerMeta = Object.assign({}, latest.providerMeta, { autoConfirmedAt: new Date().toISOString() });
          await latest.save();
          await finalizeDeposit(latest);
        } catch (e) {
          console.error('Auto confirm simulation error:', e.message);
        }
      }, delayMs);
    }

    return res.status(201).json({ success: true, data: toPublic(intent), message: 'Deposit initiated. Complete the prompt on your phone if applicable.' });
  } catch (e) {
    console.error('initiateDeposit error:', e);
    return res.status(500).json({ success: false, message: 'Failed to initiate deposit' });
  }
}

// POST /api/payments/deposits/confirm (dev utility)
// body: { id } or { providerRef }
async function confirmDeposit(req, res) {
  try {
    const userId = req.user._id;
    const { id, providerRef } = req.body || {};
    if (!id && !providerRef) {
      return res.status(400).json({ success: false, message: 'id or providerRef is required' });
    }
    const q = id ? { _id: id, user: userId } : { providerRef, user: userId };
    const intent = await PaymentIntent.findOne(q);
    if (!intent) {
      return res.status(404).json({ success: false, message: 'Payment intent not found' });
    }
    if (intent.status === 'success') {
      return res.json({ success: true, data: toPublic(intent), message: 'Deposit already confirmed' });
    }
    if (intent.type !== 'deposit') {
      return res.status(400).json({ success: false, message: 'Only deposit intents can be confirmed here' });
    }
    // Transition to success and run allocation
    intent.status = 'success';
    intent.providerMeta = Object.assign({}, intent.providerMeta, { manualConfirmedAt: new Date().toISOString() });
    await intent.save();
    await finalizeDeposit(intent);

    return res.json({ success: true, data: toPublic(intent), message: 'Deposit confirmed' });
  } catch (e) {
    console.error('confirmDeposit error:', e);
    return res.status(500).json({ success: false, message: 'Failed to confirm deposit' });
  }
}

// POST /api/payments/providers/mpesa/callback
// Accept Daraja STK callback and update intent
async function mpesaCallback(req, res) {
  try {
    const body = req.body || {};
    const stk = body.Body?.stkCallback;
    if (!stk) {
      return res.status(400).json({ success: false, message: 'Invalid callback payload' });
    }
    const providerRef = stk.CheckoutRequestID || stk.MerchantRequestID;
    if (!providerRef) {
      return res.status(400).json({ success: false, message: 'Missing providerRef' });
    }
    const intent = await PaymentIntent.findOne({ providerRef });
    if (!intent) {
      // Accept and 200 to avoid retry storms; log only
      console.warn('mpesaCallback: intent not found for ref', providerRef);
      return res.json({ success: true });
    }
    // Determine status
    const resultCode = Number(stk.ResultCode);
    if (resultCode === 0) {
      intent.status = 'success';
    } else {
      intent.status = 'failed';
      intent.error = stk.ResultDesc || 'Payment failed';
    }
    // Persist provider metadata
    intent.providerMeta = Object.assign({}, intent.providerMeta, { stkCallback: stk });
    await intent.save();

    if (intent.status === 'success') {
      await finalizeDeposit(intent);
    }

    return res.json({ success: true });
  } catch (e) {
    console.error('mpesaCallback error:', e);
    return res.status(200).json({ success: true }); // Always 200 for provider
  }
}

// POST /api/payments/providers/airtel/callback
async function airtelCallback(req, res) {
  try {
    // Accept any payload in dev; store for audit
    const { providerRef } = req.query; // some providers pass ref in query
    const payload = req.body || {};
    if (!providerRef) {
      return res.status(400).json({ success: false, message: 'Missing providerRef' });
    }
    const intent = await PaymentIntent.findOne({ providerRef });
    if (!intent) {
      console.warn('airtelCallback: intent not found for ref', providerRef);
      return res.json({ success: true });
    }
    // Here we assume success in dev
    intent.status = 'success';
    intent.providerMeta = Object.assign({}, intent.providerMeta, { airtelCallback: payload });
    await intent.save();
    await finalizeDeposit(intent);
    return res.json({ success: true });
  } catch (e) {
    console.error('airtelCallback error:', e);
    return res.status(200).json({ success: true });
  }
}

// GET /api/payments/transactions/:id/status
async function getStatus(req, res) {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const intent = await PaymentIntent.findOne({ _id: id, user: userId });
    if (!intent) {
      return res.status(404).json({ success: false, message: 'Payment intent not found' });
    }
    return res.json({ success: true, data: toPublic(intent) });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to get status' });
  }
}

// GET /api/payments/recent
async function listRecent(req, res) {
  try {
    const userId = req.user._id;
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      PaymentIntent.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      PaymentIntent.countDocuments({ user: userId })
    ]);

    return res.json({
      success: true,
      data: items.map(toPublic),
      pagination: {
        page, limit, total, pages: Math.max(1, Math.ceil(total / limit))
      }
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to list payments' });
  }
}

module.exports = {
  initiateDeposit,
  confirmDeposit,
  mpesaCallback,
  airtelCallback,
  getStatus,
  listRecent,
};