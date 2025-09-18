const { Pool } = require('pg');
const User = require('../models/user');

// Mock the pool
jest.mock('pg', () => {
  const mockPool = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Pool: jest.fn(() => mockPool) };
});

describe('User Model', () => {
  let mockPool;

  beforeEach(() => {
    mockPool = new Pool();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };

      mockPool.connect.mockResolvedValue(mockClient);
      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({
          rows: [{
            id: '123',
            name: 'Test User',
            email: 'test@example.com',
            role: 'user'
          }]
        }) // INSERT
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        dob: '1990-01-01',
        phone: '+1234567890',
        city: 'Test City'
      };

      const result = await User.create(userData);

      expect(result).toEqual({
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      });
      expect(mockClient.query).toHaveBeenCalledTimes(3);
    });

    it('should handle database errors', async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };

      mockPool.connect.mockResolvedValue(mockClient);
      mockClient.query.mockRejectedValue(new Error('Database error'));

      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      await expect(User.create(userData)).rejects.toThrow('Database error');
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      };

      mockPool.query.mockResolvedValue({ rows: [mockUser] });

      const result = await User.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['test@example.com']
      );
    });

    it('should return null if user not found', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      const result = await User.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('updateById', () => {
    it('should update user successfully', async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };

      const updatedUser = {
        id: '123',
        name: 'Updated Name',
        email: 'test@example.com',
        role: 'user'
      };

      mockPool.connect.mockResolvedValue(mockClient);
      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [updatedUser] }) // UPDATE
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      const result = await User.updateById('123', { name: 'Updated Name' });

      expect(result).toEqual(updatedUser);
    });
  });
});