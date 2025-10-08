const { Wallet } = require('../models');
const paymentService = require('./paymentService');

/**
 * Wallet Service
 * Handles wallet operations, transactions, and integrations with payment providers
 */
class WalletService {
  /**
   * Create a new wallet for a user
   * @param {string} userId - User ID
   * @param {Object} options - Wallet options
   * @returns {Object} - Created wallet
   */
  async createWallet(userId, options = {}) {
    try {
      // Check if user already has a wallet
      const existingWallet = await Wallet.findOne({ user: userId });
      if (existingWallet) {
        throw new Error('User already has a wallet');
      }

      const wallet = new Wallet({
        user: userId,
        currency: options.currency || 'KES',
        settings: {
          ...options.settings
        }
      });

      await wallet.save();

      // Add creation audit entry
      await wallet.addAuditEntry('created', 0, 'Wallet created', userId);

      return wallet;
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  }

  /**
   * Get user's wallet
   * @param {string} userId - User ID
   * @returns {Object} - Wallet document
   */
  async getWallet(userId) {
    try {
      const wallet = await Wallet.findOne({ user: userId }).populate('user', 'firstName lastName email');
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      return wallet;
    } catch (error) {
      console.error('Error getting wallet:', error);
      throw error;
    }
  }

  /**
   * Credit wallet (add money)
   * @param {string} userId - User ID
   * @param {number} amount - Amount to credit (in smallest currency unit)
   * @param {string} description - Transaction description
   * @param {Object} metadata - Additional metadata
   * @returns {Object} - Updated wallet
   */
  async creditWallet(userId, amount, description = 'Wallet credit', metadata = {}) {
    try {
      const wallet = await this.getWallet(userId);

      if (wallet.status !== 'active') {
        throw new Error('Wallet is not active');
      }

      await wallet.credit(amount, description, userId);

      // Add metadata to audit log if provided
      if (Object.keys(metadata).length > 0) {
        wallet.auditLog[wallet.auditLog.length - 1].metadata = metadata;
        await wallet.save();
      }

      return wallet;
    } catch (error) {
      console.error('Error crediting wallet:', error);
      throw error;
    }
  }

  /**
   * Debit wallet (subtract money)
   * @param {string} userId - User ID
   * @param {number} amount - Amount to debit (in smallest currency unit)
   * @param {string} description - Transaction description
   * @param {Object} metadata - Additional metadata
   * @returns {Object} - Updated wallet
   */
  async debitWallet(userId, amount, description = 'Wallet debit', metadata = {}) {
    try {
      const wallet = await this.getWallet(userId);

      if (wallet.status !== 'active') {
        throw new Error('Wallet is not active');
      }

      // Check spending limits
      await this.checkSpendingLimits(wallet, amount);

      await wallet.debit(amount, description, userId);

      // Add metadata to audit log if provided
      if (Object.keys(metadata).length > 0) {
        wallet.auditLog[wallet.auditLog.length - 1].metadata = metadata;
        await wallet.save();
      }

      return wallet;
    } catch (error) {
      console.error('Error debiting wallet:', error);
      throw error;
    }
  }

  /**
   * Check spending limits before transaction
   * @param {Object} wallet - Wallet document
   * @param {number} amount - Transaction amount
   */
  async checkSpendingLimits(wallet, amount) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Check daily limit
    const dailyDebits = wallet.auditLog
      .filter(entry =>
        entry.action === 'debited' &&
        entry.timestamp >= startOfDay
      )
      .reduce((sum, entry) => sum + entry.amount, 0);

    if (dailyDebits + amount > wallet.settings.dailyLimit) {
      throw new Error(`Daily spending limit of ${wallet.settings.dailyLimit} ${wallet.currency} would be exceeded`);
    }

    // Check monthly limit
    const monthlyDebits = wallet.auditLog
      .filter(entry =>
        entry.action === 'debited' &&
        entry.timestamp >= startOfMonth
      )
      .reduce((sum, entry) => sum + entry.amount, 0);

    if (monthlyDebits + amount > wallet.settings.monthlyLimit) {
      throw new Error(`Monthly spending limit of ${wallet.settings.monthlyLimit} ${wallet.currency} would be exceeded`);
    }
  }

