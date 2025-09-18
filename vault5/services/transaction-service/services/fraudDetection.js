const Transaction = require('../models/transaction');
const { logger } = require('../server');
const eventPublisher = require('./eventPublisher');

class FraudDetectionService {
  constructor() {
    this.riskThreshold = parseFloat(process.env.FRAUD_SCORE_THRESHOLD) || 0.7;
    this.enabled = process.env.FRAUD_DETECTION_ENABLED !== 'false';
  }

  // Analyze transaction for fraud risk
  async analyzeTransaction(userId, transactionData) {
    if (!this.enabled) {
      return {
        riskScore: 0,
        isHighRisk: false,
        flags: []
      };
    }

    try {
      const flags = [];
      let riskScore = 0;

      // Get user's recent transactions for analysis
      const recentTransactions = await Transaction.findByUserId(userId, {}, {
        limit: 50,
        offset: 0
      });

      // Rule 1: Amount-based analysis
      const amountRisk = this._analyzeAmountRisk(transactionData.amount, recentTransactions);
      riskScore += amountRisk.score;
      flags.push(...amountRisk.flags);

      // Rule 2: Frequency analysis
      const frequencyRisk = this._analyzeFrequencyRisk(userId, transactionData, recentTransactions);
      riskScore += frequencyRisk.score;
      flags.push(...frequencyRisk.flags);

      // Rule 3: Pattern analysis
      const patternRisk = this._analyzePatternRisk(transactionData, recentTransactions);
      riskScore += patternRisk.score;
      flags.push(...patternRisk.flags);

      // Rule 4: Time-based analysis
      const timeRisk = this._analyzeTimeRisk(transactionData.date);
      riskScore += timeRisk.score;
      flags.push(...timeRisk.flags);

      // Normalize risk score to 0-1 range
      riskScore = Math.min(Math.max(riskScore, 0), 1);

      const isHighRisk = riskScore >= this.riskThreshold;

      const result = {
        riskScore,
        isHighRisk,
        flags
      };

      logger.info(`Fraud analysis completed for transaction`, {
        userId,
        riskScore,
        isHighRisk,
        flagsCount: flags.length
      });

      // Publish fraud detection event if high risk
      if (isHighRisk) {
        await eventPublisher.fraudDetected(transactionData.id || 'pending', userId, riskScore, flags);
      }

      return result;
    } catch (error) {
      logger.error('Fraud analysis error:', error);
      // Return low risk on error to avoid blocking legitimate transactions
      return {
        riskScore: 0.1,
        isHighRisk: false,
        flags: ['analysis_error']
      };
    }
  }

  // Analyze amount-based risk factors
  _analyzeAmountRisk(amount, recentTransactions) {
    const flags = [];
    let score = 0;

    // Calculate average transaction amount
    const amounts = recentTransactions.map(t => t.amount);
    const avgAmount = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0;
    const maxAmount = amounts.length > 0 ? Math.max(...amounts) : 0;

    // Flag unusually large amounts
    if (amount > maxAmount * 3 && maxAmount > 0) {
      flags.push('unusually_large_amount');
      score += 0.3;
    }

    // Flag amounts significantly above average
    if (amount > avgAmount * 5 && avgAmount > 0) {
      flags.push('amount_above_average_5x');
      score += 0.2;
    }

    // Flag round number amounts (potential fraud indicator)
    if (amount % 1000 === 0 && amount >= 10000) {
      flags.push('round_number_amount');
      score += 0.1;
    }

    return { score, flags };
  }

  // Analyze transaction frequency
  _analyzeFrequencyRisk(userId, transactionData, recentTransactions) {
    const flags = [];
    let score = 0;

    // Count transactions in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentHourTransactions = recentTransactions.filter(t =>
      new Date(t.date) > oneHourAgo
    );

    if (recentHourTransactions.length >= 10) {
      flags.push('high_frequency_last_hour');
      score += 0.4;
    }

