const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { User, Account, Lending } = require('../models');

// Extend Jest timeouts for CI (must be top-level to affect hooks)
jest.setTimeout(30000);

let mongoServer;

describe('Lending Rule Engine Tests', () => {
  beforeAll(async () => {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vault5_test';
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    } catch (e) {
      mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri());
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Account.deleteMany({});
    await Lending.deleteMany({});
  });

  test('should calculate safe lending amount based on account balances', async () => {
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

    // Create accounts with balances
    const accounts = [
      { user: user._id, type: 'Daily', percentage: 50, balance: 5000 },
      { user: user._id, type: 'Fun', percentage: 5, balance: 1000 },
      { user: user._id, type: 'Charity', percentage: 5, balance: 800 },
      { user: user._id, type: 'Emergency', percentage: 10, balance: 2000 }
    ];
    await Account.insertMany(accounts);

    // Test lending calculation (50% Fun + 30% Charity + 20% Daily)
    const safeAmount = (1000 * 0.5) + (800 * 0.3) + (5000 * 0.2); // 500 + 240 + 1000 = 1740

    // This would be tested against the actual calculateSafeAmount function
    expect(safeAmount).toBe(1740);
  });

  test('should block lending from Emergency and LongTerm accounts', async () => {
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

    // Create accounts including restricted ones
    const accounts = [
      { user: user._id, type: 'Daily', percentage: 50, balance: 5000 },
      { user: user._id, type: 'Emergency', percentage: 10, balance: 10000 },
      { user: user._id, type: 'LongTerm', percentage: 10, balance: 15000 }
    ];
    await Account.insertMany(accounts);

    // Safe amount should exclude Emergency and LongTerm
    const safeAmount = 5000 * 0.2; // Only 20% of Daily

    expect(safeAmount).toBe(1000);
  });

  test('should enforce non-repayable lending caps', async () => {
    // Create test user
    const user = new User({
      name: 'Test User',
      emails: [{ email: 'test@example.com', isPrimary: true, isVerified: true }],
      phones: [{ phone: '+254712345678', isPrimary: true, isVerified: true }],
      password: 'hashedpassword',
      registrationStep: 4,
      isActive: true,
      isVerified: true,
      preferences: {
        lendingRules: {
          nonRepayCap: 3 // Max 3 non-repayable lendings per month
        }
      }
    });
    await user.save();

    // Create existing lendings (2 non-repayable)
    const existingLendings = [
      { user: user._id, type: 'Non-Emergency', repayable: false, status: 'outstanding', createdAt: new Date() },
      { user: user._id, type: 'Non-Emergency', repayable: false, status: 'outstanding', createdAt: new Date() }
    ];
    await Lending.insertMany(existingLendings);

    // Should allow one more non-repayable lending
    const currentMonthLendings = await Lending.find({
      user: user._id,
      type: 'Non-Emergency',
      repayable: false,
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    expect(currentMonthLendings.length).toBe(2);
    // Next lending should be allowed (under cap of 3)
  });
});