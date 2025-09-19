const express = require('express');
const { protect } = require('../middleware/auth');
const { requireFinanceAdmin } = require('../middleware/rbac');

const router = express.Router();

// Require authentication then finance admin access
router.use(protect);
router.use(requireFinanceAdmin);

// GET /api/admin/finance/health - simple readiness check
router.get('/health', (req, res) => {
  res.json({ success: true, service: 'finance', role: req.user.role });
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