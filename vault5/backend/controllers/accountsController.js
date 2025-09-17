const { Account, Transaction, User } = require('../models');
const bcrypt = require('bcryptjs'); // Not used here, but for consistency if needed

// Allocation engine function
const allocateIncome = async (userId, amount, description, tag = '') => {
  try {
    const user = await User.findById(userId).populate('accounts');
    if (!user) {
      throw new Error('User not found');
    }

    const accounts = user.accounts;

    if (tag) {
      // Tagged income bypasses allocation
      const transaction = new Transaction({
        user: userId,
        amount,
        type: 'income',
        description,
        tag
      });
      await transaction.save();

      // Add transaction to user's profile if needed
      return { message: 'Tagged income logged without allocation', transaction };
    }

    // Check if total percentage is 100
    const totalPercentage = accounts.reduce((sum, acc) => sum + acc.percentage, 0);
    if (totalPercentage !== 100) {
      throw new Error('Account percentages do not sum to 100%');
    }

    const allocations = [];
    const newTransactions = [];

    for (const account of accounts) {
      const splitAmount = (amount * (account.percentage / 100)).toFixed(2);

      // Update account balance
      account.balance += parseFloat(splitAmount);
      await account.save();

      // Create allocation transaction
      const allocationTransaction = new Transaction({
        user: userId,
        amount: parseFloat(splitAmount),
        type: 'income',
        description: `${description} - allocated to ${account.type}`,
        allocations: [{
          account: account._id,
          amount: parseFloat(splitAmount)
        }]
      });
      await allocationTransaction.save();

      // Update account transactions ref
      account.transactions.push(allocationTransaction._id);
      await account.save();

      allocations.push({ account: account.type, amount: parseFloat(splitAmount) });

      // Determine status based on target
      let status = 'green';
      if (account.target > 0) {
        if (account.balance < account.target) {
          status = 'red'; // Shortfall
        } else if (account.balance > account.target) {
          status = 'blue'; // Surplus
        } // else green
      }
      account.status = status;
      await account.save();
    }

    // Main income transaction
    const mainTransaction = new Transaction({
      user: userId,
      amount,
      type: 'income',
      description,
      allocations
    });
    await mainTransaction.save();

    return { message: 'Income allocated successfully', allocations, mainTransaction };
  } catch (error) {
    throw new Error(`Allocation failed: ${error.message}`);
  }
};

// Add income endpoint handler
const addIncome = async (req, res) => {
  try {
    const { amount, description, tag } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    const result = await allocateIncome(req.user._id, amount, description, tag);

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user accounts
const getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id }).populate('transactions');
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update account percentage (for customization)
const updateAccountPercentage = async (req, res) => {
  try {
    const { accountId, percentage } = req.body;

    const account = await Account.findOne({ _id: accountId, user: req.user._id });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    account.percentage = percentage;
    await account.save();

    res.json({ message: 'Percentage updated', account });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addIncome,
  getAccounts,
  updateAccountPercentage,
  allocateIncome // Export for use in other modules
};