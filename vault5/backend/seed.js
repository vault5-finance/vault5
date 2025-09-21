const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Account = require('./models/Account');
const {
  LimitTier,
  GeoPolicy,
  DeviceRule,
} = require('./models/Compliance');

const updateExistingAdmins = async () => {
  try {
    console.log('Updating existing admin users...');

    // Update any users with role 'admin' to 'super_admin'
    const result = await User.updateMany(
      { role: 'admin' },
      { $set: { role: 'super_admin' } }
    );

    if (result.modifiedCount > 0) {
      console.log(`Updated ${result.modifiedCount} admin users to super_admin role`);
    }

    console.log('Admin role update completed');
  } catch (err) {
    console.error('Update error:', err);
  }
};

const seedComplianceDefaults = async () => {
  console.log('Seeding compliance defaults (tiers, geo policy, device rules)...');

  // Limit Tiers per approved caps
  const tiers = [
    { name: 'Tier0', dailyLimit: 10000, monthlyLimit: 25000, maxHoldBalance: 0, minAccountAgeDays: 0 },
    { name: 'Tier1', dailyLimit: 50000, monthlyLimit: 200000, maxHoldBalance: 0, minAccountAgeDays: 0 },
    { name: 'Tier2', dailyLimit: 200000, monthlyLimit: 1000000, maxHoldBalance: 0, minAccountAgeDays: 0 },
  ];

  for (const t of tiers) {
    await LimitTier.updateOne(
      { name: t.name },
      { $set: t },
      { upsert: true }
    );
  }
  console.log('Limit tiers upserted');

  // Geo allowlist: KE initially
  await GeoPolicy.updateOne(
    {},
    { $set: { mode: 'allowlist', countries: ['KE'], updatedAt: new Date() } },
    { upsert: true }
  );
  console.log('Geo allowlist set to ["KE"]');

  // Device rules defaults: require cookies, forbid headless
  await DeviceRule.updateOne(
    {},
    { $set: { requireCookies: true, forbidHeadless: true, minSignals: 1, updatedAt: new Date() } },
    { upsert: true }
  );
  console.log('Device rules seeded');
};

const backfillUsers = async () => {
  console.log('Backfilling users with compliance defaults...');

  // Ensure kycLevel, limitationStatus, etc. are set for existing users
  const res1 = await User.updateMany(
    { kycLevel: { $exists: false } },
    { $set: { kycLevel: 'Tier0' } }
  );
  if (res1.modifiedCount) console.log(`Set kycLevel Tier0 on ${res1.modifiedCount} users`);

  const res2 = await User.updateMany(
    { limitationStatus: { $exists: false } },
    { $set: { limitationStatus: 'none' } }
  );
  if (res2.modifiedCount) console.log(`Set limitationStatus none on ${res2.modifiedCount} users`);

  // Ensure each user has a wallet account designated (fallback to Daily, else first)
  const cursor = User.find({}, { _id: 1 }).cursor();
  for await (const u of cursor) {
    const accounts = await Account.find({ user: u._id }).sort({ createdAt: 1 });
    if (!accounts.length) continue;

    const anyWallet = accounts.some(a => a.isWallet === true);
    if (!anyWallet) {
      let walletAcc = accounts.find(a => a.type === 'Daily') || accounts[0];
      await Account.updateOne({ _id: walletAcc._id }, { $set: { isWallet: true } });
    }
  }
  console.log('Wallet designation backfill complete');
};

