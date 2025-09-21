const { User } = require('../models');

// Get user's linked accounts
const getLinkedAccounts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('preferences.linkedAccounts');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      linkedAccounts: user.preferences.linkedAccounts,
      canAddMore: user.canAddLinkedAccount()
    });
  } catch (error) {
    console.error('Get linked accounts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a new linked account
const addLinkedAccount = async (req, res) => {
  try {
    const { accountType, accountNumber, accountName } = req.body;

    if (!accountType || !accountNumber || !accountName) {
      return res.status(400).json({
        message: 'Account type, number, and name are required'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user can add more accounts
    if (!user.canAddLinkedAccount()) {
      return res.status(400).json({
        message: 'Maximum 3 linked accounts allowed'
      });
    }

    // Check if account already exists
    if (user.hasLinkedAccount(accountType, accountNumber)) {
      return res.status(400).json({
        message: 'Account already linked'
      });
    }

    // Generate verification token
    const verificationToken = require('crypto').randomBytes(32).toString('hex');

    // Add new linked account
    user.preferences.linkedAccounts.push({
      accountType,
      accountNumber,
      accountName,
      isVerified: false,
      verificationToken,
      verificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      isPrimary: user.preferences.linkedAccounts.length === 0 // First account is primary
    });

    await user.save();

    // In production: Send verification to linked account
    console.log(`Linked account verification for ${accountType} ${accountNumber}: ${verificationToken}`);

    res.status(201).json({
      message: 'Linked account added successfully. Verification required.',
      linkedAccount: user.preferences.linkedAccounts[user.preferences.linkedAccounts.length - 1],
      verificationToken // Remove in production
    });
  } catch (error) {
    console.error('Add linked account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify linked account
const verifyLinkedAccount = async (req, res) => {
  try {
    const { accountId, verificationCode } = req.body;

    if (!accountId || !verificationCode) {
      return res.status(400).json({
        message: 'Account ID and verification code are required'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const linkedAccount = user.preferences.linkedAccounts.id(accountId);
    if (!linkedAccount) {
      return res.status(404).json({ message: 'Linked account not found' });
    }

    // In production: Verify against actual verification code
    // For demo, accept any 6-digit code
    if (verificationCode.length !== 6 || !/^\d{6}$/.test(verificationCode)) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    linkedAccount.isVerified = true;
    linkedAccount.verificationToken = undefined;
    linkedAccount.verificationExpires = undefined;

    await user.save();

    res.json({
      message: 'Linked account verified successfully',
      linkedAccount
    });
  } catch (error) {
    console.error('Verify linked account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Set primary linked account
const setPrimaryLinkedAccount = async (req, res) => {
  try {
    const { accountId } = req.body;

    if (!accountId) {
      return res.status(400).json({
        message: 'Account ID is required'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const linkedAccount = user.preferences.linkedAccounts.id(accountId);
    if (!linkedAccount) {
      return res.status(404).json({ message: 'Linked account not found' });
    }

    if (!linkedAccount.isVerified) {
      return res.status(400).json({
        message: 'Linked account must be verified first'
      });
    }

    // Set all accounts to non-primary
    user.preferences.linkedAccounts.forEach(acc => {
      acc.isPrimary = false;
    });

    // Set selected account as primary
    linkedAccount.isPrimary = true;

    await user.save();

    res.json({
      message: 'Primary linked account updated successfully',
      primaryAccount: linkedAccount
    });
  } catch (error) {
    console.error('Set primary linked account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove linked account
const removeLinkedAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const accountIndex = user.preferences.linkedAccounts.findIndex(
      acc => acc._id.toString() === accountId
    );

    if (accountIndex === -1) {
      return res.status(404).json({ message: 'Linked account not found' });
    }

    const linkedAccount = user.preferences.linkedAccounts[accountIndex];

    // Cannot remove primary account if there are other accounts
    if (linkedAccount.isPrimary && user.preferences.linkedAccounts.length > 1) {
      return res.status(400).json({
        message: 'Cannot remove primary account. Set another account as primary first.'
      });
    }

    user.preferences.linkedAccounts.splice(accountIndex, 1);
    await user.save();

    res.json({
      message: 'Linked account removed successfully'
    });
  } catch (error) {
    console.error('Remove linked account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update linked account limits
const updateLinkedAccountLimits = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { dailyLimit, monthlyLimit } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const linkedAccount = user.preferences.linkedAccounts.id(accountId);
    if (!linkedAccount) {
      return res.status(404).json({ message: 'Linked account not found' });
    }

    if (dailyLimit !== undefined) {
      linkedAccount.limits.dailyLimit = dailyLimit;
    }

    if (monthlyLimit !== undefined) {
      linkedAccount.limits.monthlyLimit = monthlyLimit;
    }

    await user.save();

    res.json({
      message: 'Linked account limits updated successfully',
      linkedAccount
    });
  } catch (error) {
    console.error('Update linked account limits error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getLinkedAccounts,
  addLinkedAccount,
  verifyLinkedAccount,
  setPrimaryLinkedAccount,
  removeLinkedAccount,
  updateLinkedAccountLimits
};