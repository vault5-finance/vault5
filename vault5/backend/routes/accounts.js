const express = require('express');
const { protect } = require('../middleware/auth');
const { addIncome, getAccounts, updateAccountPercentage, updateAccountFlags } = require('../controllers/accountsController');

const router = express.Router();

router.use(protect); // All routes protected

router.get('/', getAccounts);
router.post('/income', addIncome);
router.put('/:id/percentage', updateAccountPercentage);
router.patch('/:id/flags', updateAccountFlags);

module.exports = router;