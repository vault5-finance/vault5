const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vault5', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected successfully');
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});

// Simple login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body);

    const { email, password } = req.body;

    // Simple hardcoded check for testing
    if (email === 'admin@vault5.com' && password === 'Adminvault5') {
      const token = jwt.sign({ id: '123', email }, process.env.JWT_SECRET || 'test-secret');
      return res.json({
        token,
        user: { id: '123', email, role: 'super_admin' },
        redirect: '/admin'
      });
    }

    // Try to find user in database
    const User = require('./models/User');
    const user = await User.findOne({ 'emails.email': email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET || 'test-secret');

    res.json({
      token,
      user: {
        id: user._id,
        email: user.emails[0].email,
        role: user.role
      },
      redirect: user.role.includes('admin') ? '/admin' : '/dashboard'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Simple Vault5 server is running!' });
});

app.listen(PORT, () => {
  console.log(`Simple server running on port ${PORT}`);
});