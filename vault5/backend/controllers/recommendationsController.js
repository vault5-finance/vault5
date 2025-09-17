const recommendationEngine = require('../services/recommendationEngine');

// Get personalized financial recommendations
const getRecommendations = async (req, res) => {
  try {
    const recommendations = await recommendationEngine.generatePersonalizedRecommendations(req.user._id);
    res.json(recommendations);
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ message: 'Failed to generate recommendations', error: error.message });
  }
};

// Get spending analysis
const getSpendingAnalysis = async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 3;
    const analysis = await recommendationEngine.analyzeSpendingPatterns(req.user._id, months);
    res.json(analysis);
  } catch (error) {
    console.error('Spending analysis error:', error);
    res.status(500).json({ message: 'Failed to analyze spending patterns', error: error.message });
  }
};

// Get debt reduction strategies
const getDebtStrategies = async (req, res) => {
  try {
    const strategies = await recommendationEngine.analyzeDebtAndGenerateStrategies(req.user._id);
    res.json(strategies);
  } catch (error) {
    console.error('Debt strategies error:', error);
    res.status(500).json({ message: 'Failed to generate debt strategies', error: error.message });
  }
};

// Get budget optimization suggestions
const getBudgetOptimizations = async (req, res) => {
  try {
    const spendingAnalysis = await recommendationEngine.analyzeSpendingPatterns(req.user._id);
    const optimizations = recommendationEngine.generateBudgetOptimizations(spendingAnalysis);
    res.json(optimizations);
  } catch (error) {
    console.error('Budget optimizations error:', error);
    res.status(500).json({ message: 'Failed to generate budget optimizations', error: error.message });
  }
};

// Get financial health assessment
const getFinancialHealth = async (req, res) => {
  try {
    const recommendations = await recommendationEngine.generatePersonalizedRecommendations(req.user._id);
    res.json(recommendations.financialHealth);
  } catch (error) {
    console.error('Financial health error:', error);
    res.status(500).json({ message: 'Failed to assess financial health', error: error.message });
  }
};

module.exports = {
  getRecommendations,
  getSpendingAnalysis,
  getDebtStrategies,
  getBudgetOptimizations,
  getFinancialHealth
};