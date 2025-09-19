const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getComplianceStatus,
  submitKycRequest,
  listMyKycRequests,
  requestPayout,
} = require('../controllers/complianceController');
const {
  geoGate,
  ipDenyGate,
  deviceGate,
} = require('../middleware');

const router = express.Router();

// All compliance endpoints require authentication.
// Apply geo/IP/device gates as light checks (do not block status reads if policies absent).
router.use(protect, geoGate, ipDenyGate, deviceGate);

// GET /api/compliance/status
router.get('/status', getComplianceStatus);

// KYC endpoints
// POST /api/compliance/kyc
router.post('/kyc', submitKycRequest);

// GET /api/compliance/kyc
router.get('/kyc', listMyKycRequests);

// POST /api/compliance/payouts
router.post('/payouts', requestPayout);

module.exports = router;