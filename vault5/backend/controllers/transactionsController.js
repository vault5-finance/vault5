const { Transaction, User, Account } = require('../models');
const { analyzeTransaction } = require('../services/fraudDetection');

// Get all transactions for a user
const getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, limit = 100 } = req.query;
    let query = { user: req.user._id };

    // Add date filtering if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .populate('allocations.account', 'type percentage');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new transaction
const createTransaction = async (req, res) => {
  try {
    const { type, amount, description, category, date } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }

    const transaction = new Transaction({
      user: req.user._id,
      type,
      amount,
      description: description.trim(),
      category: category || null,
      date: date || new Date()
    });

    // Perform fraud analysis
    const fraudAnalysis = await analyzeTransaction(req.user._id, transaction);
    transaction.fraudRisk = {
      riskScore: fraudAnalysis.riskScore,
      isHighRisk: fraudAnalysis.isHighRisk,
      flags: fraudAnalysis.flags
    };

    await transaction.save();

    // If it's income, trigger allocation engine
    if (type === 'income') {
      const { allocateIncome } = require('./accountsController');
      try {
        await allocateIncome(req.user._id, amount, description, category);
      } catch (allocationError) {
        console.error('Allocation failed:', allocationError);
        // Don't fail the transaction if allocation fails
      }
    }

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('allocations.account', 'type percentage');

    res.status(201).json(populatedTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a transaction
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, description, category, date } = req.body;

    const transaction = await Transaction.findOne({ _id: id, user: req.user._id });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    transaction.type = type || transaction.type;
    transaction.amount = amount || transaction.amount;
    transaction.description = description || transaction.description;
    transaction.category = category || transaction.category;
    transaction.date = date || transaction.date;

    await transaction.save();

    const updatedTransaction = await Transaction.findById(id)
      .populate('allocations.account', 'type percentage');

    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a transaction
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOneAndDelete({ _id: id, user: req.user._id });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get transaction summary (for reports)
const getTransactionSummary = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    const userId = req.user._id;

    // Calculate date range based on period
    const now = new Date();
    let startDate;

    switch (period) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const transactions = await Transaction.find({
      user: userId,
      date: { $gte: startDate, $lte: now }
    });

    const summary = {
      period,
      totalIncome: 0,
      totalExpenses: 0,
      netCashFlow: 0,
      transactionCount: transactions.length,
      categories: {}
    };

    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        summary.totalIncome += transaction.amount;
      } else {
        summary.totalExpenses += transaction.amount;
      }

      // Category breakdown
      const category = transaction.category || 'Uncategorized';
      if (!summary.categories[category]) {
        summary.categories[category] = { income: 0, expenses: 0, count: 0 };
      }
      summary.categories[category][transaction.type === 'income' ? 'income' : 'expenses'] += transaction.amount;
      summary.categories[category].count += 1;
    });

    summary.netCashFlow = summary.totalIncome - summary.totalExpenses;

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Validate if phone number is tied to user's account for deposits
const validateDepositPhone = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const userId = req.user._id;

    if (!phoneNumber) {
      return res.status(400).json({
        message: 'Phone number is required',
        valid: false
      });
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');

    // Validate phone number format (Kenyan numbers)
    const kenyanPhoneRegex = /^(\+254|254|0)[17]\d{8}$/;
    if (!kenyanPhoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        message: 'Invalid Kenyan phone number format',
        valid: false
      });
    }

    // Get user details to check tied phone numbers
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        valid: false
      });
    }

    // Check if the phone number matches user's registered phone
    const userPhone = user.phone?.replace(/[\s\-\(\)]/g, '');
    const isTiedToAccount = userPhone === cleanPhone;

    // Additional validation - check if phone is in user's trusted contacts
    const hasTrustedContact = user.trustedContacts?.some(contact =>
      contact.phone?.replace(/[\s\-\(\)]/g, '') === cleanPhone
    );

    const isValid = isTiedToAccount || hasTrustedContact;

    res.json({
      valid: isValid,
      tiedToAccount: isTiedToAccount,
      trustedContact: hasTrustedContact,
      message: isValid
        ? 'Phone number is authorized for deposits'
        : 'Phone number is not tied to your account. Only registered phone numbers can be used for deposits.',
      phoneInfo: {
        formatted: cleanPhone.startsWith('+254') ? cleanPhone : `+254${cleanPhone.substring(cleanPhone.length - 9)}`,
        network: cleanPhone.includes('2547') ? 'Airtel' : 'Safaricom'
      }
    });

  } catch (error) {
    console.error('Phone validation error:', error);
    res.status(500).json({
      message: 'Phone validation failed',
      valid: false,
      error: error.message
    });
  }
};

