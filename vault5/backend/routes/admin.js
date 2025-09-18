const express = require('express');
const { requireSuperAdmin } = require('../middleware/rbac');
const {
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAdminStats
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require super admin access
router.use(requireSuperAdmin);

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