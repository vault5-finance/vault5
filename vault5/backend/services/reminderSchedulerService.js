const { User, ReminderHistory } = require('../models');

/**
 * Reminder Scheduler Service
 * Handles time-zone aware scheduling and delivery timing for reminders
 */
class ReminderSchedulerService {

  /**
   * Check if current time is within user's preferred contact hours
   * @param {Object} user - User document
   * @param {Date} currentTime - Current time (defaults to now)
   * @returns {boolean} - Whether within preferred hours
   */
  isWithinPreferredHours(user, currentTime = new Date()) {
    const preferences = user.preferences?.overdueReminders?.preferredContactTimes;

    if (!preferences) {
      // Default: 9 AM - 6 PM UTC
      return currentTime.getUTCHours() >= 9 && currentTime.getUTCHours() <= 18;
    }

    const { startHour, endHour, timezone } = preferences;

    // For now, use UTC time - in production, convert to user's timezone
    // TODO: Implement proper timezone conversion
    const currentHour = currentTime.getUTCHours();

    // Handle cases where endHour is less than startHour (e.g., 22:00 to 06:00)
    if (endHour < startHour) {
      return currentHour >= startHour || currentHour <= endHour;
    }

    return currentHour >= startHour && currentHour <= endHour;
  }

  /**
   * Get next available reminder time for a user
   * @param {Object} user - User document
   * @param {Date} fromTime - Starting time (defaults to now)
   * @returns {Date} - Next available time
   */
  getNextAvailableTime(user, fromTime = new Date()) {
    const preferences = user.preferences?.overdueReminders?.preferredContactTimes;

    if (!preferences) {
      // Default: next 9 AM UTC
      const nextTime = new Date(fromTime);
      nextTime.setUTCHours(9, 0, 0, 0);

      if (nextTime <= fromTime) {
        nextTime.setUTCDate(nextTime.getUTCDate() + 1);
      }

      return nextTime;
    }

    const { startHour, endHour } = preferences;
    let nextTime = new Date(fromTime);

    // Set to start of preferred hour
    nextTime.setUTCHours(startHour, 0, 0, 0);

    // If we're already past today's window, move to tomorrow
    if (fromTime.getUTCHours() >= endHour ||
        (fromTime.getUTCHours() === endHour && fromTime.getUTCMinutes() > 0)) {
      nextTime.setUTCDate(nextTime.getUTCDate() + 1);
    }
    // If we're before today's window, use today
    else if (fromTime.getUTCHours() < startHour) {
      // nextTime is already set to today
    }
    // If we're within today's window, use current time
    else {
      nextTime = new Date(fromTime);
    }

    return nextTime;
  }

  /**
   * Calculate optimal reminder times for a lending based on escalation schedule
   * @param {Object} lending - Lending document
   * @param {Object} user - User document
   * @returns {Array} - Array of {tier, scheduledTime} objects
   */
  calculateReminderSchedule(lending, user) {
    const escalationSchedule = user.getEscalationSchedule();
    const gracePeriod = user.getGracePeriodForLoanType(lending.type);
    const expectedReturnDate = new Date(lending.expectedReturnDate);

    // Base time is expected return date + grace period
    const baseTime = new Date(expectedReturnDate);
    baseTime.setDate(baseTime.getDate() + gracePeriod);

    const schedule = [];

    // Calculate each reminder tier
    const tiers = [
      { key: 'first', days: escalationSchedule.firstReminder },
      { key: 'second', days: escalationSchedule.secondReminder },
      { key: 'third', days: escalationSchedule.thirdReminder },
      { key: 'final', days: escalationSchedule.finalReminder }
    ];

    for (const tier of tiers) {
      const reminderTime = new Date(baseTime);
      reminderTime.setDate(reminderTime.getDate() + tier.days);

      // Adjust to user's preferred contact hours
      const scheduledTime = this.getNextAvailableTime(user, reminderTime);

      schedule.push({
        tier: tier.key,
        scheduledTime,
        daysOverdue: tier.days + gracePeriod
      });
    }

    return schedule;
  }

