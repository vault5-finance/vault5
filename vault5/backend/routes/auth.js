const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');
const { auditLog } = require('../middleware/audit');
const { register, login, getProfile, updateProfile, registerStep1, registerStep2, registerStep3, registerStep4, checkEmail, sendOTP, verifyOTP, forgotPassword, resetPassword, addEmail, verifyEmail, addPhone, verifyPhone, setPrimaryEmail, setPrimaryPhone, removeEmail, removePhone, changePassword, deleteAccount, verifyTwoFactor, verifyPassword, getSessions, revokeSession } = require('../controllers/authController');

const router = express.Router();

// Configure multer for avatar upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'), false);
    }
  }
});

// Multi-step registration routes
router.post('/register/step1', authLimiter, auditLog('register', 'auth'), registerStep1);
router.patch('/register/:userId/step2', auditLog('profile_update', 'user'), registerStep2);
router.patch('/register/:userId/step3', upload.single('avatar'), auditLog('profile_update', 'user'), registerStep3);
router.patch('/register/:userId/step4', auditLog('register', 'auth'), registerStep4);

// Legacy registration route
router.post('/register', upload.single('avatar'), authLimiter, auditLog('register', 'auth'), register);
router.post('/login', authLimiter, auditLog('login', 'auth'), login);
router.post('/verify-2fa', authLimiter, auditLog('verify_2fa', 'auth'), verifyTwoFactor);
router.get('/profile', protect, auditLog('profile_update', 'user'), getProfile);
router.put('/profile', protect, upload.single('avatar'), auditLog('profile_update', 'user'), updateProfile);

// New refined signup flow endpoints
router.post('/check-email', authLimiter, checkEmail);
router.post('/send-otp', authLimiter, auditLog('send_otp', 'auth'), sendOTP);
router.post('/verify-otp', authLimiter, auditLog('verify_otp', 'auth'), verifyOTP);

// Password reset routes
router.post('/forgot-password', authLimiter, auditLog('password_change', 'auth'), forgotPassword);
router.post('/reset-password', authLimiter, auditLog('password_change', 'auth'), resetPassword);


/* Multi-email/phone management routes */
router.post('/add-email', protect, addEmail);
/* Make verify-email public and support both GET (from link) and POST (manual) */
router.post('/verify-email', verifyEmail);
router.get('/verify-email', verifyEmail);
router.post('/add-phone', protect, addPhone);
router.post('/verify-phone', protect, verifyPhone);
router.patch('/set-primary-email', protect, setPrimaryEmail);
router.patch('/set-primary-phone', protect, setPrimaryPhone);
router.delete('/remove-email/:emailId', protect, removeEmail);
router.delete('/remove-phone/:phoneId', protect, removePhone);

// Password management
router.post('/change-password', protect, changePassword);
router.post('/verify-password', protect, verifyPassword);

// Session management (concurrent sessions)
router.get('/sessions', protect, getSessions);
router.post('/sessions/:id/revoke', protect, revokeSession);

// Danger zone: delete account permanently
router.delete('/account', protect, deleteAccount);

module.exports = router;