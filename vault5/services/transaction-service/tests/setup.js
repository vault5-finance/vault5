const { Pool } = require('pg');
const redis = require('redis');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';

// Mock external services for testing
jest.mock('../services/httpClient', () => ({
  userServiceClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  },
  eventBusClient: {
    post: jest.fn()
  }
}));

jest.mock('../services/eventPublisher', () => ({
  transactionCreated: jest.fn(),
  transactionUpdated: jest.fn(),
  transactionDeleted: jest.fn(),
  incomeAllocated: jest.fn(),
  fraudDetected: jest.fn(),
  highRiskTransaction: jest.fn(),
  accountBalanceUpdated: jest.fn(),
  categoryCreated: jest.fn(),
  categoryUpdated: jest.fn(),
  serviceHealthCheck: jest.fn(),
  publishBulk: jest.fn()
}));

// Global test database setup
global.testDb = {
  pool: null,
  redisClient: null
};

// Setup before all tests
beforeAll(async () => {
  // Create test database connection
  global.testDb.pool = new Pool({
    connectionString: process.env.POSTGRES_URI || 'postgresql://test:test@localhost:5433/test_db',
    max: 5,
    idleTimeoutMillis: 30000
  });

  // Create test Redis connection
  global.testDb.redisClient = redis.createClient({
    url: process.env.REDIS_URI || 'redis://localhost:6380'
  });

  try {
    await global.testDb.redisClient.connect();
  } catch (error) {
    console.warn('Redis connection failed in tests, continuing without Redis');
  }
});

// Cleanup after each test
afterEach(async () => {
  // Clear all mocks
  jest.clearAllMocks();

  // Clean up test data
  try {
    await global.testDb.pool.query('DELETE FROM allocations');
    await global.testDb.pool.query('DELETE FROM transactions');
    await global.testDb.pool.query('DELETE FROM categories WHERE user_id != \'system\'');
  } catch (error) {
    console.warn('Database cleanup failed:', error.message);
  }
});

// Cleanup after all tests
afterAll(async () => {
  if (global.testDb.pool) {
    await global.testDb.pool.end();
  }
  if (global.testDb.redisClient) {
    await global.testDb.redisClient.quit();
  }
});

// Helper function to create test user
global.createTestUser = () => ({
  id: 'test-user-id',
  email: 'test@example.com',
  role: 'user'
});

// Helper function to create test transaction
global.createTestTransaction = (overrides = {}) => ({
  userId: 'test-user-id',
  amount: 1000,
  type: 'income',
  description: 'Test transaction',
  tag: 'salary',
  date: new Date(),
  ...overrides
});

// Helper function to create test request/response mocks
global.createMockReq = (overrides = {}) => ({
  user: global.createTestUser(),
  body: {},
  query: {},
  params: {},
  ...overrides
});

global.createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};