const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  targetAmount: {
    type: Number,
    required: true
  },
  currentAmount: {
    type: Number,
    default: 0
  },
  deadline: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'achieved', 'missed'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Goal', goalSchema);