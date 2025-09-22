const Wallet = require('../models/Wallet');

// Middleware to check if user has a wallet
const requireWallet = async (req, res, next) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.id });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found. Please create a wallet first.'
      });
    }

    req.wallet = wallet;
    next();
  } catch (error) {
    console.error('Require wallet middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking wallet'
    });
  }
};

// Middleware to check if wallet is active
const requireActiveWallet = async (req, res, next) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.id });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    if (wallet.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Wallet is ${wallet.status}. Cannot perform this operation.`
      });
    }

    req.wallet = wallet;
    next();
  } catch (error) {
    console.error('Require active wallet middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking wallet status'
    });
  }
};

// Middleware to check wallet balance
const checkBalance = (requiredAmount) => {
  return async (req, res, next) => {
    try {
      const wallet = await Wallet.findOne({ user: req.user.id });

      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: 'Wallet not found'
        });
      }

      if (wallet.balance < requiredAmount) {
        return res.status(400).json({
          success: false,
          message: `Insufficient wallet balance. Available: ${wallet.balance}, Required: ${requiredAmount}`
        });
      }

      req.wallet = wallet;
      next();
    } catch (error) {
      console.error('Check balance middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking wallet balance'
      });
    }
  };
};

// Middleware to check transaction limits
const checkTransactionLimits = (amount, type = 'spend') => {
  return async (req, res, next) => {
    try {
      const wallet = await Wallet.findOne({ user: req.user.id });

      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: 'Wallet not found'
        });
      }

      const limitCheck = wallet.isWithinLimits(amount, type);

      if (!limitCheck.allowed) {
        return res.status(400).json({
          success: false,
          message: limitCheck.reason,
          limits: wallet.limits
        });
      }

      req.wallet = wallet;
      next();
    } catch (error) {
      console.error('Check transaction limits middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking transaction limits'
      });
    }
  };
};

// Middleware to check KYC level for wallet features
const requireKycLevel = (requiredLevel) => {
  return async (req, res, next) => {
    try {
      const wallet = await Wallet.findOne({ user: req.user.id });

      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: 'Wallet not found'
        });
      }

      const kycLevels = ['none', 'basic', 'verified', 'enhanced'];
      const currentLevelIndex = kycLevels.indexOf(wallet.kycLevel);
      const requiredLevelIndex = kycLevels.indexOf(requiredLevel);

      if (currentLevelIndex < requiredLevelIndex) {
        return res.status(400).json({
          success: false,
          message: `KYC level ${requiredLevel} required for this operation. Current level: ${wallet.kycLevel}`,
          requiredLevel,
          currentLevel: wallet.kycLevel
        });
      }

      req.wallet = wallet;
      next();
    } catch (error) {
      console.error('Require KYC level middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking KYC level'
      });
    }
  };
};

// Middleware to check if wallet is locked due to failed attempts
const checkWalletLock = async (req, res, next) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.id });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    if (wallet.security.lockedUntil && wallet.security.lockedUntil > new Date()) {
      const remainingTime = Math.ceil((wallet.security.lockedUntil - new Date()) / 1000 / 60);
      return res.status(400).json({
        success: false,
        message: `Wallet is locked due to too many failed attempts. Try again in ${remainingTime} minutes.`
      });
    }

    req.wallet = wallet;
    next();
  } catch (error) {
    console.error('Check wallet lock middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking wallet lock status'
    });
  }
};

// Middleware to validate PIN for wallet operations
const validatePin = async (req, res, next) => {
  try {
    const { pin } = req.body;
    const wallet = await Wallet.findOne({ user: req.user.id });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    // Check if PIN is required
    if (wallet.security.pinSet) {
      if (!pin) {
        return res.status(400).json({
          success: false,
          message: 'PIN is required for this operation'
        });
      }

      // In production, verify hashed PIN
      // For now, just check if PIN is provided
      if (pin.length < 4 || pin.length > 6) {
        return res.status(400).json({
          success: false,
          message: 'Invalid PIN format'
        });
      }
    }

    req.wallet = wallet;
    next();
  } catch (error) {
    console.error('Validate PIN middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating PIN'
    });
  }
};

// Middleware to check if payment method exists and is verified
const validatePaymentMethod = async (req, res, next) => {
  try {
    const { paymentMethod } = req.body;
    const wallet = await Wallet.findOne({ user: req.user.id });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    if (!paymentMethod || !paymentMethod.type || !paymentMethod.identifier) {
      return res.status(400).json({
        success: false,
        message: 'Payment method type and identifier are required'
      });
    }

    // Check if payment method exists in wallet
    const existingMethod = wallet.paymentMethods.find(
      method => method.type === paymentMethod.type &&
                method.identifier === paymentMethod.identifier
    );

    if (!existingMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method not found in wallet'
      });
    }

    if (!existingMethod.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is not verified'
      });
    }

    req.wallet = wallet;
    req.paymentMethod = existingMethod;
    next();
  } catch (error) {
    console.error('Validate payment method middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating payment method'
    });
  }
};

module.exports = {
  requireWallet,
  requireActiveWallet,
  checkBalance,
  checkTransactionLimits,
  requireKycLevel,
  checkWalletLock,
  validatePin,
  validatePaymentMethod
};