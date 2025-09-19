const express = require('express');
const { protect } = require('../middleware/auth');
const { requireSupportAdmin } = require('../middleware/rbac');
const {
  listUsers,
  createUserByAdmin,
  updateUserStatus,
  deleteUserByAdmin
} = require('../controllers/adminController');

const router = express.Router();

// Require authentication then support admin access
router.use(protect);
router.use(requireSupportAdmin);

// Health
router.get('/health', (req, res) => {
  res.json({ success: true, service: 'support', role: req.user.role });
});

// ========== User Account Management (Support/Admin) ==========
// List users with filters: q, status, active, page, limit
router.get('/users', listUsers);

// Create a regular user
router.post('/users', createUserByAdmin);

// Update user status flags (activate/deactivate/suspend/ban/delete/dormant)
router.patch('/users/:id/status', updateUserStatus);

// Soft delete user (mark deleted + inactive)
router.delete('/users/:id', deleteUserByAdmin);

// ========== Stubs to keep previous placeholders ==========
router.get('/tickets', (req, res) => {
  res.json({ success: true, data: [], message: 'Support tickets (stub)' });
});

router.post('/reset-password', (req, res) => {
  res.json({ success: true, message: 'Password reset action (stub)' });
});

module.exports = router;