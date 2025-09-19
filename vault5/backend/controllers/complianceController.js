const { User, ReserveHold, PayoutRequest, KycRequest } = require('../models');

// GET /api/compliance/status
// Returns limitation status, countdowns, reserve info, payout eligibility
const getComplianceStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      'limitationStatus limitationReason limitationExpiresAt reserveReleaseAt kycLevel'
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    let countdownMs = null;
    if (['temporary_30', 'temporary_180'].includes(user.limitationStatus) && user.limitationExpiresAt) {
      countdownMs = Math.max(0, user.limitationExpiresAt.getTime() - Date.now());
    }

    // Active reserves
    const now = new Date();
    const activeReserves = await ReserveHold.find({
      user: user._id,
      status: 'active',
    }).sort({ createdAt: 1 });

    const totalReserve = activeReserves.reduce((sum, r) => sum + (r.amount || 0), 0);

    const payoutEligible =
      (user.limitationStatus === 'temporary_180' || user.limitationStatus === 'permanent') &&
      user.reserveReleaseAt &&
      user.reserveReleaseAt.getTime() <= Date.now();

    res.json({
      success: true,
      data: {
        limitation: {
          status: user.limitationStatus,
          reason: user.limitationReason || '',
          countdownMs,
          reserveReleaseAt: user.reserveReleaseAt || null,
        },
        kycLevel: user.kycLevel || 'Tier0',
        reserves: {
          count: activeReserves.length,
          totalAmount: totalReserve,
          items: activeReserves.map((r) => ({
            id: r._id,
            amount: r.amount,
            currency: r.currency,
            releaseAt: r.releaseAt,
            status: r.status,
            createdAt: r.createdAt,
          })),
        },
        payoutEligible,
        serverTime: now,
      },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// POST /api/compliance/kyc
// Body: { levelRequested: 'Tier1'|'Tier2', documents: [{ type, url }] }
const submitKycRequest = async (req, res) => {
  try {
    const { levelRequested, documents } = req.body || {};
    if (!['Tier1', 'Tier2'].includes(levelRequested)) {
      return res.status(400).json({ message: 'Invalid KYC level requested' });
    }
    if (!Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ message: 'At least one document is required' });
    }

    const kyc = await KycRequest.create({
      user: req.user._id,
      levelRequested,
      documents: documents.map((d) => ({
        type: d.type,
        url: d.url,
        status: 'uploaded',
      })),
      status: 'pending',
    });

    res.status(201).json({ success: true, message: 'KYC submitted', data: kyc });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET /api/compliance/kyc
// List current user's KYC requests
const listMyKycRequests = async (req, res) => {
  try {
    const items = await KycRequest.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// POST /api/compliance/payouts
// Body: { amount, currency, destination: { bankName, accountName, accountNumber, bankCode? } }
// Validates eligibility basic checks; admin approval still required to pay
const requestPayout = async (req, res) => {
  try {
    const { amount, currency, destination } = req.body || {};
    if (!(amount > 0)) return res.status(400).json({ message: 'Valid amount required' });
    if (!destination || !destination.bankName || !destination.accountName || !destination.accountNumber) {
      return res.status(400).json({ message: 'Destination bank details are required' });
    }

    const user = await User.findById(req.user._id).select(
      'limitationStatus reserveReleaseAt'
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    const limited = ['temporary_180', 'permanent'].includes(user.limitationStatus);
    if (!limited) {
      return res.status(403).json({ message: 'Payouts are only allowed for limited accounts after the reserve period' });
    }
    if (!user.reserveReleaseAt || user.reserveReleaseAt.getTime() > Date.now()) {
      return res.status(403).json({ message: 'Reserve period not yet elapsed' });
    }

    // Optional: ensure available reserves cover requested amount
    const reserves = await ReserveHold.find({ user: user._id, status: 'active' });
    const totalActive = reserves.reduce((s, r) => s + (r.amount || 0), 0);
    if (amount > totalActive) {
      return res.status(400).json({ message: 'Requested amount exceeds available reserves' });
    }

    const payout = await PayoutRequest.create({
      user: user._id,
      amount,
      currency: currency || 'KES',
      destination,
      status: 'pending',
    });

    res.status(201).json({ success: true, message: 'Payout request submitted for review', data: payout });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = {
  getComplianceStatus,
  submitKycRequest,
  listMyKycRequests,
  requestPayout,
};