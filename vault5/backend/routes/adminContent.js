const express = require('express');
const { protect } = require('../middleware/auth');
const { requireContentAdmin } = require('../middleware/rbac');

const router = express.Router();

// Require authentication then content admin access
router.use(protect);
router.use(requireContentAdmin);

// GET /api/admin/content/health - simple readiness check
router.get('/health', (req, res) => {
  res.json({ success: true, service: 'content', role: req.user.role });
});

// Content management stubs
router.get('/articles', (req, res) => {
  res.json({ success: true, data: [], message: 'Articles listing (stub)' });
});

router.post('/articles', (req, res) => {
  res.json({ success: true, message: 'Create article (stub)' });
});

router.get('/notifications', (req, res) => {
  res.json({ success: true, data: [], message: 'Push notifications listing (stub)' });
});

router.post('/notifications', (req, res) => {
  res.json({ success: true, message: 'Send notification (stub)' });
});

module.exports = router;