// Real-time user verification for transfers
const verifyRecipient = async (req, res) => {
  try {
    const { recipientEmail, recipientPhone } = req.body;
    const senderId = req.user._id;

    if (!recipientEmail && !recipientPhone) {
      return res.status(400).json({
        message: 'Recipient email or phone number is required'
      });
    }

    // Find recipient user
    let recipient = null;
    let searchCriteria = {};

    if (recipientEmail) {
      searchCriteria.email = recipientEmail;
    } else if (recipientPhone) {
      searchCriteria.phone = recipientPhone;
    }

    recipient = await User.findOne(searchCriteria);

    if (!recipient) {
      return res.status(404).json({
        message: 'Recipient not found',
        verified: false,
        vaultUser: false
      });
    }

    // Don't allow self-verification
    if (recipient._id.toString() === senderId.toString()) {
      return res.status(400).json({
        message: 'Cannot verify yourself',
        verified: false,
        vaultUser: true
      });
    }

    // Check if recipient account is blocked
    const isBlocked = recipient.status === 'blocked' || recipient.status === 'suspended';

    // Check if recipient has active accounts
    const recipientAccounts = await Account.find({
      user: recipient._id,
      balance: { $gt: 0 }
    });

    const hasActiveAccounts = recipientAccounts.length > 0;

    // Kenyan-style verification (Hakikisha simulation)
    const verificationResult = {
      verified: true,
      vaultUser: true,
      recipient: {
        id: recipient._id,
        name: recipient.name,
        email: recipient.email,
        phone: recipient.phone,
        avatar: recipient.avatar || '👤',
        vaultUsername: recipient.username || `@${recipient.name.toLowerCase().replace(/\s+/g, '')}`,
        accountNumber: recipient.accountNumber || 'N/A',
        bankName: recipient.bankName || 'Vault5 Bank'
      },
      accountStatus: {
        isBlocked,
        hasActiveAccounts,
        canReceiveTransfers: !isBlocked && hasActiveAccounts,
        totalBalance: recipientAccounts.reduce((sum, acc) => sum + acc.balance, 0)
      },
      crossPlatform: {
        canReceiveFromMpesa: true,
        canReceiveFromAirtel: true,
        canReceiveFromBanks: true,
        supportedNetworks: ['M-Pesa', 'Airtel Money', 'KCB', 'Equity', 'Co-op', 'DTB']
      },
      security: {
        lastLogin: recipient.lastLogin || new Date(),
        accountAge: Math.floor((Date.now() - new Date(recipient.createdAt).getTime()) / (1000 * 60 * 60 * 24)), // days
        trustScore: Math.floor(Math.random() * 30) + 70, // 70-100 trust score
        verificationLevel: 'high'
      }
    };

    res.json(verificationResult);

  } catch (error) {
    console.error('Recipient verification error:', error);
    res.status(500).json({
      message: 'Verification failed',
      verified: false,
      error: error.message
    });
  }
};

// P2P Money Transfer between Vault5 users (supports linked accounts)
const transferToUser = async (req, res) => {
  try {
    const { recipientEmail, recipientPhone, amount, fromAccountId, description } = req.body;
    const senderId = req.user._id;

    if ((!recipientEmail && !recipientPhone) || !amount || !fromAccountId) {
      return res.status(400).json({
        message: 'Recipient email or phone, amount, and from account are required'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    // Find recipient user (supports linked emails and phones)
    let recipient = null;
    let foundBy = '';

    if (recipientEmail) {
      // Try to find by primary email first
      recipient = await User.findOne({ 'emails.email': recipientEmail.toLowerCase() });
      if (recipient) foundBy = 'email';
    }

    if (!recipient && recipientPhone) {
      // Try to find by phone
      recipient = await User.findOne({ 'phones.phone': recipientPhone });
      if (recipient) foundBy = 'phone';
    }

    if (!recipient) {
      return res.status(404).json({
        message: 'Recipient not found',
        searchedBy: recipientEmail ? 'email' : 'phone'
      });
    }

    // Don't allow self-transfer
    if (recipient._id.toString() === senderId.toString()) {
      return res.status(400).json({ message: 'Cannot transfer to yourself' });
    }

    // Find sender's account
    const senderAccount = await Account.findOne({
      _id: fromAccountId,
      user: senderId
    });

    if (!senderAccount) {
      return res.status(404).json({ message: 'Sender account not found' });
    }

    if (senderAccount.balance < amount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    // Find recipient's Daily account (default receiving account)
    const recipientDailyAccount = await Account.findOne({
      user: recipient._id,
      type: 'Daily'
    });

    if (!recipientDailyAccount) {
      return res.status(404).json({ message: 'Recipient Daily account not found' });
    }

    // Start transaction
    const session = await Account.startSession();
    session.startTransaction();

    try {
      // Deduct from sender's account
      senderAccount.balance -= amount;
      await senderAccount.save({ session });

      // Add to recipient's account
      recipientDailyAccount.balance += amount;
      await recipientDailyAccount.save({ session });

      // Create transaction records for both users
      const senderTransaction = new Transaction({
        user: senderId,
        type: 'expense',
        amount: amount,
        description: `Transfer to ${recipient.name} - ${description || 'P2P Transfer'}`,
        category: 'Transfer',
        date: new Date()
      });

      const recipientTransaction = new Transaction({
        user: recipient._id,
        type: 'income',
        amount: amount,
        description: `Transfer from ${req.user.name} - ${description || 'P2P Transfer'}`,
        category: 'Transfer',
        date: new Date()
      });

      await senderTransaction.save({ session });
      await recipientTransaction.save({ session });

      // Commit transaction
      await session.commitTransaction();

      res.status(200).json({
        message: 'Transfer completed successfully',
        transfer: {
          amount,
          recipient: {
            name: recipient.name,
            email: recipientEmail,
            phone: recipientPhone,
            foundBy: foundBy,
            linkedAccount: foundBy === 'email' ? 'email' : 'phone'
          },
          senderAccount: senderAccount.type,
          recipientAccount: recipientDailyAccount.type
        }
      });

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (error) {
    console.error('P2P Transfer error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
  transferToUser,
  verifyRecipient,
  validateDepositPhone
};