const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  emails: [{
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: String,
    verificationExpires: Date,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  phones: [{
    phone: {
      type: String,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationCode: String,
    verificationExpires: Date,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
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
  vaultTag: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'not_required'],
    default: 'not_required'
  },
  limitsTier: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    default: 'basic'
  },
  country: {
    type: String,
    default: 'Kenya'
  },
  lastLogin: {
    type: Date
  },
  flags: {
    suspicious: {
      type: Boolean,
      default: false
    },
    locked: {
      type: Boolean,
      default: false
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false
    }
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

// Virtual properties for backward compatibility
userSchema.virtual('email').get(function() {
  const primaryEmail = this.emails.find(e => e.isPrimary);
  return primaryEmail ? primaryEmail.email : null;
});

userSchema.virtual('phone').get(function() {
  const primaryPhone = this.phones.find(p => p.isPrimary);
  return primaryPhone ? primaryPhone.phone : null;
});

userSchema.virtual('phoneVerified').get(function() {
  const primaryPhone = this.phones.find(p => p.isPrimary);
  return primaryPhone ? primaryPhone.isVerified : false;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Pre-save middleware to ensure at least one primary email and phone
userSchema.pre('save', function(next) {
  // Ensure at least one primary email
  if (this.emails.length > 0 && !this.emails.some(e => e.isPrimary)) {
    this.emails[0].isPrimary = true;
  }

  // Ensure at least one primary phone
  if (this.phones.length > 0 && !this.phones.some(p => p.isPrimary)) {
    this.phones[0].isPrimary = true;
  }

  next();
});

module.exports = mongoose.model('User', userSchema);