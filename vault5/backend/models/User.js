const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: ''
  },
  dob: {
    type: Date
  },
  phone: {
    type: String
  },
  city: {
    type: String
  },
  address: {
    type: String
  },
  termsAccepted: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  kycCompleted: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: false
  },
  registrationStep: {
    type: Number,
    default: 0,
    min: 0,
    max: 4
  },
  preferences: {
    notifications: {
      type: Boolean,
      default: true
    },
    currency: {
      type: String,
      default: 'KES'
    },
    linkedAccounts: [{
      type: String,
      default: [] // e.g., ['M-Pesa', 'Equity', 'KCB', 'Airtel', 'Co-op', 'DTB']
    }],
    notificationThresholds: {
      shortfall: {
        type: Number,
        default: 1000
      },
      goalProgress: {
        type: Number,
        default: 90 // Alert when progress reaches %
      },
      loanDueDays: {
        type: Number,
        default: 3 // Alert days before due
      }
    },
    lendingRules: {
      nonRepayCap: {
        type: Number,
        default: 3 // Per month
      },
      safePercent: {
        type: Number,
        default: 50 // % of available for lending
      }
    }
  },
  accounts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  }],
  goals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal'
  }],
  notifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);