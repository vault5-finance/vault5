const express = require('express');
const router = express.Router();
const plaidController = require('../controllers/plaidController');
const { protect } = require('../middleware/auth');

router.post('/link-token', protect, plaidController.createLinkToken);
router.post('/exchange-token', protect, plaidController.exchangePublicToken);
router.post('/webhook', plaidController.handleWebhook);
router.get('/transactions', protect, plaidController.getTransactions);

module.exports = router;