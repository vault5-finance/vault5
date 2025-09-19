const express = require('express');
const { protect } = require('../middleware/auth');
const { requireComplianceAdmin } = require('../middleware/rbac');
const { getAuditLogs, getAuditLogsCsv } = require('../controllers/adminController');
const { User, Limitation, ReserveHold, PayoutRequest, KycRequest, Account } = require('../models');
const { logAudit } = require('../utils/audit');

const router = express.Router();

// Require authentication then compliance admin access
router.use(protect);
router.use(requireComplianceAdmin);

// ============= AUDIT =============

// GET /api/admin/compliance/audit-logs (JSON, supports filters via query)
router.get('/audit-logs', getAuditLogs);

// GET /api/admin/compliance/audit-logs.csv (CSV export, same filters)
router.get('/audit-logs.csv', getAuditLogsCsv);

// ============= KYC REVIEW =============

// GET /api/admin/compliance/kyc?status=pending|approved|rejected|more_info
router.get('/kyc', async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;
    const items = await KycRequest.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// PATCH /api/admin/compliance/kyc/:id
// Body: { action: 'approve'|'reject'|'more_info', notes?: string }
router.patch('/kyc/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body || {};
    const kyc = await KycRequest.findById(id);
    if (!kyc) return res.status(404).json({ message: 'KYC request not found' });

    const user = await User.findById(kyc.user);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (action === 'approve') {
      kyc.status = 'approved';
      if (kyc.levelRequested === 'Tier1' || kyc.levelRequested === 'Tier2') {
        user.kycLevel = kyc.levelRequested;
      }
      user.kycStatus = 'approved';
      await user.save();
    } else if (action === 'reject') {
      kyc.status = 'rejected';
      user.kycStatus = 'rejected';
      await user.save();
    } else if (action === 'more_info') {
      kyc.status = 'more_info';
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    if (notes) kyc.notes = notes;
    kyc.reviewer = req.user._id;
    await kyc.save();

    await logAudit(req, {
      actionName: 'compliance_kyc_decision',
      resource: 'kyc',
      resourceId: kyc._id,
      details: { userId: String(user._id), action, notes, levelRequested: kyc.levelRequested },
      success: true
    });

    res.json({ success: true, message: 'KYC updated', data: kyc });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ============= LIMITATIONS =============

// GET /api/admin/compliance/limitations?status=active|lifted|expired
router.get('/limitations', async (req, res) => {
  try {
    const { status } = req.query;
    const q = {};
    if (status) q.status = status;
    const items = await Limitation.find(q).sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /api/admin/compliance/limitations
// Body: { userId, type: 'temporary_30'|'temporary_180'|'permanent', reason?: string }
router.post('/limitations', async (req, res) => {
  try {
    const { userId, type, reason } = req.body || {};
    if (!userId || !['temporary_30', 'temporary_180', 'permanent'].includes(type)) {
      return res.status(400).json({ message: 'userId and valid type are required' });
    }
    const user = await User.findById(userId);
    if (!user || user.role !== 'user') return res.status(404).json({ message: 'User not found' });

    const now = new Date();
    let expiresAt = undefined;
    let reserveReleaseAt = undefined;

    if (type === 'temporary_30') {
      expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    } else if (type === 'temporary_180' || type === 'permanent') {
      reserveReleaseAt = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
    }

    // Update user snapshot fields
    user.limitationStatus = type;
    user.limitationReason = reason || '';
    user.limitationExpiresAt = expiresAt;
    user.reserveReleaseAt = reserveReleaseAt;
    await user.save();

    // Create Limitation record
    const lim = await Limitation.create({
      user: user._id,
      type,
      reason: reason || '',
      imposedBy: req.user._id,
      imposedAt: now,
      expiresAt,
      status: 'active'
    });

    // If 180/permanent: record a reserve snapshot from wallet (if present)
    if (type === 'temporary_180' || type === 'permanent') {
      const wallet = await Account.findOne({ user: user._id, isWallet: true });
      const walletAmount = wallet ? Number(wallet.balance || 0) : 0;
      await ReserveHold.create({
        user: user._id,
        amount: walletAmount,
        currency: 'KES',
        createdAt: now,
        releaseAt: reserveReleaseAt || new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000),
        status: 'active',
        notes: 'Initial reserve snapshot at limitation impose'
      });
    }

    await logAudit(req, {
      actionName: 'compliance_limit_impose',
      resource: 'user',
      resourceId: user._id,
      details: { type, reason, expiresAt, reserveReleaseAt },
      success: true
    });

    res.status(201).json({ success: true, message: 'Limitation imposed', data: lim });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// PATCH /api/admin/compliance/limitations/:id/lift
router.patch('/limitations/:id/lift', async (req, res) => {
  try {
    const { id } = req.params;
    const lim = await Limitation.findById(id);
    if (!lim) return res.status(404).json({ message: 'Limitation not found' });

    const user = await User.findById(lim.user);
    if (!user) return res.status(404).json({ message: 'User not found' });

    lim.status = 'lifted';
    await lim.save();

    user.limitationStatus = 'none';
    user.limitationReason = '';
    user.limitationExpiresAt = undefined;
    user.reserveReleaseAt = undefined;
    await user.save();

    await logAudit(req, {
      actionName: 'compliance_limit_lift',
      resource: 'user',
      resourceId: user._id,
      details: { limitationId: String(lim._id) },
      success: true
    });

    res.json({ success: true, message: 'Limitation lifted', data: lim });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ============= PAYOUTS =============

// GET /api/admin/compliance/payouts?status=pending|approved|rejected|paid
router.get('/payouts', async (req, res) => {
  try {
    const { status } = req.query;
    const q = {};
    if (status) q.status = status;
    const items = await PayoutRequest.find(q).sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// PATCH /api/admin/compliance/payouts/:id
// Body: { action: 'approve'|'reject'|'paid', rejectionReason?: string }
router.patch('/payouts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason } = req.body || {};
    const payout = await PayoutRequest.findById(id);
    if (!payout) return res.status(404).json({ message: 'Payout request not found' });

    if (action === 'approve') {
      payout.status = 'approved';
      payout.reviewer = req.user._id;
    } else if (action === 'reject') {
      payout.status = 'rejected';
      payout.reviewer = req.user._id;
      payout.rejectionReason = rejectionReason || '';
      payout.processedAt = new Date();
    } else if (action === 'paid') {
      payout.status = 'paid';
      payout.reviewer = req.user._id;
      payout.processedAt = new Date();
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    await payout.save();

    await logAudit(req, {
      actionName: 'compliance_payout_decision',
      resource: 'payout',
      resourceId: payout._id,
      details: { action, rejectionReason },
      success: true
    });

    res.json({ success: true, message: 'Payout updated', data: payout });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;