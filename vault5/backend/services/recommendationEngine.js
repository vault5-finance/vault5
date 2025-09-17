const { Transaction, User, Account, Loan } = require('../models');

class RecommendationEngine {
  // Analyze spending patterns for a user
  async analyzeSpendingPatterns(userId, months = 3) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const transactions = await Transaction.find({
      user: userId,
      date: { $gte: startDate },
      type: 'expense'
    }).sort({ date: -1 });

    // Group by category/tag
    const categorySpending = {};
    let totalSpending = 0;

    transactions.forEach(transaction => {
      const category = transaction.tag || transaction.description.toLowerCase().split(' ')[0] || 'uncategorized';
      if (!categorySpending[category]) {
        categorySpending[category] = { total: 0, count: 0, transactions: [] };
      }
      categorySpending[category].total += transaction.amount;
      categorySpending[category].count += 1;
      categorySpending[category].transactions.push({
        amount: transaction.amount,
        date: transaction.date,
        description: transaction.description
      });
      totalSpending += transaction.amount;
    });

    // Calculate percentages and identify patterns
    Object.keys(categorySpending).forEach(category => {
      categorySpending[category].percentage = (categorySpending[category].total / totalSpending) * 100;
    });

    return {
      totalSpending,
      categoryBreakdown: categorySpending,
      transactionCount: transactions.length,
      averageTransaction: totalSpending / transactions.length,
      period: `${months} months`
    };
  }

  // Generate budget optimization suggestions
  generateBudgetOptimizations(spendingAnalysis) {
    const suggestions = [];
    const { categoryBreakdown, totalSpending } = spendingAnalysis;

    // Identify high-spending categories
    const highSpendingCategories = Object.entries(categoryBreakdown)
      .filter(([_, data]) => data.percentage > 15)
      .sort((a, b) => b[1].percentage - a[1].percentage);

    highSpendingCategories.forEach(([category, data]) => {
      if (category.toLowerCase().includes('food') || category.toLowerCase().includes('restaurant')) {
        suggestions.push({
          type: 'budget_optimization',
          category,
          currentSpending: data.total,
          percentage: data.percentage,
          suggestion: `Consider meal planning and cooking at home to reduce dining expenses by 20-30%`,
          potentialSavings: data.total * 0.25,
          priority: 'high'
        });
      } else if (category.toLowerCase().includes('entertainment') || category.toLowerCase().includes('shopping')) {
        suggestions.push({
          type: 'budget_optimization',
          category,
          currentSpending: data.total,
          percentage: data.percentage,
          suggestion: `Set a monthly limit for discretionary spending and track against it`,
          potentialSavings: data.total * 0.15,
          priority: 'medium'
        });
      } else if (category.toLowerCase().includes('transport') || category.toLowerCase().includes('fuel')) {
        suggestions.push({
          type: 'budget_optimization',
          category,
          currentSpending: data.total,
          percentage: data.percentage,
          suggestion: `Consider carpooling, public transport, or biking for short distances`,
          potentialSavings: data.total * 0.2,
          priority: 'high'
        });
      }
    });

    // General budget suggestions
    if (totalSpending > 0) {
      const suggestedSavings = totalSpending * 0.2; // 20% savings goal
      suggestions.push({
        type: 'budget_optimization',
        category: 'general',
        currentSpending: totalSpending,
        percentage: 100,
        suggestion: `Aim to save 20% of your income. Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings`,
        potentialSavings: suggestedSavings,
        priority: 'high'
      });
    }

    return suggestions;
  }

  // Analyze debt and generate reduction strategies
  async analyzeDebtAndGenerateStrategies(userId) {
    // Get user's loans and accounts
    const [loans, accounts] = await Promise.all([
      Loan.find({ user: userId, status: { $ne: 'paid' } }),
      Account.find({ user: userId })
    ]);

    const strategies = [];
    let totalDebt = 0;
    let totalInterest = 0;

    loans.forEach(loan => {
      totalDebt += loan.amount;
      totalInterest += (loan.amount * loan.interestRate * loan.term) / 100;
    });

    // Debt consolidation strategy
    if (loans.length > 2) {
      const averageInterest = loans.reduce((sum, loan) => sum + loan.interestRate, 0) / loans.length;
      strategies.push({
        type: 'debt_reduction',
        strategy: 'consolidation',
        description: `Consider consolidating ${loans.length} loans into one with a lower interest rate`,
        currentTotalDebt: totalDebt,
        estimatedSavings: totalInterest * 0.3, // Assume 30% interest savings
        priority: 'high',
        steps: [
          'Compare consolidation loan rates',
          'Calculate total interest savings',
          'Apply for consolidation loan',
          'Use funds to pay off existing loans'
        ]
      });
    }

    // High-interest debt payoff strategy
    const highInterestLoans = loans.filter(loan => loan.interestRate > 15);
    if (highInterestLoans.length > 0) {
      strategies.push({
        type: 'debt_reduction',
        strategy: 'avalanche',
        description: 'Focus on paying off high-interest debt first (debt avalanche method)',
        targetLoans: highInterestLoans.map(loan => ({ id: loan._id, amount: loan.amount, rate: loan.interestRate })),
        priority: 'high',
        steps: [
          'List debts by interest rate (highest first)',
          'Make minimum payments on all debts',
          'Put extra money toward highest interest debt',
          'Once paid off, roll payment to next highest'
        ]
      });
    }

    // Balance transfer strategy
    if (loans.some(loan => loan.interestRate > 20)) {
      strategies.push({
        type: 'debt_reduction',
        strategy: 'balance_transfer',
        description: 'Consider 0% balance transfer credit cards for high-interest debt',
        potentialLoans: loans.filter(loan => loan.interestRate > 20).map(loan => loan._id),
        priority: 'medium',
        steps: [
          'Find 0% APR balance transfer offers',
          'Calculate transfer fees vs interest savings',
          'Transfer balances during promotional period',
          'Set up automatic payments'
        ]
      });
    }

    return {
      totalDebt,
      totalInterest,
      strategies,
      debtToIncomeRatio: await this.calculateDebtToIncomeRatio(userId)
    };
  }

  // Calculate debt-to-income ratio
  async calculateDebtToIncomeRatio(userId) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    const [incomeTransactions, loans] = await Promise.all([
      Transaction.find({
        user: userId,
        type: 'income',
        date: { $gte: startDate }
      }),
      Loan.find({ user: userId, status: { $ne: 'paid' } })
    ]);

    const monthlyIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const monthlyDebtPayments = loans.reduce((sum, loan) => {
      return sum + (loan.amount / loan.term); // Simplified monthly payment
    }, 0);

    return monthlyIncome > 0 ? (monthlyDebtPayments / monthlyIncome) * 100 : 0;
  }

  // Generate personalized recommendations
  async generatePersonalizedRecommendations(userId) {
    const spendingAnalysis = await this.analyzeSpendingPatterns(userId);
    const debtAnalysis = await this.analyzeDebtAndGenerateStrategies(userId);

    const recommendations = {
      budgetOptimizations: this.generateBudgetOptimizations(spendingAnalysis),
      debtReductionStrategies: debtAnalysis.strategies,
      spendingInsights: {
        topSpendingCategory: Object.entries(spendingAnalysis.categoryBreakdown)
          .sort((a, b) => b[1].total - a[1].total)[0],
        averageMonthlySpending: spendingAnalysis.totalSpending / 3, // Assuming 3 months
        spendingTrend: await this.calculateSpendingTrend(userId)
      },
      financialHealth: {
        debtToIncomeRatio: debtAnalysis.debtToIncomeRatio,
        savingsRate: await this.calculateSavingsRate(userId),
        emergencyFundStatus: await this.assessEmergencyFund(userId)
      },
      generatedAt: new Date()
    };

    return recommendations;
  }

  // Calculate spending trend
  async calculateSpendingTrend(userId) {
    const months = 6;
    const trends = [];

    for (let i = months - 1; i >= 0; i--) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - i - 1);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() - i);

      const spending = await Transaction.aggregate([
        {
          $match: {
            user: userId,
            type: 'expense',
            date: { $gte: startDate, $lt: endDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);

      trends.push({
        month: endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        spending: spending[0]?.total || 0
      });
    }

    return trends;
  }

  // Calculate savings rate
  async calculateSavingsRate(userId) {
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

    return totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
  }

  // Assess emergency fund status
  async assessEmergencyFund(userId) {
    const accounts = await Account.find({ user: userId, type: 'savings' });
    const emergencyFund = accounts.reduce((sum, account) => sum + account.balance, 0);

    // Get monthly expenses for comparison
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    const monthlyExpenses = await Transaction.aggregate([
      { $match: { user: userId, type: 'expense', date: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const recommendedAmount = (monthlyExpenses[0]?.total || 0) * 6; // 6 months of expenses

    return {
      currentAmount: emergencyFund,
      recommendedAmount,
      status: emergencyFund >= recommendedAmount ? 'adequate' :
              emergencyFund >= recommendedAmount * 0.5 ? 'building' : 'insufficient',
      monthsCovered: monthlyExpenses[0]?.total ? emergencyFund / monthlyExpenses[0].total : 0
    };
  }
}

module.exports = new RecommendationEngine();