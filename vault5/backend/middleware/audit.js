const AuditLog = require('../models/AuditLog');

// Audit logging middleware
const auditLog = (action, resource) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    const originalJson = res.json;

    // Override response methods to capture the response
    res.send = function(data) {
      logAudit(req, res, action, resource, data);
      originalSend.call(this, data);
    };

    res.json = function(data) {
      logAudit(req, res, action, resource, data);
      originalJson.call(this, data);
    };

    next();
  };
};

// Helper function to log audit events
async function logAudit(req, res, action, resource, responseData) {
  try {
    // Only log if user is authenticated
    if (!req.user && !req.body.email) return;

    const auditEntry = {
      user: req.user?._id,
      action,
      resource,
      resourceId: req.params.id || req.user?._id || null,
      details: {
        method: req.method,
        url: req.originalUrl,
        body: sanitizeBody(req.body),
        responseStatus: res.statusCode
      },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || 'Unknown',
      success: res.statusCode < 400,
      errorMessage: res.statusCode >= 400 ? responseData?.message : null
    };

    // For login/register, we might not have user ID yet
    if (!auditEntry.user && req.body.email) {
      // Try to find user by email for post-audit logging
      const User = require('../models/User');
      const user = await User.findOne({ email: req.body.email });
      if (user) auditEntry.user = user._id;
    }

    if (auditEntry.user) {
      await AuditLog.create(auditEntry);
    }
  } catch (error) {
    console.error('Audit logging error:', error);
    // Don't fail the request if audit logging fails
  }
}

// Sanitize sensitive data from request body
function sanitizeBody(body) {
  if (!body) return {};

  const sanitized = { ...body };

  // Remove sensitive fields
  const sensitiveFields = ['password', 'passwordHash', 'token', 'otp', 'secret'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
}

module.exports = { auditLog };