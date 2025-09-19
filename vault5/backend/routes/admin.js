const express = require('express');
const { protect } = require('../middleware/auth');
const { requireSuperAdmin, requireCriticalReason } = require('../middleware/rbac');
const {
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAdminStats,
  getSystemOverview,
  purgeAuditLogs
} = require('../controllers/adminController');

const router = express.Router();

// Require authentication then super admin access
router.use(protect);
router.use(requireSuperAdmin);

// System overview (super admin)
router.get('/overview', getSystemOverview);
// Purge audit logs (super admin only) - critical
router.delete('/overview/audit-logs', requireCriticalReason, purgeAuditLogs);

// Get admin statistics
router.get('/stats', getAdminStats);

// Get all admins
router.get('/', getAllAdmins);

// Create new admin - critical
router.post('/', requireCriticalReason, createAdmin);

// Update admin - critical
router.put('/:id', requireCriticalReason, updateAdmin);

// Delete admin - critical
router.delete('/:id', requireCriticalReason, deleteAdmin);

module.exports = router;