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

// P2P Money Transfer between Vault5 users
const transferToUser = async (req, res) => {
  try {
    const { recipientEmail, amount, fromAccountId, description } = req.body;
    const senderId = req.user._id;

    if (!recipientEmail || !amount || !fromAccountId) {
      return res.status(400).json({
        message: 'Recipient email, amount, and from account are required'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    // Find recipient user
    const recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
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
            email: recipientEmail
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
  transferToUser
};