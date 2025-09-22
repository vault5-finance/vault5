const express = require('express');
const { body, param, validationResult } = require('express-validator');
const emailVerificationService = require('../services/emailVerificationService');
const { protect, authorize } = require('../middleware');

const router = express.Router();

/**
 * @route POST /api/email-verification/send
 * @desc Send email verification link
 * @access Private
 */
router.post('/send', protect, [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;
    const userId = req.user.id;

    // Check if user exists and owns the email
    const User = require('../models/User');
    const user = await User.findById(userId).select('emails isEmailVerified username');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const emailEntry = (user.emails || []).find(e => e.email === email);
    if (!emailEntry) {
      return res.status(403).json({
        success: false,
        message: 'Email address is not linked to your account'
      });
    }

    // Check if already verified
    if (emailEntry.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'This email is already verified'
      });
    }

    // Generate and send verification email
    const token = emailVerificationService.generateVerificationToken(email);
    const emailResult = await emailVerificationService.sendVerificationEmail(email, token, user.username);

    if (emailResult.success) {
      res.json({
        success: true,
        message: 'Verification email sent successfully',
        expiresIn: '24 hours'
      });
    } else {
      res.status(500).json({
        success: false,
        message: emailResult.message
      });
    }
  } catch (error) {
    console.error('Send email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification email'
    });
  }
});

/**
 * @route POST /api/email-verification/resend
 * @desc Resend email verification link
 * @access Private
 */
router.post('/resend', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const User = require('../models/User');
    const user = await User.findById(userId).select('emails isEmailVerified username');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.emails || user.emails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No email linked to this account'
      });
    }

    const primary = user.emails.find(e => e.isPrimary) || user.emails[0];

    if (primary.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Primary email is already verified'
      });
    }

    const result = await emailVerificationService.resendVerificationEmail(primary.email);

    if (result.success) {
      res.json({
        success: true,
        message: 'Verification email resent successfully',
        expiresIn: '24 hours'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Resend email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email'
    });
  }
});

/**
 * @route GET /api/email-verification/verify/:token
 * @desc Verify email using token from email link
 * @access Public
 */
router.get('/verify/:token', [
  param('token').isLength({ min: 64, max: 64 }).withMessage('Invalid verification token')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token',
        errors: errors.array()
      });
    }

    const { token } = req.params;
    const result = await emailVerificationService.verifyEmail(token);

    if (result.success) {
      // Redirect to frontend with success message
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/email-verified?success=true&message=${encodeURIComponent(result.message)}`;
      res.redirect(redirectUrl);
    } else {
      // Redirect to frontend with error message
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/email-verified?success=false&message=${encodeURIComponent(result.message)}`;
      res.redirect(redirectUrl);
    }
  } catch (error) {
    console.error('Email verification error:', error);
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/email-verified?success=false&message=${encodeURIComponent('Verification failed')}`;
    res.redirect(redirectUrl);
  }
});

/**
 * @route GET /api/email-verification/status
 * @desc Check email verification status
 * @access Private
 */
router.get('/status', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const User = require('../models/User');
    const user = await User.findById(userId).select('emails isEmailVerified emailVerifiedAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const primaryEmail = user.emails?.find(e => e.isPrimary)?.email || user.emails?.[0]?.email || null;

    res.json({
      success: true,
      data: {
        email: primaryEmail,
        isVerified: user.isEmailVerified,
        verifiedAt: user.emailVerifiedAt
      }
    });
  } catch (error) {
    console.error('Check email verification status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check verification status'
    });
  }
});

/**
 * @route POST /api/email-verification/send-to-email
 * @desc Send verification email to specific email (admin function)
 * @access Private (Admin only)
 */
router.post(
  '/send-to-email',
  protect,
  authorize('super_admin','system_admin','finance_admin','compliance_admin','support_admin','content_admin','account_admin'),
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address')
  ],
  async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Admin access is enforced by authorize middleware above

    const token = emailVerificationService.generateVerificationToken(email);
    const emailResult = await emailVerificationService.sendVerificationEmail(email, token, 'User');

    if (emailResult.success) {
      res.json({
        success: true,
        message: 'Verification email sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: emailResult.message
      });
    }
  } catch (error) {
    console.error('Send email verification to specific email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification email'
    });
  }
});

module.exports = router;