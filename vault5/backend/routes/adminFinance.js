const express = require('express');
const { protect } = require('../middleware/auth');
const { requireFinanceAdmin } = require('../middleware/rbac');
const { Transaction, User } = require('../models');
const { allocateIncome } = require('../controllers/accountsController');

const router = express.Router();

// Require authentication then finance admin access
router.use(protect);
router.use(requireFinanceAdmin);

// GET /api/admin/finance/health - simple readiness check
router.get('/health', (req, res) => {
  res.json({ success: true, service: 'finance', role: req.user.role });
});

// POST /api/admin/finance/credit-income
// Admin-only utility to credit income to a user by email and run the allocation engine.
// Body: { email: string, amount: number, currency?: 'KES', description?: string, tag?: string, category?: string }
router.post('/credit-income', async (req, res) => {
  try {
    const {
      email,
      amount,
      currency = 'KES',
      description = 'Admin credit via finance endpoint',
      tag = 'admin_credit',
      category = 'Admin'
    } = req.body || {};

    if (!email || !String(email).trim()) {
      return res.status(400).json({ success: false, message: 'Target user email is required' });
    }
    const amt = Number(amount);
    if (!(amt > 0)) {
      return res.status(400).json({ success: false, message: 'Valid positive amount is required' });
    }

    // Find by primary emails[] first, then legacy email field
    const emailLower = String(email).toLowerCase();
    let user = await User.findOne({ 'emails.email': emailLower });
    if (!user) {
      user = await User.findOne({ email: emailLower });
    }
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found by email' });
    }

    // Create an income transaction record for the target user
    const tx = new Transaction({
      user: user._id,
      type: 'income',
      amount: amt,
      description,
      date: new Date(),
      tag
      // fraudRisk left to defaults; this is an internal admin credit
    });
    await tx.save();

    // Invoke allocation engine to distribute funds across user accounts
    try {
      await allocateIncome(user._id, amt, description, category);
    } catch (e) {
      // Do not fail the credit if allocation fails; report back so admin can reconcile
      console.error('Admin credit allocation failed:', e);
      return res.status(201).json({
        success: true,
        message: 'Income transaction created; allocation failed - requires follow-up',
        user: { id: user._id, email: emailLower, name: user.name },
        transactionId: tx._id,
        amount: amt,
        currency,
        allocation: { success: false, error: e.message }
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Income credited and allocated successfully',
      user: { id: user._id, email: emailLower, name: user.name },
      transactionId: tx._id,
      amount: amt,
      currency
    });
  } catch (error) {
    console.error('Admin credit error:', error);
    return res.status(500).json({ success: false, message: 'Failed to credit income', error: error.message });
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