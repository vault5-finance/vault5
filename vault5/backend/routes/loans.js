const express = require('express');
const { protect } = require('../middleware/auth');
const { createLoan, getLoans, makeRepayment, updateLoan, deleteLoan, checkSecurity } = require('../controllers/loansController');
const {
  geoGate,
  ipDenyGate,
  deviceGate,
  limitationGate,
  loanEligibilityGate,
} = require('../middleware');

const router = express.Router();

router.use(protect); // All routes protected

// Apply regional/network/device gates to all loan routes
router.use(geoGate, ipDenyGate, deviceGate);

// Create loan requires eligibility and must not be under limitation
router.post('/', limitationGate, loanEligibilityGate, createLoan);

// Listing loans allowed for all authenticated users
router.get('/', getLoans);

// Security check for lending
router.post('/check-security', checkSecurity);

// Repayments are money-moving; block if under limitation
router.post('/:id/repay', limitationGate, makeRepayment);

router.put('/:id', updateLoan);
router.delete('/:id', deleteLoan);

module.exports = router;