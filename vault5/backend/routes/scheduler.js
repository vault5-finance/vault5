const express = require('express');
const { protect } = require('../middleware/auth');
const {
  processOverdueReminders,
  getOverdueSummary,
  processUserOverdueReminders
} = require('../controllers/schedulerController');

const router = express.Router();

// All routes protected
router.use(protect);

// Manual trigger for overdue reminders (for cron jobs)
router.post('/process-overdue-reminders', processOverdueReminders);

// Get overdue summary for current user
router.get('/overdue-summary', getOverdueSummary);

// Process overdue reminders for current user only (for testing)
router.post('/process-user-overdue', processUserOverdueReminders);

module.exports = router;