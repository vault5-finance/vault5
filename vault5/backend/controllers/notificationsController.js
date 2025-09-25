const { Notification, User } = require('../models');

// Generate notification (called from other controllers)
// extraMeta is optional object persisted to notification.meta
const generateNotification = async (userId, type, title, message, relatedId, severity = 'medium', extraMeta = {}) => {
  try {
    const notification = new Notification({
      user: userId,
      type,
      title,
      message,
      relatedId,
      severity,
      meta: extraMeta || {}
    });
    await notification.save();

    // Add to user notifications ref
    const user = await User.findById(userId);
    if (user) {
      user.notifications.push(notification._id);
      await user.save();
    }

    return notification;
  } catch (error) {
    console.error('Failed to generate notification:', error);
  }
};

// Get user's notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({ _id: id, user: req.user._id });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndDelete({ _id: id, user: req.user._id });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Remove from user ref
    const user = await User.findById(req.user._id);
    if (user) {
      user.notifications = user.notifications.filter(nId => nId.toString() !== id);
      await user.save();
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  deleteNotification,
  generateNotification // Export for use in other modules
};