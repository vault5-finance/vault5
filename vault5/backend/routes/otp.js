const express = require('express');
const { body, validationResult } = require('express-validator');
const otpService = require('../services/otpService');
const { protect } = require('../middleware');
const { normalizePhoneNumber } = require('../utils/phoneUtils');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Request OTP for phone verification
router.post('/request', [
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .custom((value) => normalizePhoneNumber(value) !== null)
    .withMessage('Invalid Kenyan phone number format'),
  body('purpose')
    .optional()
    .isIn(['phone_verification', 'password_reset', 'transaction_verification'])
    .withMessage('Invalid OTP purpose')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { phoneNumber, purpose = 'phone_verification' } = req.body;

    // Request OTP
    const result = await otpService.requestOTP(phoneNumber, purpose);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        expiresAt: result.expiresAt,
        // Don't send actual OTP in production
        otp: process.env.NODE_ENV === 'development' ? result.smsResult.message.match(/\d{6}/)[0] : undefined
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
});

// Verify OTP
router.post('/verify', [
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .custom((value) => normalizePhoneNumber(value) !== null)
    .withMessage('Invalid Kenyan phone number format'),
  body('otp')
    .notEmpty()
    .withMessage('OTP is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),
  body('purpose')
    .optional()
    .isIn(['phone_verification', 'password_reset', 'transaction_verification'])
    .withMessage('Invalid OTP purpose')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { phoneNumber, otp, purpose = 'phone_verification' } = req.body;

    // Verify OTP (pass current user to bind verification to their account)
    const result = await otpService.verifyOTP(phoneNumber, otp, purpose, req.user?.id);

    res.json(result);
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP'
    });
  }
});

// Resend OTP
router.post('/resend', [
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .custom((value) => normalizePhoneNumber(value) !== null)
    .withMessage('Invalid Kenyan phone number format'),
  body('purpose')
    .optional()
    .isIn(['phone_verification', 'password_reset', 'transaction_verification'])
    .withMessage('Invalid OTP purpose')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { phoneNumber, purpose = 'phone_verification' } = req.body;

    // Resend OTP
    const result = await otpService.resendOTP(phoneNumber, purpose);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        expiresAt: result.expiresAt,
        // Don't send actual OTP in production
        otp: process.env.NODE_ENV === 'development' ? result.smsResult.message.match(/\d{6}/)[0] : undefined
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('OTP resend error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP'
    });
  }
});

// Check OTP status
router.get('/status/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const { purpose = 'phone_verification' } = req.query;

    const normalized = normalizePhoneNumber(phoneNumber);
    if (!normalized) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Kenyan phone number format'
      });
    }

    const status = otpService.getOTPStatus(normalized, purpose);

    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('OTP status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check OTP status'
    });
  }
});

// Check if phone is verified
router.get('/phone-status/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    const normalized = normalizePhoneNumber(phoneNumber);
    if (!normalized) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Kenyan phone number format'
      });
    }

    const isVerified = await otpService.isPhoneVerified(normalized);

    res.json({
      success: true,
      phoneNumber: normalized,
      isVerified
    });
  } catch (error) {
    console.error('Phone verification status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check phone verification status'
    });
  }
});

module.exports = router;