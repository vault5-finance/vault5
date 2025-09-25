const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'missed_deposit',
      'surplus',
      'goal_achieved',
      'outstanding_lending',
      'upcoming_loan_repayment',
      'money_received',
      'money_debited'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId, // e.g., transaction, account, goal, loan, lending ID
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  // Additional structured details for richer UI (amount, currency, txCode, balance, sender, etc.)
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);