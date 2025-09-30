const express = require('express');
const router = express.Router();
const subscriptionsController = require('../controllers/subscriptionsController');
const { protect } = require('../middleware/auth');

// All routes require auth
router.use(protect);

// CRUD
router.post('/', subscriptionsController.createSubscription);
router.get('/', subscriptionsController.listSubscriptions);
router.get('/:id', subscriptionsController.getSubscription);
router.patch('/:id/cancel', subscriptionsController.cancelSubscription);
router.patch('/:id/resume', subscriptionsController.resumeSubscription);

// Test charge
router.post('/:id/charge-now', subscriptionsController.chargeNow);

module.exports = router;