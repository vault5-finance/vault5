const { User, Transaction, Loan, LimitTier, GeoPolicy, IpDenylist, DeviceRule, Limitation, VelocityCounter, RiskEvent } = require('../models');

// Helpers
function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function daysBetween(a, b) {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}
function getClientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip || req.connection?.remoteAddress || '';
}

// Very light CIDR check: supports /32 exact and /24 prefix ranges (best-effort placeholder)
function ipInCidr(ip, cidr) {
  if (!ip || !cidr) return false;
  const [block, mask] = cidr.split('/');
  if (!mask) return ip === block;
  if (mask === '32') return ip === block;
  if (mask === '24') {
    const ipParts = ip.split('.'); const blockParts = block.split('.');
    return ipParts[0] === blockParts[0] && ipParts[1] === blockParts[1] && ipParts[2] === blockParts[2];
  }
  // Fallback: string compare
  return ip.startsWith(block);
}

// Risk event helper
async function logRiskEvent(userId, kind, score = 0, metadata = {}) {
  try {
    await RiskEvent.create({ user: userId || undefined, kind, score, metadata });
  } catch (e) {
    // swallow
  }
}

// Gates

// Geo allowlist gate (KE only initially via GeoPolicy)
async function geoGate(req, res, next) {
  try {
    const policy = await GeoPolicy.findOne({});
    if (!policy || policy.mode !== 'allowlist' || !Array.isArray(policy.countries) || policy.countries.length === 0) {
      return next(); // no restriction configured
    }
    const country = (req.user?.country || '').toUpperCase();
    if (!country || !policy.countries.includes(country)) {
      await logRiskEvent(req.user?._id, 'login_geo_block', 80, { country });
      return res.status(451).json({ message: 'Service not available in your region' });
    }
    next();
  } catch (e) {
    next(); // fail-open
  }
}

// IP denylist CIDR gate
async function ipDenyGate(req, res, next) {
  try {
    const list = await IpDenylist.findOne({});
    if (!list || !Array.isArray(list.cidrs) || list.cidrs.length === 0) return next();
    const ip = getClientIp(req);
    const blocked = list.cidrs.some(c => ipInCidr(ip, c));
    if (blocked) {
      await logRiskEvent(req.user?._id, 'ip_block', 90, { ip });
      return res.status(403).json({ message: 'Access blocked by network policy' });
    }
    next();
  } catch (e) {
    next(); // fail-open
  }
}

// Device rules gate (cookies and headless checks)
async function deviceGate(req, res, next) {
  try {
    const rules = await DeviceRule.findOne({});
    if (!rules) return next();
    const ua = String(req.headers['user-agent'] || '');
    const hasCookies = Boolean(req.headers['cookie'] || req.headers['cookies']);
    if (rules.forbidHeadless && /Headless|PhantomJS|Puppeteer|Playwright/i.test(ua)) {
      await logRiskEvent(req.user?._id, 'device_block', 70, { ua });
      return res.status(400).json({ message: 'Unsupported browser environment' });
    }
    if (rules.requireCookies && !hasCookies) {
      await logRiskEvent(req.user?._id, 'device_block', 50, { reason: 'cookies_disabled' });
      return res.status(400).json({ message: 'Please enable cookies to continue' });
    }
    next();
  } catch {
    next();
  }
}

// Limitation gate (temporary_30, temporary_180, permanent)
// Blocks money-moving actions; allows KYC and support. For temp_180/permanent, informs about payout after reserve release.
async function limitationGate(req, res, next) {
  try {
    const u = req.user;
    if (!u) return res.status(401).json({ message: 'Not authorized' });
    const status = u.limitationStatus || 'none';
    if (status === 'none') return next();

    // Compute countdown for user messaging
    let countdown = null;
    if (status === 'temporary_30' || status === 'temporary_180') {
      countdown = u.limitationExpiresAt ? Math.max(0, u.limitationExpiresAt.getTime() - Date.now()) : null;
    }

    await logRiskEvent(u._id, 'limit_block', 60, { status, route: req.originalUrl });

    const msg = status === 'temporary_30'
      ? 'Your account is temporarily limited. Money transfers are currently disabled. You may complete KYC to resolve.'
      : status === 'temporary_180'
        ? 'Your account is limited for 180 days. Funds are in reserve. Payout may be requested to a verified bank after the wait period.'
        : 'Your account is permanently limited. Outgoing transactions are disabled. Contact support for more information.';

    return res.status(423).json({
      message: msg,
      limitation: {
        status,
        reason: u.limitationReason || '',
        countdownMs: countdown,
        reserveReleaseAt: u.reserveReleaseAt || null
      }
    });
  } catch (e) {
    next();
  }
}

// Limitation gate for outgoing-only (allows income)
// For transaction creation, if type === 'income', allow even when limited.
// Otherwise, reuse limitation response as above.
async function limitationGateOutgoing(req, res, next) {
  try {
    const u = req.user;
    if (!u) return res.status(401).json({ message: 'Not authorized' });
    const status = u.limitationStatus || 'none';
    if (status === 'none') return next();

    const type = String(req.body?.type || '').toLowerCase();
    if (type === 'income') return next();

    // Same response shape as limitationGate
    let countdown = null;
    if (status === 'temporary_30' || status === 'temporary_180') {
      countdown = u.limitationExpiresAt ? Math.max(0, u.limitationExpiresAt.getTime() - Date.now()) : null;
    }

    await logRiskEvent(u._id, 'limit_block', 60, { status, route: req.originalUrl, kind: 'outgoing' });

    const msg = status === 'temporary_30'
      ? 'Your account is temporarily limited. Outgoing transactions are disabled. You may complete KYC to resolve.'
      : status === 'temporary_180'
        ? 'Your account is limited for 180 days. Outgoing transactions are disabled. Payout may be requested to a verified bank after the wait period.'
        : 'Your account is permanently limited. Outgoing transactions are disabled. Contact support for more information.';

    return res.status(423).json({
      message: msg,
      limitation: {
        status,
        reason: u.limitationReason || '',
        countdownMs: countdown,
        reserveReleaseAt: u.reserveReleaseAt || null
      }
    });
  } catch (e) {
    next();
  }
}

