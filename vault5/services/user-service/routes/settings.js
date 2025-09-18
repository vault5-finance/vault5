const express = require('express');
const router = express.Router();
const {
  updateSettings,
  getSettings,
  updateNotificationSettings,
  updateLendingRules,
  updateLinkedAccounts
} = require('../controllers/settingsController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Settings routes
router.get('/', getSettings);
router.put('/', updateSettings);

// Specific settings routes
router.put('/notifications', updateNotificationSettings);
router.put('/lending-rules', updateLendingRules);
router.put('/linked-accounts', updateLinkedAccounts);

module.exports = router;