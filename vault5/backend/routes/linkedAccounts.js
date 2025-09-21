const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getLinkedAccounts,
  addLinkedAccount,
  verifyLinkedAccount,
  setPrimaryLinkedAccount,
  removeLinkedAccount,
  updateLinkedAccountLimits
} = require('../controllers/linkedAccountsController');

const router = express.Router();

// All linked account routes require authentication
router.use(protect);

// Linked accounts management routes
router.get('/', getLinkedAccounts);
router.post('/', addLinkedAccount);
router.post('/verify', verifyLinkedAccount);
router.patch('/primary', setPrimaryLinkedAccount);
router.delete('/:accountId', removeLinkedAccount);
router.patch('/:accountId/limits', updateLinkedAccountLimits);

module.exports = router;