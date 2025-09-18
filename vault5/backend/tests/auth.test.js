const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const {
  register,
  login,
  getProfile,
  updateProfile,
  checkEmail,
  sendOTP,
  verifyOTP,
  checkVaultTag,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

describe('Auth Controller Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vault5_test');
  });

  afterAll(async () => {
    // Clean up and close connection
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear users before each test
    await User.deleteMany({});
  });

  describe('checkEmail', () => {
    it('should return exists: false for non-existent email', async () => {
      const mockReq = { body: { email: 'nonexistent@example.com' } };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await checkEmail(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ exists: false });
    });

    it('should return exists: true for existing email', async () => {
      // Create a test user
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10)
      });

      const mockReq = { body: { email: 'test@example.com' } };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await checkEmail(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        exists: true,
        method: 'password'
      });
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockReq = {
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          dob: '1990-01-01',
          phone: '+1234567890',
          city: 'Test City'
        }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalled();

      // Verify user was created
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).toBeTruthy();
      expect(user.name).toBe('Test User');
    });

    it('should reject registration with existing email', async () => {
      // Create existing user
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        password: await bcrypt.hash('password123', 10)
      });

      const mockReq = {
        body: {
          name: 'New User',
          email: 'existing@example.com',
          password: 'password123',
          dob: '1990-01-01',
          phone: '+1234567890',
          city: 'Test City'
        }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User already exists'
      });
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      // Create test user
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10)
      });
    });

    it('should login successfully with correct credentials', async () => {
      const mockReq = {
        body: {
          email: 'test@example.com',
          password: 'password123'
        }
      };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await login(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalled();
      const response = mockRes.json.mock.calls[0][0];
      expect(response.token).toBeTruthy();
      expect(response.user.email).toBe('test@example.com');
    });

    it('should reject login with wrong password', async () => {
      const mockReq = {
        body: {
          email: 'test@example.com',
          password: 'wrongpassword'
        }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid credentials'
      });
    });
  });

  describe('sendOTP', () => {
    it('should send OTP successfully', async () => {
      const mockReq = { body: { phone: '+1234567890' } };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await sendOTP(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'OTP sent successfully',
        otp: expect.any(String)
      });
    });
  });

  describe('verifyOTP', () => {
    it('should verify valid OTP', async () => {
      const mockReq = { body: { phone: '+1234567890', otp: '123456' } };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await verifyOTP(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'OTP verified successfully'
      });
    });

    it('should reject invalid OTP format', async () => {
      const mockReq = { body: { phone: '+1234567890', otp: '12345' } };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await verifyOTP(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid OTP format'
      });
    });
  });

  describe('checkVaultTag', () => {
    it('should return available for non-existent vault tag', async () => {
      const mockReq = { body: { vaultTag: 'uniqueTag' } };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await checkVaultTag(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ available: true });
    });

    it('should return unavailable for existing vault tag', async () => {
      // Create user with vault tag
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        vaultTag: 'takenTag'
      });

      const mockReq = { body: { vaultTag: 'takenTag' } };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await checkVaultTag(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ available: false });
    });
  });
});