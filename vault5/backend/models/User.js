const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: function() {
      // Name is required only after registration step 2 (when personal details are collected)
      return this.registrationStep >= 2;
    },
    trim: true
  },
  // Legacy top-level email for backward compatibility with older tests/flows
  email: {
    type: String,
    lowercase: true,
    select: true
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
    // Align with controller logic that issues verificationCode for emails
    verificationCode: String,
    // Keep legacy token support
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
    enum: ['user', 'super_admin', 'system_admin', 'finance_admin', 'compliance_admin', 'support_admin', 'content_admin', 'account_admin'],
    default: 'user'
  },
  department: {
    type: String,
    enum: ['none', 'system', 'finance', 'compliance', 'support', 'content', 'accounts'],
    default: 'none'
  },
  permissions: [{
    type: String,
    enum: [
      // Super Admin - All permissions
      'admin.create', 'admin.update', 'admin.delete', 'admin.view_all',

      // System Admin permissions
      'system.view', 'system.update', 'system.monitor', 'system.deploy',

      // Finance Admin permissions
      'finance.view', 'finance.approve', 'finance.disburse', 'finance.reconcile',

      // Compliance Admin permissions
      'compliance.view', 'compliance.approve', 'compliance.audit', 'compliance.report',

      // Support Admin permissions
      'support.view', 'support.resolve', 'support.reset', 'support.compensate',

      // Content Admin permissions
      'content.view', 'content.update', 'content.publish', 'content.notify',

      // Accounts Admin permissions
      'accounts.view', 'accounts.create', 'accounts.update', 'accounts.status', 'accounts.delete'
    ]
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  avatar: {
    type: String,
    default: ''
  },
  dob: {
    type: Date
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'not_required'],
    default: 'not_required'
  },
  // Overall account lifecycle/status
  accountStatus: {
    type: String,
    enum: ['active', 'dormant', 'suspended', 'banned', 'deleted'],
    default: 'active'
  },
  // Whether account is currently active/usable
  isActive: {
    type: Boolean,
    default: true
  },

  // Compliance & limitations fields
  kycLevel: {
    type: String,
    enum: ['Tier0', 'Tier1', 'Tier2'],
    default: 'Tier0'
  },
  limitationStatus: {
    type: String,
    enum: ['none', 'temporary_30', 'temporary_180', 'permanent'],
    default: 'none'
  },
  limitationReason: {
    type: String,
    default: ''
  },
  limitationExpiresAt: {
    type: Date
  },
  // Reserve release eligibility (e.g., 180-day wait)
  reserveReleaseAt: {
    type: Date
  },
  riskFlags: [{
    type: String
  }],

  // Legacy app-tier (kept for compatibility)
  limitsTier: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    default: 'basic'
  },
  country: {
    type: String,
    default: 'Kenya'
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
      accountType: {
        type: String,
        required: true,
        enum: ['M-Pesa', 'Airtel Money', 'Equity Bank', 'KCB', 'Co-op Bank', 'DTB', 'ABSA', 'Standard Chartered', 'Other']
      },
      accountNumber: {
        type: String,
        required: true
      },
      accountName: {
        type: String,
        required: true
      },
      isVerified: {
        type: Boolean,
        default: false
      },
      // Email verification fields (for backward compatibility and primary email)
      isEmailVerified: {
        type: Boolean,
        default: false
      },
      emailVerifiedAt: {
        type: Date
      },
      emailVerificationToken: String,
      emailVerificationExpires: Date,
      verificationToken: String,
      verificationExpires: Date,
      isPrimary: {
        type: Boolean,
        default: false
      },
      addedAt: {
        type: Date,
        default: Date.now
      },
      lastUsed: {
        type: Date
      },
      status: {
        type: String,
        enum: ['active', 'inactive', 'suspended', 'blocked'],
        default: 'active'
      },
      limits: {
        dailyLimit: {
          type: Number,
          default: 50000 // KES 50,000 daily limit
        },
        monthlyLimit: {
          type: Number,
          default: 500000 // KES 500,000 monthly limit
        }
      }
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
  }],
  trustedDevices: [{
    deviceId: { type: String, required: true },
    userAgent: { type: String, default: '' },
    ip: { type: String, default: '' },
    nickname: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    lastUsedAt: { type: Date, default: Date.now }
  }],
  lastLogin: { type: Date }
}, {
  timestamps: true
});

