const { Lending, User, ReminderHistory } = require('../models');
const gracePeriodService = require('./gracePeriodService');

/**
 * Reminder Scheduler Service
 * Manages the scheduling and queuing of overdue reminders
 */
class ReminderSchedulerService {
  /**
   * Default escalation schedule (days overdue)
   */
  get DEFAULT_ESCALATION_SCHEDULE() {
    return {
      firstReminder: 1,    // 1 day overdue
      secondReminder: 7,   // 7 days overdue
      thirdReminder: 14,   // 14 days overdue
      finalReminder: 30,   // 30 days overdue
      collectionNotice: 45, // 45 days overdue
      legalNotice: 60      // 60 days overdue
    };
  }

  /**
   * Get all pending reminders that should be sent now
   * @returns {Array} - Array of pending reminder objects
   */
  async getPendingReminders() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find all pending lendings that might be overdue
      const pendingLendings = await Lending.find({
        status: { $in: ['pending', 'overdue'] },
        expectedReturnDate: { $exists: true }
      }).populate('user');

      const pendingReminders = [];

      for (const lending of pendingLendings) {
        const reminder = await this.checkLendingForReminder(lending, today);
        if (reminder) {
          pendingReminders.push(reminder);
        }
      }

      console.log(`Found ${pendingReminders.length} pending reminders across ${pendingLendings.length} lendings`);
      return pendingReminders;

    } catch (error) {
      console.error('Error getting pending reminders:', error);
      throw error;
    }
  }

  /**
   * Check if a lending needs a reminder sent now
   * @param {Object} lending - Lending document with populated user
   * @param {Date} today - Today's date (start of day)
   * @returns {Object|null} - Reminder object or null
   */
  async checkLendingForReminder(lending, today) {
    try {
      const user = lending.user;
      if (!user) return null;

      // Calculate effective grace period
      const effectiveGracePeriod = await gracePeriodService.calculateEffectiveGracePeriod(lending, user);
      const expectedReturnDate = new Date(lending.expectedReturnDate);
      const rawDaysOverdue = Math.floor((today - expectedReturnDate) / (1000 * 60 * 60 * 24));
      const effectiveDaysOverdue = Math.max(0, rawDaysOverdue - effectiveGracePeriod);

      // Skip if still within grace period
      if (effectiveDaysOverdue <= 0) {
        return null;
      }

      // Get user's escalation schedule
      const schedule = user.getEscalationSchedule() || this.DEFAULT_ESCALATION_SCHEDULE;

      // Determine which reminder tier should be sent
      const reminderTier = this.determineReminderTier(effectiveDaysOverdue, schedule);
      if (!reminderTier) return null;

      // Check if this tier reminder has already been sent
      const existingReminder = await ReminderHistory.findOne({
        user: user._id,
        lending: lending._id,
        tier: reminderTier,
        status: { $in: ['sent', 'delivered'] }
      });

      if (existingReminder) {
        return null; // Already sent this tier
      }

      // Check if a higher tier reminder has been sent (don't send lower tiers if higher ones exist)
      const higherTiers = this.getHigherTiers(reminderTier);
      const higherTierSent = await ReminderHistory.findOne({
        user: user._id,
        lending: lending._id,
        tier: { $in: higherTiers },
        status: { $in: ['sent', 'delivered'] }
      });

      if (higherTierSent) {
        return null; // Don't send lower tier if higher tier already sent
      }

      return {
        user,
        lending,
        tier: reminderTier,
        daysOverdue: effectiveDaysOverdue,
        gracePeriod: effectiveGracePeriod,
        rawDaysOverdue
      };

    } catch (error) {
      console.error(`Error checking lending ${lending._id} for reminder:`, error);
      return null;
    }
  }

  /**
   * Determine which reminder tier to send based on days overdue
   * @param {number} daysOverdue - Effective days overdue
   * @param {Object} schedule - Escalation schedule
   * @returns {string|null} - Reminder tier or null
   */
  determineReminderTier(daysOverdue, schedule) {
    if (daysOverdue >= schedule.legalNotice) return 'legal';
    if (daysOverdue >= schedule.collectionNotice) return 'collection';
    if (daysOverdue >= schedule.finalReminder) return 'final';
    if (daysOverdue >= schedule.thirdReminder) return 'third';
    if (daysOverdue >= schedule.secondReminder) return 'second';
    if (daysOverdue >= schedule.firstReminder) return 'first';

    return null;
  }

  /**
   * Get higher tier reminders for a given tier
   * @param {string} tier - Current tier
   * @returns {Array} - Array of higher tier names
   */
  getHigherTiers(tier) {
    const tierOrder = ['first', 'second', 'third', 'final', 'collection', 'legal'];
    const currentIndex = tierOrder.indexOf(tier);

    if (currentIndex === -1) return [];

    return tierOrder.slice(currentIndex + 1);
  }

  /**
   * Schedule a reminder for future sending
   * @param {Object} reminderData - Reminder scheduling data
   * @returns {Object} - Scheduled reminder info
   */
  async scheduleReminder(reminderData) {
    try {
      const {
        userId,
        lendingId,
        tier,
        scheduledFor,
        priority = 'normal'
      } = reminderData;

      // Create a scheduled reminder record
      const scheduledReminder = new ReminderHistory({
        user: userId,
        lending: lendingId,
        tier,
        status: 'scheduled',
        scheduledFor: scheduledFor || new Date(),
        priority,
        metadata: {
          scheduledAt: new Date(),
          ...reminderData.metadata
        }
      });

      await scheduledReminder.save();

      console.log(`Scheduled ${tier} reminder for lending ${lendingId} at ${scheduledFor}`);
      return scheduledReminder;

    } catch (error) {
      console.error('Error scheduling reminder:', error);
      throw error;
    }
  }

  /**
   * Get escalation schedule for a user
   * @param {string} userId - User ID
   * @returns {Object} - User's escalation schedule
   */
  async getUserEscalationSchedule(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return this.DEFAULT_ESCALATION_SCHEDULE;
      }

      return user.getEscalationSchedule() || this.DEFAULT_ESCALATION_SCHEDULE;
    } catch (error) {
      console.error('Error getting user escalation schedule:', error);
      return this.DEFAULT_ESCALATION_SCHEDULE;
    }
  }

  /**
   * Update user's escalation schedule
   * @param {string} userId - User ID
   * @param {Object} schedule - New escalation schedule
   * @returns {Object} - Updated schedule
   */
  async updateUserEscalationSchedule(userId, schedule) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Validate schedule
      const validation = this.validateEscalationSchedule(schedule);
      if (!validation.isValid) {
        throw new Error(`Invalid schedule: ${validation.errors.join(', ')}`);
      }

      // Initialize preferences if not exists
      if (!user.preferences) {
        user.preferences = {};
      }

      user.preferences.escalationSchedule = schedule;
      await user.save();

      return schedule;
    } catch (error) {
      console.error('Error updating escalation schedule:', error);
      throw error;
    }
  }

  /**
   * Validate escalation schedule
   * @param {Object} schedule - Schedule to validate
   * @returns {Object} - Validation result
   */
  validateEscalationSchedule(schedule) {
    const errors = [];
    const requiredFields = ['firstReminder', 'secondReminder', 'thirdReminder', 'finalReminder'];

    // Check required fields
    for (const field of requiredFields) {
      if (typeof schedule[field] !== 'number' || schedule[field] < 1 || schedule[field] > 365) {
        errors.push(`${field} must be a number between 1 and 365`);
      }
    }

    // Check logical order
    if (schedule.firstReminder >= schedule.secondReminder) {
      errors.push('firstReminder must be less than secondReminder');
    }
    if (schedule.secondReminder >= schedule.thirdReminder) {
      errors.push('secondReminder must be less than thirdReminder');
    }
    if (schedule.thirdReminder >= schedule.finalReminder) {
      errors.push('thirdReminder must be less than finalReminder');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get reminder statistics for a user
   * @param {string} userId - User ID
   * @param {Object} dateRange - Date range filter
   * @returns {Object} - Reminder statistics
   */
  async getReminderStatistics(userId, dateRange = {}) {
    try {
      const matchConditions = { user: userId };

      // Add date range filter
      if (dateRange.start || dateRange.end) {
        matchConditions.sentAt = {};
        if (dateRange.start) matchConditions.sentAt.$gte = new Date(dateRange.start);
        if (dateRange.end) matchConditions.sentAt.$lte = new Date(dateRange.end);
      }

      const stats = await ReminderHistory.aggregate([
        { $match: matchConditions },
        {
          $group: {
            _id: {
              tier: '$tier',
              status: '$status'
            },
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        },
        {
          $group: {
            _id: '$_id.tier',
            statuses: {
              $push: {
                status: '$_id.status',
                count: '$count',
                totalAmount: '$totalAmount'
              }
            },
            totalCount: { $sum: '$count' },
            totalAmount: { $sum: '$totalAmount' }
          }
        }
      ]);

      // Format the results
      const formattedStats = {};
      stats.forEach(stat => {
        formattedStats[stat._id] = {
          totalCount: stat.totalCount,
          totalAmount: stat.totalAmount,
          statuses: stat.statuses.reduce((acc, status) => {
            acc[status.status] = {
              count: status.count,
              totalAmount: status.totalAmount
            };
            return acc;
          }, {})
        };
      });

      return formattedStats;
    } catch (error) {
      console.error('Error getting reminder statistics:', error);
      throw error;
    }
  }

  /**
   * Cancel scheduled reminders for a lending
   * @param {string} lendingId - Lending ID
   * @param {Array} tiers - Optional array of tiers to cancel
   * @returns {number} - Number of cancelled reminders
   */
  async cancelScheduledReminders(lendingId, tiers = null) {
    try {
      const conditions = {
        lending: lendingId,
        status: 'scheduled'
      };

      if (tiers) {
        conditions.tier = { $in: tiers };
      }

      const result = await ReminderHistory.updateMany(
        conditions,
        {
          status: 'cancelled',
          cancelledAt: new Date()
        }
      );

      console.log(`Cancelled ${result.modifiedCount} scheduled reminders for lending ${lendingId}`);
      return result.modifiedCount;
    } catch (error) {
      console.error('Error cancelling scheduled reminders:', error);
      throw error;
    }
  }
}

module.exports = new ReminderSchedulerService();