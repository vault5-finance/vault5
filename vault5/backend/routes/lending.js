const express = require('express');
const { protect } = require('../middleware/auth');
const { lendingLimiter } = require('../middleware/rateLimit');
const {
  createLending,
  getLendings,
  updateLendingStatus,
  getLendingLedger,
  getLendingAnalytics,
  calculateSafeAmount,
  getBorrowerScore
} = require('../controllers/lendingController');

const router = express.Router();

router.use(protect); // All routes protected

// Calculation and scoring
router.post('/calculate-safe-amount', lendingLimiter, calculateSafeAmount);
router.get('/score', getBorrowerScore);

// Core lending routes
router.post('/', lendingLimiter, createLending);
router.get('/', getLendings);
router.put('/:id/status', lendingLimiter, updateLendingStatus);
router.get('/ledger', getLendingLedger);
router.get('/analytics', getLendingAnalytics);

module.exports = router;