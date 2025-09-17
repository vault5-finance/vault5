const { body, validationResult } = require('express-validator');
const Account = require('../models/account');
const User = require('../models/user');
const { logger } = require('../server');

// Get user accounts
const getAccounts = async (req, res) => {
  try {
    const userId = req.user.id;
    const accounts = await Account.findByUserId(userId);

    res.json(accounts);
  } catch (error) {
    logger.error('Get accounts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get account summary with totals
const getAccountSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const accounts = await Account.findByUserId(userId);
    const totalBalance = await Account.getTotalBalance(userId);

    const summary = {
      accounts,
      totalBalance,
      accountCount: accounts.length
    };

    res.json(summary);
  } catch (error) {
    logger.error('Get account summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update account percentage
const updateAccountPercentage = [
  body('accountId').isUUID().withMessage('Valid account ID is required'),
  body('percentage').isFloat({ min: 0, max: 100 }).withMessage('Percentage must be between 0 and 100'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const { accountId, percentage } = req.body;
      const userId = req.user.id;

      // Verify account belongs to user
      const account = await Account.findById(accountId);
      if (!account || account.user_id !== userId) {
        return res.status(404).json({ message: 'Account not found' });
      }

      const updatedAccount = await Account.updateById(accountId, { percentage });

      res.json({
        message: 'Account percentage updated successfully',
        account: updatedAccount
      });
    } catch (error) {
      logger.error('Update account percentage error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

// Update account target
const updateAccountTarget = [
  body('accountId').isUUID().withMessage('Valid account ID is required'),
  body('target').isFloat({ min: 0 }).withMessage('Target must be a positive number'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const { accountId, target } = req.body;
      const userId = req.user.id;

      // Verify account belongs to user
      const account = await Account.findById(accountId);
      if (!account || account.user_id !== userId) {
        return res.status(404).json({ message: 'Account not found' });
      }

      const updatedAccount = await Account.updateById(accountId, { target });

      res.json({
        message: 'Account target updated successfully',
        account: updatedAccount
      });
    } catch (error) {
      logger.error('Update account target error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

// Bulk update account percentages
const bulkUpdatePercentages = [
  body('percentages').isObject().withMessage('Percentages must be an object'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const { percentages } = req.body;
      const userId = req.user.id;

      // Validate that percentages sum to 100
      const totalPercentage = Object.values(percentages).reduce((sum, p) => sum + parseFloat(p), 0);
      if (Math.abs(totalPercentage - 100) > 0.01) { // Allow small floating point differences
        return res.status(400).json({
          message: 'Account percentages must sum to 100%',
          totalPercentage
        });
      }

      // Validate account types exist for user
      const userAccounts = await Account.findByUserId(userId);
      const userAccountTypes = userAccounts.map(acc => acc.type);

      for (const type of Object.keys(percentages)) {
        if (!userAccountTypes.includes(type)) {
          return res.status(400).json({
            message: `Invalid account type: ${type}`,
            validTypes: userAccountTypes
          });
        }
      }

      const updatedAccounts = await Account.bulkUpdatePercentages(userId, percentages);

      res.json({
        message: 'Account percentages updated successfully',
        accounts: updatedAccounts
      });
    } catch (error) {
      logger.error('Bulk update percentages error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

// Reset accounts to default percentages
const resetToDefaults = async (req, res) => {
  try {
    const userId = req.user.id;

    const defaultPercentages = {
      'Daily': 50,
      'Emergency': 10,
      'Investment': 20,
      'LongTerm': 10,
      'Fun': 5,
      'Charity': 5
    };

    const updatedAccounts = await Account.bulkUpdatePercentages(userId, defaultPercentages);

    res.json({
      message: 'Accounts reset to default percentages',
      accounts: updatedAccounts
    });
  } catch (error) {
    logger.error('Reset to defaults error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get account by ID
const getAccountById = async (req, res) => {
  try {
    const { accountId } = req.params;
    const userId = req.user.id;

    const account = await Account.findById(accountId);
    if (!account || account.user_id !== userId) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json(account);
  } catch (error) {
    logger.error('Get account by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAccounts,
  getAccountSummary,
  updateAccountPercentage,
  updateAccountTarget,
  bulkUpdatePercentages,
  resetToDefaults,
  getAccountById
};