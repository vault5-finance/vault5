const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getGracePeriodSettings,
  updateGracePeriodSettings,
  getGracePeriodExplanation,
  getDefaultConfigurations,
  resetToDefaults
} = require('../controllers/gracePeriodController');

const router = express.Router();

// All routes protected
router.use(protect);

// Get user's grace period settings
router.get('/settings', getGracePeriodSettings);

// Update user's grace period settings
router.put('/settings', updateGracePeriodSettings);

// Reset settings to defaults
router.post('/settings/reset', resetToDefaults);

// Get grace period explanation for a specific lending
router.get('/explanation/:lendingId', getGracePeriodExplanation);

// Get default configurations
router.get('/defaults', getDefaultConfigurations);

module.exports = router;