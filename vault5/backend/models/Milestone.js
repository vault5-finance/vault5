const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['savings', 'transactions', 'budget', 'investment', 'debt_free', 'streak'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  target: {
    type: Number,
    required: true // e.g., amount to save, number of transactions
  },
  current: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    default: 'KES' // KES, count, percentage, etc.
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'expired'],
    default: 'active'
  },
  completedAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  rewards: {
    points: {
      type: Number,
      default: 0
    },
    badge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge'
    }
  },
  progress: [{
    date: {
      type: Date,
      default: Date.now
    },
    value: Number,
    description: String
  }]
}, {
  timestamps: true
});

// Index for efficient queries
milestoneSchema.index({ user: 1, status: 1 });
milestoneSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('Milestone', milestoneSchema);