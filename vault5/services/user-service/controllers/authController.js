const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const Account = require('../models/account');
const { redisClient, logger } = require('../server');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });
};

const generateRefreshToken = (id) => {
  const refreshToken = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });
  return refreshToken;
};

// Create the 6 default accounts for a new user
const createDefaultAccounts = async (userId) => {
  return await Account.createDefaultAccounts(userId);
};

// POST /api/auth/register
const register = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('dob').isISO8601().withMessage('Valid date of birth is required'),
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('city').trim().isLength({ min: 2 }).withMessage('City is required'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const { name, email, password, dob, phone, city } = req.body;

      // Check if user exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create user
      const user = await User.create({
        name,
        email,
        password,
        dob: new Date(dob),
        phone,
        city
      });

      // Create default accounts
      const accountIds = await createDefaultAccounts(user.id);

      const token = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      // Store refresh token in Redis
      await redisClient.setEx(`refresh:${refreshToken}`, 7 * 24 * 60 * 60, user.id);

      res.status(201).json({
        token,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          dob: user.dob,
          phone: user.phone,
          city: user.city,
          role: user.role,
        },
      });
    } catch (err) {
      logger.error('Register error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

// POST /api/auth/login
const login = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').exists().withMessage('Password is required'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const { email, password } = req.body;
      const user = await User.findByEmail(email);

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (!user.is_active) {
        return res.status(401).json({ message: 'Account is deactivated' });
      }

      const token = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      // Store refresh token in Redis
      await redisClient.setEx(`refresh:${refreshToken}`, 7 * 24 * 60 * 60, user.id);

      res.json({
        token,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
      });
    } catch (err) {
      logger.error('Login error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

// GET /api/auth/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user accounts
    const accounts = await Account.findByUserId(user.id);

    res.json({
      ...user,
      accounts
    });
  } catch (err) {
    logger.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/auth/profile
const updateProfile = [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('city').optional().trim().isLength({ min: 2 }).withMessage('City must be at least 2 characters'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const { name, email, password, dob, phone, city } = req.body;
      const userId = req.user.id;

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (dob !== undefined) updateData.dob = new Date(dob);
      if (phone !== undefined) updateData.phone = phone;
      if (city !== undefined) updateData.city = city;

      if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password_hash = await bcrypt.hash(password, salt);
      }

      const updatedUser = await User.updateById(userId, updateData);

      res.json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        dob: updatedUser.dob,
        phone: updatedUser.phone,
        city: updatedUser.city,
        role: updatedUser.role,
      });
    } catch (err) {
      logger.error('Update profile error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

// POST /api/auth/refresh
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if refresh token exists in Redis
    const userId = await redisClient.get(`refresh:${token}`);
    if (!userId || userId !== decoded.id) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Generate new tokens
    const newToken = generateToken(decoded.id);
    const newRefreshToken = generateRefreshToken(decoded.id);

    // Replace refresh token in Redis
    await redisClient.del(`refresh:${token}`);
    await redisClient.setEx(`refresh:${newRefreshToken}`, 7 * 24 * 60 * 60, decoded.id);

    res.json({
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token expired' });
    }
    res.status(500).json({ message: 'Token refresh failed' });
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      // Blacklist the access token
      await redisClient.setEx(`blacklist:${token}`, 30 * 24 * 60 * 60, 'true'); // 30 days
    }

    // Remove refresh token if provided
    const { refreshToken } = req.body;
    if (refreshToken) {
      await redisClient.del(`refresh:${refreshToken}`);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      // For security, don't reveal if user doesn't exist
      return res.json({ message: 'If your email exists, a password reset link has been sent' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    // Save reset token
    await User.setResetToken(user.id, resetToken, new Date(Date.now() + 600000)); // 10 minutes

    // In production: Send email with reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    logger.info(`Password reset link for ${email}: ${resetLink}`);

    res.json({ message: 'Password reset link sent to email' });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByResetToken(token);

    if (!user || user.id !== decoded.id) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Update password
    await User.updatePassword(user.id, newPassword);
    await User.clearResetToken(user.id);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    logger.error('Reset password error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Token has expired' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
};