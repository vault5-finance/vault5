const express = require('express');
const { protect } = require('../middleware/auth');
const {
  geoGate,
  ipDenyGate,
  deviceGate,
  limitationGateOutgoing,
  capsGate,
  velocityGate,
} = require('../middleware');
const {
  initiateDeposit,
  confirmDeposit,
  mpesaCallback,
  airtelCallback,
  getStatus,
  listRecent,
} = require('../controllers/paymentsController');

const router = express.Router();

// Auth required for user-facing endpoints
router.use('/deposits', protect);
router.use('/transactions', protect);
router.use('/recent', protect);

// Apply network/device gates to sensitive money-moving endpoints
router.post('/deposits/initiate', geoGate, ipDenyGate, deviceGate, limitationGateOutgoing, capsGate, velocityGate, initiateDeposit);
router.post('/deposits/confirm', confirmDeposit);

// Provider callbacks (no auth). In production secure by IP/signature.
router.post('/providers/mpesa/callback', mpesaCallback);
router.post('/providers/airtel/callback', airtelCallback);

// Status + listing
router.get('/transactions/:id/status', getStatus);
router.get('/recent', listRecent);

module.exports = router;