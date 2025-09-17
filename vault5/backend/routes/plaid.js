const express = require('express');
const router = express.Router();
const plaidController = require('../controllers/plaidController');
const authMiddleware = require('../middleware/auth');

router.post('/link-token', authMiddleware, plaidController.createLinkToken);
router.post('/exchange-token', authMiddleware, plaidController.exchangePublicToken);
router.post('/webhook', plaidController.handleWebhook);
router.get('/transactions', authMiddleware, plaidController.getTransactions);

module.exports = router;