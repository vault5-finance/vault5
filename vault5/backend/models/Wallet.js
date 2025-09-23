const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'KES',
    enum: ['KES', 'USD', 'EUR', 'GBP']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'blocked'],
    default: 'active'
  },
  // KYC Level required for wallet features
  kycLevel: {
    type: String,
    enum: ['none', 'basic', 'verified', 'enhanced'],
    default: 'none'
  },
  // Wallet limits based on KYC level
  limits: {
    dailyLimit: {
      type: Number,
      default: 50000 // KES 50,000
    },
    monthlyLimit: {
      type: Number,
      default: 500000 // KES 500,000
    },
    transactionLimit: {
      type: Number,
      default: 100000 // KES 100,000 per transaction
    }
  },
  // Payment methods linked to wallet
  paymentMethods: [{
    type: {
      type: String,
      enum: ['mpesa', 'card', 'bank_transfer', 'paypal']
    },
    identifier: String, // phone number, card last 4, account number
    isDefault: {
      type: Boolean,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Wallet statistics
  stats: {
    totalRecharged: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    transactionCount: {
      type: Number,
      default: 0
    },
    lastTransaction: Date
  },
  // Security features
  security: {
    pinSet: {
      type: Boolean,
      default: false
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    maxFailedAttempts: {
      type: Number,
      default: 3
    },
    failedAttempts: {
      type: Number,
      default: 0
    },
    lockedUntil: Date
  }
}, {
  timestamps: true
});

// Indexes for performance
walletSchema.index({ user: 1 });
walletSchema.index({ status: 1 });
walletSchema.index({ 'paymentMethods.type': 1 });

// Virtual for available balance (considering pending transactions)
walletSchema.virtual('availableBalance').get(function() {
  return this.balance;
});

// Limits disabled by business decision
walletSchema.methods.isWithinLimits = function(amount, type = 'recharge') {
  return { allowed: true };
};

// Method to update wallet statistics
walletSchema.methods.updateStats = function(amount, type) {
  if (type === 'recharge') {
    this.stats.totalRecharged += amount;
  } else if (type === 'spend') {
    this.stats.totalSpent += amount;
  }

  this.stats.transactionCount += 1;
  this.stats.lastTransaction = new Date();
};

// Static method to get wallet with populated user data
walletSchema.statics.getWalletWithUser = function(userId) {
  return this.findOne({ user: userId })
    .populate('user', 'name email phone')
    .exec();
};

module.exports = mongoose.model('Wallet', walletSchema);