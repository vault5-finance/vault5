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

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize secrets before DB connection
loadSecrets().then(secretsLoaded => {
  if (!secretsLoaded) {
    console.warn('Secrets not loaded from AWS - using local environment variables');
  }

  // Middleware (security, compression, CORS)
  const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '*')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const corsOptions = {
    origin: function (origin, callback) {
      // Allow non-browser clients (no origin) and wildcard
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  };

  app.use(helmet());
  app.use(compression());
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  app.use(express.json());

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
  investmentsRoutes,
  transactionsRoutes,
  settingsRoutes,
  notificationsRoutes,
  recommendationsRoutes,
  gamificationRoutes,
  receiptsRoutes
} = require('./routes');
const plaidRoutes = require('./routes/plaid');
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
app.use('/api/investments', investmentsRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/receipts', receiptsRoutes);
app.use('/api/plaid', plaidRoutes);
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