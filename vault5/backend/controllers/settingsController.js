const { User } = require('../models');

// Update user settings (preferences)
const updateSettings = async (req, res) => {
  try {
    const updates = req.body; // e.g., { linkedAccounts: ['M-Pesa'], notificationThresholds: { shortfall: 2000 }, lendingRules: { nonRepayCap: 2 } }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Merge updates into preferences
    user.preferences = { ...user.preferences, ...updates };

    await user.save();

    res.json({ message: 'Settings updated successfully', preferences: user.preferences });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user settings
const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('preferences');
    res.json(user.preferences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updateSettings,
  getSettings
};