  /**
   * Check if a reminder should be sent now based on schedule and user preferences
   * @param {Object} lending - Lending document
   * @param {Object} user - User document
   * @param {string} tier - Reminder tier to check
   * @returns {boolean} - Whether reminder should be sent
   */
  async shouldSendReminderNow(lending, user, tier) {
    // Check if user has reminders enabled
    if (!user.preferences?.overdueReminders?.enabled) {
      return false;
    }

    // Check if current time is within preferred hours
    if (!this.isWithinPreferredHours(user)) {
      return false;
    }

    // Check if this tier reminder has already been sent
    const existingReminder = await ReminderHistory.findOne({
      user: user._id,
      lending: lending._id,
      tier,
      status: { $in: ['sent', 'delivered'] }
    });

    if (existingReminder) {
      return false;
    }

    // Calculate if it's time for this tier
    const schedule = this.calculateReminderSchedule(lending, user);
    const tierSchedule = schedule.find(s => s.tier === tier);

    if (!tierSchedule) {
      return false;
    }

    const now = new Date();
    const scheduledTime = tierSchedule.scheduledTime;

    // Allow some flexibility (±1 hour) for cron job timing
    const timeDiff = Math.abs(now - scheduledTime);
    const oneHour = 60 * 60 * 1000;

    return timeDiff <= oneHour;
  }

  /**
   * Get pending reminders that should be sent now
   * @returns {Array} - Array of {user, lending, tier} objects
   */
  async getPendingReminders() {
    const now = new Date();
    const pendingReminders = [];

    try {
      // Get all users with overdue reminders enabled
      const users = await User.find({
        'preferences.overdueReminders.enabled': true
      }).select('_id preferences.overdueReminders');

      for (const user of users) {
        // Check if current time is within user's preferred hours
        if (!this.isWithinPreferredHours(user, now)) {
          continue;
        }

        // Get overdue lendings for this user
        const { Lending } = require('../models');
        const overdueLendings = await Lending.find({
          user: user._id,
          status: 'pending',
          expectedReturnDate: { $lt: now }
        });

        for (const lending of overdueLendings) {
          // Calculate which reminder tier should be sent
          const schedule = this.calculateReminderSchedule(lending, user);

          for (const tierSchedule of schedule) {
            if (this.shouldSendReminderNow(lending, user, tierSchedule.tier)) {
              pendingReminders.push({
                user,
                lending,
                tier: tierSchedule.tier,
                scheduledTime: tierSchedule.scheduledTime,
                daysOverdue: tierSchedule.daysOverdue
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error getting pending reminders:', error);
    }

    return pendingReminders;
  }

  /**
   * Schedule a reminder for future delivery
   * @param {Object} user - User document
   * @param {Object} lending - Lending document
   * @param {string} tier - Reminder tier
   * @param {Date} scheduledTime - When to send the reminder
   * @returns {Object} - Scheduled reminder info
   */
  async scheduleReminder(user, lending, tier, scheduledTime) {
    // In a production system, this would integrate with a job queue
    // For now, we'll just log the scheduling

    console.log(`Scheduled ${tier} reminder for user ${user._id}, lending ${lending._id} at ${scheduledTime.toISOString()}`);

    return {
      userId: user._id,
      lendingId: lending._id,
      tier,
      scheduledTime,
      status: 'scheduled'
    };
  }

  /**
   * Get user's reminder schedule summary
   * @param {string} userId - User ID
   * @returns {Object} - Schedule summary
   */
  async getUserScheduleSummary(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const { Lending } = require('../models');
      const overdueLendings = await Lending.find({
        user: userId,
        status: 'pending',
        expectedReturnDate: { $lt: new Date() }
      });

      const summary = {
        userId,
        preferredHours: user.getPreferredContactHours(),
        overdueLendingsCount: overdueLendings.length,
        scheduledReminders: []
      };

      for (const lending of overdueLendings) {
        const schedule = this.calculateReminderSchedule(lending, user);
        summary.scheduledReminders.push({
          lendingId: lending._id,
          borrowerName: lending.borrowerName,
          amount: lending.amount,
          schedule
        });
      }

      return summary;
    } catch (error) {
      console.error('Error getting user schedule summary:', error);
      throw error;
    }
  }

  /**
   * Validate user's preferred contact times
   * @param {Object} contactTimes - Contact times object
   * @returns {boolean} - Is valid
   */
  validateContactTimes(contactTimes) {
    const { startHour, endHour } = contactTimes;

    if (!Number.isInteger(startHour) || !Number.isInteger(endHour)) {
      return false;
    }

    if (startHour < 0 || startHour > 23 || endHour < 0 || endHour > 23) {
      return false;
    }

    return true;
  }

  /**
   * Convert time to user's timezone (placeholder for future implementation)
   * @param {Date} utcTime - UTC time
   * @param {string} timezone - Target timezone
   * @returns {Date} - Converted time
   */
  convertToUserTimezone(utcTime, timezone) {
    // TODO: Implement proper timezone conversion using a library like moment-timezone
    // For now, return UTC time
    return new Date(utcTime);
  }
}

module.exports = new ReminderSchedulerService();