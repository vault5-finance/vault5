const express = require('express');
const { protect } = require('../middleware/auth');
const { requireComplianceAdmin } = require('../middleware/rbac');
const { getAuditLogs } = require('../controllers/adminController');

const router = express.Router();

// Require authentication then compliance admin access
router.use(protect);
router.use(requireComplianceAdmin);

// GET /api/admin/compliance/audit-logs
router.get('/audit-logs', getAuditLogs);

module.exports = router;