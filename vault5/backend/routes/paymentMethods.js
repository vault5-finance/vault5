const express = require('express');
const router = express.Router();
const paymentMethodsController = require('../controllers/paymentMethodsController');
const { protect } = require('../middleware/auth');
const { reAuth2FA } = require('../middleware/reAuth2FA'); // For sensitive actions like linking/removing

// All routes require auth
router.use(protect);

// Stripe config
router.get('/stripe/config', paymentMethodsController.getStripeConfig);

// Setup intent for card collection
router.post('/stripe/setup-intent', paymentMethodsController.createSetupIntent);

// Link card after setup confirmation
router.post('/cards/link', reAuth2FA, paymentMethodsController.linkCard);

// List cards
router.get('/cards', paymentMethodsController.listCards);

// Set default card
router.patch('/cards/:id/default', paymentMethodsController.setDefaultCard);

// Remove card
router.delete('/cards/:id', reAuth2FA, paymentMethodsController.removeCard);

module.exports = router;