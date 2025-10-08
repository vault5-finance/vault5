const mongoose = require('mongoose');

/**
 * Wallet Model
 * Digital wallet for users to store funds and make payments
 */
const walletSchema = new mongoose.Schema({
  // Reference to the user who owns this wallet
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One wallet per user
  },

  // Wallet balance in the smallest currency unit (e.g., cents for USD, shillings for KES)
  balance: {
    type: Number,
    default: 0,
    min: 0
  },

  // Currency code (KES, USD, EUR, etc.)
  currency: {
    type: String,
    default: 'KES',
    enum: ['KES', 'USD', 'EUR', 'GBP'],
    uppercase: true
  },

  // Wallet status
  status: {
    type: String,
    enum: ['active', 'suspended', 'frozen', 'closed'],
    default: 'active'
  },

  // KYC verification status
  kycStatus: {
    type: String,
    enum: ['none', 'pending', 'verified', 'rejected'],
    default: 'none'
  },

  // KYC verification details
  kycDetails: {
    idNumber: String,
    idType: {
      type: String,
      enum: ['national_id', 'passport', 'drivers_license']
    },
    verificationDate: Date,
    rejectionReason: String
  },

  // Wallet settings
  settings: {
    // Auto-recharge settings
    autoRecharge: {
      enabled: { type: Boolean, default: false },
      threshold: { type: Number, default: 1000 }, // Minimum balance to trigger auto-recharge
      amount: { type: Number, default: 5000 } // Amount to recharge
    },

    // Spending limits
    dailyLimit: { type: Number, default: 50000 }, // Daily spending limit
    monthlyLimit: { type: Number, default: 500000 }, // Monthly spending limit

    // Notification preferences
    notifications: {
      lowBalance: { type: Boolean, default: true },
      largeTransaction: { type: Boolean, default: true },
      failedPayment: { type: Boolean, default: true }
    }
  },

  // Linked payment methods
  paymentMethods: [{
    type: {
      type: String,
      enum: ['card', 'bank_account', 'mobile_money'],
      required: true
    },
    provider: {
      type: String,
      enum: ['mpesa', 'airtel', 'card', 'bank'],
      required: true
    },
    accountNumber: {
      type: String,
      required: true
    },
    accountName: String,
    isDefault: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    verificationDate: Date,
    metadata: mongoose.Schema.Types.Mixed
  }],

  // Transaction statistics
  stats: {
    totalTransactions: { type: Number, default: 0 },
    totalCredits: { type: Number, default: 0 },
    totalDebits: { type: Number, default: 0 },
    lastTransactionDate: Date,
    averageTransactionAmount: { type: Number, default: 0 }
  },

  // Security features
  security: {
    // PIN for mobile transactions
    pinHash: String,
    pinAttempts: { type: Number, default: 0 },
    pinLockedUntil: Date,

    // Biometric settings
    biometricEnabled: { type: Boolean, default: false },

    // Device restrictions
    allowedDevices: [{
      deviceId: String,
      deviceName: String,
      addedDate: { type: Date, default: Date.now }
    }]
  },

  // Audit trail
  auditLog: [{
    action: {
      type: String,
      enum: ['created', 'credited', 'debited', 'suspended', 'frozen', 'closed', 'kyc_verified', 'kyc_rejected']
    },
    amount: Number,
    balanceBefore: Number,
    balanceAfter: Number,
    description: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    ipAddress: String,
    userAgent: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Indexes for performance
walletSchema.index({ user: 1 });
walletSchema.index({ status: 1 });
walletSchema.index({ kycStatus: 1 });
walletSchema.index({ 'paymentMethods.isDefault': 1 });
walletSchema.index({ createdAt: -1 });

// Virtual for formatted balance
walletSchema.virtual('formattedBalance').get(function() {
  return (this.balance / 100).toFixed(2); // Assuming balance is stored in cents
});

// Instance methods
walletSchema.methods.addAuditEntry = function(action, amount = 0, description = '', performedBy = null) {
  this.auditLog.push({
    action,
    amount,
    balanceBefore: this.balance - amount,
    balanceAfter: this.balance,
    description,
    performedBy,
    timestamp: new Date()
  });

  // Keep only last 100 audit entries
  if (this.auditLog.length > 100) {
    this.auditLog = this.auditLog.slice(-100);
  }

  return this.save();
};

walletSchema.methods.credit = function(amount, description = 'Credit', performedBy = null) {
  if (amount <= 0) throw new Error('Credit amount must be positive');

  this.balance += amount;
  this.stats.totalCredits += amount;
  this.stats.totalTransactions += 1;
  this.stats.lastTransactionDate = new Date();

  // Update average transaction amount
  const totalAmount = this.stats.totalCredits + this.stats.totalDebits;
  this.stats.averageTransactionAmount = totalAmount / this.stats.totalTransactions;

  return this.addAuditEntry('credited', amount, description, performedBy);
};

walletSchema.methods.debit = function(amount, description = 'Debit', performedBy = null) {
  if (amount <= 0) throw new Error('Debit amount must be positive');
  if (this.balance < amount) throw new Error('Insufficient balance');

  this.balance -= amount;
  this.stats.totalDebits += amount;
  this.stats.totalTransactions += 1;
  this.stats.lastTransactionDate = new Date();

  // Update average transaction amount
  const totalAmount = this.stats.totalCredits + this.stats.totalDebits;
  this.stats.averageTransactionAmount = totalAmount / this.stats.totalTransactions;

  return this.addAuditEntry('debited', amount, description, performedBy);
};

walletSchema.methods.canSpend = function(amount) {
  return this.balance >= amount && this.status === 'active';
};

walletSchema.methods.isKYCSufficient = function(requiredLevel = 'verified') {
  if (requiredLevel === 'none') return true;
  if (requiredLevel === 'verified') return this.kycStatus === 'verified';
  return ['pending', 'verified'].includes(this.kycStatus);
};

// Static methods
walletSchema.statics.findByUserId = function(userId) {
  return this.findOne({ user: userId });
};

walletSchema.statics.getWalletStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalWallets: { $sum: 1 },
        activeWallets: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        totalBalance: { $sum: '$balance' },
        verifiedWallets: {
          $sum: { $cond: [{ $eq: ['$kycStatus', 'verified'] }, 1, 0] }
        }
      }
    }
  ]);

  return stats[0] || {
    totalWallets: 0,
    activeWallets: 0,
    totalBalance: 0,
    verifiedWallets: 0
  };
};

module.exports = mongoose.model('Wallet', walletSchema);

module.exports = mongoose.model('Wallet', walletSchema);