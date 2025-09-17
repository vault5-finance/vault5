const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Account = require('./models/Account');
require('dotenv').config();

const seedDefaultUser = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI is not set. Please configure backend/.env');
    }

    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    const email = 'admin@vault5.com';
    const password = 'adminvault5';
    const name = 'Vault5 Admin';
    const dob = new Date('1990-01-01');
    const phone = '+254712345678';
    const city = 'Nairobi';
    const avatar = 'https://ui-avatars.com/api/?name=Vault5+Admin';

    const exists = await User.findOne({ email });
    if (exists) {
      console.log('Default user already exists');
      process.exit(0);
    }

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
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedDefaultUser();