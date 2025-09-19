const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: function() {
      // Name is required only after registration step 2 (when personal details are collected)
      return this.registrationStep >= 2;
    },
    trim: true,
    immutable: function() {
      // Name cannot be changed once set (after registration step 2)
      return this.registrationStep >= 2;
    }
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
    type: Date,
    immutable: function() {
      // Date of birth cannot be changed once set (after registration step 2)
      return this.registrationStep >= 2;
    }
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

// Indexes for compliance queries
userSchema.index({ limitationStatus: 1 });
userSchema.index({ reserveReleaseAt: 1 });
userSchema.index({ kycLevel: 1 });

module.exports = mongoose.model('User', userSchema);