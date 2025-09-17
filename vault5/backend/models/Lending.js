const mongoose = require('mongoose');

const lendingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  borrowerName: {
    type: String,
    required: true
  },
  borrowerContact: {
    type: String
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['emergency', 'non-emergency'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'repaid', 'written_off', 'overdue'],
    default: 'pending'
  },
  expectedReturnDate: {
    type: Date
  },
  actualReturnDate: {
    type: Date
  },
  notes: {
    type: String
  },
  sourceAccounts: [{
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account'
    },
    amount: {
      type: Number
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Lending', lendingSchema);