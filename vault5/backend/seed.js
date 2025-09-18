const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Account = require('./models/Account');
require('dotenv').config();

const seedAdminUsers = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI is not set. Please configure backend/.env');
    }

    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    const adminUsers = [
      {
        email: 'admin@vault5.com',
        password: 'Adminvault5',
        name: 'Vault5 Admin',
        dob: new Date('1990-01-01'),
        phone: '+254712345678',
        city: 'Nairobi',
        avatar: 'https://ui-avatars.com/api/?name=Vault5+Admin',
        role: 'admin'
      },
      {
        email: 'bnyaliti@gmail.com',
        password: 'Admin',
        name: 'Bryson Nyaliti Omullo',
        dob: new Date('2001-07-31'),
        phone: '+254745959794',
        city: 'Nairobi',
        avatar: 'https://ui-avatars.com/api/?name=Bryson+Nyaliti',
        role: 'admin'
      }
    ];

    for (const adminData of adminUsers) {
      const exists = await User.findOne({ 'emails.email': adminData.email });
      if (exists) {
        console.log(`Admin user ${adminData.email} already exists`);
        continue;
      }

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(adminData.password, salt);

      const user = new User({
        name: adminData.name,
        emails: [{
          email: adminData.email,
          isPrimary: true,
          isVerified: true
        }],
        phones: [{
          phone: adminData.phone,
          isPrimary: true,
          isVerified: true
        }],
        password: hashed,
        dob: adminData.dob,
        city: adminData.city,
        avatar: adminData.avatar,
        role: adminData.role,
        isActive: true,
        isVerified: true,
        termsAccepted: true
      });
      await user.save();

      // Create default accounts for each admin
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

      console.log(`Admin user ${adminData.email} created successfully`);
    }

    console.log('Admin users seeding completed');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedAdminUsers();