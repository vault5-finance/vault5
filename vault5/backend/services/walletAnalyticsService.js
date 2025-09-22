const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

class WalletAnalyticsService {
  constructor() {
    this.timeRanges = {
      '7d': { days: 7, label: 'Last 7 days' },
      '30d': { days: 30, label: 'Last 30 days' },
      '90d': { days: 90, label: 'Last 90 days' },
      '1y': { days: 365, label: 'Last year' }
    };
  }

  // Get wallet overview for user
  async getWalletOverview(userId, timeRange = '30d') {
    try {
      const wallet = await Wallet.findOne({ user: userId });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const range = this.timeRanges[timeRange];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - range.days);

      // Get transaction statistics
      const transactionStats = await this.getTransactionStats(userId, startDate);

      // Get spending patterns
      const spendingPatterns = await this.getSpendingPatterns(userId, startDate);

      // Get recharge patterns
      const rechargePatterns = await this.getRechargePatterns(userId, startDate);

      // Calculate trends
      const trends = await this.calculateTrends(userId, startDate);

      return {
        success: true,
        data: {
          wallet: {
            balance: wallet.balance,
            availableBalance: wallet.availableBalance,
            status: wallet.status,
            kycLevel: wallet.kycLevel
          },
          stats: {
            totalRecharged: wallet.stats.totalRecharged,
            totalSpent: wallet.stats.totalSpent,
            transactionCount: wallet.stats.transactionCount,
            averageTransaction: wallet.stats.transactionCount > 0
              ? (wallet.stats.totalRecharged + wallet.stats.totalSpent) / wallet.stats.transactionCount
              : 0
          },
          timeRange: {
            period: timeRange,
            label: range.label,
            startDate: startDate,
            endDate: new Date()
          },
          transactionStats,
          spendingPatterns,
          rechargePatterns,
          trends
        }
      };
    } catch (error) {
      console.error('Get wallet overview error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Get transaction statistics
  async getTransactionStats(userId, startDate) {
    try {
      const transactions = await Transaction.find({
        user: userId,
        createdAt: { $gte: startDate },
        type: { $in: ['wallet_recharge', 'wallet_transfer'] }
      });

      const stats = {
        total: transactions.length,
        recharges: transactions.filter(t => t.type === 'wallet_recharge').length,
        transfers: transactions.filter(t => t.type === 'wallet_transfer').length,
        totalVolume: transactions.reduce((sum, t) => sum + t.amount, 0),
        averageAmount: transactions.length > 0
          ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length
          : 0
      };

      return stats;
    } catch (error) {
      console.error('Get transaction stats error:', error);
      return null;
    }
  }

  // Get spending patterns
  async getSpendingPatterns(userId, startDate) {
    try {
      const transfers = await Transaction.find({
        user: userId,
        createdAt: { $gte: startDate },
        type: 'wallet_transfer'
      });

      // Group by target account
      const patterns = {};
      transfers.forEach(transaction => {
        const account = transaction.account;
        if (!patterns[account]) {
          patterns[account] = {
            count: 0,
            total: 0,
            average: 0
          };
        }
        patterns[account].count++;
        patterns[account].total += transaction.amount;
      });

      // Calculate averages
      Object.keys(patterns).forEach(account => {
        patterns[account].average = patterns[account].total / patterns[account].count;
      });

      return {
        byAccount: patterns,
        topAccounts: Object.entries(patterns)
          .sort(([,a], [,b]) => b.total - a.total)
          .slice(0, 5)
      };
    } catch (error) {
      console.error('Get spending patterns error:', error);
      return null;
    }
  }

  // Get recharge patterns
  async getRechargePatterns(userId, startDate) {
    try {
      const recharges = await Transaction.find({
        user: userId,
        createdAt: { $gte: startDate },
        type: 'wallet_recharge'
      });

      // Group by payment method
      const patterns = {};
      recharges.forEach(transaction => {
        const method = transaction.metadata?.paymentMethod?.type || 'unknown';
        if (!patterns[method]) {
          patterns[method] = {
            count: 0,
            total: 0,
            average: 0
          };
        }
        patterns[method].count++;
        patterns[method].total += transaction.amount;
      });

      // Calculate averages
      Object.keys(patterns).forEach(method => {
        patterns[method].average = patterns[method].total / patterns[method].count;
      });

      return {
        byMethod: patterns,
        topMethods: Object.entries(patterns)
          .sort(([,a], [,b]) => b.total - a.total)
          .slice(0, 5)
      };
    } catch (error) {
      console.error('Get recharge patterns error:', error);
      return null;
    }
  }

  // Calculate trends
  async calculateTrends(userId, startDate) {
    try {
      const transactions = await Transaction.find({
        user: userId,
        createdAt: { $gte: startDate },
        type: { $in: ['wallet_recharge', 'wallet_transfer'] }
      }).sort({ createdAt: 1 });

      if (transactions.length < 2) {
        return {
          rechargeTrend: 'insufficient_data',
          spendingTrend: 'insufficient_data',
          volumeTrend: 'insufficient_data'
        };
      }

      // Calculate trends using simple linear regression
      const rechargeTrend = this.calculateTrend(transactions.filter(t => t.type === 'wallet_recharge'));
      const spendingTrend = this.calculateTrend(transactions.filter(t => t.type === 'wallet_transfer'));
      const volumeTrend = this.calculateTrend(transactions);

      return {
        rechargeTrend: this.interpretTrend(rechargeTrend),
        spendingTrend: this.interpretTrend(spendingTrend),
        volumeTrend: this.interpretTrend(volumeTrend)
      };
    } catch (error) {
      console.error('Calculate trends error:', error);
      return {
        rechargeTrend: 'error',
        spendingTrend: 'error',
        volumeTrend: 'error'
      };
    }
  }

  // Calculate trend using simple linear regression
  calculateTrend(transactions) {
    if (transactions.length < 2) return 0;

    const n = transactions.length;
    const xSum = transactions.reduce((sum, t, i) => sum + i, 0);
    const ySum = transactions.reduce((sum, t) => sum + t.amount, 0);
    const xySum = transactions.reduce((sum, t, i) => sum + i * t.amount, 0);
    const xSquareSum = transactions.reduce((sum, t, i) => sum + i * i, 0);

    const slope = (n * xySum - xSum * ySum) / (n * xSquareSum - xSum * xSum);
    return slope;
  }

  // Interpret trend value
  interpretTrend(slope) {
    if (slope > 100) return 'strongly_increasing';
    if (slope > 50) return 'increasing';
    if (slope > -50) return 'stable';
    if (slope > -100) return 'decreasing';
    return 'strongly_decreasing';
  }

  // Get wallet health score
  async getWalletHealthScore(userId) {
    try {
      const wallet = await Wallet.findOne({ user: userId });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      let score = 100;

      // Deduct points for low balance
      if (wallet.balance < 1000) score -= 20;
      else if (wallet.balance < 5000) score -= 10;

      // Deduct points for inactive wallet
      const daysSinceLastTransaction = wallet.stats.lastTransaction
        ? Math.floor((new Date() - wallet.stats.lastTransaction) / (1000 * 60 * 60 * 24))
        : 30;

      if (daysSinceLastTransaction > 30) score -= 30;
      else if (daysSinceLastTransaction > 7) score -= 15;

      // Deduct points for failed security attempts
      if (wallet.security.failedAttempts > 0) {
        score -= wallet.security.failedAttempts * 5;
      }

      // Deduct points for suspended status
      if (wallet.status !== 'active') score -= 50;

      // Bonus points for high KYC level
      const kycBonus = { none: 0, basic: 5, verified: 10, enhanced: 15 };
      score += kycBonus[wallet.kycLevel];

      // Bonus points for multiple payment methods
      if (wallet.paymentMethods.length > 1) score += 5;
      if (wallet.paymentMethods.length > 2) score += 5;

      return Math.max(0, Math.min(100, score));
    } catch (error) {
      console.error('Get wallet health score error:', error);
      return 0;
    }
  }

  // Get monthly wallet report
  async getMonthlyReport(userId, year, month) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);

      const transactions = await Transaction.find({
        user: userId,
        createdAt: { $gte: startDate, $lt: endDate },
        type: { $in: ['wallet_recharge', 'wallet_transfer'] }
      });

      const wallet = await Wallet.findOne({ user: userId });

      const report = {
        period: {
          year,
          month,
          startDate,
          endDate
        },
        summary: {
          totalTransactions: transactions.length,
          totalRecharged: transactions
            .filter(t => t.type === 'wallet_recharge')
            .reduce((sum, t) => sum + t.amount, 0),
          totalSpent: transactions
            .filter(t => t.type === 'wallet_transfer')
            .reduce((sum, t) => sum + t.amount, 0),
          netFlow: 0
        },
        transactions: transactions,
        walletBalance: wallet ? wallet.balance : 0
      };

      report.summary.netFlow = report.summary.totalRecharged - report.summary.totalSpent;

      return {
        success: true,
        data: report
      };
    } catch (error) {
      console.error('Get monthly report error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Get wallet insights
  async getWalletInsights(userId) {
    try {
      const overview = await this.getWalletOverview(userId, '30d');
      const healthScore = await this.getWalletHealthScore(userId);

      if (!overview.success) {
        return overview;
      }

      const insights = [];

      // Balance insights
      if (overview.data.wallet.balance < 1000) {
        insights.push({
          type: 'warning',
          message: 'Your wallet balance is low. Consider recharging.',
          action: 'recharge'
        });
      }

      // Transaction insights
      if (overview.data.stats.transactionCount === 0) {
        insights.push({
          type: 'info',
          message: 'You haven\'t used your wallet yet. Start by adding funds.',
          action: 'get_started'
        });
      }

      // Trend insights
      if (overview.data.trends.spendingTrend === 'strongly_increasing') {
        insights.push({
          type: 'warning',
          message: 'Your spending has increased significantly. Review your budget.',
          action: 'review_budget'
        });
      }

      // Health score insights
      if (healthScore < 50) {
        insights.push({
          type: 'danger',
          message: 'Your wallet health score is low. Take action to improve it.',
          action: 'improve_health'
        });
      }

      return {
        success: true,
        data: {
          healthScore,
          insights,
          recommendations: this.generateRecommendations(overview.data, healthScore)
        }
      };
    } catch (error) {
      console.error('Get wallet insights error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Generate recommendations based on data
  generateRecommendations(data, healthScore) {
    const recommendations = [];

    if (data.wallet.balance > data.stats.averageTransaction * 5) {
      recommendations.push('Consider investing excess wallet balance in savings accounts');
    }

    if (data.spendingPatterns.byAccount['Fun'] &&
        data.spendingPatterns.byAccount['Fun'].total > data.stats.totalSpent * 0.3) {
      recommendations.push('Your entertainment spending is high. Consider setting a budget.');
    }

    if (data.paymentMethods && data.paymentMethods.length === 1) {
      recommendations.push('Add more payment methods for better flexibility and security.');
    }

    if (healthScore < 70) {
      recommendations.push('Complete KYC verification to unlock higher limits and features.');
    }

    return recommendations;
  }
}

module.exports = new WalletAnalyticsService();