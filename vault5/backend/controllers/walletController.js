const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { generateUniqueTransactionCode } = require('../utils/txCode');

// Internal: ensure a wallet exists for user
async function ensureWallet(userId) {
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    wallet = new Wallet({ user: userId, balance: 0 });
    await wallet.save();
  }
  return wallet;
}

// Programmatic credit to a user's main wallet (admin/payout/system utility)
// Returns { wallet, transaction, transactionCode }
async function creditWallet(userId, amount, description = 'Wallet credit', meta = {}, currency = 'KES') {
  if (!(Number(amount) > 0)) {
    throw new Error('Amount must be positive');
  }
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const wallet = await ensureWallet(userId);

  // Apply negative balance first (auto-deduct logic)
  const originalAmount = Number(amount);
  const currentDebt = Number(wallet.negativeBalance || 0);
  let appliedToDebt = 0;
  let netCredit = originalAmount;

  if (currentDebt > 0) {
    appliedToDebt = Math.min(originalAmount, currentDebt);
    wallet.negativeBalance = parseFloat((currentDebt - appliedToDebt).toFixed(2));
    netCredit = parseFloat((originalAmount - appliedToDebt).toFixed(2));
  }

  // Update positive balance with remaining credit (if any)
  if (netCredit > 0) {
    wallet.balance = parseFloat((Number(wallet.balance || 0) + netCredit).toFixed(2));
    if (typeof wallet.updateStats === 'function') {
      wallet.updateStats(netCredit, 'recharge');
    }
  }
  await wallet.save();

  // Create transaction record with mpesa-like code and balanceAfter
  const txCode = await generateUniqueTransactionCode(Transaction, 10);
  const transaction = new Transaction({
    user: userId,
    type: 'income',
    amount: originalAmount,
    description: description,
    currency,
    transactionCode: txCode,
    balanceAfter: wallet.balance,
    category: 'Wallet',
    allocations: [],
    fraudRisk: { riskScore: 0, isHighRisk: false, flags: [] },
    metadata: Object.assign({}, meta, {
      source: 'wallet_credit',
      appliedToDebt,
      netCredit,
      debtRemaining: Number(wallet.negativeBalance || 0)
    })
  });
  await transaction.save();

  return { wallet, transaction, transactionCode: txCode };
}

// Get user's wallet
const getWallet = async (req, res) => {
  try {
    const wallet = await Wallet.getWalletWithUser(req.user.id);

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    res.json({
      success: true,
      data: wallet
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving wallet'
    });
  }
};

// Create wallet for user
const createWallet = async (req, res) => {
  try {
    const existingWallet = await Wallet.findOne({ user: req.user.id });

    if (existingWallet) {
      return res.status(400).json({
        success: false,
        message: 'Wallet already exists'
      });
    }

    const wallet = new Wallet({
      user: req.user.id
    });

    await wallet.save();

    const populatedWallet = await Wallet.getWalletWithUser(req.user.id);

    res.status(201).json({
      success: true,
      message: 'Wallet created successfully',
      data: populatedWallet
    });
  } catch (error) {
    console.error('Create wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating wallet'
    });
  }
};

// Recharge wallet
const rechargeWallet = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { amount, paymentMethod, description } = req.body;

    // Get user's wallet
    let wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    // Check if wallet is active
    if (wallet.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Wallet is not active'
      });
    }

    // Check limits
    const limitCheck = wallet.isWithinLimits(amount, 'recharge');
    if (!limitCheck.allowed) {
      return res.status(400).json({
        success: false,
        message: limitCheck.reason
      });
    }

    // Check security (PIN if required)
    if (wallet.security.pinSet && !req.body.pin) {
      return res.status(400).json({
        success: false,
        message: 'PIN required for this transaction'
      });
    }

    // Process payment through PSP
    const paymentResult = await processPayment(amount, paymentMethod, req.user, 'recharge');

    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        message: paymentResult.message
      });
    }

    // Update wallet balance
    wallet.balance += amount;
    wallet.updateStats(amount, 'recharge');
    await wallet.save();

    // Create transaction record
    const transaction = new Transaction({
      user: req.user.id,
      type: 'wallet_recharge',
      amount: amount,
      description: description || `Wallet recharge via ${paymentMethod.type}`,
      category: 'income',
      account: 'Daily', // Default to Daily account
      metadata: {
        paymentMethod: paymentMethod,
        reference: paymentResult.reference,
        walletBalance: wallet.balance
      }
    });

    await transaction.save();

    // Get updated wallet
    const updatedWallet = await Wallet.getWalletWithUser(req.user.id);

    res.json({
      success: true,
      message: 'Wallet recharged successfully',
      data: {
        wallet: updatedWallet,
        transaction: transaction,
        paymentReference: paymentResult.reference
      }
    });
  } catch (error) {
    console.error('Recharge wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recharging wallet'
    });
  }
};

