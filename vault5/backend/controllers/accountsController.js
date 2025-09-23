const { Account, Transaction, User } = require('../models');
const { generateNotification } = require('./notificationsController');
const bcrypt = require('bcryptjs'); // Not used here, but for consistency if needed

// Allocation engine function
// options: { target?: 'auto' | 'wallet', accountId?: string }
const allocateIncome = async (userId, amount, description, tag = '', options = {}) => {
  try {
    const user = await User.findById(userId).populate('accounts');
    if (!user) {
      throw new Error('User not found');
    }

    let accounts = user.accounts || [];
    if (!accounts || accounts.length === 0) {
      accounts = await Account.find({ user: userId });
    }

    // Tagged income bypasses allocation ONLY for special cases
    const bypassTags = ['rent', 'debt_repayment', 'reimbursement'];
    if (tag && bypassTags.includes(tag)) {
      const transaction = new Transaction({
        user: userId,
        amount,
        type: 'income',
        description,
        tag
      });
      await transaction.save();
      return { message: 'Tagged income logged without allocation', transaction };
    }

    const target = options.target || 'auto';
    const accountId = options.accountId;

    // Direct deposit to wallet or a specific account
    if (target === 'wallet' || accountId) {
      let targetAccount = null;
      if (accountId) {
        targetAccount = accounts.find(a => String(a._id) === String(accountId));
      } else {
        targetAccount = accounts.find(a => a.isWallet === true) || null;
      }
      if (!targetAccount) {
        // Fallback to Daily account, then any first available account
        targetAccount = accounts.find(a => a.type === 'Daily') || accounts[0] || null;
      }
      if (!targetAccount) {
        throw new Error('No accounts available for deposits');
      }

      const amt = parseFloat(parseFloat(amount).toFixed(2));
      targetAccount.balance += amt;

      // Determine status based on target threshold
      let status = 'green';
      if (targetAccount.target > 0) {
        if (targetAccount.balance < targetAccount.target) status = 'red';
        else if (targetAccount.balance > targetAccount.target) status = 'blue';
      }
      targetAccount.status = status;
      await targetAccount.save();

      const walletTx = new Transaction({
        user: userId,
        amount: amt,
        type: 'income',
        description: `${description} - deposited to ${targetAccount.type}`,
        allocations: [{
          account: targetAccount._id,
          amount: amt
        }]
      });
      await walletTx.save();

      // Link to account
      targetAccount.transactions.push(walletTx._id);
      await targetAccount.save();

      return {
        message: 'Income deposited to wallet',
        allocations: [{ account: targetAccount._id, amount: amt }],
        mainTransaction: walletTx
      };
    }

    // Auto-distribution across accounts where isAutoDistribute !== false
    const includedAccounts = accounts.filter(a => a.isAutoDistribute !== false);
    // Deterministic account ordering (Daily first) for stable behavior and tests
    const typePriority = { Daily: 1, Emergency: 2, Investment: 3, LongTerm: 4, Fun: 5, Charity: 6 };
    includedAccounts.sort((a, b) => (typePriority[a.type] || 99) - (typePriority[b.type] || 99));
    if (includedAccounts.length === 0) {
      throw new Error('No accounts available for auto-distribution');
    }
    // Use absolute percentages of total income (do not normalize)

    const allocations = [];

    for (const account of includedAccounts) {
      const splitAmount = parseFloat(((amount * (account.percentage || 0)) / 100).toFixed(2));

      // Update account balance
      account.balance += splitAmount;
      await account.save();

      // Create allocation transaction
      const allocationTransaction = new Transaction({
        user: userId,
        amount: splitAmount,
        type: 'income',
        description: `${description} - allocated to ${account.type}`,
        allocations: [{
          account: account._id,
          amount: splitAmount
        }]
      });
      await allocationTransaction.save();

      // Update account transactions ref
      account.transactions.push(allocationTransaction._id);
      await account.save();

      // Determine status based on target
      let status = 'green';
      if (account.target > 0) {
        if (account.balance < account.target) status = 'red';
        else if (account.balance > account.target) status = 'blue';
      }
      account.status = status;
      await account.save();

      // Generate notifications and debt ledger for shortfall or surplus
      if (status === 'red') {
        const shortfallAmount = account.target - account.balance;
        // Create expense transaction for shortfall (aligns with tests and reporting)
        const shortfallTx = new Transaction({
          user: userId,
          amount: shortfallAmount,
          type: 'expense',
          description: `shortfall in ${account.type} account`,
          allocations: [{ account: account._id, amount: shortfallAmount }]
        });
        await shortfallTx.save();
        account.transactions.push(shortfallTx._id);
        await account.save();

        await generateNotification(userId, 'missed_deposit', 'Missed Deposit Alert', `Your ${account.type} account is below target. Shortfall: KES ${shortfallAmount.toFixed(2)}`, account._id, 'high');
      } else if (status === 'blue') {
        await generateNotification(userId, 'surplus', 'Surplus Alert', `Your ${account.type} account has exceeded target. Surplus: KES ${(account.balance - account.target).toFixed(2)}`, account._id, 'medium');
      }

      allocations.push({ account: account._id, amount: splitAmount });
    }

    // Main income transaction (summary)
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
    const { amount, description, tag, target, accountId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }

    const options = { target, accountId };
    const result = await allocateIncome(req.user._id, amount, description.trim(), tag, options);

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

// Update account flags (isWallet, isAutoDistribute)
const updateAccountFlags = async (req, res) => {
  try {
    const { id } = req.params;
    const { isWallet, isAutoDistribute } = req.body || {};

    const account = await Account.findOne({ _id: id, user: req.user._id });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Enforce single wallet per user
    if (typeof isWallet === 'boolean') {
      if (isWallet === true) {
        await Account.updateMany(
          { user: req.user._id, _id: { $ne: id } },
          { $set: { isWallet: false } }
        );
        account.isWallet = true;
      } else {
        account.isWallet = false;
      }
    }

    if (typeof isAutoDistribute === 'boolean') {
      account.isAutoDistribute = isAutoDistribute;
    }

    await account.save();

    res.json({ message: 'Account preferences updated', account });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addIncome,
  getAccounts,
  updateAccountPercentage,
  updateAccountFlags,
  allocateIncome // Export for use in other modules
};