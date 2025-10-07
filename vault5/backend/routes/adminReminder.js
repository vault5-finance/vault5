const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const {
  getReminderAnalytics,
  getReminderHistory,
  getSystemHealth
} = require('../controllers/adminReminderController');

const router = express.Router();

// All routes require authentication and admin privileges
router.use(protect);
router.use(adminOnly);

// Get comprehensive reminder analytics
router.get('/analytics', getReminderAnalytics);

// Get detailed reminder history with filtering
router.get('/history', getReminderHistory);

// Get system health metrics
router.get('/health', getSystemHealth);

module.exports = router;