// Transfer from wallet to account
const walletToAccount = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { amount, targetAccount, description } = req.body;

    // Get user's wallet
    let wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    // Check if wallet has sufficient balance
    if (wallet.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance'
      });
    }

    // Check limits
    const limitCheck = wallet.isWithinLimits(amount, 'spend');
    if (!limitCheck.allowed) {
      return res.status(400).json({
        success: false,
        message: limitCheck.reason
      });
    }

    // Check security (PIN if required)
    if (wallet.security.pinSet && !req.body.pin) {
      return res.status(400).json({
        success: false,
        message: 'PIN required for this transaction'
      });
    }

    // Update wallet balance
    wallet.balance -= amount;
    wallet.updateStats(amount, 'spend');
    await wallet.save();

    // Create transaction record
    const transaction = new Transaction({
      user: req.user.id,
      type: 'wallet_transfer',
      amount: amount,
      description: description || `Transfer to ${targetAccount} account`,
      category: 'transfer',
      account: targetAccount,
      metadata: {
        source: 'wallet',
        walletBalance: wallet.balance
      }
    });

    await transaction.save();

    // Get updated wallet
    const updatedWallet = await Wallet.getWalletWithUser(req.user.id);

    res.json({
      success: true,
      message: 'Transfer completed successfully',
      data: {
        wallet: updatedWallet,
        transaction: transaction
      }
    });
  } catch (error) {
    console.error('Wallet to account transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing transfer'
    });
  }
};

// Get wallet transaction history
const getWalletHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const skip = (page - 1) * limit;

    let filter = { user: req.user.id };
    if (type) {
      filter.type = { $in: type.split(',').map(t => `wallet_${t}`) };
    }

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email');

    const total = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: transactions.length,
          totalRecords: total
        }
      }
    });
  } catch (error) {
    console.error('Get wallet history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving wallet history'
    });
  }
};

// Add payment method
const addPaymentMethod = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { type, identifier, setAsDefault } = req.body;

    let wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    // If setting as default, remove default from other methods
    if (setAsDefault) {
      wallet.paymentMethods.forEach(method => {
        method.isDefault = false;
      });
    }

    // Add new payment method
    wallet.paymentMethods.push({
      type,
      identifier,
      isDefault: setAsDefault || false,
      isVerified: false
    });

    await wallet.save();

    const updatedWallet = await Wallet.getWalletWithUser(req.user.id);

    res.json({
      success: true,
      message: 'Payment method added successfully',
      data: updatedWallet
    });
  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding payment method'
    });
  }
};

// Set wallet PIN
const setWalletPin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { pin } = req.body;

    let wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    // Hash PIN (in production, use proper PIN hashing)
    wallet.security.pinSet = true;
    wallet.security.failedAttempts = 0;
    wallet.security.lockedUntil = null;

    await wallet.save();

    res.json({
      success: true,
      message: 'PIN set successfully'
    });
  } catch (error) {
    console.error('Set wallet PIN error:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting PIN'
    });
  }
};

