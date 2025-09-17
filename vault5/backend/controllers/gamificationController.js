const { Milestone, Badge, FinancialScore, Transaction, Account, Loan } = require('../models');

// Get user's milestones
const getMilestones = async (req, res) => {
  try {
    const milestones = await Milestone.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('rewards.badge');
    res.json(milestones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new milestone
const createMilestone = async (req, res) => {
  try {
    const { type, title, description, target, unit, expiresAt } = req.body;

    const milestone = new Milestone({
      user: req.user._id,
      type,
      title,
      description,
      target,
      unit: unit || 'KES',
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    await milestone.save();
    res.status(201).json(milestone);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update milestone progress
const updateMilestoneProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress, description } = req.body;

    const milestone = await Milestone.findOne({ _id: id, user: req.user._id });
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    milestone.current = progress;
    milestone.progress.push({
      value: progress,
      description: description || `Progress update to ${progress}`
    });

    if (milestone.current >= milestone.target && milestone.status === 'active') {
      milestone.status = 'completed';
      milestone.completedAt = new Date();

      // Award badge if specified
      if (milestone.rewards.badge) {
        // Badge awarding logic would go here
      }
    }

    await milestone.save();
    res.json(milestone);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's badges
const getBadges = async (req, res) => {
  try {
    const badges = await Badge.find({ user: req.user._id })
      .sort({ earnedAt: -1 });
    res.json(badges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Award a badge
const awardBadge = async (req, res) => {
  try {
    const { type, name, description, icon, rarity, criteria, points } = req.body;

    const badge = new Badge({
      user: req.user._id,
      type,
      name,
      description,
      icon: icon || '🏆',
      rarity: rarity || 'common',
      criteria,
      points: points || 0
    });

    await badge.save();
    res.status(201).json(badge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get financial score
const getFinancialScore = async (req, res) => {
  try {
    const score = await FinancialScore.findOne({ user: req.user._id })
      .sort({ calculatedAt: -1 });

    if (!score) {
      return res.status(404).json({ message: 'Financial score not calculated yet' });
    }

    res.json(score);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Calculate and update financial score
const calculateFinancialScore = async (req, res) => {
  try {
    const userId = req.user._id;

    // Calculate components
    const components = await calculateScoreComponents(userId);

    // Get previous score for trend
    const previousScore = await FinancialScore.findOne({ user: req.user._id })
      .sort({ calculatedAt: -1 });

    const score = new FinancialScore({
      user: userId,
      components,
      trends: {
        previousScore: previousScore ? previousScore.overallScore : null,
        change: previousScore ? components.savingsRate.score - previousScore.overallScore : 0
      }
    });

    // Generate insights
    score.insights = generateFinancialInsights(components);

    await score.save();
    res.json(score);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to calculate score components
const calculateScoreComponents = async (userId) => {
  // Savings Rate (25% weight)
  const savingsRate = await calculateSavingsRate(userId);

  // Debt-to-Income Ratio (25% weight)
  const debtToIncomeRatio = await calculateDebtToIncomeRatio(userId);

  // Emergency Fund (20% weight)
  const emergencyFund = await calculateEmergencyFundScore(userId);

  // Budget Adherence (15% weight)
  const budgetAdherence = await calculateBudgetAdherence(userId);

  // Investment Diversity (15% weight)
  const investmentDiversity = await calculateInvestmentDiversity(userId);

  return {
    savingsRate,
    debtToIncomeRatio,
    emergencyFund,
    budgetAdherence,
    investmentDiversity
  };
};

// Helper functions for score calculations
const calculateSavingsRate = async (userId) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);

  const [income, expenses] = await Promise.all([
    Transaction.aggregate([
      { $match: { user: userId, type: 'income', date: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Transaction.aggregate([
      { $match: { user: userId, type: 'expense', date: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ]);

  const totalIncome = income[0]?.total || 0;
  const totalExpenses = expenses[0]?.total || 0;
  const rate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  // Score: 0-100 based on savings rate
  let score = Math.min(rate * 5, 100); // 20% savings = 100 score
  if (rate < 0) score = 0; // Negative savings

  return { score: Math.round(score), value: rate };
};

const calculateDebtToIncomeRatio = async (userId) => {
  const [income, loans] = await Promise.all([
    Transaction.aggregate([
      { $match: { user: userId, type: 'income', date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Loan.find({ user: userId, status: { $ne: 'paid' } })
  ]);

  const monthlyIncome = (income[0]?.total || 0) / 12; // Approximate monthly
  const monthlyDebtPayments = loans.reduce((sum, loan) => sum + (loan.amount / loan.term), 0);
  const ratio = monthlyIncome > 0 ? (monthlyDebtPayments / monthlyIncome) * 100 : 0;

  // Score: Lower ratio = higher score
  let score = Math.max(100 - ratio * 2, 0); // 50% ratio = 0 score

  return { score: Math.round(score), value: ratio };
};

const calculateEmergencyFundScore = async (userId) => {
  const accounts = await Account.find({ user: userId, type: 'Emergency' });
  const emergencyFund = accounts.reduce((sum, account) => sum + account.balance, 0);

  const monthlyExpenses = await Transaction.aggregate([
    { $match: { user: userId, type: 'expense', date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const recommendedAmount = (monthlyExpenses[0]?.total || 0) * 6;
  const coverage = recommendedAmount > 0 ? (emergencyFund / recommendedAmount) * 100 : 100;

  return { score: Math.min(coverage, 100), value: emergencyFund };
};

const calculateBudgetAdherence = async (userId) => {
  // Simplified: compare actual spending vs planned budget
  // This would need more complex logic based on user's budget settings
  return { score: 75, value: 75 }; // Placeholder
};

const calculateInvestmentDiversity = async (userId) => {
  // Simplified: check number of different investment types
  const investments = await Transaction.find({
    user: userId,
    type: 'expense',
    tag: { $regex: /invest/i }
  });

  const diversity = Math.min(investments.length * 10, 100);
  return { score: diversity, value: investments.length };
};

const generateFinancialInsights = (components) => {
  const insights = [];

  if (components.savingsRate.score >= 80) {
    insights.push({
      type: 'achievement',
      title: 'Excellent Savings Rate',
      description: 'You\'re saving more than 15% of your income!',
      priority: 'high'
    });
  } else if (components.savingsRate.score < 50) {
    insights.push({
      type: 'improvement',
      title: 'Improve Savings Rate',
      description: 'Consider increasing your savings to at least 20% of income.',
      priority: 'high'
    });
  }

  if (components.debtToIncomeRatio.score >= 80) {
    insights.push({
      type: 'strength',
      title: 'Healthy Debt Levels',
      description: 'Your debt-to-income ratio is within healthy limits.',
      priority: 'medium'
    });
  } else if (components.debtToIncomeRatio.score < 50) {
    insights.push({
      type: 'warning',
      title: 'High Debt Levels',
      description: 'Consider debt reduction strategies to improve your financial health.',
      priority: 'high'
    });
  }

  return insights;
};

module.exports = {
  getMilestones,
  createMilestone,
  updateMilestoneProgress,
  getBadges,
  awardBadge,
  getFinancialScore,
  calculateFinancialScore
};