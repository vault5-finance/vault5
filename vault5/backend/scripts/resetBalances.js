const mongoose = require('mongoose');
const User = require('../models/User');
const Account = require('../models/Account');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vault5', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('MongoDB connected for balance reset');

  try {
    // Reset all account balances to 0 first
    console.log('Resetting all account balances to 0...');
    await Account.updateMany({}, { balance: 0 });
    console.log('✅ All account balances reset to 0');

    // Find Collins user
    let collinsUser = await User.findOne({ email: 'collins@gmail.com' });
    if (!collinsUser) {
      console.log('❌ Collins user not found. Creating user...');

      // Create Collins user if not exists
      const newCollinsUser = new User({
        name: 'Collins Oduya',
        email: 'collins@gmail.com',
        phone: '+254712345678',
        password: 'password123', // In production, this should be hashed
        avatar: '👨‍🔬',
        username: '@collins',
        accountNumber: '23456789012',
        bankName: 'Equity Bank'
      });

      await newCollinsUser.save();
      collinsUser = newCollinsUser;
      console.log('✅ Collins user created');
    }

    // Define account distribution for 10,000 KES
    const accountDistribution = [
      { type: 'Daily', percentage: 50, amount: 5000 },        // 50% = 5,000
      { type: 'Emergency', percentage: 10, amount: 1000 },    // 10% = 1,000
      { type: 'Investment', percentage: 20, amount: 2000 },   // 20% = 2,000
      { type: 'LongTerm', percentage: 10, amount: 1000 },     // 10% = 1,000
      { type: 'Fun', percentage: 5, amount: 500 },           // 5% = 500
      { type: 'Charity', percentage: 5, amount: 500 }        // 5% = 500
    ];

    console.log('Setting up Collins account balances...');

    // Update or create accounts for Collins with distributed balances
    for (const accountInfo of accountDistribution) {
      let account = await Account.findOne({
        user: collinsUser._id,
        type: accountInfo.type
      });

      if (account) {
        // Update existing account
        account.balance = accountInfo.amount;
        account.percentage = accountInfo.percentage;
        account.target = accountInfo.amount * 2; // Set target to 2x current balance
        await account.save();
        console.log(`✅ Updated ${accountInfo.type} account: KES ${accountInfo.amount}`);
      } else {
        // Create new account
        account = new Account({
          user: collinsUser._id,
          type: accountInfo.type,
          percentage: accountInfo.percentage,
          balance: accountInfo.amount,
          target: accountInfo.amount * 2,
          status: 'green'
        });
        await account.save();
        console.log(`✅ Created ${accountInfo.type} account: KES ${accountInfo.amount}`);
      }
    }

    // Verify total balance
    const collinsAccounts = await Account.find({ user: collinsUser._id });
    const totalBalance = collinsAccounts.reduce((sum, acc) => sum + acc.balance, 0);

    console.log(`\n📊 Collins Account Summary:`);
    console.log(`Total Balance: KES ${totalBalance.toLocaleString()}`);
    console.log(`Target Balance: KES ${collinsAccounts.reduce((sum, acc) => sum + (acc.target || 0), 0).toLocaleString()}`);

    collinsAccounts.forEach(account => {
      console.log(`${account.type}: KES ${account.balance.toLocaleString()} (${account.percentage}%)`);
    });

    // Verify other users have 0 balance
    const otherUsers = await User.find({ email: { $ne: 'collins@gmail.com' } });
    let zeroBalanceCount = 0;

    for (const user of otherUsers) {
      const userAccounts = await Account.find({ user: user._id });
      const userTotalBalance = userAccounts.reduce((sum, acc) => sum + acc.balance, 0);

      if (userTotalBalance === 0) {
        zeroBalanceCount++;
      } else {
        console.log(`⚠️  ${user.name} (${user.email}) still has KES ${userTotalBalance}`);
      }
    }

    console.log(`\n✅ Balance reset completed!`);
    console.log(`✅ Collins has KES 10,000 distributed across accounts`);
    console.log(`✅ ${zeroBalanceCount}/${otherUsers.length} other users have 0 balance`);

  } catch (error) {
    console.error('❌ Error during balance reset:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});