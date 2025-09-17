const express = require('express');
const { protect } = require('../middleware/auth');
const { createLoan, getLoans, makeRepayment, updateLoan, deleteLoan } = require('../controllers/loansController');

const router = express.Router();

router.use(protect); // All routes protected

router.post('/', createLoan);
router.get('/', getLoans);
router.post('/:id/repay', makeRepayment);
router.put('/:id', updateLoan);
router.delete('/:id', deleteLoan);

module.exports = router;