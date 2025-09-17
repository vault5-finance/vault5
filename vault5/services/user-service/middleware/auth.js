const jwt = require('jsonwebtoken');
const { pool, redisClient, logger } = require('../server');

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token is blacklisted in Redis
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ message: 'Token has been revoked' });
    }

    // Get user from database
    const userQuery = `
      SELECT id, email, name, role, is_active, preferences
      FROM users
      WHERE id = $1
    `;
    const userResult = await pool.query(userQuery, [decoded.id]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Attach user to request
    req.user = user;

    // Update last activity in Redis
    await redisClient.setEx(`user:${user.id}:last_activity`, 3600, new Date().toISOString());

    next();
  } catch (error) {
    logger.error('Authentication error:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }

    res.status(500).json({ message: 'Authentication failed' });
  }
};

// Middleware for role-based access control
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

// Middleware to check if user owns the resource or is admin
const requireOwnershipOrAdmin = (resourceIdParam) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const userId = req.user.id;

      // If user is admin, allow access
      if (req.user.role === 'admin') {
        return next();
      }

      // Check ownership based on resource type
      let ownershipQuery = '';
      let params = [userId, resourceId];

      if (resourceIdParam === 'accountId') {
        ownershipQuery = 'SELECT 1 FROM accounts WHERE user_id = $1 AND id = $2';
      } else if (resourceIdParam === 'userId') {
        // For user resources, check if user is accessing their own data
        if (userId !== resourceId) {
          return res.status(403).json({ message: 'Access denied' });
        }
        return next();
      }

      if (ownershipQuery) {
        const result = await pool.query(ownershipQuery, params);
        if (result.rows.length === 0) {
          return res.status(403).json({ message: 'Access denied' });
        }
      }

      next();
    } catch (error) {
      logger.error('Ownership check error:', error);
      res.status(500).json({ message: 'Authorization check failed' });
    }
  };
};

// Middleware to refresh token
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    // Check if refresh token exists in Redis
    const userId = await redisClient.get(`refresh:${token}`);
    if (!userId) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Get user
    const userQuery = 'SELECT id, email, role FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];

    // Generate new access token
    const newToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    );

    res.json({
      token: newToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({ message: 'Token refresh failed' });
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  requireOwnershipOrAdmin,
  refreshToken
};