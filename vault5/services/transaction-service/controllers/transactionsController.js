const Transaction = require('../models/transaction');
const { logger } = require('../server');
const { body, validationResult } = require('express-validator');
const eventPublisher = require('../services/eventPublisher');
const fraudDetectionService = require('../services/fraudDetection');

// Validation rules
const transactionValidation = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('description').trim().isLength({ min: 1, max: 500 }).withMessage('Description is required and must be less than 500 characters'),
  body('date').optional().isISO8601().withMessage('Invalid date format')
];

// Get all transactions for a user
const getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, type, limit = 100, offset = 0 } = req.query;
    const userId = req.user.id;

    const filters = {};
    if (type) filters.type = type;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    const pagination = {
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    const transactions = await Transaction.findByUserId(userId, filters, pagination);

    // Get total count for pagination
    const totalCount = await Transaction.countByUserId(userId, filters);

    res.json({
      transactions,
      pagination: {
        total: totalCount,
        limit: pagination.limit,
        offset: pagination.offset,
        hasMore: (pagination.offset + pagination.limit) < totalCount
      }
    });
  } catch (error) {
    logger.error('Get transactions error:', error);
    res.status(500).json({ message: 'Failed to retrieve transactions' });
  }
};

// Create a new transaction
const createTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, amount, description, tag, date, categoryId } = req.body;
    const userId = req.user.id;

    // Perform fraud analysis
    const fraudAnalysis = await fraudDetectionService.analyzeTransaction(userId, transactionData);

    const transactionData = {
      userId,
      amount: parseFloat(amount),
      type,
      description: description.trim(),
      tag: tag || '',
      date: date ? new Date(date) : new Date(),
      fraudRisk: fraudAnalysis
    };

    const transaction = await Transaction.create(transactionData);

    // Publish transaction created event
    await eventPublisher.transactionCreated(transaction);

    // If it's income, trigger allocation engine
    if (type === 'income') {
      // This will be implemented in allocation engine
      logger.info(`Income transaction created: ${transaction.id}`);
    }

    res.status(201).json(transaction);
  } catch (error) {
    logger.error('Create transaction error:', error);
    res.status(500).json({ message: 'Failed to create transaction' });
  }
};

// Update a transaction
const updateTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { type, amount, description, tag, date } = req.body;
    const userId = req.user.id;

    const transaction = await Transaction.findById(id);
    if (!transaction || transaction.userId !== userId) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const updateData = {};
    if (type !== undefined) updateData.type = type;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (description !== undefined) updateData.description = description.trim();
    if (tag !== undefined) updateData.tag = tag || '';
    if (date !== undefined) updateData.date = new Date(date);

    const updatedTransaction = await Transaction.updateById(id, updateData);

    res.json(updatedTransaction);
  } catch (error) {
    logger.error('Update transaction error:', error);
    res.status(500).json({ message: 'Failed to update transaction' });
  }
};

// Delete a transaction
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const transaction = await Transaction.findById(id);
    if (!transaction || transaction.userId !== userId) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await Transaction.deleteById(id);

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    logger.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Failed to delete transaction' });
  }
};

// Get transaction summary (for reports)
const getTransactionSummary = async (req, res) => {
  try {
    const { period = 'monthly', startDate, endDate } = req.query;
    const userId = req.user.id;

    let start, end = new Date();

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      // Calculate date range based on period
      const now = new Date();
      switch (period) {
        case 'weekly':
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'yearly':
          start = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          start = new Date(now.getFullYear(), now.getMonth(), 1);
      }
    }

    const stats = await Transaction.getUserTransactionStats(userId, start, end);

    // Get category breakdown (simplified - will be enhanced)
    const transactions = await Transaction.findByUserId(userId, {
      startDate: start,
      endDate: end
    });

    const categories = {};
    transactions.forEach(transaction => {
      const category = transaction.tag || 'Uncategorized';
      if (!categories[category]) {
        categories[category] = { income: 0, expenses: 0, count: 0 };
      }
      if (transaction.type === 'income') {
        categories[category].income += transaction.amount;
      } else {
        categories[category].expenses += transaction.amount;
      }
      categories[category].count += 1;
    });

    const summary = {
      period,
      startDate: start,
      endDate: end,
      totalIncome: stats.total_income || 0,
      totalExpenses: stats.total_expenses || 0,
      netCashFlow: (stats.total_income || 0) - (stats.total_expenses || 0),
      transactionCount: stats.total_transactions || 0,
      categories
    };

    res.json(summary);
  } catch (error) {
    logger.error('Get transaction summary error:', error);
    res.status(500).json({ message: 'Failed to get transaction summary' });
  }
};

// Get high-risk transactions
const getHighRiskTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const minRiskScore = parseFloat(req.query.minRiskScore) || 0.7;

    const transactions = await Transaction.getFraudRiskTransactions(userId, minRiskScore);

    res.json({ transactions });
  } catch (error) {
    logger.error('Get high risk transactions error:', error);
    res.status(500).json({ message: 'Failed to get high risk transactions' });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
  getHighRiskTransactions,
  transactionValidation
};