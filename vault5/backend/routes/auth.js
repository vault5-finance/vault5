const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const { register, login, getProfile, updateProfile, registerStep1, registerStep2, registerStep3, registerStep4, checkEmail, sendOTP, verifyOTP, checkVaultTag, forgotPassword, resetPassword } = require('../controllers/authController');

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
router.post('/register/step1', registerStep1);
router.patch('/register/:userId/step2', registerStep2);
router.patch('/register/:userId/step3', upload.single('avatar'), registerStep3);
router.patch('/register/:userId/step4', registerStep4);

// Legacy registration route
router.post('/register', upload.single('avatar'), register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', upload.single('avatar'), updateProfile); // Also allow avatar update

// New refined signup flow endpoints
router.post('/check-email', checkEmail);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/check-vault-tag', checkVaultTag);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;