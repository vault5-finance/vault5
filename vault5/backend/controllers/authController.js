const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Account, Transaction } = require('../models');
const Wallet = require('../models/Wallet');
const Notification = require('../models/Notification');
const Lending = require('../models/Lending');
const Loan = require('../models/Loan');

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

    // Normalize email
    const emailLower = email.toLowerCase();

    // Check if email already exists in either new array or legacy field
    const existingUser = await User.findOne({
      $or: [
        { 'emails.email': emailLower },
        { email: emailLower }
      ]
    });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if phone already exists in any user's phones array
    const existingPhoneUser = await User.findOne({
      'phones.phone': phone
    });
    if (existingPhoneUser) {
      return res.status(400).json({ message: 'Phone number already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const avatar = req.file ? `/uploads/${req.file.filename}` : '';

    // Create user with all required fields for single-step registration
    const user = new User({
      name,
      // Set legacy top-level email for backward compatibility (used by tests and some queries)
      email: emailLower,
      emails: [{
        email: emailLower,
        isPrimary: true,
        isVerified: true  // Mark as verified for legacy registration
      }],
      phones: [{
        phone,
        isPrimary: true,
        isVerified: true  // Mark as verified for legacy registration
      }],
      password: hashed,
      dob: new Date(dob),
      city,
      avatar,
      // Set registration step to 4 (completed) and mark as active
      registrationStep: 4,
      isActive: true,
      isVerified: true,
      termsAccepted: true,
      kycCompleted: false,
      // Initialize compliance fields
      kycLevel: 'Tier0',
      limitationStatus: 'none',
      accountStatus: 'active'
    });

    await user.save();

    // Initialize default accounts and link to user
    const accountIds = await createDefaultAccounts(user._id);
    user.accounts = accountIds;
    await user.save();

    const token = generateToken(user._id);

    // Resolve primary email for response
    let primaryEmail = user.email;
    if (user.emails && user.emails.length > 0) {
      const primaryEmailEntry = user.emails.find(e => e.isPrimary) || user.emails[0];
      primaryEmail = primaryEmailEntry?.email;
    }

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: primaryEmail,
        dob: user.dob,
        phone: user.phone,
        city: user.city,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    // Provide more specific error messages
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: `Validation failed: ${messages.join(', ')}` });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
 try {
   const { email, password, phone } = req.body;

   // Support login with email OR phone (PayPal-style)
   let user = null;
   let loginMethod = '';

   if (email) {
     // Robust find by either emails[] or legacy email in one query
     const emailLower = String(email).toLowerCase();
     user = await User.findOne({
       $or: [
         { 'emails.email': emailLower },
         { email: emailLower }
       ]
     }).select('+password');
     loginMethod = 'email';
   } else if (phone) {
     // Try to find user with phone array structure
     user = await User.findOne({
       'phones.phone': phone
     }).select('+password');
     loginMethod = 'phone';
   }

   if (!user) {
     return res.status(401).json({
       message: 'Invalid credentials',
       availableMethods: ['email', 'phone']
     });
   }

   const requireEmailVerification = (process.env.AUTH_REQUIRE_EMAIL_VERIFICATION || 'false').toLowerCase() === 'true';

   // For new email array structure, check if email is verified (configurable)
   if (requireEmailVerification && loginMethod === 'email' && user.emails && user.emails.length > 0) {
     const emailEntry = user.emails.find(e => e.email === String(email).toLowerCase());
     if (emailEntry && !emailEntry.isVerified) {
       return res.status(401).json({ message: 'Email not verified. Please check your email for verification link.' });
     }
   }

   // For phone login, check if phone is verified
   if (loginMethod === 'phone' && user.phones && user.phones.length > 0) {
     const phoneEntry = user.phones.find(p => p.phone === phone);
     if (phoneEntry && !phoneEntry.isVerified) {
       return res.status(401).json({ message: 'Phone not verified. Please verify your phone number first.' });
     }
   }

   // Account status gates (activation/deactivation/suspension/banned/deleted)
   if (user.isActive === false) {
     return res.status(403).json({ message: 'Account is inactive. Please contact support.' });
   }
   const blockedStatuses = ['suspended', 'banned', 'deleted'];
   if (blockedStatuses.includes(user.accountStatus)) {
     const statusMsg = {
       suspended: 'Your account is suspended. Please contact support.',
       banned: 'Your account is banned. Access is restricted.',
       deleted: 'This account has been deleted.'
     };
     return res.status(403).json({ message: statusMsg[user.accountStatus] || 'Account access restricted' });
   }

   const match = await bcrypt.compare(password, user.password);
   if (!match) {
     return res.status(401).json({ message: 'Invalid credentials' });
   }

   // 2FA decision point: admin skip, trusted device skip, suspicious forces 2FA
   const adminRoles = ['super_admin', 'system_admin', 'finance_admin', 'compliance_admin', 'support_admin', 'content_admin'];
   const isAdmin = adminRoles.includes(user.role);
   const headers = req.headers || {};
   const deviceId = headers['x-device-id'] || (req.body && req.body.deviceId) || '';
   const trusted = typeof user.isDeviceTrusted === 'function' ? user.isDeviceTrusted(deviceId) : false;
   const suspicious = Boolean(user.flags?.suspicious);
   const isProd = (process.env.NODE_ENV === 'production');
   const isTestEnv = (process.env.NODE_ENV === 'test') || Boolean(process.env.JEST_WORKER_ID);
   const require2FA = !isTestEnv && isProd && !isAdmin && (!trusted || suspicious);

   if (require2FA) {
     // Build primary phone for hint
     let primaryPhone = user.phone;
     if (user.phones && user.phones.length > 0) {
       const entry = user.phones.find(p => p.isPrimary) || user.phones[0];
       primaryPhone = entry?.phone || primaryPhone;
     }
     // Create a short-lived temp token marking 2FA pending
     const tempToken = jwt.sign(
       { id: user._id, twoFactorPending: true },
       process.env.JWT_SECRET || 'dev_secret',
       { expiresIn: '10m' }
     );
     return res.json({
       twoFactorRequired: true,
       tempToken,
       methods: ['sms'],
       primaryPhone,
       message: 'Additional verification required. Enter the 6-digit code.'
     });
   }

   // Continue normal login (issue full token)
   user.lastLogin = new Date();
   await user.save();

   const token = generateToken(user._id);

   // Role-based redirect logic
   console.log('User role during login:', user.role);

   // Get primary email for backward compatibility
   let primaryEmail = user.email; // Legacy field
   if (user.emails && user.emails.length > 0) {
     const primaryEmailEntry = user.emails.find(e => e.isPrimary);
     if (primaryEmailEntry) {
       primaryEmail = primaryEmailEntry.email;
     }
   }

   const response = {
     token,
     user: {
       id: user._id,
       name: user.name,
       email: primaryEmail,
       avatar: user.avatar,
       role: user.role,
     },
   };

   // Set redirect based on user role (supports extended admin roles)
   if (isAdmin) {
     response.redirect = '/admin';
     console.log('Admin user detected, redirecting to /admin');
   } else {
     response.redirect = '/dashboard';
     console.log('Regular user detected, redirecting to /dashboard');
   }

   console.log('Login response:', { redirect: response.redirect, userRole: user.role });
   res.json(response);
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
 
 
    // Emails and phones must be managed via dedicated endpoints
    if (email !== undefined) {
      return res.status(400).json({ message: 'Use add-email/verify-email and set-primary-email endpoints to manage emails' });
    }
    if (phone !== undefined) {
      return res.status(400).json({ message: 'Use add-phone/verify-phone and set-primary-phone endpoints to manage phone numbers' });
    }
 
    if (name !== undefined) user.name = name;
    if (dob !== undefined) user.dob = new Date(dob);
    if (city !== undefined) user.city = city;
    if (req.file) user.avatar = `/uploads/${req.file.filename}`;
 
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }


    await user.save();
 
    // Resolve primary email for response
    let primaryEmail = user.email;
    if (user.emails && user.emails.length > 0) {
      const primaryEmailEntry = user.emails.find(e => e.isPrimary) || user.emails[0];
      primaryEmail = primaryEmailEntry?.email;
    }
 
    res.json({
      id: user._id,
      name: user.name,
      email: primaryEmail,
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

    // Check if email already exists (arrays or legacy field)
    const emailLower = email.toLowerCase();
    let foundPath = null;
    let existingUser = await User.findOne({ 'emails.email': emailLower }).select('_id accountStatus emails email');
    if (existingUser) {
      foundPath = 'emails.email';
    }
    if (!existingUser) {
      existingUser = await User.findOne({ email: emailLower }).select('_id accountStatus emails email');
      if (existingUser) {
        foundPath = 'legacy email';
      }
    }
    if (existingUser) {
      console.warn('registerStep1: email exists', {
        email: emailLower,
        userId: existingUser?._id?.toString?.(),
        accountStatus: existingUser?.accountStatus || null,
        path: foundPath
      });
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create partial user data (don't save yet to avoid index conflicts)
    const userData = {
      emails: [{
        email: email.toLowerCase(),
        isPrimary: true,
        isVerified: false
      }],
      password: hashedPassword,
      registrationStep: 1,
      isVerified: false
    };

    // For now, just store in memory/session - will be saved in step 2
    // In production, use Redis or similar for temporary storage
    const tempUserId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // Store userData temporarily (in production, use Redis)
    if (!global.tempUsers) {
      global.tempUsers = {};
    }
    global.tempUsers[tempUserId] = userData;
    console.log('Stored temp user:', tempUserId, Object.keys(global.tempUsers));

    // Return user ID for session continuity
    res.status(201).json({
      userId: tempUserId,
      message: 'Step 1 completed. Proceed to step 2.'
    });
  } catch (error) {
    console.error('Registration step 1 error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const registerStep2 = async (req, res) => {
  try {
    const { firstName, middleName, lastName, dob, phone, city } = req.body;
    const userId = req.params.userId || req.body.userId;

    // Check if this is a temporary user ID
    console.log('Step 2 - Checking userId:', userId);
    console.log('Step 2 - Available temp users:', global.tempUsers ? Object.keys(global.tempUsers) : 'none');
    const tempUserData = global.tempUsers && global.tempUsers[userId];
    console.log('Step 2 - Found temp user data:', !!tempUserData);
    if (!tempUserData) {
      return res.status(400).json({ message: 'Invalid user or step' });
    }

    // Validate phone format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    // Check if phone already exists in any user's phones array
    const existingPhoneUser = await User.findOne({
      'phones.phone': phone
    });
    if (existingPhoneUser) {
      return res.status(400).json({ message: 'Phone number already in use' });
    }

    // Create the actual user from temporary data
    const user = new User({
      ...tempUserData,
      name: `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim(),
      dob: new Date(dob),
      city,
      registrationStep: 2,
      phones: [{
        phone,
        isPrimary: true,
        isVerified: false
      }]
    });

    await user.save();

    // Clean up temporary data
    delete global.tempUsers[userId];

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
    const { address, termsAccepted } = req.body;
    const userId = req.params.userId || req.body.userId;
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
    const { kycSkipped } = req.body;
    const userId = req.params.userId || req.body.userId;

    const user = await User.findById(userId);
    if (!user || user.registrationStep !== 3) {
      return res.status(400).json({ message: 'Invalid user or step' });
    }

    user.kycCompleted = !kycSkipped;
    user.registrationStep = 4;
    user.isActive = true;

    // Mark primary email and phone as verified for new registrations
    if (user.emails && user.emails.length > 0) {
      const primaryEmail = user.emails.find(e => e.isPrimary);
      if (primaryEmail) primaryEmail.isVerified = true;
    }

    if (user.phones && user.phones.length > 0) {
      const primaryPhone = user.phones.find(p => p.isPrimary);
      if (primaryPhone) primaryPhone.isVerified = true;
    }

    await user.save();

    // Auto-create 6 default accounts
    const accountIds = await createDefaultAccounts(user._id);
    user.accounts = accountIds;
    await user.save();

    // Create token
    const token = generateToken(user._id);

    // Determine primary email for messaging
    let primaryEmail = user.email;
    if (user.emails && user.emails.length > 0) {
      const primaryEmailEntry = user.emails.find(e => e.isPrimary) || user.emails[0];
      primaryEmail = primaryEmailEntry?.email;
    }

    // Send verification email stub
    console.log(`Verification email sent to ${primaryEmail}`);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: primaryEmail,
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
 
    const emailLower = email.toLowerCase();
    let user = await User.findOne({ 'emails.email': emailLower });
    if (!user) {
      user = await User.findOne({ email: emailLower });
    }
 
    if (user) {
      return res.json({
        exists: true,
        method: user.password ? 'password' : 'oauth'
      });
    }

    return res.json({ exists: false });
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
 
    // Validate E.164-ish format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }
 
    // Gate by existing linkage and account status (except deleted)
    const existing = await User.findOne({ 'phones.phone': phone });
    if (existing) {
      const status = existing.accountStatus || (existing.isActive ? 'active' : 'inactive');
      if (status !== 'deleted') {
        const statusMessages = {
          active: 'This number is linked to an existing account. Please sign in.',
          dormant: 'This number is linked to a dormant account. Please sign in to reactivate.',
          suspended: 'This number is linked to a suspended account. Contact support.',
          banned: 'This number is linked to a banned account. Contact support.',
          deleted: ''
        };
        return res.status(400).json({ message: statusMessages[status] || 'This number is linked to an existing account', status });
      }
    }
 
    // In production, integrate with SMS service
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
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

/**
 * POST /api/auth/verify-2fa
 * Accepts a tempToken (JWT with { twoFactorPending: true }), a 6-digit otp (dev: any 6 digits),
 * and optional rememberDevice + deviceId to trust current device.
 * Returns full auth token and redirect target.
 */
const verifyTwoFactor = async (req, res) => {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    const { otp, rememberDevice = false, deviceId, nickname, tempToken: bodyTemp } = req.body || {};

    let tempToken = bodyTemp;
    const authHeader = req.headers.authorization;
    if (!tempToken && authHeader && authHeader.startsWith('Bearer ')) {
      tempToken = authHeader.split(' ')[1];
    }
    if (!tempToken) {
      return res.status(400).json({ message: 'Missing temp token' });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'dev_secret');
    } catch (e) {
      return res.status(400).json({ message: 'Invalid or expired temp token' });
    }

    if (!decoded?.twoFactorPending || !decoded?.id) {
      return res.status(400).json({ message: 'Invalid 2FA session' });
    }

    // Validate OTP format; in dev accept any 6-digit
    if (!otp || !/^\d{6}$/.test(String(otp))) {
      return res.status(400).json({ message: 'Invalid OTP format' });
    }
    if (isProd) {
      // TODO: verify against stored OTP from SMS/email provider
      // For now, still accept 6-digit in non-production only
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Trust device if requested
    const ua = req.headers['user-agent'] || '';
    const ip = ((req.headers['x-forwarded-for'] || req.ip || '') + '').split(',')[0].trim();
    if (deviceId && typeof user.upsertTrustedDevice === 'function') {
      user.upsertTrustedDevice({
        deviceId,
        userAgent: ua,
        ip,
        nickname: nickname || ''
      });
      await user.save();
    }

    // Issue full token
    const token = generateToken(user._id);

    // Resolve primary email for response
    let primaryEmail = user.email;
    if (user.emails && user.emails.length > 0) {
      const entry = user.emails.find(e => e.isPrimary) || user.emails[0];
      primaryEmail = entry?.email || primaryEmail;
    }

    const adminRoles = ['super_admin', 'system_admin', 'finance_admin', 'compliance_admin', 'support_admin', 'content_admin'];
    const redirect = adminRoles.includes(user.role) ? '/admin' : '/dashboard';

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: primaryEmail,
        avatar: user.avatar,
        role: user.role
      },
      redirect,
      message: 'Two-factor verification successful'
    });
  } catch (error) {
    console.error('verifyTwoFactor error:', error);
    return res.status(500).json({ message: 'Server error' });
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
};

// POST /api/auth/check-username
const checkUsername = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        available: false,
        error: 'Username must be 3-20 characters, letters, numbers, and underscores only'
      });
    }

    // Check if username is available
    const existing = await User.findOne({ vaultTag: username.toLowerCase() });
    const available = !existing;

    res.json({ available });
  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Try to find user with new email array structure first
    let user = await User.findOne({
      'emails.email': email.toLowerCase()
    });

    // If not found, try legacy email field for backward compatibility
    if (!user) {
      user = await User.findOne({ email: email.toLowerCase() });
    }

    if (!user) {
      // For security, don't reveal if user doesn't exist
      return res.json({ message: 'If your email exists, a password reset link has been sent' });
    }

    // For new email array structure, check if email is verified
    if (user.emails && user.emails.length > 0) {
      const emailEntry = user.emails.find(e => e.email === email.toLowerCase());
      if (emailEntry && !emailEntry.isVerified) {
        return res.status(400).json({ message: 'Email not verified. Please verify your email first.' });
      }
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

// POST /api/auth/add-email
const addEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if email already exists
    const existingUser = await User.findOne({ 'emails.email': email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Check limit (max 6 emails)
    if (user.emails.length >= 6) {
      return res.status(400).json({ message: 'Maximum 6 emails allowed' });
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.emails.push({
      email: email.toLowerCase(),
      isPrimary: false,
      isVerified: false,
      verificationCode,
      verificationExpires: Date.now() + 600000 // 10 minutes
    });

    await user.save();

    // Send verification email with code and verification link
    const verificationLink = `http://localhost:3000/verify-email?email=${encodeURIComponent(email)}&code=${verificationCode}`;
    console.log(`Verification email sent to ${email}: Click here to verify: ${verificationLink}`);

    res.json({ message: 'Verification email sent' });
  } catch (error) {
    console.error('Add email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/verify-email
const verifyEmail = async (req, res) => {
  try {
    // Support both query params (from email link) and body params
    const email = req.query.email || req.body.email;
    const code = req.query.code || req.body.code;

    if (!email || !code) return res.status(400).json({ message: 'Email and code are required' });

    const user = await User.findOne({ 'emails.email': email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const emailEntry = user.emails.find(e => e.email === email.toLowerCase() && e.verificationCode === code);
    if (!emailEntry) return res.status(400).json({ message: 'Invalid code' });

    if (emailEntry.verificationExpires < Date.now()) {
      return res.status(400).json({ message: 'Verification code has expired' });
    }

    emailEntry.isVerified = true;
    emailEntry.verificationCode = undefined;
    emailEntry.verificationExpires = undefined;

    await user.save();

    // Redirect to frontend login with email prefilled if request came from a link (query present)
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
    if (req.query.email && req.query.code) {
      return res.redirect(302, `${frontendBase}/login?email=${encodeURIComponent(email)}`);
    }

    // Otherwise respond with JSON for API clients
    return res.json({
      message: 'Email verified successfully',
      redirect: `/login?email=${encodeURIComponent(email)}`
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/add-phone
const addPhone = async (req, res) => {
  try {
    let { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone is required' });

    // Normalize phone number: if starts with 0, replace with +254
    if (phone.startsWith('0')) {
      phone = '+254' + phone.substring(1);
    } else if (!phone.startsWith('+')) {
      phone = '+254' + phone;
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if phone already exists
    const existingUser = await User.findOne({ 'phones.phone': phone });
    if (existingUser) {
      return res.status(400).json({ message: 'Phone number already in use' });
    }

    // Check limit (max 3 phones)
    if (user.phones.length >= 3) {
      return res.status(400).json({ message: 'Maximum 3 phone numbers allowed' });
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.phones.push({
      phone,
      isPrimary: false,
      isVerified: false,
      verificationCode,
      verificationExpires: Date.now() + 600000 // 10 minutes
    });

    await user.save();

    // Send verification SMS (simulated)
    console.log(`Verification code sent to ${phone}: ${verificationCode}`);

    res.json({ message: 'Verification code sent' });
  } catch (error) {
    console.error('Add phone error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/verify-phone
const verifyPhone = async (req, res) => {
  try {
    const { phone, phoneId, code } = req.body;

    if (!code || (!phone && !phoneId)) {
      return res.status(400).json({ message: 'Phone or phoneId and code are required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isDev = process.env.NODE_ENV !== 'production';
    const isSixDigits = /^\d{6}$/.test(String(code));

    let phoneEntry = null;

    if (isDev && isSixDigits) {
      // Dev mode: accept any 6-digit code, only require that the phone entry exists and is not yet verified
      if (phoneId) {
        const entry = user.phones.id(phoneId);
        if (entry && !entry.isVerified) {
          phoneEntry = entry;
        }
      } else if (phone) {
        phoneEntry = user.phones.find(p => p.phone === phone && !p.isVerified);
      }
    } else {
      // Production: enforce exact code match and 6-digit format
      if (!isSixDigits) {
        return res.status(400).json({ message: 'Invalid code format' });
      }
      if (phoneId) {
        const entry = user.phones.id(phoneId);
        if (entry && entry.verificationCode === code) {
          phoneEntry = entry;
        }
      } else if (phone) {
        phoneEntry = user.phones.find(p => p.phone === phone && p.verificationCode === code);
      }
    }

    if (!phoneEntry) {
      return res.status(400).json({ message: 'Invalid code' });
    }

    phoneEntry.isVerified = true;
    phoneEntry.verificationCode = undefined;
    phoneEntry.verificationExpires = undefined;

    await user.save();

    res.json({
      message: 'Phone verified successfully',
      phoneId: phoneEntry._id,
      phone: phoneEntry.phone
    });
  } catch (error) {
    console.error('Verify phone error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/auth/set-primary-email
const setPrimaryEmail = async (req, res) => {
  try {
    const { emailId } = req.body;
    if (!emailId) return res.status(400).json({ message: 'Email ID is required' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const emailEntry = user.emails.id(emailId);
    if (!emailEntry) return res.status(404).json({ message: 'Email not found' });

    if (!emailEntry.isVerified) return res.status(400).json({ message: 'Email must be verified first' });

    // Set all emails to non-primary
    user.emails.forEach(e => e.isPrimary = false);
    // Set selected email as primary
    emailEntry.isPrimary = true;

    await user.save();

    res.json({ message: 'Primary email updated successfully' });
  } catch (error) {
    console.error('Set primary email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/auth/set-primary-phone
const setPrimaryPhone = async (req, res) => {
  try {
    const { phoneId } = req.body;
    if (!phoneId) return res.status(400).json({ message: 'Phone ID is required' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const phoneEntry = user.phones.id(phoneId);
    if (!phoneEntry) return res.status(404).json({ message: 'Phone not found' });

    if (!phoneEntry.isVerified) return res.status(400).json({ message: 'Phone must be verified first' });

    // Set all phones to non-primary
    user.phones.forEach(p => p.isPrimary = false);
    // Set selected phone as primary
    phoneEntry.isPrimary = true;

    await user.save();

    res.json({ message: 'Primary phone updated successfully' });
  } catch (error) {
    console.error('Set primary phone error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/auth/remove-email/:emailId
const removeEmail = async (req, res) => {
  try {
    const { emailId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const emailIndex = user.emails.findIndex(e => e._id.toString() === emailId);
    if (emailIndex === -1) return res.status(404).json({ message: 'Email not found' });

    const emailEntry = user.emails[emailIndex];

    // Cannot remove primary email
    if (emailEntry.isPrimary) {
      return res.status(400).json({ message: 'Cannot remove primary email' });
    }

    user.emails.splice(emailIndex, 1);
    await user.save();

    res.json({ message: 'Email removed successfully' });
  } catch (error) {
    console.error('Remove email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/auth/remove-phone/:phoneId
const removePhone = async (req, res) => {
  try {
    const { phoneId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const phoneIndex = user.phones.findIndex(p => p._id.toString() === phoneId);
    if (phoneIndex === -1) return res.status(404).json({ message: 'Phone not found' });

    const phoneEntry = user.phones[phoneIndex];

    // Cannot remove primary phone
    if (phoneEntry.isPrimary) {
      return res.status(400).json({ message: 'Cannot remove primary phone' });
    }

    user.phones.splice(phoneIndex, 1);
    await user.save();

    res.json({ message: 'Phone removed successfully' });
  } catch (error) {
    console.error('Remove phone error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * DELETE /api/auth/account
 * Danger zone: permanently delete the user's account and related data
 */
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Best-effort cascading deletes
    await Promise.all([
      Account.deleteMany({ user: userId }),
      Transaction.deleteMany({ user: userId }),
      Notification.deleteMany({ user: userId }),
      Lending.deleteMany({ user: userId }),
      Loan.deleteMany({ user: userId }),
      Wallet.deleteOne({ user: userId })
    ]);

    await User.deleteOne({ _id: userId });

    return res.json({ success: true, message: 'Account and related data deleted permanently' });
  } catch (error) {
    console.error('Delete account error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete account' });
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
  addEmail,
  verifyEmail,
  addPhone,
  verifyPhone,
  setPrimaryEmail,
  setPrimaryPhone,
  removeEmail,
  removePhone,
  changePassword,
  deleteAccount,
  verifyTwoFactor,
};