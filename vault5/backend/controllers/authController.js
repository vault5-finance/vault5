const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Account } = require('../models');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '30d' });
};

// Create the 6 default accounts for a new user
const createDefaultAccounts = async (userId) => {
  const defaults = [
    { type: 'Daily', percentage: 50 },
    { type: 'Emergency', percentage: 10 },
    { type: 'Investment', percentage: 20 },
    { type: 'LongTerm', percentage: 10 },
    { type: 'Fun', percentage: 5 },
    { type: 'Charity', percentage: 5 },
  ];

  const created = [];
  for (const d of defaults) {
    const acc = new Account({
      user: userId,
      type: d.type,
      percentage: d.percentage,
      balance: 0,
      target: 0,
      status: 'green',
    });
    await acc.save();
    created.push(acc._id);
  }
  return created;
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, dob, phone, city } = req.body;
    if (!name || !email || !password || !dob || !phone || !city) {
      return res.status(400).json({ message: 'Name, email, password, DOB, phone, and city are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const avatar = req.file ? `/uploads/${req.file.filename}` : '';

    const user = new User({
      name,
      email,
      password: hashed,
      dob: new Date(dob),
      phone,
      city,
      avatar,
    });
    await user.save();

    // Initialize default accounts and link to user
    const accountIds = await createDefaultAccounts(user._id);
    user.accounts = accountIds;
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dob: user.dob,
        phone: user.phone,
        city: user.city,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/auth/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('accounts goals');
    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, password, dob, phone, city } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (dob !== undefined) user.dob = new Date(dob);
    if (phone !== undefined) user.phone = phone;
    if (city !== undefined) user.city = city;
    if (req.file) user.avatar = `/uploads/${req.file.filename}`;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      dob: user.dob,
      phone: user.phone,
      city: user.city,
      avatar: user.avatar,
      role: user.role,
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Multi-step registration endpoints
const registerStep1 = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create partial user
    const user = new User({
      email,
      password: hashedPassword,
      registrationStep: 1,
      isVerified: false
    });

    await user.save();

    // Return user ID for session continuity
    res.status(201).json({
      userId: user._id,
      message: 'Step 1 completed. Proceed to step 2.'
    });
  } catch (error) {
    console.error('Registration step 1 error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const registerStep2 = async (req, res) => {
  try {
    const { userId, firstName, middleName, lastName, dob, phone, city } = req.body;

    const user = await User.findById(userId);
    if (!user || user.registrationStep !== 1) {
      return res.status(400).json({ message: 'Invalid user or step' });
    }

    // Validate phone format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    user.name = `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim();
    user.dob = dob;
    user.phone = phone;
    user.city = city;
    user.registrationStep = 2;

    await user.save();

    res.json({
      userId: user._id,
      message: 'Step 2 completed. Proceed to step 3.'
    });
  } catch (error) {
    console.error('Registration step 2 error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const registerStep3 = async (req, res) => {
  try {
    const { userId, address, termsAccepted } = req.body;
    const avatar = req.file ? `/uploads/${req.file.filename}` : null;

    const user = await User.findById(userId);
    if (!user || user.registrationStep !== 2) {
      return res.status(400).json({ message: 'Invalid user or step' });
    }

    if (!termsAccepted) {
      return res.status(400).json({ message: 'Terms must be accepted' });
    }

    user.address = address;
    if (avatar) user.avatar = avatar;
    user.termsAccepted = termsAccepted;
    user.registrationStep = 3;

    await user.save();

    res.json({
      userId: user._id,
      message: 'Step 3 completed. Proceed to step 4.'
    });
  } catch (error) {
    console.error('Registration step 3 error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const registerStep4 = async (req, res) => {
  try {
    const { userId, kycSkipped } = req.body;

    const user = await User.findById(userId);
    if (!user || user.registrationStep !== 3) {
      return res.status(400).json({ message: 'Invalid user or step' });
    }

    user.kycCompleted = !kycSkipped;
    user.registrationStep = 4;
    user.isActive = true;

    await user.save();

    // Auto-create 6 default accounts
    const accountIds = await createDefaultAccounts(user._id);
    user.accounts = accountIds;
    await user.save();

    // Create token
    const token = generateToken(user._id);

    // Send verification email stub
    console.log(`Verification email sent to ${user.email}`);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      message: 'Registration completed successfully'
    });
  } catch (error) {
    console.error('Registration step 4 error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/check-email
const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.json({
        exists: true,
        method: user.password ? 'password' : 'oauth'
      });
    }

    res.json({ exists: false });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/send-otp
const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // In production, integrate with SMS service (Twilio, Africa's Talking, etc.)
    // For now, simulate OTP sending
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP temporarily (in production, use Redis or similar)
    // For demo, we'll just log it
    console.log(`OTP for ${phone}: ${otp}`);

    res.json({ message: 'OTP sent successfully', otp }); // Remove otp in production
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    // In production, verify against stored OTP
    // For demo, accept any 6-digit code
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: 'Invalid OTP format' });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
};

// POST /api/auth/check-vault-tag
const checkVaultTag = async (req, res) => {
  try {
    const { vaultTag } = req.body;
    if (!vaultTag) {
      return res.status(400).json({ message: 'VaultTag is required' });
    }

    // Check if vault tag is available
    const existing = await User.findOne({ vaultTag: vaultTag.toLowerCase() });
    res.json({ available: !existing });
  } catch (error) {
    console.error('Check vault tag error:', error);
    res.status(500).json({ message: 'Server error' });
  }
// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal if user doesn't exist
      return res.json({ message: 'If your email exists, a password reset link has been sent' });
    }

    // Generate reset token (expires in 10 minutes)
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '10m' }
    );

    // Save reset token to user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 600000; // 10 minutes
    await user.save();

    // In production: Send email with reset link
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
    console.log(`Password reset link for ${email}: ${resetLink}`);

    res.json({ message: 'Password reset link sent to email' });
  } catch (error) {
    console.error('Forgot password error:', error);
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

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Token has expired' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid token' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  registerStep1,
  registerStep2,
  registerStep3,
  registerStep4,
  checkEmail,
  sendOTP,
  verifyOTP,
  checkVaultTag,
  forgotPassword,
  resetPassword,
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  registerStep1,
  registerStep2,
  registerStep3,
  registerStep4,
  checkEmail,
  sendOTP,
  verifyOTP,
  checkVaultTag,
};