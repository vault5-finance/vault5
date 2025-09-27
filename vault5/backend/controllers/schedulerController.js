const overdueReminderService = require('../services/overdueReminderService');

/**
 * Scheduler Controller
 * Provides endpoints for scheduled tasks like overdue reminders
 */
const processOverdueReminders = async (req, res) => {
  try {
    console.log('Manual trigger: Processing overdue reminders...');

    const results = await overdueReminderService.processOverdueLendings();

    res.json({
      success: true,
      message: 'Overdue reminders processed successfully',
      results
    });
  } catch (error) {
    console.error('Error processing overdue reminders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process overdue reminders',
      error: error.message
    });
  }
};

/**
 * Get overdue summary for a user
 */
const getOverdueSummary = async (req, res) => {
  try {
    const summary = await overdueReminderService.getOverdueSummary(req.user._id);

    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Error getting overdue summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get overdue summary',
      error: error.message
    });
  }
};

/**
 * Process overdue reminders for current user only (for testing)
 */
const processUserOverdueReminders = async (req, res) => {
  try {
    console.log(`Processing overdue reminders for user ${req.user._id}...`);

    const results = await overdueReminderService.processUserOverdueLendings(req.user._id);

    res.json({
      success: true,
      message: 'User overdue reminders processed successfully',
      results
    });
  } catch (error) {
    console.error('Error processing user overdue reminders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process user overdue reminders',
      error: error.message
    });
  }
};

module.exports = {
  processOverdueReminders,
  getOverdueSummary,
  processUserOverdueReminders
};