const express = require('express');
const { body } = require('express-validator');
const walletController = require('../controllers/walletController');
const { protect, authorize } = require('../middleware/auth');
const walletMiddleware = require('../middleware/wallet');

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/wallet - Get user's wallet
router.get('/', walletController.getWallet);

// POST /api/wallet - Create wallet for user
router.post('/', walletController.createWallet);

// POST /api/wallet/recharge - Recharge wallet
router.post('/recharge', [
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 1 })
    .withMessage('Amount must be greater than 0'),
  body('paymentMethod')
    .isObject()
    .withMessage('Payment method is required'),
  body('paymentMethod.type')
    .isIn(['mpesa', 'card', 'bank_transfer', 'paypal'])
    .withMessage('Invalid payment method type'),
  body('paymentMethod.identifier')
    .notEmpty()
    .withMessage('Payment method identifier is required'),
  body('description')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Description must be less than 255 characters')
], walletController.rechargeWallet);

// POST /api/wallet/transfer - Transfer from wallet to account
router.post('/transfer', [
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 1 })
    .withMessage('Amount must be greater than 0'),
  body('targetAccount')
    .isIn(['Daily', 'Emergency', 'Investment', 'LongTerm', 'Fun', 'Charity'])
    .withMessage('Invalid target account'),
  body('description')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Description must be less than 255 characters')
], walletController.walletToAccount);

// GET /api/wallet/history - Get wallet transaction history
router.get('/history', walletController.getWalletHistory);

// POST /api/wallet/payment-method - Add payment method
router.post('/payment-method', [
  body('type')
    .isIn(['mpesa', 'card', 'bank_transfer', 'paypal'])
    .withMessage('Invalid payment method type'),
  body('identifier')
    .notEmpty()
    .withMessage('Payment method identifier is required'),
  body('setAsDefault')
    .optional()
    .isBoolean()
    .withMessage('setAsDefault must be a boolean')
], walletController.addPaymentMethod);

// POST /api/wallet/pin - Set wallet PIN
router.post('/pin', [
  body('pin')
    .isLength({ min: 4, max: 6 })
    .withMessage('PIN must be 4-6 digits')
    .isNumeric()
    .withMessage('PIN must contain only numbers')
], walletController.setWalletPin);

// GET /api/wallet/stats - Get wallet statistics
router.get('/stats', walletController.getWalletStats);

// PUT /api/wallet/limits - Update wallet limits (admin only)
router.put('/limits', [
  authorize('admin'),
  body('dailyLimit')
    .optional()
    .isNumeric()
    .withMessage('Daily limit must be a number'),
  body('monthlyLimit')
    .optional()
    .isNumeric()
    .withMessage('Monthly limit must be a number'),
  body('transactionLimit')
    .optional()
    .isNumeric()
    .withMessage('Transaction limit must be a number')
], walletController.updateWalletLimits);

// GET /api/wallet/limits - Get wallet limits
router.get('/limits', walletController.getWalletLimits);

// POST /api/wallet/verify-payment-method - Verify payment method
router.post('/verify-payment-method', [
  body('type')
    .isIn(['mpesa', 'card', 'bank_transfer', 'paypal'])
    .withMessage('Invalid payment method type'),
  body('identifier')
    .notEmpty()
    .withMessage('Payment method identifier is required'),
  body('verificationCode')
    .notEmpty()
    .withMessage('Verification code is required')
], walletController.verifyPaymentMethod);

// DELETE /api/wallet/payment-method/:methodId - Remove payment method
router.delete('/payment-method/:methodId', walletController.removePaymentMethod);

// PUT /api/wallet/status - Update wallet status (admin only)
router.put('/status', [
  authorize('admin'),
  body('status')
    .isIn(['active', 'inactive', 'suspended', 'blocked'])
    .withMessage('Invalid wallet status'),
  body('reason')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Reason must be less than 255 characters')
], walletController.updateWalletStatus);

module.exports = router;