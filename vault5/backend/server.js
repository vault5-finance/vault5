const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const { loadSecrets } = require('./utils/secretsLoader');
const User = require('./models/User');
const Account = require('./models/Account');

// Load environment variables first
dotenv.config();

/**
 * Environment Variables Configuration for Deployment
 *
 * Required Environment Variables:
 * - MONGO_URI: MongoDB connection string
 *   - Local: mongodb://localhost:27017/vault5
 *   - Production: MongoDB Atlas or hosted MongoDB URI
 *
 * - CORS_ALLOWED_ORIGINS: Comma-separated list of allowed origins for CORS
 *   - Render deployment: "https://vault5.vercel.app,https://*.vercel.app"
 *   - Include main production domain and all preview deployments
 *
 * Optional Environment Variables:
 * - PORT: Server port (defaults to 5000)
 *   - Render: Automatically set by platform
 *   - Local development: Can be overridden
 *
 * - NODE_ENV: Environment mode
 *   - production: Enables production optimizations
 *   - development: Enables verbose logging (default)
 *
 * Deployment Platform Variables:
 * - Render: Automatically sets PORT and may require CORS_ALLOWED_ORIGINS
 * - Vercel: Requires REACT_APP_API_URL to be set in dashboard
 */

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize secrets before DB connection
loadSecrets().then(secretsLoaded => {
  if (!secretsLoaded) {
    console.warn('Secrets not loaded from AWS - using local environment variables');
  }

  // Middleware (security, compression, CORS)
  /**
   * CORS Configuration for Deployment Environments
   *
   * Environment Variables:
   * - CORS_ALLOWED_ORIGINS: Comma-separated list of allowed origins
   *   - Render deployment: "https://vault5.vercel.app,https://*.vercel.app"
   *   - Development: "*" (allows all origins)
   *   - Custom domains: Add your domain(s) to the list
   *
   * Supported origin patterns:
   * - Exact match: https://vault5.vercel.app
   * - Wildcard subdomains: *.vercel.app (matches any subdomain)
   * - Regex patterns: regex:^https://.*\.vercel\.app$ (advanced matching)
   *
   * For Render deployment, set CORS_ALLOWED_ORIGINS to include:
   * - https://vault5.vercel.app (main production domain)
   * - *.vercel.app (preview deployments)
   * - Your custom domain (if using one)
   */
  const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '*')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  // Helper: match origin against patterns
  // Supports:
  //  - Exact match: https://vault5.vercel.app
  //  - Wildcard subdomains: *.vercel.app or *.onrender.com
  //  - Regex: regex:^https://.*\.vercel\.app$
  const isOriginAllowed = (origin) => {
    if (!origin) return true; // non-browser clients
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return true;

    for (const pat of allowedOrigins) {
      if (!pat) continue;
      if (pat.startsWith('*.')) {
        // wildcard subdomain match
        const suffix = pat.slice(1); // ".vercel.app"
        if (origin.endsWith(suffix)) return true;
      } else if (pat.startsWith('regex:')) {
        const rx = pat.slice(6);
        try {
          const re = new RegExp(rx);
          if (re.test(origin)) return true;
        } catch {
          // ignore invalid regex
        }
      }
    }
    return false;
  };

  const corsOptions = {
    origin: function (origin, callback) {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      // lightweight diagnostic to help debug CORS in non-prod
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[CORS] Blocked origin:', origin, 'Allowed list:', allowedOrigins);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  };
 
  // Trust proxy headers (required on Render/behind proxies) so rate-limit and IP detection work
  // Fixes: express-rate-limit ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
  app.set('trust proxy', 1);
 
  app.use(helmet());
  app.use(compression());
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  app.use(express.json());

  // Lightweight request/response logger to trace auth/signup failures without leaking secrets
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path || req.url;
    // Redact sensitive fields
    const safeBody = (() => {
      try {
        if (!req.body || typeof req.body !== 'object') return undefined;
        const clone = { ...req.body };
        if ('password' in clone) clone.password = '[redacted]';
        if ('confirmPassword' in clone) clone.confirmPassword = '[redacted]';
        if ('token' in clone) clone.token = '[redacted]';
        return clone;
      } catch {
        return undefined;
      }
    })();

    console.log('[req]', req.method, path, safeBody ? { body: safeBody } : '');

    res.on('finish', () => {
      const ms = Date.now() - start;
      console.log('[res]', req.method, path, res.statusCode, `${ms}ms`);
    });

    next();
  });

  // Serve uploaded files statically (with cache hints)
  app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    maxAge: '7d',
    etag: true,
    immutable: false
  }));

  // MongoDB Connection
  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vault5', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
.then(async () => {
  console.log('MongoDB connected');

  // One-time migration: drop legacy unique index on `email` if it exists (migrated to emails[])
  try {
    const idx = await mongoose.connection.db.collection('users').indexes();
    const legacyEmailIdx = idx.find(i => i.name === 'email_1');
    if (legacyEmailIdx) {
      console.log('Dropping legacy index email_1 on users collection');
      await mongoose.connection.db.collection('users').dropIndex('email_1');
    }
  } catch (e) {
    console.warn('Index check/drop skipped:', e.message);
  }

  // Default user seeding moved to backend/seed.js (run separately)
  // This inline seeding was removed to avoid schema drift and duplication.
})
.catch(err => console.error('MongoDB connection error:', err));

// Routes
const {
  authRoutes,
  adminRoutes,
  adminComplianceRoutes,
  adminFinanceRoutes,
  adminSupportRoutes,
  adminContentRoutes,
  adminSystemRoutes,
  adminAccountsRoutes,
  legalRoutes,
  accountsRoutes,
  goalsRoutes,
  lendingRoutes,
  reportsRoutes,
  loansRoutes,
  p2pLoansRoutes,
  investmentsRoutes,
  transactionsRoutes,
  settingsRoutes,
  notificationsRoutes,
  recommendationsRoutes,
  gamificationRoutes,
  receiptsRoutes,
  paymentsRoutes
} = require('./routes');
const kycRoutes = require('./routes/kyc');
const plaidRoutes = require('./routes/plaid');
const linkedAccountsRoutes = require('./routes/linkedAccounts');
const walletRoutes = require('./routes/wallet');
const otpRoutes = require('./routes/otp');
const emailVerificationRoutes = require('./routes/emailVerification');
const schedulerRoutes = require('./routes/scheduler');
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/compliance', adminComplianceRoutes);
app.use('/api/admin/finance', adminFinanceRoutes);
app.use('/api/admin/support', adminSupportRoutes);
app.use('/api/admin/content', adminContentRoutes);
app.use('/api/admin/system', adminSystemRoutes);
app.use('/api/admin/accounts', adminAccountsRoutes);
app.use('/api/legal', legalRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/lending', lendingRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api/p2p-loans', p2pLoansRoutes);
app.use('/api/investments', investmentsRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/receipts', receiptsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/plaid', plaidRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/linked-accounts', linkedAccountsRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/email-verification', emailVerificationRoutes);
app.use('/api/scheduler', schedulerRoutes);
// Compliance & KYC routes
app.use('/api/compliance', require('./routes').complianceRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Vault5 Backend API is running!' });
});

// Error handling middleware (basic)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
}).catch(err => console.error('Secrets loading error:', err));