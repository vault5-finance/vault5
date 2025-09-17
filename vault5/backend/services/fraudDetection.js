const { Transaction } = require('../models');

// Detect fraudulent patterns in transactions
async function analyzeTransaction(userId, transaction) {
  try {
    // Get user's recent transactions
    const recentTransactions = await Transaction.find({
      user: userId,
      date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    }).sort({ date: -1 }).limit(50);

    // Calculate risk score (0-100)
    let riskScore = 0;
    
    // Rule 1: Unusual amount compared to average
    const avgAmount = recentTransactions.reduce((sum, t) => sum + t.amount, 0) / Math.max(recentTransactions.length, 1);
    if (transaction.amount > avgAmount * 5) {
      riskScore += 30;
    }
    
    // Rule 2: Unusual frequency
    if (recentTransactions.length > 20) {
      riskScore += Math.min(30, (recentTransactions.length - 20) * 2);
    }
    
    // Rule 3: Unusual location (if available)
    if (transaction.location && recentTransactions.some(t => t.location !== transaction.location)) {
      riskScore += 20;
    }
    
    // Rule 4: Unusual time (late night transactions)
    const transactionHour = new Date(transaction.date).getHours();
    if (transactionHour > 22 || transactionHour < 5) {
      riskScore += 15;
    }
    
    // Rule 5: Uncommon category
    const categoryCounts = recentTransactions.reduce((counts, t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
      return counts;
    }, {});
    if (transaction.category && !categoryCounts[transaction.category]) {
      riskScore += 15;
    }
    
    return {
      riskScore: Math.min(100, riskScore),
      isHighRisk: riskScore > 70,
      flags: riskScore > 0 ? [
        riskScore >= 30 ? 'unusual_amount' : null,
        riskScore >= 20 ? 'unusual_location' : null,
        riskScore >= 15 ? 'unusual_time' : null,
        riskScore >= 15 ? 'uncommon_category' : null
      ].filter(f => f) : []
    };
    
  } catch (error) {
    console.error('Fraud detection error:', error);
    return {
      riskScore: 0,
      isHighRisk: false,
      flags: []
    };
  }
}

module.exports = { analyzeTransaction };