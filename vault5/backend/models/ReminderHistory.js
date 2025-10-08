const mongoose = require('mongoose');

const reminderHistorySchema = new mongoose.Schema({
  lending: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lending',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  level: {
    type: String,
    enum: ['initial', '7_days', '14_days', '30_days', '60_days', '90_days'],
    required: true
  },
  type: {
    type: String,
    enum: ['email', 'sms', 'push', 'call'],
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'failed', 'pending'],
    default: 'pending'
  },
  message: {
    type: String,
    required: true
  },
  daysOverdue: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  borrowerName: {
    type: String,
    required: true
  },
  borrowerContact: {
    type: String
  },
  expectedReturnDate: {
    type: Date,
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  deliveredAt: {
    type: Date
  },
  failedAt: {
    type: Date
  },
  failureReason: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for performance
reminderHistorySchema.index({ lending: 1, level: 1 });
reminderHistorySchema.index({ user: 1, sentAt: -1 });
reminderHistorySchema.index({ status: 1, sentAt: -1 });
reminderHistorySchema.index({ level: 1, sentAt: -1 });

module.exports = mongoose.model('ReminderHistory', reminderHistorySchema);