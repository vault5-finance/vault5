const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  tag: {
    type: String,
    default: '' // e.g., 'rent', 'debt_repayment' for special incomes
  },
  currency: {
    type: String,
    default: 'KES'
  },
  transactionCode: {
    type: String,
    index: true // mpesa-style code (unique intent, but allow replays during migration)
  },
  balanceAfter: {
    type: Number
  },
  date: {
    type: Date,
    default: Date.now
  },
  fraudRisk: {
    riskScore: {
      type: Number,
      default: 0
    },
    isHighRisk: {
      type: Boolean,
      default: false
    },
    flags: [{
      type: String
    }]
  },
  allocations: [{
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account'
    },
    amount: {
      type: Number,
      required: true
    }
  }]
}, {
  timestamps: true
});

// Helpful compound indexes
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);