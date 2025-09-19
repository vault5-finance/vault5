const express = require('express');
const { protect } = require('../middleware/auth');
const { requireComplianceAdmin } = require('../middleware/rbac');
const { getAuditLogs, getAuditLogsCsv } = require('../controllers/adminController');

const router = express.Router();

// Require authentication then compliance admin access
router.use(protect);
router.use(requireComplianceAdmin);

// GET /api/admin/compliance/audit-logs (JSON, supports filters via query)
router.get('/audit-logs', getAuditLogs);

// GET /api/admin/compliance/audit-logs.csv (CSV export, same filters)
router.get('/audit-logs.csv', getAuditLogsCsv);

module.exports = router;