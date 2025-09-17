const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['savings', 'budget', 'investment', 'debt', 'streak', 'achievement', 'milestone'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '🏆' // emoji or icon name
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  criteria: {
    type: mongoose.Schema.Types.Mixed, // flexible criteria object
    required: true
  },
  points: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
badgeSchema.index({ user: 1, type: 1 });
badgeSchema.index({ user: 1, earnedAt: -1 });

module.exports = mongoose.model('Badge', badgeSchema);