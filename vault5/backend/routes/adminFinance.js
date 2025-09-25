const express = require('express');
const { protect } = require('../middleware/auth');
const { requireFinanceAdmin } = require('../middleware/rbac');
const { Transaction, User, Account } = require('../models');
const { allocateIncome } = require('../controllers/accountsController');
const { generateNotification } = require('../controllers/notificationsController');
const { generateUniqueTransactionCode } = require('../utils/txCode');

const router = express.Router();

// Require authentication then finance admin access
router.use(protect);
router.use(requireFinanceAdmin);

// GET /api/admin/finance/health - simple readiness check
router.get('/health', (req, res) => {
  res.json({ success: true, service: 'finance', role: req.user.role });
});

// GET /api/admin/finance/users?q= - lightweight user search for finance ops
router.get('/users', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim().toLowerCase();
    if (!q) return res.json([]);

    const users = await User.find({
      $or: [
        { 'emails.email': { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } }
      ]
    })
      .select('_id name email emails role accountStatus isActive createdAt')
      .limit(20)
      .lean();

    res.json(users);
  } catch (e) {
    console.error('Finance users search error:', e);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
});

// POST /api/admin/finance/credit-income
// Admin utility to credit income to a user by email and optionally run allocation engine.
// Body: {
//   email: string,
//   amount: number,
//   currency?: 'KES',
//   description?: string,
//   tag?: string,
//   target?: 'auto' | 'wallet',
//   accountId?: string
// }
router.post('/credit-income', async (req, res) => {
  try {
    const {
      email,
      amount,
      currency = 'KES',
      description = 'Admin credit via finance endpoint',
      tag = 'admin_credit',
      target = 'auto',
      accountId
    } = req.body || {};

    if (!email || !String(email).trim()) {
      return res.status(400).json({ success: false, message: 'Target user email is required' });
    }
    const amt = Number(amount);
    if (!(amt > 0)) {
      return res.status(400).json({ success: false, message: 'Valid positive amount is required' });
    }

    const emailLower = String(email).toLowerCase();
    let user = await User.findOne({ 'emails.email': emailLower });
    if (!user) user = await User.findOne({ email: emailLower });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found by email' });
    }

    // Generate M-Pesa-like transaction code
    const txCode = await generateUniqueTransactionCode(Transaction, 10);

    // Allocate income (auto or wallet/account)
    const result = await allocateIncome(
      user._id,
      amt,
      description,
      tag,
      { target, accountId, currency, transactionCode: txCode }
    );

    const tx = result?.mainTransaction;
    const balance = result?.currentBalance;

    // Compose notification "money received"
    const senderName = req.user?.name || req.user?.email || 'Vault5 Finance';
    const message = `Congrats! You have received ${currency} ${amt.toFixed(2)} from ${senderName} on ${new Date().toLocaleString()}. New vault balance is ${currency} ${(balance ?? 0).toFixed(2)}. Transaction ID ${txCode}.`;

    await generateNotification(
      user._id,
      'money_received',
      'Funds Received',
      message,
      tx?._id || user._id,
      'low',
      {
        amount: amt,
        currency,
        sender: senderName,
        transactionCode: txCode,
        balanceAfter: balance,
        target,
        accountId: accountId || null
      }
    );

    return res.status(201).json({
      success: true,
      message: 'Income credited and allocated successfully',
      user: { id: user._id, email: emailLower, name: user.name },
      transactionId: tx?._id || null,
      transactionCode: txCode,
      amount: amt,
      currency,
      balanceAfter: balance,
      allocations: result?.allocations || []
    });
  } catch (error) {
    console.error('Admin credit error:', error);
    return res.status(500).json({ success: false, message: 'Failed to credit income', error: error.message });
  }
});

// POST /api/admin/finance/debit
// Decrease funds from a user's wallet/Daily account with a debit transaction.
// Body: { email: string, amount: number, currency?: 'KES', description?: string, target?: 'wallet' | 'account', accountId?: string }
router.post('/debit', async (req, res) => {
  try {
    const {
      email,
      amount,
      currency = 'KES',
      description = 'Admin debit via finance endpoint',
      target = 'wallet',
      accountId
    } = req.body || {};

    if (!email || !String(email).trim()) {
      return res.status(400).json({ success: false, message: 'Target user email is required' });
    }
    const amt = Number(amount);
    if (!(amt > 0)) {
      return res.status(400).json({ success: false, message: 'Valid positive amount is required' });
    }

    const emailLower = String(email).toLowerCase();
    let user = await User.findOne({ 'emails.email': emailLower });
    if (!user) user = await User.findOne({ email: emailLower });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found by email' });
    }

    // Pick an account to debit: explicit accountId -> wallet -> Daily -> first
    let targetAccount = null;
    const userAccounts = await Account.find({ user: user._id });
    if (accountId) {
      targetAccount = userAccounts.find(a => String(a._id) === String(accountId));
    }
    if (!targetAccount) {
      targetAccount = userAccounts.find(a => a.isWallet === true) || null;
    }
    if (!targetAccount) {
      targetAccount = userAccounts.find(a => a.type === 'Daily') || userAccounts[0] || null;
    }
    if (!targetAccount) {
      return res.status(400).json({ success: false, message: 'No accounts available for debit' });
    }

    if (targetAccount.balance < amt) {
      return res.status(400).json({ success: false, message: 'Insufficient balance on target account' });
    }

    targetAccount.balance = parseFloat((targetAccount.balance - amt).toFixed(2));
    await targetAccount.save();

    // Generate M-Pesa-like transaction code
    const txCode = await generateUniqueTransactionCode(Transaction, 10);

    // Create expense transaction
    const expenseTx = new Transaction({
      user: user._id,
      amount: amt,
      type: 'expense',
      description: `${description} - debited from ${targetAccount.type}`,
      currency,
      transactionCode: txCode,
      allocations: [{ account: targetAccount._id, amount: amt }]
    });

    // Compute total balance after debit
    const allAccs = await Account.find({ user: user._id }, 'balance');
    const totalBalance = allAccs.reduce((s, a) => s + (a.balance || 0), 0);
    expenseTx.balanceAfter = totalBalance;
    await expenseTx.save();

    // Optional: notify user of debit (can be toggled later)
    await generateNotification(
      user._id,
      'money_debited',
      'Funds Debited',
      `${currency} ${amt.toFixed(2)} was debited from your ${targetAccount.type} by Vault5 Finance. Tx: ${txCode}.`,
      expenseTx._id,
      'medium',
      { amount: amt, currency, transactionCode: txCode, balanceAfter: totalBalance, accountId: targetAccount._id }
    );

    return res.status(201).json({
      success: true,
      message: 'Funds debited successfully',
      user: { id: user._id, email: emailLower, name: user.name },
      transactionId: expenseTx._id,
      transactionCode: txCode,
      amount: amt,
      currency,
      balanceAfter: totalBalance,
      account: { id: targetAccount._id, type: targetAccount.type }
    });
  } catch (error) {
    console.error('Admin debit error:', error);
    return res.status(500).json({ success: false, message: 'Failed to debit funds', error: error.message });
  }
});

// Placeholder endpoints (stubs) - to be implemented with real controllers
// Approvals queue
router.get('/approvals', (req, res) => {
  res.json({ success: true, data: [], message: 'Approvals queue (stub)' });
});

// Disbursement queue
router.get('/disbursements', (req, res) => {
  res.json({ success: true, data: [], message: 'Disbursement queue (stub)' });
});

// Adjust interest/penalties within policy (stub)
router.post('/policy', (req, res) => {
  res.json({ success: true, message: 'Finance policy update (stub)' });
});

module.exports = router;