const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getRecommendations,
  getSpendingAnalysis,
  getDebtStrategies,
  getBudgetOptimizations,
  getFinancialHealth
} = require('../controllers/recommendationsController');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', getRecommendations);
router.get('/spending-analysis', getSpendingAnalysis);
router.get('/debt-strategies', getDebtStrategies);
router.get('/budget-optimizations', getBudgetOptimizations);
router.get('/financial-health', getFinancialHealth);

module.exports = router;