const express = require('express');
const { protect } = require('../middleware/auth');
const { idempotency } = require('../middleware/idempotency');
const { reAuth2FAP2PLoan } = require('../middleware/reAuth2FA');
const p2pLoansController = require('../controllers/p2pLoansController');

const router = express.Router();

// All P2P loan routes require authentication
router.use(protect);

// Privacy-preserving eligibility check
// POST /api/p2p-loans/eligibility-check
router.post('/eligibility-check', idempotency(), p2pLoansController.eligibilityCheck);

// List loans for current user (borrowed and lent)
// GET /api/p2p-loans
router.get('/', p2pLoansController.listLoans);

// Create a new loan request (borrower -> lender)
// POST /api/p2p-loans
router.post('/', idempotency(), p2pLoansController.createLoanRequest);

// Get loan detail for borrower or lender
// GET /api/p2p-loans/:id
router.get('/:id', p2pLoansController.getLoan);

// Get lending capacity preview for lender (before approval)
// GET /api/p2p-loans/:id/capacity-preview
router.get('/:id/capacity-preview', p2pLoansController.getCapacityPreview);

// Lender actions
// POST /api/p2p-loans/:id/approve
router.post('/:id/approve', reAuth2FAP2PLoan, idempotency(), p2pLoansController.approveLoan);
// POST /api/p2p-loans/:id/decline
router.post('/:id/decline', idempotency(), p2pLoansController.declineLoan);

// Repayment and schedule management (borrower or lender where applicable)
// POST /api/p2p-loans/:id/repay
router.post('/:id/repay', idempotency(), p2pLoansController.repayLoan);
// POST /api/p2p-loans/:id/reschedule
router.post('/:id/reschedule', idempotency(), p2pLoansController.rescheduleLoan);
// POST /api/p2p-loans/:id/writeoff
router.post('/:id/writeoff', idempotency(), p2pLoansController.writeoffLoan);

module.exports = router;