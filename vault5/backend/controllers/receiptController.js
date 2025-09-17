const receiptProcessor = require('../services/receiptProcessor');
const multer = require('multer');
const path = require('path');

// Configure multer for receipt uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/receipts'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF) and PDFs are allowed'));
    }
  }
});

// Process uploaded receipt image
const processReceiptUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No receipt file uploaded' });
    }

    // For now, we'll assume OCR has already been performed and text is provided
    // In a real implementation, you'd integrate with an OCR service like Google Vision API
    const ocrText = req.body.ocrText || req.body.text;

    if (!ocrText) {
      return res.status(400).json({
        message: 'OCR text is required. Please provide the extracted text from the receipt.'
      });
    }

    const result = await receiptProcessor.processAndSaveReceipt(ocrText, req.user._id);

    res.json({
      message: `Receipt processed successfully. Transaction ${result.action}.`,
      transaction: result.transaction,
      receiptData: result.receiptData
    });

  } catch (error) {
    console.error('Receipt processing error:', error);
    res.status(500).json({
      message: 'Failed to process receipt',
      error: error.message
    });
  }
};

// Process receipt text directly (for API testing)
const processReceiptText = async (req, res) => {
  try {
    const { text, ocrText } = req.body;

    if (!text && !ocrText) {
      return res.status(400).json({ message: 'Receipt text is required' });
    }

    const receiptText = text || ocrText;
    const processedData = await receiptProcessor.processReceiptText(receiptText);

    res.json({
      message: 'Receipt text processed successfully',
      data: processedData
    });

  } catch (error) {
    console.error('Receipt text processing error:', error);
    res.status(500).json({
      message: 'Failed to process receipt text',
      error: error.message
    });
  }
};

// Get receipt processing history
const getReceiptHistory = async (req, res) => {
  try {
    const { Transaction } = require('../models');

    const receipts = await Transaction.find({
      user: req.user._id,
      receiptData: { $exists: true }
    })
    .sort({ createdAt: -1 })
    .select('description amount date receiptData');

    res.json(receipts);
  } catch (error) {
    console.error('Receipt history error:', error);
    res.status(500).json({ message: 'Failed to fetch receipt history' });
  }
};

// Test receipt processing with sample data
const testReceiptProcessing = async (req, res) => {
  try {
    const sampleReceipts = [
      {
        text: `NAKUMATT SUPERMARKET
Date: 15/09/2024
Time: 14:30

Milk - 150.00
Bread - 80.00
Eggs - 120.00
Sugar - 95.00

Total: 445.00 KES
Thank you for shopping!`
      },
      {
        text: `SHELL PETROL STATION
Date: 16/09/2024

Fuel Type: Petrol
Litres: 40
Price per litre: 180.00

Total Amount: 7200.00 KES
Payment: M-Pesa`
      }
    ];

    const results = [];

    for (const sample of sampleReceipts) {
      const processed = await receiptProcessor.processReceiptText(sample.text);
      results.push({
        input: sample.text,
        output: processed
      });
    }

    res.json({
      message: 'Receipt processing test completed',
      results
    });

  } catch (error) {
    console.error('Test processing error:', error);
    res.status(500).json({
      message: 'Test failed',
      error: error.message
    });
  }
};

module.exports = {
  processReceiptUpload,
  processReceiptText,
  getReceiptHistory,
  testReceiptProcessing,
  upload
};