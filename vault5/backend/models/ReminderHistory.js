const mongoose = require('mongoose');

/**
 * ReminderHistory Model
 * Tracks all reminder communications sent to users for overdue lendings
 */
const reminderHistorySchema = new mongoose.Schema({
  // Reference to the user who received the reminder
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Reference to the lending that triggered the reminder
  lending: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lending',
    required: true
  },

  // Reminder tier/escalation level
  tier: {
    type: String,
    enum: ['first', 'second', 'third', 'final', 'collection', 'legal'],
    required: true
  },

  // Days overdue when reminder was sent
  daysOverdue: {
    type: Number,
    required: true,
    min: 0
  },

  // Communication channel used
  channel: {
    type: String,
    enum: ['email', 'sms', 'push', 'whatsapp'],
    required: true
  },

  // Delivery status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'failed', 'bounced', 'complained'],
    default: 'sent'
  },

  // Message content (for audit and analytics)
  subject: {
    type: String,
    trim: true
  },

  message: {
    type: String,
    trim: true
  },

  // Template used (for A/B testing and analytics)
  template: {
    type: String,
    enum: ['friendly', 'firm', 'urgent', 'legal', 'collection'],
    required: true
  },

  // Provider response (for debugging failed deliveries)
  providerResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Cost tracking (for SMS/WhatsApp charges)
  cost: {
    type: Number,
    default: 0,
    min: 0
  },

  // User response tracking
  userResponse: {
    type: String,
    enum: ['none', 'viewed', 'repaid', 'contacted', 'disputed', 'ignored'],
    default: 'none'
  },

  // Response timestamp
  responseAt: {
    type: Date
  },

  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for performance
reminderHistorySchema.index({ user: 1, createdAt: -1 });
reminderHistorySchema.index({ lending: 1, createdAt: -1 });
reminderHistorySchema.index({ tier: 1, status: 1 });
reminderHistorySchema.index({ channel: 1, status: 1 });
reminderHistorySchema.index({ createdAt: -1 });
reminderHistorySchema.index({ daysOverdue: 1 });

// Virtual for checking if reminder was effective (user responded positively)
reminderHistorySchema.virtual('isEffective').get(function() {
  return ['repaid', 'contacted'].includes(this.userResponse);
});

// Instance method to mark as responded
reminderHistorySchema.methods.markResponded = function(responseType, responseAt = new Date()) {
  this.userResponse = responseType;
  this.responseAt = responseAt;
  return this.save();
};

// Static method to get reminder statistics for a user
reminderHistorySchema.statics.getUserStats = async function(userId, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const stats = await this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        createdAt: { $gte: since }
      }
    },
    {
      $group: {
        _id: null,
        totalSent: { $sum: 1 },
        totalDelivered: {
          $sum: { $cond: [{ $in: ['$status', ['sent', 'delivered']] }, 1, 0] }
        },
        totalFailed: {
          $sum: { $cond: [{ $in: ['$status', ['failed', 'bounced']] }, 1, 0] }
        },
        effectiveReminders: {
          $sum: { $cond: [{ $in: ['$userResponse', ['repaid', 'contacted']] }, 1, 0] }
        },
        totalCost: { $sum: '$cost' }
      }
    }
  ]);

  return stats[0] || {
    totalSent: 0,
    totalDelivered: 0,
    totalFailed: 0,
    effectiveReminders: 0,
    totalCost: 0
  };
};

// Static method to get escalation effectiveness
reminderHistorySchema.statics.getEscalationEffectiveness = async function(userId = null, days = 90) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const matchStage = { createdAt: { $gte: since } };
  if (userId) matchStage.user = mongoose.Types.ObjectId(userId);

  const effectiveness = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$tier',
        total: { $sum: 1 },
        effective: {
          $sum: { $cond: [{ $in: ['$userResponse', ['repaid', 'contacted']] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        tier: '$_id',
        total: 1,
        effective: 1,
        effectivenessRate: {
          $cond: {
            if: { $eq: ['$total', 0] },
            then: 0,
            else: { $multiply: [{ $divide: ['$effective', '$total'] }, 100] }
          }
        }
      }
    },
    { $sort: { tier: 1 } }
  ]);

  return effectiveness;
};

module.exports = mongoose.model('ReminderHistory', reminderHistorySchema);