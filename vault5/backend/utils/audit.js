const { AuditLog } = require('../models');

/**
 * Build a shallow diff between before and after objects (only first-level keys).
 * Excludes keys with identical values and sensitive fields like password.
 */
function buildDelta(before = {}, after = {}) {
  const SENSITIVE = new Set(['password', 'token', 'verificationToken', 'verificationCode']);
  const keys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
  const delta = {};
  for (const k of keys) {
    if (SENSITIVE.has(k)) continue;
    const b = before ? before[k] : undefined;
    const a = after ? after[k] : undefined;
    const changed =
      (b === undefined && a !== undefined) ||
      (b !== undefined && a === undefined) ||
      (JSON.stringify(b) !== JSON.stringify(a));
    if (changed) {
      delta[k] = { before: b, after: a };
    }
  }
  return delta;
}

/**
 * Normalize request meta for audit: IP, UA, actor, reason
 */
function extractRequestMeta(req) {
  const ip =
    (req.headers['x-forwarded-for'] && String(req.headers['x-forwarded-for']).split(',')[0].trim()) ||
    req.ip ||
    req.connection?.remoteAddress ||
    '';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const actor = req.user?._id || null;
  const reason =
    (req.meta && req.meta.reason) ||
    (req.body && req.body.reason) ||
    req.headers['x-reason'] ||
    undefined;

  return { ipAddress: ip, userAgent, actor, reason };
}

/**
 * Write an audit log entry.
 * Note on enums:
 * - AuditLog.action enum is limited; to avoid enum violations we use "admin_action"
 *   and embed the specific actionName in details.actionName.
 * - AuditLog.resource enum includes: 'user', 'transaction', 'account', 'lending', 'profile', 'kyc', 'auth'
 *   Choose the closest one. For system-level actions like purging logs, use resource='auth'.
 *
 * @param {object} req - Express request (used to derive actor, ip, ua, reason)
 * @param {object} payload
 * @param {string} payload.actionName - Specific action descriptor (e.g., 'user_status_update')
 * @param {('user'|'transaction'|'account'|'lending'|'profile'|'kyc'|'auth')} payload.resource
 * @param {string|object} [payload.resourceId]
 * @param {object} [payload.details]
 * @param {boolean} [payload.success=true]
 * @param {string} [payload.errorMessage]
 */
async function logAudit(req, { actionName, resource, resourceId = undefined, details = {}, success = true, errorMessage } = {}) {
  const { ipAddress, userAgent, actor, reason } = extractRequestMeta(req);

  const entry = new AuditLog({
    user: actor,
    action: 'admin_action',
    resource,
    resourceId,
    details: {
      actionName,
      ...details,
      reason: reason || details.reason || undefined,
    },
    ipAddress,
    userAgent,
    success,
    errorMessage,
    timestamp: new Date(),
  });

  try {
    await entry.save();
  } catch (e) {
    // Do not block main flow on audit errors
    console.error('Audit log write failed:', e.message);
  }
}

module.exports = {
  logAudit,
  buildDelta,
  extractRequestMeta,
};