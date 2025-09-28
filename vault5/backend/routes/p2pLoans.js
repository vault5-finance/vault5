const express = require('express');
const { protect } = require('../middleware/auth');
const p2pLoansController = require('../controllers/p2pLoansController');

const router = express.Router();

// All P2P loan routes require authentication
router.use(protect);

// Privacy-preserving eligibility check
// POST /api/p2p-loans/eligibility-check
router.post('/eligibility-check', p2pLoansController.eligibilityCheck);

// List loans for current user (borrowed and lent)
// GET /api/p2p-loans
router.get('/', p2pLoansController.listLoans);

// Create a new loan request (borrower -> lender)
// POST /api/p2p-loans
router.post('/', p2pLoansController.createLoanRequest);

// Get loan detail for borrower or lender
// GET /api/p2p-loans/:id
router.get('/:id', p2pLoansController.getLoan);

// Lender actions
// POST /api/p2p-loans/:id/approve
router.post('/:id/approve', p2pLoansController.approveLoan);
// POST /api/p2p-loans/:id/decline
router.post('/:id/decline', p2pLoansController.declineLoan);

// Repayment and schedule management (borrower or lender where applicable)
// POST /api/p2p-loans/:id/repay
router.post('/:id/repay', p2pLoansController.repayLoan);
// POST /api/p2p-loans/:id/reschedule
router.post('/:id/reschedule', p2pLoansController.rescheduleLoan);
// POST /api/p2p-loans/:id/writeoff
router.post('/:id/writeoff', p2pLoansController.writeoffLoan);

module.exports = router;