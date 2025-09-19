const { User } = require('../models');

// Role hierarchy (higher number = more permissions)
// Note: equal-level roles are NOT interchangeable; see requireRole logic.
const ROLE_HIERARCHY = {
  user: 0,
  content_admin: 1,
  support_admin: 2,
  account_admin: 3,
  compliance_admin: 3,
  finance_admin: 4,
  system_admin: 5,
  super_admin: 10
};

// Middleware to check if user has required role
// Semantics:
// - Higher role levels can access lower role routes.
// - Equal-level access is allowed ONLY if the role names match exactly.
const requireRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      const userRoleLevel = ROLE_HIERARCHY[user.role] ?? 0;
      const requiredRoleLevel = ROLE_HIERARCHY[requiredRole] ?? 0;

      const isHigher = userRoleLevel > requiredRoleLevel;
      const isSameLevelSameRole = userRoleLevel === requiredRoleLevel && user.role === requiredRole;

      if (!isHigher && !isSameLevelSameRole) {
        return res.status(403).json({
          message: 'Insufficient permissions',
          required: requiredRole,
          current: user.role
        });
      }

      req.user.role = user.role;
      req.user.permissions = user.permissions;
      next();
    } catch (error) {
      console.error('RBAC middleware error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
};

// Middleware to check if user has specific permission
const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Super admin has all permissions
      if (user.role === 'super_admin') {
        req.user.role = user.role;
        req.user.permissions = user.permissions;
        return next();
      }

      // Check if user has the specific permission
      if (!user.permissions || !user.permissions.includes(permission)) {
        return res.status(403).json({
          message: 'Insufficient permissions',
          required: permission,
          current: user.permissions || []
        });
      }

      req.user.role = user.role;
      req.user.permissions = user.permissions;
      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
};

// Middleware to check if user can manage admins (only super admin)
const requireSuperAdmin = requireRole('super_admin');

// Middleware for different admin roles
const requireSystemAdmin = requireRole('system_admin');
const requireFinanceAdmin = requireRole('finance_admin');
const requireComplianceAdmin = requireRole('compliance_admin');
const requireSupportAdmin = requireRole('support_admin');
const requireContentAdmin = requireRole('content_admin');

// Exact role (or super_admin) gate for Accounts Admin domain
const requireAccountAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    if (user.role === 'account_admin' || user.role === 'super_admin') {
      req.user.role = user.role;
      req.user.permissions = user.permissions;
      return next();
    }
    return res.status(403).json({
      message: 'Insufficient permissions',
      required: 'account_admin',
      current: user.role
    });
  } catch (error) {
    console.error('AccountAdmin middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Require a human-provided reason for critical actions
const requireCriticalReason = (req, res, next) => {
  try {
    const reason = (req.body && req.body.reason) || req.headers['x-reason'] || '';
    if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
      return res.status(400).json({
        message: 'Reason is required for this action (min 5 characters)'
      });
    }
    req.meta = req.meta || {};
    req.meta.reason = reason.trim();
    next();
  } catch (error) {
    console.error('requireCriticalReason error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  requireRole,
  requirePermission,
  requireSuperAdmin,
  requireSystemAdmin,
  requireFinanceAdmin,
  requireComplianceAdmin,
  requireSupportAdmin,
  requireContentAdmin,
  requireAccountAdmin,
  requireCriticalReason
};