// Virtual properties for backward compatibility
// Removed virtual email field to prevent index conflicts

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

  // Ensure at most one primary linked account
  const primaryLinkedAccounts = this.preferences.linkedAccounts.filter(acc => acc.isPrimary);
  if (primaryLinkedAccounts.length > 1) {
    // If multiple primaries, keep only the first one as primary
    this.preferences.linkedAccounts.forEach((acc, index) => {
      acc.isPrimary = index === 0 && primaryLinkedAccounts.length > 0;
    });
  }

  // Auto-assign permissions based on role
  if (this.isModified('role') || this.isNew) {
    this.permissions = this.getDefaultPermissions(this.role);
  }

  // Auto-assign department based on role
  if (this.isModified('role') || this.isNew) {
    this.department = this.getDepartmentFromRole(this.role);
  }

  next();
});

// Helper method to get default permissions for a role
userSchema.methods.getDefaultPermissions = function(role) {
  const permissionMap = {
    super_admin: [
      'admin.create', 'admin.update', 'admin.delete', 'admin.view_all',
      'system.view', 'system.update', 'system.monitor', 'system.deploy',
      'finance.view', 'finance.approve', 'finance.disburse', 'finance.reconcile',
      'compliance.view', 'compliance.approve', 'compliance.audit', 'compliance.report',
      'support.view', 'support.resolve', 'support.reset', 'support.compensate',
      'content.view', 'content.update', 'content.publish', 'content.notify',
      'accounts.view', 'accounts.create', 'accounts.update', 'accounts.status', 'accounts.delete'
    ],
    system_admin: ['system.view', 'system.update', 'system.monitor', 'system.deploy'],
    finance_admin: ['finance.view', 'finance.approve', 'finance.disburse', 'finance.reconcile'],
    compliance_admin: ['compliance.view', 'compliance.approve', 'compliance.audit', 'compliance.report'],
    support_admin: ['support.view', 'support.resolve', 'support.reset', 'support.compensate'],
    content_admin: ['content.view', 'content.update', 'content.publish', 'content.notify'],
    account_admin: ['accounts.view', 'accounts.create', 'accounts.update', 'accounts.status', 'accounts.delete'],
    user: []
  };

  return permissionMap[role] || [];
};

// Helper method to get department from role
userSchema.methods.getDepartmentFromRole = function(role) {
  const departmentMap = {
    super_admin: 'none',
    system_admin: 'system',
    finance_admin: 'finance',
    compliance_admin: 'compliance',
    support_admin: 'support',
    content_admin: 'content',
    account_admin: 'accounts',
    user: 'none'
  };

 return departmentMap[role] || 'none';
};

// Helper methods for linked accounts management
userSchema.methods.canAddLinkedAccount = function() {
 return this.preferences.linkedAccounts.length < 3;
};

userSchema.methods.getPrimaryLinkedAccount = function() {
 return this.preferences.linkedAccounts.find(acc => acc.isPrimary) || this.preferences.linkedAccounts[0] || null;
};

userSchema.methods.getVerifiedLinkedAccounts = function() {
 return this.preferences.linkedAccounts.filter(acc => acc.isVerified && acc.status === 'active');
};

userSchema.methods.getActiveLinkedAccounts = function() {
 return this.preferences.linkedAccounts.filter(acc => acc.status === 'active');
};

userSchema.methods.hasLinkedAccount = function(accountType, accountNumber) {
 return this.preferences.linkedAccounts.some(acc =>
   acc.accountType === accountType && acc.accountNumber === accountNumber
 );
};
userSchema.methods.updateLinkedAccountLastUsed = function(accountId) {
 const account = this.preferences.linkedAccounts.id(accountId);
 if (account) {
   account.lastUsed = new Date();
 }
};

// Trusted devices helpers
userSchema.methods.isDeviceTrusted = function(deviceId) {
  if (!deviceId) return false;
  return Array.isArray(this.trustedDevices) && this.trustedDevices.some(d => d.deviceId === deviceId);
};

userSchema.methods.upsertTrustedDevice = function({ deviceId, userAgent = '', ip = '', nickname = '' } = {}) {
  if (!deviceId) return;
  if (!Array.isArray(this.trustedDevices)) this.trustedDevices = [];
  const existing = this.trustedDevices.find(d => d.deviceId === deviceId);
  if (existing) {
    existing.userAgent = userAgent || existing.userAgent;
    existing.ip = ip || existing.ip;
    existing.lastUsedAt = new Date();
    if (nickname) existing.nickname = nickname;
  } else {
    this.trustedDevices.push({
      deviceId,
      userAgent,
      ip,
      nickname,
      createdAt: new Date(),
      lastUsedAt: new Date()
    });
  }
};

// Indexes for compliance queries
userSchema.index({ limitationStatus: 1 });
userSchema.index({ reserveReleaseAt: 1 });
userSchema.index({ kycLevel: 1 });
userSchema.index({ 'trustedDevices.deviceId': 1 });

module.exports = mongoose.model('User', userSchema);