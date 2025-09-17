const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary
} = require('../controllers/transactionsController');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', getTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);
router.get('/summary', getTransactionSummary);

module.exports = router;