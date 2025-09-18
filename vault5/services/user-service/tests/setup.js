// Test setup file
const dotenv = require('dotenv');

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.POSTGRES_URI = 'postgresql://test:test@localhost:5432/test_db';

// Mock Redis for tests
jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn(),
    on: jest.fn(),
    get: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
    ping: jest.fn()
  }))
}));

// Mock logger
jest.mock('../server', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  },
  pool: {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn()
  },
  redisClient: {
    connect: jest.fn(),
    on: jest.fn(),
    get: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
    ping: jest.fn()
  }
}));

// Global test teardown
afterAll(async () => {
  // Clean up any test resources
  jest.clearAllMocks();
});