// Caps gate based on KYC tier and transactions within daily/monthly windows
async function capsGate(req, res, next) {
  try {
    const u = req.user;
    if (!u) return res.status(401).json({ message: 'Not authorized' });
    const tierName = u.kycLevel || 'Tier0';
    const tier = await LimitTier.findOne({ name: tierName });
    if (!tier) return next(); // no caps configured

    const amount = Number(req.body?.amount || 0);
    if (!(amount > 0)) return res.status(400).json({ message: 'Valid amount is required' });

    // Sum user transactions for current day/month
    const now = new Date();
    const sod = startOfDay(now);
    const som = startOfMonth(now);

    const [dayAgg, monthAgg] = await Promise.all([
      Transaction.aggregate([
        { $match: { user: u._id, date: { $gte: sod, $lte: now } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { user: u._id, date: { $gte: som, $lte: now } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const usedToday = Number(dayAgg?.[0]?.total || 0);
    const usedMonth = Number(monthAgg?.[0]?.total || 0);

    const wouldDay = usedToday + amount;
    const wouldMonth = usedMonth + amount;

    if (tier.dailyLimit > 0 && wouldDay > tier.dailyLimit) {
      await logRiskEvent(u._id, 'cap_hit', 40, { type: 'daily', usedToday, amount, limit: tier.dailyLimit });
      return res.status(429).json({ message: `Daily limit exceeded for your tier (${tierName}).` });
    }
    if (tier.monthlyLimit > 0 && wouldMonth > tier.monthlyLimit) {
      await logRiskEvent(u._id, 'cap_hit', 40, { type: 'monthly', usedMonth, amount, limit: tier.monthlyLimit });
      return res.status(429).json({ message: `Monthly limit exceeded for your tier (${tierName}).` });
    }

    next();
  } catch (e) {
    next(e);
  }
}

// Velocity gate (basic counters). Blocks if exceeding 2x caps as a safety net; otherwise logs signals.
// This can be tuned later or aligned with separate velocity policies.
async function velocityGate(req, res, next) {
  try {
    const u = req.user;
    if (!u) return res.status(401).json({ message: 'Not authorized' });

    const amount = Number(req.body?.amount || 0);
    if (!(amount > 0)) return res.status(400).json({ message: 'Valid amount is required' });

    const tier = await LimitTier.findOne({ name: u.kycLevel || 'Tier0' });
    const now = new Date();

    const windows = [
      { win: 'day', resetAt: startOfDay(new Date(now.getTime() + 24 * 60 * 60 * 1000)) },
      { win: 'week', resetAt: startOfDay(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) },
      { win: 'month', resetAt: startOfMonth(new Date(now.getFullYear(), now.getMonth() + 1, 1)) },
    ];

    for (const w of windows) {
      const vc = await VelocityCounter.findOneAndUpdate(
        { user: u._id, window: w.win },
        {
          $setOnInsert: { resetAt: w.resetAt },
          $inc: { count: 1, amount: amount }
        },
        { new: true, upsert: true }
      );

      // Simple guard: if daily velocity > 2x daily limit, block
      if (tier && w.win === 'day' && tier.dailyLimit > 0 && vc.amount > 2 * tier.dailyLimit) {
        await logRiskEvent(u._id, 'velocity_hit', 50, { window: w.win, amount: vc.amount });
        return res.status(429).json({ message: 'Transaction velocity too high. Please try again later.' });
      }
    }

    next();
  } catch (e) {
    next();
  }
}

// Loan eligibility gate (KYC Tier2, tenure >= 90 days, cooldown 30 days). On-time rate check TBD.
async function loanEligibilityGate(req, res, next) {
  try {
    const u = req.user;
    if (!u) return res.status(401).json({ message: 'Not authorized' });

    if ((u.kycLevel || 'Tier0') !== 'Tier2') {
      return res.status(403).json({ message: 'Loans are available to Tier2 verified users only' });
    }
    const tenureDays = daysBetween(new Date(), new Date(u.createdAt || u._id.getTimestamp?.() || Date.now()));
    if (tenureDays < 90) {
      return res.status(403).json({ message: 'Account must be at least 90 days old to request a loan' });
    }

    // Cooldown check: last loan creation within 30 days
    const lastLoan = await Loan.findOne({ user: u._id }).sort({ createdAt: -1 }).select('createdAt status');
    if (lastLoan && daysBetween(new Date(), new Date(lastLoan.createdAt)) < 30) {
      return res.status(403).json({ message: 'Please wait 30 days between loan requests' });
    }

    // TODO: compute on-time rate ≥ 95% based on repayment history once fields exist.

    next();
  } catch (e) {
    next(e);
  }
}

module.exports = {
  geoGate,
  ipDenyGate,
  deviceGate,
  limitationGate,
  limitationGateOutgoing,
  capsGate,
  velocityGate,
  loanEligibilityGate,
};