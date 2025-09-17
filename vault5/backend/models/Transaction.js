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

module.exports = mongoose.model('Transaction', transactionSchema);