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
      'money_debited',
      // Overdue reminder types
      'lending_overdue_first',
      'lending_overdue_second',
      'lending_overdue_third',
      'lending_overdue_final',
      'lending_overdue_collection',
      'lending_overdue_legal'
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
  },

  // Reminder-specific fields
  reminderTier: {
    type: String,
    enum: ['first', 'second', 'third', 'final', 'collection', 'legal'],
    required: function() {
      return this.type && this.type.startsWith('lending_overdue');
    }
  },

  daysOverdue: {
    type: Number,
    min: 0,
    required: function() {
      return this.type && this.type.startsWith('lending_overdue');
    }
  },

  lendingReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lending',
    required: function() {
      return this.type && this.type.startsWith('lending_overdue');
    }
  },

  // Escalation tracking
  escalationLevel: {
    type: Number,
    min: 1,
    max: 6,
    default: function() {
      if (!this.reminderTier) return null;
      const tierMap = {
        'first': 1,
        'second': 2,
        'third': 3,
        'final': 4,
        'collection': 5,
        'legal': 6
      };
      return tierMap[this.reminderTier] || null;
    }
  },

  // Reminder effectiveness tracking
  reminderResponse: {
    type: String,
    enum: ['pending', 'viewed', 'repaid', 'contacted', 'disputed', 'ignored', 'escalated'],
    default: 'pending'
  },

  responseAt: {
    type: Date
  },

  // Link to reminder history for detailed tracking
  reminderHistoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReminderHistory'
  }
}, {
  timestamps: true
});

// Indexes for performance
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ reminderTier: 1, createdAt: -1 });
notificationSchema.index({ lendingReference: 1, createdAt: -1 });
notificationSchema.index({ escalationLevel: 1, reminderResponse: 1 });
notificationSchema.index({ reminderHistoryId: 1 });

// Instance methods for reminder notifications
notificationSchema.methods.markAsResponded = function(responseType, responseAt = new Date()) {
  this.reminderResponse = responseType;
  this.responseAt = responseAt;
  return this.save();
};

notificationSchema.methods.isOverdueReminder = function() {
  return this.type && this.type.startsWith('lending_overdue');
};

notificationSchema.methods.getEscalationInfo = function() {
  if (!this.isOverdueReminder()) return null;

  return {
    tier: this.reminderTier,
    level: this.escalationLevel,
    daysOverdue: this.daysOverdue,
    isEffective: ['repaid', 'contacted'].includes(this.reminderResponse)
  };
};

// Static methods for reminder analytics
notificationSchema.statics.getReminderEffectiveness = async function(userId = null, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const matchStage = {
    type: { $regex: '^lending_overdue' },
    createdAt: { $gte: since }
  };
  if (userId) matchStage.user = userId;

  const effectiveness = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$reminderTier',
        total: { $sum: 1 },
        effective: {
          $sum: {
            $cond: [
              { $in: ['$reminderResponse', ['repaid', 'contacted']] },
              1,
              0
            ]
          }
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

notificationSchema.statics.getOverdueNotificationsForLending = async function(lendingId) {
  return this.find({
    lendingReference: lendingId,
    type: { $regex: '^lending_overdue' }
  }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Notification', notificationSchema);