// Migrate existing users to 5-account model (remove Charity; set new percentages)
// - Move any Charity balance to LongTerm
// - Ensure accounts set: Daily 50, Emergency 10, Investment 20, LongTerm 10, Fun 10
// - Update Fun from 5 to 10 percent if needed
const migrateToFiveAccounts = async () => {
  if (process.env.MIGRATE_FIVE_ACCOUNTS !== 'true') {
    console.log('Skipping 5-account migration (set MIGRATE_FIVE_ACCOUNTS=true to run)');
    return;
  }
  console.log('Running 5-account model migration...');

  const usersCursor = User.find({}, { _id: 1 }).cursor();
  let updatedUsers = 0;

  for await (const u of usersCursor) {
    const accounts = await Account.find({ user: u._id });
    if (!accounts.length) continue;

    const byType = Object.fromEntries(accounts.map(a => [a.type, a]));
    // Move Charity -> LongTerm then remove Charity
    if (byType['Charity']) {
      const charity = byType['Charity'];
      const amt = Number(charity.balance || 0);
      if (!byType['LongTerm']) {
        // Create LongTerm if missing
        const lt = await Account.create({
          user: u._id,
          type: 'LongTerm',
          percentage: 10,
          balance: 0,
          target: 0,
          status: 'green',
          isWallet: false,
          isAutoDistribute: true
        });
        byType['LongTerm'] = lt;
      }
      if (amt > 0) {
        await Account.updateOne({ _id: byType['LongTerm']._id }, { $inc: { balance: amt } });
      }
      await Account.deleteOne({ _id: charity._id });
      delete byType['Charity'];
    }

    // Ensure required accounts exist with target percentages
    const targetPerc = {
      Daily: 50,
      Emergency: 10,
      Investment: 20,
      LongTerm: 10,
      Fun: 10,
    };

    for (const [type, perc] of Object.entries(targetPerc)) {
      if (!byType[type]) {
        const created = await Account.create({
          user: u._id,
          type,
          percentage: perc,
          balance: 0,
          target: 0,
          status: 'green',
          isWallet: type === 'Daily',
          isAutoDistribute: true
        });
        byType[type] = created;
      } else {
        // Update percentage (e.g., set Fun to 10 if previously 5)
        await Account.updateOne({ _id: byType[type]._id }, { $set: { percentage: perc } });
      }
    }

    updatedUsers++;
  }

  console.log(`5-account migration complete. Users updated: ${updatedUsers}`);
};

const seedAdminUsers = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI is not set. Please configure backend/.env');
    }

    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    // First update any existing admin users
    await updateExistingAdmins();

    // Seed compliance defaults (tiers, geo, device)
    await seedComplianceDefaults();

    // Backfill user compliance fields and wallet designation
    await backfillUsers();

    // Optional migration: enable by setting MIGRATE_FIVE_ACCOUNTS=true in env
    await migrateToFiveAccounts();

    const adminUsers = [
      {
        email: 'admin@vault5.com',
        password: 'Adminvault5',
        name: 'Vault5 Admin',
        dob: new Date('1990-01-01'),
        phone: '+254712345678',
        city: 'Nairobi',
        avatar: 'https://ui-avatars.com/api/?name=Vault5+Admin',
        role: 'super_admin'
      },
      {
        email: 'bnyaliti@gmail.com',
        password: 'Admin',
        name: 'Bryson Nyaliti Omullo',
        dob: new Date('2001-07-31'),
        phone: '+254745959794',
        city: 'Nairobi',
        avatar: 'https://ui-avatars.com/api/?name=Bryson+Nyaliti',
        role: 'super_admin'
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
        termsAccepted: true,
        kycLevel: 'Tier2' // elevate admins to highest KYC for testing admin consoles
      });
      await user.save();

      // Create default accounts for each admin (5-account model)
      const defaults = [
        { type: 'Daily', percentage: 50 },
        { type: 'Emergency', percentage: 10 },
        { type: 'Investment', percentage: 20 },
        { type: 'LongTerm', percentage: 10 },
        { type: 'Fun', percentage: 10 },
      ];

      let createdAccounts = [];
      for (const d of defaults) {
        const acc = new Account({
          user: user._id,
          type: d.type,
          percentage: d.percentage,
          balance: 0,
          target: 0,
          status: 'green',
          isWallet: d.type === 'Daily', // set Daily as wallet by default
          isAutoDistribute: true
        });
        await acc.save();
        createdAccounts.push(acc._id);
      }
      user.accounts.push(...createdAccounts);
      await user.save();

      console.log(`Admin user ${adminData.email} created successfully`);
    }

    console.log('Seeding completed');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedAdminUsers();