const express = require('express');
const { protect } = require('../middleware/auth');
const { requireSupportAdmin } = require('../middleware/rbac');

const router = express.Router();

// Require authentication then support admin access
router.use(protect);
router.use(requireSupportAdmin);

// Health
router.get('/health', (req, res) => {
  res.json({ success: true, service: 'support', role: req.user.role });
});

// ========== User Account Management (DEPRECATED here) ==========
// Use /api/admin/accounts instead (role: account_admin or super_admin)
const deprecation = (req, res) => {
  res.status(410).json({
    success: false,
    message: 'Deprecated endpoint. Use /api/admin/accounts/users endpoints.',
    migrateTo: {
      list: 'GET /api/admin/accounts/users',
      create: 'POST /api/admin/accounts/users',
      updateStatus: 'PATCH /api/admin/accounts/users/:id/status',
      delete: 'DELETE /api/admin/accounts/users/:id'
    }
  });
};

router.get('/users', deprecation);
router.post('/users', deprecation);
router.patch('/users/:id/status', deprecation);
router.delete('/users/:id', deprecation);

// ========== Support service stubs remain ==========
router.get('/tickets', (req, res) => {
  res.json({ success: true, data: [], message: 'Support tickets (stub)' });
});

router.post('/reset-password', (req, res) => {
  res.json({ success: true, message: 'Password reset action (stub)' });
});

module.exports = router;