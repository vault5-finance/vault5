const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const { logger } = require('../server');

// Update user settings (preferences)
const updateSettings = [
  body('preferences').optional().isObject().withMessage('Preferences must be an object'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const updates = req.body; // e.g., { linkedAccounts: ['M-Pesa'], notificationThresholds: { shortfall: 2000 }, lendingRules: { nonRepayCap: 2 } }
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Merge updates into preferences
      const currentPreferences = user.preferences || {};
      const newPreferences = { ...currentPreferences, ...updates };

      // Validate preferences structure
      const validKeys = ['notifications', 'currency', 'linkedAccounts', 'notificationThresholds', 'lendingRules'];
      const invalidKeys = Object.keys(newPreferences).filter(key => !validKeys.includes(key));

      if (invalidKeys.length > 0) {
        return res.status(400).json({
          message: 'Invalid preference keys',
          invalidKeys
        });
      }

      await User.updateById(userId, { preferences: newPreferences });

      res.json({
        message: 'Settings updated successfully',
        preferences: newPreferences
      });
    } catch (error) {
      logger.error('Update settings error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

// Get user settings
const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.preferences || {});
  } catch (error) {
    logger.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update notification preferences
const updateNotificationSettings = [
  body('notifications').optional().isBoolean().withMessage('Notifications must be a boolean'),
  body('notificationThresholds').optional().isObject().withMessage('Notification thresholds must be an object'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const { notifications, notificationThresholds } = req.body;
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const currentPreferences = user.preferences || {};
      const newPreferences = { ...currentPreferences };

      if (notifications !== undefined) {
        newPreferences.notifications = notifications;
      }

      if (notificationThresholds) {
        newPreferences.notificationThresholds = {
          ...currentPreferences.notificationThresholds,
          ...notificationThresholds
        };
      }

      await User.updateById(userId, { preferences: newPreferences });

      res.json({
        message: 'Notification settings updated successfully',
        preferences: newPreferences
      });
    } catch (error) {
      logger.error('Update notification settings error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

// Update lending rules
const updateLendingRules = [
  body('lendingRules').isObject().withMessage('Lending rules must be an object'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const { lendingRules } = req.body;
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const currentPreferences = user.preferences || {};
      const newPreferences = {
        ...currentPreferences,
        lendingRules: {
          ...currentPreferences.lendingRules,
          ...lendingRules
        }
      };

      await User.updateById(userId, { preferences: newPreferences });

      res.json({
        message: 'Lending rules updated successfully',
        preferences: newPreferences
      });
    } catch (error) {
      logger.error('Update lending rules error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

// Update linked accounts
const updateLinkedAccounts = [
  body('linkedAccounts').isArray().withMessage('Linked accounts must be an array'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const { linkedAccounts } = req.body;
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const currentPreferences = user.preferences || {};
      const newPreferences = {
        ...currentPreferences,
        linkedAccounts
      };

      await User.updateById(userId, { preferences: newPreferences });

      res.json({
        message: 'Linked accounts updated successfully',
        preferences: newPreferences
      });
    } catch (error) {
      logger.error('Update linked accounts error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
];

module.exports = {
  updateSettings,
  getSettings,
  updateNotificationSettings,
  updateLendingRules,
  updateLinkedAccounts
};