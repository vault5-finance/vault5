const express = require('express');
const { downloadUserAgreementPDF } = require('../controllers/legalController');

const router = express.Router();

// Public legal routes (no auth required)
router.get('/user-agreement.pdf', downloadUserAgreementPDF);

module.exports = router;