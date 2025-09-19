const express = require('express');
const { protect } = require('../middleware/auth');
const { requireAccountAdmin, requireCriticalReason } = require('../middleware/rbac');
const {
  listUsers,
  createUser,
  updateUserStatus,
  deleteUser,
} = require('../controllers/adminAccountsController');

const router = express.Router();

// Require authentication then accounts admin (or super_admin)
router.use(protect);
router.use(requireAccountAdmin);

// Health (optional)
router.get('/health', (req, res) => {
  res.json({ success: true, service: 'accounts', role: req.user.role });
});

// Accounts Admin: User lifecycle management
router.get('/users', listUsers);
router.post('/users', requireCriticalReason, createUser);
router.patch('/users/:id/status', requireCriticalReason, updateUserStatus);
router.delete('/users/:id', requireCriticalReason, deleteUser);

module.exports = router;