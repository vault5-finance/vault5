const mongoose = require('mongoose');
const { User, Account, Transaction } = require('../models');
const { allocateIncome } = require('../controllers/accountsController');

describe('Allocation Engine Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vault5_test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Account.deleteMany({});
    await Transaction.deleteMany({});
  });

  test('should allocate income correctly to default accounts', async () => {
    // Create test user
    const user = new User({
      name: 'Test User',
      emails: [{ email: 'test@example.com', isPrimary: true, isVerified: true }],
      phones: [{ phone: '+254712345678', isPrimary: true, isVerified: true }],
      password: 'hashedpassword',
      registrationStep: 4,
      isActive: true,
      isVerified: true
    });
    await user.save();

    // Create default accounts
    const accounts = [
      { user: user._id, type: 'Daily', percentage: 50, balance: 0 },
      { user: user._id, type: 'Emergency', percentage: 10, balance: 0 },
      { user: user._id, type: 'Investment', percentage: 20, balance: 0 },
      { user: user._id, type: 'LongTerm', percentage: 10, balance: 0 },
      { user: user._id, type: 'Fun', percentage: 5, balance: 0 },
      { user: user._id, type: 'Charity', percentage: 5, balance: 0 }
    ];
    await Account.insertMany(accounts);
    user.accounts = accounts.map(a => a._id);
    await user.save();

    // Allocate income
    const incomeAmount = 10000; // KES 10,000
    await allocateIncome(user._id, incomeAmount, 'Salary', 'Income');

    // Check allocations
    const updatedAccounts = await Account.find({ user: user._id }).sort({ type: 1 });

    expect(updatedAccounts.find(a => a.type === 'Daily').balance).toBe(5000);
    expect(updatedAccounts.find(a => a.type === 'Emergency').balance).toBe(1000);
    expect(updatedAccounts.find(a => a.type === 'Investment').balance).toBe(2000);
    expect(updatedAccounts.find(a => a.type === 'LongTerm').balance).toBe(1000);
    expect(updatedAccounts.find(a => a.type === 'Fun').balance).toBe(500);
    expect(updatedAccounts.find(a => a.type === 'Charity').balance).toBe(500);
  });

  test('should track compliance and create shortfall transactions', async () => {
    // Create test user
    const user = new User({
      name: 'Test User',
      emails: [{ email: 'test@example.com', isPrimary: true, isVerified: true }],
      phones: [{ phone: '+254712345678', isPrimary: true, isVerified: true }],
      password: 'hashedpassword',
      registrationStep: 4,
      isActive: true,
      isVerified: true
    });
    await user.save();

    // Create accounts with targets
    const accounts = [
      { user: user._id, type: 'Daily', percentage: 50, balance: 0, target: 5000 },
      { user: user._id, type: 'Emergency', percentage: 10, balance: 0, target: 1000 }
    ];
    await Account.insertMany(accounts);
    user.accounts = accounts.map(a => a._id);
    await user.save();

    // Allocate small income that won't meet targets
    const incomeAmount = 1000; // KES 1,000
    await allocateIncome(user._id, incomeAmount, 'Small Income', 'Income');

    // Check that shortfall is tracked
    const updatedAccounts = await Account.find({ user: user._id });
    const dailyAccount = updatedAccounts.find(a => a.type === 'Daily');

    expect(dailyAccount.balance).toBe(500); // 50% of 1000
    expect(dailyAccount.status).toBe('red'); // Shortfall

    // Check for shortfall transaction
    const shortfallTx = await Transaction.findOne({
      user: user._id,
      type: 'expense',
      description: { $regex: 'shortfall' }
    });

    expect(shortfallTx).toBeTruthy();
    expect(shortfallTx.amount).toBe(4500); // 5000 - 500
  });
});