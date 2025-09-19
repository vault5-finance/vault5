const express = require('express');
const { protect } = require('../middleware/auth');
const { requireSystemAdmin } = require('../middleware/rbac');

const router = express.Router();

// Require authentication then system admin access
router.use(protect);
router.use(requireSystemAdmin);

// GET /api/admin/system/health - simple readiness check
router.get('/health', (req, res) => {
  res.json({ success: true, service: 'system', role: req.user.role });
});

// Infra keys (stub)
router.get('/integrations', (req, res) => {
  res.json({ success: true, data: [], message: 'Integrations (MongoDB, Plaid, gateways) - stub' });
});

// Deployments (stub)
router.post('/deploy', (req, res) => {
  res.json({ success: true, message: 'Deployment kicked off (stub)' });
});

// Logs and alerts (stub)
router.get('/logs', (req, res) => {
  res.json({ success: true, data: [], message: 'System logs (stub)' });
});

module.exports = router;