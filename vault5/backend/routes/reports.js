const express = require('express');
const { protect } = require('../middleware/auth');
const { getDashboard, getCashFlowReport, exportToPDF, exportToExcel } = require('../controllers/reportsController');

const router = express.Router();

router.use(protect); // All routes protected

router.get('/dashboard', getDashboard);
router.get('/cashflow', getCashFlowReport);
router.get('/export/pdf', exportToPDF);
router.get('/export/excel', exportToExcel);

module.exports = router;