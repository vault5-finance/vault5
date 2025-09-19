const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary
} = require('../controllers/transactionsController');
const {
  geoGate,
  ipDenyGate,
  deviceGate,
  limitationGate,
  capsGate,
  velocityGate,
} = require('../middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Apply geo/IP/device gates to all transaction routes
router.use(geoGate, ipDenyGate, deviceGate);

router.get('/', getTransactions);
// Create transaction must pass limitation (outgoing-only), caps, and velocity checks
// limitationGateOutgoing allows income while blocking outgoing operations under limitation
router.post('/', limitationGateOutgoing, capsGate, velocityGate, createTransaction);

router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);
router.get('/summary', getTransactionSummary);

module.exports = router;