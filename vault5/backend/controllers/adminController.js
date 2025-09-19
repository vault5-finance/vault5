const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Transaction, AuditLog } = require('../models');

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
  purgeAuditLogs
};