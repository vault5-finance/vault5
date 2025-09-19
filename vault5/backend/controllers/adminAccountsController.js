const bcrypt = require('bcryptjs');
const { User, Account } = require('../models');
const { logAudit, buildDelta } = require('../utils/audit');

/**
 * Accounts Admin Controller
 * Role: account_admin (or super_admin)
 * Scope:
 *  - Manage ONLY regular users (role === 'user')
 *  - Critical actions must include a reason (enforced by middleware)
 */

// GET /api/admin/accounts/users
// Query: q (search), status (accountStatus), active (true/false), page, limit
async function listUsers(req, res) {
  try {
    const { q, status, active, page = 1, limit = 50 } = req.query;
    const query = { role: 'user' };

    if (q) {
      const like = new RegExp(q, 'i');
      query.$or = [
        { name: like },
        { 'emails.email': like },
        { vaultTag: like },
        { city: like },
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
      User.countDocuments(query),
    ]);

    // Non-critical, but useful to audit access pattern
    await logAudit(req, {
      actionName: 'accounts_list_users',
      resource: 'user',
      details: { q: q || null, status: status || null, active: active ?? null, page: Number(page), limit: Number(limit) },
      success: true,
    });

    return res.json({ success: true, data: { items, total, page: Number(page), limit: Number(limit) } });
  } catch (error) {
    console.error('AccountsAdmin.listUsers error:', error);
    await logAudit(req, {
      actionName: 'accounts_list_users',
      resource: 'user',
      details: { error: error.message },
      success: false,
      errorMessage: error.message,
    });
    return res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/admin/accounts/users
// Body: { name, email, password, dob, phone, city }
async function createUser(req, res) {
  try {
    const { name, email, password, dob, phone, city } = req.body;
    if (!name || !email || !password || !dob || !phone || !city) {
      return res.status(400).json({ message: 'Name, email, password, DOB, phone, and city are required' });
    }

    // Uniqueness checks
    const emailLower = String(email).toLowerCase();
    const existingEmail = await User.findOne({ 'emails.email': emailLower });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const existingPhone = await User.findOne({ 'phones.phone': phone });
    if (existingPhone) {
      return res.status(400).json({ message: 'Phone already in use' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // Create user
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
      createdBy: req.user._id,
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

    await logAudit(req, {
      actionName: 'accounts_create_user',
      resource: 'user',
      resourceId: user._id,
      details: {
        name: user.name,
        email: emailLower,
        phone: phone,
      },
      success: true,
    });

    return res.status(201).json({ success: true, message: 'User created', data });
  } catch (error) {
    console.error('AccountsAdmin.createUser error:', error);
    await logAudit(req, {
      actionName: 'accounts_create_user',
      resource: 'user',
      details: { error: error.message },
      success: false,
      errorMessage: error.message,
    });
    return res.status(500).json({ message: 'Server error' });
  }
}

// PATCH /api/admin/accounts/users/:id/status
// Body: { isActive?: boolean, accountStatus?: 'active'|'dormant'|'suspended'|'banned'|'deleted' }
async function updateUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { isActive, accountStatus } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Guard: accounts admin may ONLY manage regular users
    if (user.role !== 'user') {
      return res.status(403).json({ message: 'Not allowed to modify admin accounts' });
    }

    const before = user.toObject();

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

    const after = user.toObject();
    const delta = buildDelta(before, after);
    delete after.password;

    await logAudit(req, {
      actionName: 'accounts_update_user_status',
      resource: 'user',
      resourceId: user._id,
      details: { delta },
      success: true,
    });

    return res.json({ success: true, message: 'User status updated', data: { ...after, password: undefined } });
  } catch (error) {
    console.error('AccountsAdmin.updateUserStatus error:', error);
    await logAudit(req, {
      actionName: 'accounts_update_user_status',
      resource: 'user',
      details: { error: error.message },
      success: false,
      errorMessage: error.message,
    });
    return res.status(500).json({ message: 'Server error' });
  }
}

// DELETE /api/admin/accounts/users/:id
// Soft delete: mark as deleted + inactive
async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Guard: accounts admin may ONLY manage regular users
    if (user.role !== 'user') {
      return res.status(403).json({ message: 'Not allowed to delete admin accounts' });
    }

    const before = user.toObject();

    user.accountStatus = 'deleted';
    user.isActive = false;
    await user.save();

    const after = user.toObject();
    const delta = buildDelta(before, after);

    await logAudit(req, {
      actionName: 'accounts_delete_user_soft',
      resource: 'user',
      resourceId: user._id,
      details: { delta },
      success: true,
    });

    return res.json({ success: true, message: 'User deleted (soft)' });
  } catch (error) {
    console.error('AccountsAdmin.deleteUser error:', error);
    await logAudit(req, {
      actionName: 'accounts_delete_user_soft',
      resource: 'user',
      details: { error: error.message },
      success: false,
      errorMessage: error.message,
    });
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  listUsers,
  createUser,
  updateUserStatus,
  deleteUser,
};