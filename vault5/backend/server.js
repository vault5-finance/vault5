const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');
const User = require('./models/User');
const Account = require('./models/Account');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vault5', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('MongoDB connected');

  // Seed default user if not exists
  const email = 'bnyaliti@gmail.com';
  const exists = await User.findOne({ email });
  if (!exists) {
    const password = 'Admin';
    const name = 'Bryson Nyaliti Omullo';
    const dob = new Date('2001-07-31');
    const phone = '+254745959794';
    const city = 'Nairobi';
    const avatar = '';

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashed,
      dob,
      phone,
      city,
      avatar,
      role: 'admin'
    });
    await user.save();

    // Create default accounts
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

    console.log('Default user created successfully');
  } else {
    console.log('Default user already exists');
  }
})
.catch(err => console.error('MongoDB connection error:', err));

// Routes
const {
  authRoutes,
  accountsRoutes,
  goalsRoutes,
  lendingRoutes,
  reportsRoutes,
  loansRoutes,
  investmentsRoutes,
  transactionsRoutes,
  settingsRoutes,
  notificationsRoutes
} = require('./routes');
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/lending', lendingRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api/investments', investmentsRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationsRoutes);

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