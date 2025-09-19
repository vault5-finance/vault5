const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Transaction, AuditLog, Account } = require('../models');

// Get all admins (super admin only)
const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({
      role: { $in: ['super_admin', 'system_admin', 'finance_admin', 'compliance_admin', 'support_admin', 'content_admin'] }
    }).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: admins
    });
  } catch (error) {
    console.error('Get all admins error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new admin (super admin only)
const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: 'Name, email, password, and role are required'
      });
    }

    // Validate role
    const validRoles = ['system_admin', 'finance_admin', 'compliance_admin', 'support_admin', 'content_admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: 'Invalid role. Must be one of: ' + validRoles.join(', ')
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({
      $or: [
        { 'emails.email': email.toLowerCase() },
        { email: email.toLowerCase() }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const admin = new User({
      name,
      emails: [{
        email: email.toLowerCase(),
        isPrimary: true,
        isVerified: true
      }],
      password: hashedPassword,
      role,
      department: department || role.replace('_admin', ''),
      isVerified: true,
      isActive: true,
      registrationStep: 4, // Mark as fully registered
      createdBy: req.user._id
    });

    await admin.save();

    // Return admin data without password
    const adminData = admin.toObject();
    delete adminData.password;

    res.status(201).json({
      success: true,
      message: `${role.replace('_', ' ').toUpperCase()} created successfully`,
      data: adminData
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update admin (super admin only)
const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, department, isActive } = req.body;

    // Find admin
    const admin = await User.findById(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Prevent demoting last remaining super admin
    if (admin.role === 'super_admin' && role && role !== 'super_admin') {
      const superCount = await User.countDocuments({ role: 'super_admin' });
      if (superCount <= 1) {
        return res.status(400).json({ message: 'Cannot demote the last remaining super admin' });
      }
    }

    // Update fields
    if (name) admin.name = name;
    if (role) {
      const validRoles = ['system_admin', 'finance_admin', 'compliance_admin', 'support_admin', 'content_admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
      admin.role = role;
      admin.department = department || role.replace('_admin', '');
    }
    if (typeof isActive === 'boolean') admin.isActive = isActive;

    // Handle email update
    if (email && email !== admin.emails[0]?.email) {
      // Check if new email exists
      const existingUser = await User.findOne({
        $or: [
          { 'emails.email': email.toLowerCase() },
          { email: email.toLowerCase() }
        ],
        _id: { $ne: id }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      // Update primary email
      if (admin.emails.length > 0) {
        admin.emails[0].email = email.toLowerCase();
      } else {
        admin.emails.push({
          email: email.toLowerCase(),
          isPrimary: true,
          isVerified: true
        });
      }
    }

    await admin.save();

    // Return updated admin data
    const adminData = admin.toObject();
    delete adminData.password;

    res.json({
      success: true,
      message: 'Admin updated successfully',
      data: adminData
    });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete admin (super admin only)
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Find admin
    const admin = await User.findById(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Prevent deleting the last remaining super admin
    if (admin.role === 'super_admin') {
      const superCount = await User.countDocuments({ role: 'super_admin' });
      if (superCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last remaining super admin' });
      }
    }

    // Prevent deleting yourself
    if (admin._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get admin statistics (super admin only)
const getAdminStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $match: {
          role: { $in: ['super_admin', 'system_admin', 'finance_admin', 'compliance_admin', 'support_admin', 'content_admin'] }
        }
      },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: {
            $sum: { $cond: ['$isActive', 1, 0] }
          }
        }
      }
    ]);

    const totalAdmins = stats.reduce((sum, stat) => sum + stat.count, 0);
    const activeAdmins = stats.reduce((sum, stat) => sum + stat.active, 0);

    res.json({
      success: true,
      data: {
        totalAdmins,
        activeAdmins,
        inactiveAdmins: totalAdmins - activeAdmins,
        breakdown: stats
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * System overview for super admin: users, KYC, risk, activity
 */
const getSystemOverview = async (req, res) => {
  try {
    // Users overview
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ role: 'user', isActive: true });
    const dormantUsers = await User.countDocuments({ role: 'user', accountStatus: 'dormant' });
    const suspendedUsers = await User.countDocuments({ role: 'user', accountStatus: 'suspended' });
    const bannedUsers = await User.countDocuments({ role: 'user', accountStatus: 'banned' });

    // KYC overview
    const kycPending = await User.countDocuments({ role: 'user', kycStatus: { $in: ['pending', 'not_required'] } });
    const kycApproved = await User.countDocuments({ role: 'user', kycStatus: 'approved' });
    const kycRejected = await User.countDocuments({ role: 'user', kycStatus: 'rejected' });

    // Risk overview (transactions flagged)
    const flaggedTx = await Transaction.countDocuments({ 'fraudRisk.isHighRisk': true });

    // Recent activity (today's transactions)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todaysTransactions = await Transaction.countDocuments({ createdAt: { $gte: startOfDay } });

    res.json({
      success: true,
      data: {
        users: { totalUsers, activeUsers, dormantUsers, suspendedUsers, bannedUsers },
        kyc: { kycPending, kycApproved, kycRejected },
        risk: { flaggedTx },
        activity: { todaysTransactions }
      }
    });
  } catch (error) {
    console.error('Get system overview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============ USER MANAGEMENT (support_admin and above) ============

/**
 * GET /api/admin/users
 * Query: q (search), status (accountStatus), active (true/false), page, limit
 * List regular users (role = 'user')
 */
const listUsers = async (req, res) => {
  try {
    const { q, status, active, page = 1, limit = 50 } = req.query;
    const query = { role: 'user' };

    if (q) {
      const like = new RegExp(q, 'i');
      query.$or = [
        { name: like },
        { 'emails.email': like },
        { vaultTag: like },
        { city: like }
      ];
    }
    if (status) {
      query.accountStatus = status;
    }
    if (active !== undefined) {
      query.isActive = String(active) === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query)
    ]);

    res.json({ success: true, data: { items, total, page: Number(page), limit: Number(limit) } });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /api/admin/users
 * Create a new regular user (role='user') by admin
 */
const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, dob, phone, city } = req.body;
    if (!name || !email || !password || !dob || !phone || !city) {
      return res.status(400).json({ message: 'Name, email, password, DOB, phone, and city are required' });
    }

    // Email/phone uniqueness
    const emailLower = email.toLowerCase();
    const existingEmail = await User.findOne({ 'emails.email': emailLower });
    if (existingEmail) return res.status(400).json({ message: 'Email already exists' });

    const existingPhone = await User.findOne({ 'phones.phone': phone });
    if (existingPhone) return res.status(400).json({ message: 'Phone already in use' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      emails: [{ email: emailLower, isPrimary: true, isVerified: true }],
      phones: [{ phone, isPrimary: true, isVerified: true }],
      password: hashed,
      dob: new Date(dob),
      city,
      role: 'user',
      registrationStep: 4,
      isVerified: true,
      isActive: true,
      accountStatus: 'active',
      createdBy: req.user._id
    });
    await user.save();

    // Create 6 default accounts
    const defaults = [
      { type: 'Daily', percentage: 50 },
      { type: 'Emergency', percentage: 10 },
      { type: 'Investment', percentage: 20 },
      { type: 'LongTerm', percentage: 10 },
      { type: 'Fun', percentage: 5 },
      { type: 'Charity', percentage: 5 },
    ];
    for (const d of defaults) {
      const acc = new Account({
        user: user._id,
        type: d.type,
        percentage: d.percentage,
        balance: 0,
        target: 0,
        status: 'green',
      });
      await acc.save();
      user.accounts.push(acc._id);
    }
    await user.save();

    const data = user.toObject();
    delete data.password;

    res.status(201).json({ success: true, message: 'User created', data });
  } catch (error) {
    console.error('Create user by admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * PATCH /api/admin/users/:id/status
 * Body: { isActive?: boolean, accountStatus?: 'active'|'dormant'|'suspended'|'banned'|'deleted' }
 */
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, accountStatus } = req.body;

    const user = await User.findById(id);
    if (!user || user.role !== 'user') {
      return res.status(404).json({ message: 'User not found' });
    }

    if (typeof isActive === 'boolean') {
      user.isActive = isActive;
    }

    if (accountStatus !== undefined) {
      const allowed = ['active', 'dormant', 'suspended', 'banned', 'deleted'];
      if (!allowed.includes(accountStatus)) {
        return res.status(400).json({ message: 'Invalid account status' });
      }
      user.accountStatus = accountStatus;
      if (accountStatus === 'deleted') {
        user.isActive = false;
      }
    }

    await user.save();

    const data = user.toObject();
    delete data.password;

    res.json({ success: true, message: 'User status updated', data });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * DELETE /api/admin/users/:id
 * Soft delete: mark as deleted + inactive
 */
const deleteUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user || user.role !== 'user') {
      return res.status(404).json({ message: 'User not found' });
    }

    user.accountStatus = 'deleted';
    user.isActive = false;
    await user.save();

    res.json({ success: true, message: 'User deleted (soft)' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
 
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(500);
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const purgeAuditLogs = async (req, res) => {
  try {
    await AuditLog.deleteMany({});
    res.json({ success: true, message: 'Audit logs purged' });
  } catch (error) {
    console.error('Purge audit logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAdminStats,
  getSystemOverview,
  getAuditLogs,
  purgeAuditLogs,
  // User management (support_admin+ or super_admin)
  listUsers,
  createUserByAdmin,
  updateUserStatus,
  deleteUserByAdmin
};