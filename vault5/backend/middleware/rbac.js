const { User } = require('../models');

// Role hierarchy (higher number = more permissions)
const ROLE_HIERARCHY = {
  user: 0,
  content_admin: 1,
  support_admin: 2,
  compliance_admin: 3,
  finance_admin: 4,
  system_admin: 5,
  super_admin: 10
};

// Middleware to check if user has required role
const requireRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      const userRoleLevel = ROLE_HIERARCHY[user.role] || 0;
      const requiredRoleLevel = ROLE_HIERARCHY[requiredRole] || 0;

      if (userRoleLevel < requiredRoleLevel) {
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

module.exports = {
  requireRole,
  requirePermission,
  requireSuperAdmin,
  requireSystemAdmin,
  requireFinanceAdmin,
  requireComplianceAdmin,
  requireSupportAdmin,
  requireContentAdmin
};