  /**
   * Process wallet recharge via payment provider
   * @param {string} userId - User ID
   * @param {Object} rechargeData - Recharge data
   * @returns {Object} - Payment result
   */
  async rechargeWallet(userId, rechargeData) {
    try {
      const { provider, amount, currency, paymentMethod, metadata = {} } = rechargeData;

      const wallet = await this.getWallet(userId);

      // Validate KYC if required for large amounts
      if (amount > 50000 && !wallet.isKYCSufficient('verified')) { // 500 KES
        throw new Error('KYC verification required for large recharges');
      }

      // Process payment through PSP
      const paymentResult = await paymentService.processPayment({
        provider,
        type: paymentMethod.type,
        amount,
        currency: currency || wallet.currency,
        customer: {
          userId,
          email: wallet.user.email,
          phoneNumber: paymentMethod.accountNumber // For mobile money
        },
        metadata: {
          walletId: wallet._id,
          recharge: true,
          ...metadata
        }
      });

      if (!paymentResult.success) {
        throw new Error(`Payment failed: ${paymentResult.error}`);
      }

      // If payment is completed immediately, credit the wallet
      if (paymentResult.status === 'completed') {
        await this.creditWallet(userId, amount, 'Wallet recharge', {
          paymentProvider: provider,
          transactionId: paymentResult.transactionId,
          ...metadata
        });
      }

      return {
        ...paymentResult,
        walletBalance: wallet.balance + (paymentResult.status === 'completed' ? amount : 0)
      };

    } catch (error) {
      console.error('Error recharging wallet:', error);
      throw error;
    }
  }

  /**
   * Transfer money between wallets
   * @param {string} fromUserId - Sender user ID
   * @param {string} toUserId - Receiver user ID
   * @param {number} amount - Amount to transfer
   * @param {string} description - Transfer description
   * @returns {Object} - Transfer result
   */
  async transferBetweenWallets(fromUserId, toUserId, amount, description = 'Wallet transfer') {
    try {
      if (fromUserId === toUserId) {
        throw new Error('Cannot transfer to the same wallet');
      }

      const fromWallet = await this.getWallet(fromUserId);
      const toWallet = await this.getWallet(toUserId);

      // Check if both wallets are active
      if (fromWallet.status !== 'active' || toWallet.status !== 'active') {
        throw new Error('Both wallets must be active for transfer');
      }

      // Check if sender has sufficient balance
      if (!fromWallet.canSpend(amount)) {
        throw new Error('Insufficient balance');
      }

      // Check spending limits
      await this.checkSpendingLimits(fromWallet, amount);

      // Perform the transfer atomically
      await fromWallet.debit(amount, `Transfer to ${toWallet.user.firstName}: ${description}`, fromUserId);
      await toWallet.credit(amount, `Transfer from ${fromWallet.user.firstName}: ${description}`, fromUserId);

      return {
        success: true,
        fromWallet: {
          id: fromWallet._id,
          balance: fromWallet.balance
        },
        toWallet: {
          id: toWallet._id,
          balance: toWallet.balance
        },
        amount,
        description
      };

    } catch (error) {
      console.error('Error transferring between wallets:', error);
      throw error;
    }
  }

