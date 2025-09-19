const express = require('express');
const { protect } = require('../middleware/auth');
const { requireSupportAdmin } = require('../middleware/rbac');

const router = express.Router();

// Require authentication then support admin access
router.use(protect);
router.use(requireSupportAdmin);

// GET /api/admin/support/health - simple readiness check
router.get('/health', (req, res) => {
  res.json({ success: true, service: 'support', role: req.user.role });
});

// Tickets listing (stub)
router.get('/tickets', (req, res) => {
  res.json({ success: true, data: [], message: 'Support tickets (stub)' });
});

// Password reset action (stub)
router.post('/reset-password', (req, res) => {
  res.json({ success: true, message: 'Password reset action (stub)' });
});

module.exports = router;