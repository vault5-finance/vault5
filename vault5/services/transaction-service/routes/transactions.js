const express = require('express');
const router = express.Router();
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
  getHighRiskTransactions,
  transactionValidation
} = require('../controllers/transactionsController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET /api/transactions - Get all transactions for user
router.get('/', getTransactions);

// POST /api/transactions - Create new transaction
router.post('/', transactionValidation, createTransaction);

// GET /api/transactions/summary - Get transaction summary
router.get('/summary', getTransactionSummary);

// GET /api/transactions/high-risk - Get high-risk transactions
router.get('/high-risk', getHighRiskTransactions);

// PUT /api/transactions/:id - Update transaction
router.put('/:id', transactionValidation, updateTransaction);

// DELETE /api/transactions/:id - Delete transaction
router.delete('/:id', deleteTransaction);

module.exports = router;