    // Count transactions in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentDayTransactions = recentTransactions.filter(t =>
      new Date(t.date) > oneDayAgo
    );

    if (recentDayTransactions.length >= 50) {
      flags.push('high_frequency_last_24h');
      score += 0.3;
    }

    // Check for rapid succession of similar amounts
    const similarAmounts = recentTransactions.filter(t =>
      Math.abs(t.amount - transactionData.amount) < transactionData.amount * 0.1 &&
      t.type === transactionData.type
    );

    if (similarAmounts.length >= 3) {
      flags.push('similar_amount_pattern');
      score += 0.2;
    }

    return { score, flags };
  }

  // Analyze transaction patterns
  _analyzePatternRisk(transactionData, recentTransactions) {
    const flags = [];
    let score = 0;

    // Check for repetitive descriptions
    const sameDescriptionCount = recentTransactions.filter(t =>
      t.description.toLowerCase() === transactionData.description.toLowerCase()
    ).length;

    if (sameDescriptionCount >= 5) {
      flags.push('repetitive_description');
      score += 0.2;
    }

    // Check for suspicious keywords
    const suspiciousKeywords = ['test', 'fake', 'dummy', 'sample', 'xxx'];
    const hasSuspiciousKeyword = suspiciousKeywords.some(keyword =>
      transactionData.description.toLowerCase().includes(keyword)
    );

    if (hasSuspiciousKeyword) {
      flags.push('suspicious_keywords');
      score += 0.3;
    }

    // Check for unusual expense patterns (e.g., large expense after no activity)
    if (transactionData.type === 'expense') {
      const recentExpenses = recentTransactions.filter(t => t.type === 'expense');
      const avgExpense = recentExpenses.length > 0 ?
        recentExpenses.reduce((a, b) => a + b.amount, 0) / recentExpenses.length : 0;

      if (transactionData.amount > avgExpense * 10 && avgExpense > 0) {
        flags.push('unusual_expense_spike');
        score += 0.25;
      }
    }

    return { score, flags };
  }

  // Analyze time-based risk factors
  _analyzeTimeRisk(date) {
    const flags = [];
    let score = 0;

    const transactionDate = new Date(date);
    const now = new Date();
    const hour = transactionDate.getHours();

    // Flag transactions outside normal business hours (2 AM - 6 AM)
    if (hour >= 2 && hour <= 6) {
      flags.push('unusual_hours');
      score += 0.1;
    }

    // Flag future-dated transactions
    if (transactionDate > now) {
      flags.push('future_dated');
      score += 0.4;
    }

    // Flag transactions too far in the past
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (transactionDate < thirtyDaysAgo) {
      flags.push('too_old_transaction');
      score += 0.2;
    }

    return { score, flags };
  }

  // Get high-risk transactions for a user
  async getHighRiskTransactions(userId, limit = 20) {
    try {
      return await Transaction.getFraudRiskTransactions(userId, this.riskThreshold, limit);
    } catch (error) {
      logger.error('Get high risk transactions error:', error);
      throw error;
    }
  }

  // Update risk threshold
  updateRiskThreshold(newThreshold) {
    this.riskThreshold = Math.min(Math.max(newThreshold, 0), 1);
    logger.info(`Fraud detection risk threshold updated to: ${this.riskThreshold}`);
  }

  // Get fraud statistics
  async getFraudStatistics(userId, startDate, endDate) {
    try {
      const transactions = await Transaction.findByUserId(userId, {
        startDate,
        endDate
      });

      const stats = {
        totalTransactions: transactions.length,
        highRiskTransactions: transactions.filter(t => t.fraudRisk.isHighRisk).length,
        averageRiskScore: transactions.length > 0 ?
          transactions.reduce((sum, t) => sum + t.fraudRisk.riskScore, 0) / transactions.length : 0,
        riskFlags: {}
      };

      // Count risk flags
      transactions.forEach(transaction => {
        transaction.fraudRisk.flags.forEach(flag => {
          stats.riskFlags[flag] = (stats.riskFlags[flag] || 0) + 1;
        });
      });

      return stats;
    } catch (error) {
      logger.error('Get fraud statistics error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const fraudDetectionService = new FraudDetectionService();

module.exports = fraudDetectionService;