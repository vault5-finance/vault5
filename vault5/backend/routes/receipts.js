const express = require('express');
const { protect } = require('../middleware/auth');
const {
  processReceiptUpload,
  processReceiptText,
  getReceiptHistory,
  testReceiptProcessing,
  upload
} = require('../controllers/receiptController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Upload and process receipt image
router.post('/upload', upload.single('receipt'), processReceiptUpload);

// Process receipt text directly
router.post('/process-text', processReceiptText);

// Get receipt processing history
router.get('/history', getReceiptHistory);

// Test receipt processing (development only)
router.get('/test', testReceiptProcessing);

module.exports = router;