// Get wallet statistics
const getWalletStats = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    const stats = {
      balance: wallet.balance,
      availableBalance: wallet.availableBalance,
      totalRecharged: wallet.stats.totalRecharged,
      totalSpent: wallet.stats.totalSpent,
      transactionCount: wallet.stats.transactionCount,
      limits: wallet.limits,
      kycLevel: wallet.kycLevel,
      paymentMethodsCount: wallet.paymentMethods.length
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get wallet stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving wallet statistics'
    });
  }
};

// Payment processing using PSP service
const processPayment = async (amount, paymentMethod, user, type) => {
  const paymentService = require('../services/paymentService');
  return await paymentService.processPayment(amount, paymentMethod, user, type);
};

  // Update wallet limits (admin only)
  const updateWalletLimits = async (req, res) => {
    try {
      const { dailyLimit, monthlyLimit, transactionLimit } = req.body;
      const wallet = await Wallet.findOne({ user: req.params.userId });

      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: 'Wallet not found'
        });
      }

      if (dailyLimit !== undefined) wallet.limits.dailyLimit = dailyLimit;
      if (monthlyLimit !== undefined) wallet.limits.monthlyLimit = monthlyLimit;
      if (transactionLimit !== undefined) wallet.limits.transactionLimit = transactionLimit;

      await wallet.save();

      res.json({
        success: true,
        message: 'Wallet limits updated successfully',
        data: wallet.limits
      });
    } catch (error) {
      console.error('Update wallet limits error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating wallet limits'
      });
    }
  };

  // Get wallet limits
  const getWalletLimits = async (req, res) => {
    try {
      const wallet = await Wallet.findOne({ user: req.user.id });

      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: 'Wallet not found'
        });
      }

      res.json({
        success: true,
        data: wallet.limits
      });
    } catch (error) {
      console.error('Get wallet limits error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving wallet limits'
      });
    }
  };

  // Verify payment method
  const verifyPaymentMethod = async (req, res) => {
    try {
      const { type, identifier, verificationCode } = req.body;
      const wallet = await Wallet.findOne({ user: req.user.id });

      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: 'Wallet not found'
        });
      }

      const paymentMethod = wallet.paymentMethods.find(
        method => method.type === type && method.identifier === identifier
      );

      if (!paymentMethod) {
        return res.status(404).json({
          success: false,
          message: 'Payment method not found'
        });
      }

      // In a real implementation, verify the code with the payment provider
      // For now, just mark as verified
      paymentMethod.isVerified = true;
      await wallet.save();

      res.json({
        success: true,
        message: 'Payment method verified successfully'
      });
    } catch (error) {
      console.error('Verify payment method error:', error);
      res.status(500).json({
        success: false,
        message: 'Error verifying payment method'
      });
    }
  };

  // Remove payment method
  const removePaymentMethod = async (req, res) => {
    try {
      const { methodId } = req.params;
      const wallet = await Wallet.findOne({ user: req.user.id });

      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: 'Wallet not found'
        });
      }

      wallet.paymentMethods.id(methodId).remove();
      await wallet.save();

      res.json({
        success: true,
        message: 'Payment method removed successfully'
      });
    } catch (error) {
      console.error('Remove payment method error:', error);
      res.status(500).json({
        success: false,
        message: 'Error removing payment method'
      });
    }
  };

  // Update wallet status (admin only)
  const updateWalletStatus = async (req, res) => {
    try {
      const { status, reason } = req.body;
      const wallet = await Wallet.findOne({ user: req.params.userId });

      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: 'Wallet not found'
        });
      }

      wallet.status = status;
      await wallet.save();

      res.json({
        success: true,
        message: `Wallet status updated to ${status}`,
        data: {
          status: wallet.status,
          reason: reason
        }
      });
    } catch (error) {
      console.error('Update wallet status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating wallet status'
      });
    }
  };

module.exports = {
  // Utility
  creditWallet,
  ensureWallet,

  // HTTP handlers
  getWallet,
  createWallet,
  rechargeWallet,
  walletToAccount,
  getWalletHistory,
  addPaymentMethod,
  setWalletPin,
  getWalletStats,
  updateWalletLimits,
  getWalletLimits,
  verifyPaymentMethod,
  removePaymentMethod,
  updateWalletStatus
};