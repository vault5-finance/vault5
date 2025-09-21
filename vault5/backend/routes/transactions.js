const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
  transferToUser,
  transferToLinkedAccount,
  verifyRecipient,
  validateDepositPhone
} = require('../controllers/transactionsController');
const {
  geoGate,
  ipDenyGate,
  deviceGate,
  limitationGate,
  limitationGateOutgoing,
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

// Real-time recipient verification - minimal security gates for verification
router.post('/verify-recipient', geoGate, ipDenyGate, deviceGate, verifyRecipient);

// Phone validation for deposits - minimal security gates
router.post('/validate-deposit-phone', geoGate, ipDenyGate, deviceGate, validateDepositPhone);

// P2P transfer route - must pass all security gates
router.post('/transfer', limitationGateOutgoing, capsGate, velocityGate, transferToUser);

// Linked account transfer route - must pass all security gates
router.post('/transfer/linked-account', limitationGateOutgoing, capsGate, velocityGate, transferToLinkedAccount);

module.exports = router;