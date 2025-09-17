const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true // e.g., 'Bolt Car Loan'
  },
  principal: {
    type: Number,
    required: true
  },
  interestRate: {
    type: Number,
    default: 0
  },
  repaymentAmount: {
    type: Number,
    required: true
  },
  frequency: {
    type: String,
    enum: ['monthly', 'weekly', 'daily'],
    default: 'monthly'
  },
  nextDueDate: {
    type: Date,
    required: true
  },
  remainingBalance: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'paid', 'defaulted'],
    default: 'active'
  },
  accountDeduction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Loan', loanSchema);