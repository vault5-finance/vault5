const { Transaction, User } = require('../models');

// Get all transactions for a user
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ date: -1 })
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

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary
};