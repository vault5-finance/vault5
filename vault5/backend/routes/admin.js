const express = require('express');
const { protect } = require('../middleware/auth');
const { requireSuperAdmin } = require('../middleware/rbac');
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
// Purge audit logs (super admin only)
router.delete('/overview/audit-logs', purgeAuditLogs);

// Get admin statistics
router.get('/stats', getAdminStats);

// Get all admins
router.get('/', getAllAdmins);

// Create new admin
router.post('/', createAdmin);

// Update admin
router.put('/:id', updateAdmin);

// Delete admin
router.delete('/:id', deleteAdmin);

module.exports = router;