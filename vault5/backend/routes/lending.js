const express = require('express');
const { protect } = require('../middleware/auth');
const { createLending, getLendings, updateLendingStatus, getLendingLedger } = require('../controllers/lendingController');

const router = express.Router();

router.use(protect); // All routes protected

router.post('/', createLending);
router.get('/', getLendings);
router.put('/:id/status', updateLendingStatus);
router.get('/ledger', getLendingLedger);

module.exports = router;