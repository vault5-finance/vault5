const express = require('express');
const { protect } = require('../middleware/auth');
const { createInvestment, getInvestments, updateInvestment, deleteInvestment } = require('../controllers/investmentsController');

const router = express.Router();

router.use(protect); // All routes protected

router.post('/', createInvestment);
router.get('/', getInvestments);
router.put('/:id', updateInvestment);
router.delete('/:id', deleteInvestment);

module.exports = router;