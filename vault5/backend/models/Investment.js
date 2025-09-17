const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['T-Bill', 'MMF', 'Stock', 'Rental', 'Custom'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  expectedReturn: {
    type: Number,
    default: 0
  },
  currentValue: {
    type: Number,
    default: 0
  },
  maturityDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'matured', 'sold'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Investment', investmentSchema);