const express = require('express');
const router = express.Router();
const {
  getAccounts,
  getAccountSummary,
  updateAccountPercentage,
  updateAccountTarget,
  bulkUpdatePercentages,
  resetToDefaults,
  getAccountById
} = require('../controllers/accountsController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Account management routes
router.get('/', getAccounts);
router.get('/summary', getAccountSummary);
router.get('/:accountId', getAccountById);

// Update routes
router.put('/percentage', updateAccountPercentage);
router.put('/target', updateAccountTarget);
router.put('/bulk-percentages', bulkUpdatePercentages);
router.post('/reset-defaults', resetToDefaults);

module.exports = router;