  /**
   * Add payment method to wallet
   * @param {string} userId - User ID
   * @param {Object} paymentMethod - Payment method data
   * @returns {Object} - Updated wallet
   */
  async addPaymentMethod(userId, paymentMethod) {
    try {
      const wallet = await this.getWallet(userId);

      // Check if payment method already exists
      const existingMethod = wallet.paymentMethods.find(
        pm => pm.type === paymentMethod.type && pm.accountNumber === paymentMethod.accountNumber
      );

      if (existingMethod) {
        throw new Error('Payment method already exists');
      }

      // Set as default if it's the first method or explicitly requested
      if (wallet.paymentMethods.length === 0 || paymentMethod.isDefault) {
        wallet.paymentMethods.forEach(pm => pm.isDefault = false);
        paymentMethod.isDefault = true;
      }

      wallet.paymentMethods.push({
        ...paymentMethod,
        isVerified: false,
        addedDate: new Date()
      });

      await wallet.save();

      return wallet;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  /**
   * Update wallet settings
   * @param {string} userId - User ID
   * @param {Object} settings - New settings
   * @returns {Object} - Updated wallet
   */
  async updateSettings(userId, settings) {
    try {
      const wallet = await this.getWallet(userId);

      // Validate settings
      if (settings.dailyLimit && settings.dailyLimit < 1000) {
        throw new Error('Daily limit must be at least 1000');
      }

      if (settings.monthlyLimit && settings.monthlyLimit < 10000) {
        throw new Error('Monthly limit must be at least 10000');
      }

      wallet.settings = { ...wallet.settings, ...settings };
      await wallet.save();

      return wallet;
    } catch (error) {
      console.error('Error updating wallet settings:', error);
      throw error;
    }
  }

  /**
   * Get wallet transaction history
   * @param {string} userId - User ID
   * @param {Object} filters - Filter options
   * @returns {Array} - Transaction history
   */
  async getTransactionHistory(userId, filters = {}) {
    try {
      const wallet = await this.getWallet(userId);

      let transactions = wallet.auditLog;

      // Apply filters
      if (filters.action) {
        transactions = transactions.filter(t => t.action === filters.action);
      }

      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        transactions = transactions.filter(t => t.timestamp >= startDate);
      }

      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        transactions = transactions.filter(t => t.timestamp <= endDate);
      }

      if (filters.limit) {
        transactions = transactions.slice(-filters.limit);
      }

      // Sort by timestamp descending
      transactions.sort((a, b) => b.timestamp - a.timestamp);

      return transactions.map(t => ({
        id: t._id,
        action: t.action,
        amount: t.amount,
        balanceBefore: t.balanceBefore,
        balanceAfter: t.balanceAfter,
        description: t.description,
        timestamp: t.timestamp,
        metadata: t.metadata || {}
      }));

    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw error;
    }
  }

  /**
   * Get wallet statistics
   * @param {string} userId - User ID
   * @returns {Object} - Wallet statistics
   */
  async getWalletStats(userId) {
    try {
      const wallet = await this.getWallet(userId);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      // Monthly stats
      const monthlyTransactions = wallet.auditLog.filter(
        t => t.timestamp >= startOfMonth
      );

      const monthlyCredits = monthlyTransactions
        .filter(t => t.action === 'credited')
        .reduce((sum, t) => sum + t.amount, 0);

      const monthlyDebits = monthlyTransactions
        .filter(t => t.action === 'debited')
        .reduce((sum, t) => sum + t.amount, 0);

      // Yearly stats
      const yearlyTransactions = wallet.auditLog.filter(
        t => t.timestamp >= startOfYear
      );

      return {
        currentBalance: wallet.balance,
        currency: wallet.currency,
        status: wallet.status,
        kycStatus: wallet.kycStatus,
        monthly: {
          transactions: monthlyTransactions.length,
          credits: monthlyCredits,
          debits: monthlyDebits,
          netFlow: monthlyCredits - monthlyDebits
        },
        yearly: {
          transactions: yearlyTransactions.length,
          totalVolume: yearlyTransactions.reduce((sum, t) => sum + t.amount, 0)
        },
        limits: {
          dailyLimit: wallet.settings.dailyLimit,
          monthlyLimit: wallet.settings.monthlyLimit,
          dailyUsed: wallet.auditLog
            .filter(t => t.action === 'debited' && t.timestamp >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
            .reduce((sum, t) => sum + t.amount, 0),
          monthlyUsed: monthlyDebits
        }
      };

    } catch (error) {
      console.error('Error getting wallet stats:', error);
      throw error;
    }
  }

  /**
   * Suspend wallet
   * @param {string} userId - User ID
   * @param {string} reason - Suspension reason
   * @returns {Object} - Updated wallet
   */
  async suspendWallet(userId, reason = 'Administrative action') {
    try {
      const wallet = await this.getWallet(userId);

      wallet.status = 'suspended';
      await wallet.addAuditEntry('suspended', 0, reason, userId);

      return wallet;
    } catch (error) {
      console.error('Error suspending wallet:', error);
      throw error;
    }
  }

  /**
   * Reactivate wallet
   * @param {string} userId - User ID
   * @returns {Object} - Updated wallet
   */
  async reactivateWallet(userId) {
    try {
      const wallet = await this.getWallet(userId);

      wallet.status = 'active';
      await wallet.addAuditEntry('reactivated', 0, 'Wallet reactivated', userId);

      return wallet;
    } catch (error) {
      console.error('Error reactivating wallet:', error);
      throw error;
    }
  }
};

module.exports = new WalletService();

module.exports = new WalletService();