const gracePeriodService = require('../services/gracePeriodService');
const { User } = require('../models');

/**
 * Get user's current grace period settings
 */
const getGracePeriodSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('preferences.overdueReminders');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const settings = user.preferences?.overdueReminders || {};

    // Add default values if not set
    const defaultSettings = {
      enabled: true,
      channels: {
        email: true,
        sms: false,
        push: true,
        whatsapp: false
      },
      gracePeriods: {
        emergency: 1,
        nonEmergency: 3
      },
      escalationSchedule: {
        firstReminder: 1,
        secondReminder: 7,
        thirdReminder: 14,
        finalReminder: 30
      },
      preferredContactTimes: {
        startHour: 9,
        endHour: 18,
        timezone: 'Africa/Nairobi'
      },
      templates: {
        preferredTone: 'professional'
      }
    };

    // Merge user settings with defaults
    const mergedSettings = {
      ...defaultSettings,
      ...settings,
      channels: { ...defaultSettings.channels, ...(settings.channels || {}) },
      gracePeriods: { ...defaultSettings.gracePeriods, ...(settings.gracePeriods || {}) },
      escalationSchedule: { ...defaultSettings.escalationSchedule, ...(settings.escalationSchedule || {}) },
      preferredContactTimes: { ...defaultSettings.preferredContactTimes, ...(settings.preferredContactTimes || {}) },
      templates: { ...defaultSettings.templates, ...(settings.templates || {}) }
    };

    res.json({
      success: true,
      settings: mergedSettings
    });
  } catch (error) {
    console.error('Error getting grace period settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get grace period settings',
      error: error.message
    });
  }
};

/**
 * Update user's grace period settings
 */
const updateGracePeriodSettings = async (req, res) => {
  try {
    const updates = req.body;

    // Validate grace period values
    if (updates.gracePeriods) {
      const { emergency, nonEmergency } = updates.gracePeriods;
      if (emergency !== undefined && !gracePeriodService.validateGracePeriod(emergency)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid emergency grace period (must be 0-30 days)'
        });
      }
      if (nonEmergency !== undefined && !gracePeriodService.validateGracePeriod(nonEmergency)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid non-emergency grace period (must be 0-30 days)'
        });
      }
    }

    // Validate escalation schedule
    if (updates.escalationSchedule) {
      const schedule = updates.escalationSchedule;
      const requiredFields = ['firstReminder', 'secondReminder', 'thirdReminder', 'finalReminder'];

      for (const field of requiredFields) {
        if (schedule[field] !== undefined && (!Number.isInteger(schedule[field]) || schedule[field] < 0 || schedule[field] > 180)) {
          return res.status(400).json({
            success: false,
            message: `Invalid ${field} (must be 0-180 days)`
          });
        }
      }

      // Ensure logical order
      if (schedule.firstReminder >= schedule.secondReminder ||
          schedule.secondReminder >= schedule.thirdReminder ||
          schedule.thirdReminder >= schedule.finalReminder) {
        return res.status(400).json({
          success: false,
          message: 'Escalation schedule must be in ascending order'
        });
      }
    }

    // Update user preferences
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Deep merge the updates
    user.preferences = user.preferences || {};
    user.preferences.overdueReminders = {
      ...user.preferences.overdueReminders,
      ...updates
    };

    await user.save();

    res.json({
      success: true,
      message: 'Grace period settings updated successfully',
      settings: user.preferences.overdueReminders
    });
  } catch (error) {
    console.error('Error updating grace period settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update grace period settings',
      error: error.message
    });
  }
};

/**
 * Get grace period explanation for a specific lending
 */
const getGracePeriodExplanation = async (req, res) => {
  try {
    const { lendingId } = req.params;

    const lending = await require('../models').Lending.findOne({
      _id: lendingId,
      user: req.user._id
    });

    if (!lending) {
      return res.status(404).json({
        success: false,
        message: 'Lending not found'
      });
    }

    const user = await User.findById(req.user._id);
    const effectiveGracePeriod = await gracePeriodService.calculateEffectiveGracePeriod(lending, user);
    const explanation = await gracePeriodService.getGracePeriodExplanation(lending, user, effectiveGracePeriod);

    res.json({
      success: true,
      explanation
    });
  } catch (error) {
    console.error('Error getting grace period explanation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get grace period explanation',
      error: error.message
    });
  }
};

/**
 * Get default grace period configurations
 */
const getDefaultConfigurations = async (req, res) => {
  try {
    const userTier = req.query.userTier || 'basic';
    const lendingType = req.query.lendingType || 'non-emergency';

    const defaultGracePeriod = gracePeriodService.getDefaultGracePeriod(userTier, lendingType);

    res.json({
      success: true,
      configurations: {
        defaultGracePeriod,
        allDefaults: gracePeriodService.DEFAULT_CONFIGS,
        businessRules: gracePeriodService.BUSINESS_RULES
      }
    });
  } catch (error) {
    console.error('Error getting default configurations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get default configurations',
      error: error.message
    });
  }
};

/**
 * Reset user's grace period settings to defaults
 */
const resetToDefaults = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Reset to empty object (will use defaults when retrieved)
    user.preferences.overdueReminders = {};
    await user.save();

    res.json({
      success: true,
      message: 'Grace period settings reset to defaults'
    });
  } catch (error) {
    console.error('Error resetting grace period settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset grace period settings',
      error: error.message
    });
  }
};

module.exports = {
  getGracePeriodSettings,
  updateGracePeriodSettings,
  getGracePeriodExplanation,
  getDefaultConfigurations,
  resetToDefaults
};