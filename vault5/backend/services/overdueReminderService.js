const { Lending, User, ReminderHistory, Notification } = require('../models');
const emailService = require('./emailService');
const { generateNotification } = require('../controllers/notificationsController');
const gracePeriodService = require('./gracePeriodService');
const reminderSchedulerService = require('./reminderSchedulerService');

/**
 * Overdue Reminder Service
 * Handles daily checks for overdue lendings and sends reminders
 */
class OverdueReminderService {
  /**
   * Process overdue lendings with escalating reminder system
   * This method should be called regularly (e.g., hourly) by a scheduler
   */
  async processOverdueLendings() {
    try {
      console.log('Starting scheduled overdue lending check...');

      // Get all pending reminders that should be sent now
      const pendingReminders = await reminderSchedulerService.getPendingReminders();

      console.log(`Found ${pendingReminders.length} pending reminders to send`);

      const results = {
        processed: 0,
        remindersSent: {
          first: 0,
          second: 0,
          third: 0,
          final: 0,
          collection: 0,
          legal: 0
        },
        errors: []
      };

      // Process each pending reminder
      for (const reminder of pendingReminders) {
        try {
          await this.sendEscalatingReminder(
            reminder.user,
            reminder.lending,
            reminder.tier,
            reminder.daysOverdue
          );

          results.processed++;
          results.remindersSent[reminder.tier]++;
        } catch (error) {
          console.error(`Error sending ${reminder.tier} reminder for lending ${reminder.lending._id}:`, error);
          results.errors.push({
            lendingId: reminder.lending._id,
            tier: reminder.tier,
            error: error.message
          });
        }
      }

      console.log('Scheduled overdue lending check completed:', results);
      return results;
    } catch (error) {
      console.error('Error in processOverdueLendings:', error);
      throw error;
    }
  }

  /**
   * Process escalating reminder for a single overdue lending
   * @param {Object} lending - The lending document with populated user
   * @returns {Object} - Processing result
   */
  async processEscalatingReminder(lending) {
    const user = lending.user;
    const today = new Date();
    const expectedReturnDate = new Date(lending.expectedReturnDate);
    const rawDaysOverdue = Math.floor((today - expectedReturnDate) / (1000 * 60 * 60 * 24));

    // Calculate effective grace period using business rules
    const effectiveGracePeriod = await gracePeriodService.calculateEffectiveGracePeriod(lending, user);
    const effectiveDaysOverdue = Math.max(0, rawDaysOverdue - effectiveGracePeriod);

    // Skip if still within grace period
    if (effectiveDaysOverdue <= 0) {
      console.log(`Lending ${lending._id} still within grace period (${effectiveGracePeriod} days)`);
      return {
        skippedDueToGrace: true,
        reminderSent: false,
        gracePeriod: effectiveGracePeriod,
        rawDaysOverdue
      };
    }

    // Mark lending as overdue if not already
    if (lending.status !== 'overdue') {
      lending.status = 'overdue';
      await lending.save();
    }

    // Determine which reminder tier to send
    const reminderTier = this.determineReminderTier(effectiveDaysOverdue, user);

    // Check if this tier reminder has already been sent
    const existingReminder = await ReminderHistory.findOne({
      user: user._id,
      lending: lending._id,
      tier: reminderTier,
      status: { $in: ['sent', 'delivered'] }
    });

    if (existingReminder) {
      return { skippedDueToGrace: false, reminderSent: false, alreadySent: true };
    }

    // Send the escalating reminder
    try {
      await this.sendEscalatingReminder(user, lending, reminderTier, effectiveDaysOverdue);
      return { skippedDueToGrace: false, reminderSent: true, tier: reminderTier };
    } catch (error) {
      console.error(`Failed to send ${reminderTier} reminder for lending ${lending._id}:`, error);
      throw error;
    }
  }

  /**
   * Determine which reminder tier to send based on days overdue and user preferences
   * @param {number} daysOverdue - Effective days overdue (after grace period)
   * @param {Object} user - User document
   * @returns {string} - Reminder tier
   */
  determineReminderTier(daysOverdue, user) {
    const schedule = user.getEscalationSchedule();

    if (daysOverdue >= schedule.finalReminder) return 'final';
    if (daysOverdue >= schedule.thirdReminder) return 'third';
    if (daysOverdue >= schedule.secondReminder) return 'second';
    if (daysOverdue >= schedule.firstReminder) return 'first';

    return 'first'; // Fallback
  }

  /**
   * Send escalating reminder based on tier
   * @param {Object} user - User document
   * @param {Object} lending - Lending document
   * @param {string} tier - Reminder tier
   * @param {number} daysOverdue - Effective days overdue
   */
  async sendEscalatingReminder(user, lending, tier, daysOverdue) {
    const template = this.getTemplateForTier(tier);
    const enabledChannels = user.getEnabledReminderChannels();

    // Create reminder history record
    const reminderHistory = new ReminderHistory({
      user: user._id,
      lending: lending._id,
      tier,
      daysOverdue,
      template,
      status: 'sent'
    });

    // Send through enabled channels
    const channelResults = [];

    for (const channel of enabledChannels) {
      try {
        const result = await this.sendReminderViaChannel(
          user, lending, tier, daysOverdue, channel, template, reminderHistory
        );
        channelResults.push({ channel, success: true, ...result });
      } catch (error) {
        console.error(`Failed to send ${tier} reminder via ${channel} for lending ${lending._id}:`, error);
        channelResults.push({ channel, success: false, error: error.message });
      }
    }

    // Update reminder history with channel results
    reminderHistory.providerResponse = channelResults;
    await reminderHistory.save();

    // Create in-app notification
    try {
      const notification = await this.createEscalatingNotification(
        user._id, lending, tier, daysOverdue, reminderHistory._id
      );
      reminderHistory.notificationId = notification._id;
      await reminderHistory.save();
    } catch (error) {
      console.error(`Failed to create notification for ${tier} reminder:`, error);
    }

    return reminderHistory;
  }

  /**
   * Send reminder through specific channel
   */
  async sendReminderViaChannel(user, lending, tier, daysOverdue, channel, template, reminderHistory) {
    const content = await this.generateReminderContent(lending, tier, daysOverdue, template, user);

    switch (channel) {
      case 'email':
        return await this.sendEmailReminder(user, content);

      case 'sms':
        return await this.sendSMSReminder(user, content);

      case 'push':
        return await this.sendPushReminder(user, content);

      case 'whatsapp':
        return await this.sendWhatsAppReminder(user, content);

      default:
        throw new Error(`Unsupported channel: ${channel}`);
    }
  }

  /**
   * Get template type based on reminder tier
   */
  getTemplateForTier(tier) {
    const tierTemplates = {
      'first': 'friendly',
      'second': 'firm',
      'third': 'urgent',
      'final': 'legal',
      'collection': 'collection',
      'legal': 'legal'
    };
    return tierTemplates[tier] || 'friendly';
  }

  /**
   * Generate reminder content based on tier and template
   */
  async generateReminderContent(lending, tier, daysOverdue, template, user) {
    const overdueText = daysOverdue === 1 ? '1 day' : `${daysOverdue} days`;
    const expectedDate = lending.expectedReturnDate.toLocaleDateString();

    // Get grace period explanation for transparency
    const gracePeriodExplanation = await gracePeriodService.getGracePeriodExplanation(lending, user, user.getGracePeriodForLoanType(lending.type));

    const templates = {
      friendly: {
        subject: `Friendly Reminder: Lending to ${lending.borrowerName}`,
        message: `
Hello! Just a friendly reminder that your lending of KES ${lending.amount.toLocaleString()} to ${lending.borrowerName} is now ${overdueText} overdue.

Lending Details:
- Borrower: ${lending.borrowerName}
- Contact: ${lending.borrowerContact || 'Not provided'}
- Amount: KES ${lending.amount.toLocaleString()}
- Expected Return: ${expectedDate}
- Grace Period Applied: ${gracePeriodExplanation.effectiveGracePeriod} days

Please reach out to ${lending.borrowerName} when you get a chance. If you've already received payment, please update the status in your Vault5 app.

Thank you for using Vault5!
        `.trim()
      },

      firm: {
        subject: `Important: Overdue Lending to ${lending.borrowerName}`,
        message: `
Your lending of KES ${lending.amount.toLocaleString()} to ${lending.borrowerName} is now ${overdueText} overdue.

This is your second reminder. Please contact ${lending.borrowerName} immediately to arrange repayment.

Lending Details:
- Borrower: ${lending.borrowerName}
- Contact: ${lending.borrowerContact || 'Not provided'}
- Amount: KES ${lending.amount.toLocaleString()}
- Expected Return: ${expectedDate}
- Days Overdue: ${overdueText}

If you've received payment, please update your lending status in Vault5.

Best regards,
Vault5 Team
        `.trim()
      },

      urgent: {
        subject: `URGENT: Overdue Lending Requires Immediate Attention`,
        message: `
URGENT: Your lending of KES ${lending.amount.toLocaleString()} to ${lending.borrowerName} is ${overdueText} overdue.

This is your third and final courtesy reminder. Immediate action is required.

Lending Details:
- Borrower: ${lending.borrowerName}
- Contact: ${lending.borrowerContact || 'Not provided'}
- Amount: KES ${lending.amount.toLocaleString()}
- Expected Return: ${expectedDate}
- Days Overdue: ${overdueText}

Please contact ${lending.borrowerName} today or update the lending status if payment has been received.

Failure to resolve this may result in further action.

Vault5 Team
        `.trim()
      },

      legal: {
        subject: `FINAL NOTICE: Overdue Lending - ${lending.borrowerName}`,
        message: `
FINAL NOTICE

Your lending of KES ${lending.amount.toLocaleString()} to ${lending.borrowerName} remains unpaid and is now ${overdueText} overdue.

This is your final reminder before we consider further collection actions.

Lending Details:
- Borrower: ${lending.borrowerName}
- Contact: ${lending.borrowerContact || 'Not provided'}
- Amount: KES ${lending.amount.toLocaleString()}
- Expected Return Date: ${expectedDate}
- Days Overdue: ${overdueText}

Please resolve this matter immediately by contacting ${lending.borrowerName} or updating the payment status in your Vault5 account.

If this matter is not resolved within 7 days, we may need to escalate this to our collections department.

Vault5 Legal Team
        `.trim()
      }
    };

    return templates[template] || templates.friendly;
  }

  /**
   * Send email reminder
   */
  async sendEmailReminder(user, content) {
    return await emailService.sendNotificationEmail(
      user.email,
      content.subject,
      content.message,
      user.name || user.firstName || 'User'
    );
  }

  /**
   * Send SMS reminder (placeholder - would integrate with SMS service)
   */
  async sendSMSReminder(user, content) {
    // TODO: Integrate with SMS service (e.g., Africa's Talking, Twilio)
    console.log(`SMS Reminder to ${user.phone}: ${content.subject}`);
    return { messageId: `sms-${Date.now()}`, cost: 0.5 };
  }

  /**
   * Send push notification reminder
   */
  async sendPushReminder(user, content) {
    // TODO: Integrate with push notification service (e.g., Firebase, OneSignal)
    console.log(`Push Reminder to user ${user._id}: ${content.subject}`);
    return { messageId: `push-${Date.now()}` };
  }

  /**
   * Send WhatsApp reminder (placeholder - would integrate with WhatsApp Business API)
   */
  async sendWhatsAppReminder(user, content) {
    // TODO: Integrate with WhatsApp Business API
    console.log(`WhatsApp Reminder to ${user.phone}: ${content.subject}`);
    return { messageId: `wa-${Date.now()}`, cost: 0.8 };
  }

  /**
   * Legacy method for backward compatibility - use generateReminderContent instead
   * @deprecated Use generateReminderContent with tier-based templates
   */
  async generateOverdueEmailMessage(lending, daysOverdue, user = null) {
    const content = await this.generateReminderContent(lending, 'first', daysOverdue, 'friendly', user || { getGracePeriodForLoanType: () => 3 });
    return content.message;
  }

  /**
   * Create escalating in-app notification for overdue lending
   * @param {string} userId - User ID
   * @param {Object} lending - Lending document
   * @param {string} tier - Reminder tier
   * @param {number} daysOverdue - Number of days overdue
   * @param {string} reminderHistoryId - Reminder history ID
   */
  async createEscalatingNotification(userId, lending, tier, daysOverdue, reminderHistoryId) {
    const overdueText = daysOverdue === 1 ? 'day' : 'days';
    const tierTitles = {
      'first': 'Lending Reminder',
      'second': 'Overdue Lending Notice',
      'third': 'Urgent: Overdue Lending',
      'final': 'Final Notice: Overdue Lending',
      'collection': 'Collections: Overdue Lending',
      'legal': 'Legal Notice: Overdue Lending'
    };

    const tierMessages = {
      'first': `Your lending of KES ${lending.amount.toLocaleString()} to ${lending.borrowerName} is ${daysOverdue} ${overdueText} overdue. Please follow up with the borrower.`,
      'second': `Important: Your lending to ${lending.borrowerName} (KES ${lending.amount.toLocaleString()}) is ${daysOverdue} ${overdueText} overdue. Contact required.`,
      'third': `URGENT: Lending to ${lending.borrowerName} is ${daysOverdue} ${overdueText} overdue. Immediate action needed.`,
      'final': `FINAL NOTICE: Your lending to ${lending.borrowerName} remains unpaid after ${daysOverdue} days. Further action may be taken.`,
      'collection': `COLLECTIONS: Your overdue lending to ${lending.borrowerName} has been escalated to collections.`,
      'legal': `LEGAL NOTICE: Formal proceedings may begin for your overdue lending to ${lending.borrowerName}.`
    };

    const severityLevels = {
      'first': 'medium',
      'second': 'medium',
      'third': 'high',
      'final': 'high',
      'collection': 'high',
      'legal': 'high'
    };

    const notificationType = `lending_overdue_${tier}`;

    const notification = await generateNotification(
      userId,
      notificationType,
      tierTitles[tier] || 'Lending Reminder',
      tierMessages[tier] || `Your lending to ${lending.borrowerName} is overdue.`,
      lending._id,
      severityLevels[tier] || 'medium',
      {
        lendingId: lending._id,
        borrowerName: lending.borrowerName,
        borrowerContact: lending.borrowerContact,
        amount: lending.amount,
        daysOverdue: daysOverdue,
        expectedReturnDate: lending.expectedReturnDate,
        reminderTier: tier,
        reminderHistoryId: reminderHistoryId,
        escalationLevel: this.getEscalationLevel(tier)
      }
    );

    return notification;
  }

  /**
   * Get escalation level number from tier
   */
  getEscalationLevel(tier) {
    const levels = {
      'first': 1,
      'second': 2,
      'third': 3,
      'final': 4,
      'collection': 5,
      'legal': 6
    };
    return levels[tier] || 1;
  }

  /**
   * Get overdue lendings summary for a user
   * @param {string} userId - User ID
   * @returns {Object} - Summary of overdue lendings
   */
  async getOverdueSummary(userId) {
    try {
      const overdueLendings = await Lending.find({
        user: userId,
        status: 'overdue'
      });

      const totalAmount = overdueLendings.reduce((sum, lending) => sum + lending.amount, 0);
      const totalCount = overdueLendings.length;

      return {
        totalCount,
        totalAmount,
        lendings: overdueLendings.map(lending => ({
          id: lending._id,
          borrowerName: lending.borrowerName,
          borrowerContact: lending.borrowerContact,
          amount: lending.amount,
          expectedReturnDate: lending.expectedReturnDate,
          daysOverdue: Math.floor((new Date() - lending.expectedReturnDate) / (1000 * 60 * 60 * 24))
        }))
      };
    } catch (error) {
      console.error('Error getting overdue summary:', error);
      throw error;
    }
  }

  /**
   * Manual trigger for testing - process overdue lendings for a specific user
   * @param {string} userId - User ID
   * @returns {Object} - Results
   */
  async processUserOverdueLendings(userId) {
    try {
      console.log(`Processing escalating overdue lendings for user ${userId}...`);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overdueLendings = await Lending.find({
        user: userId,
        status: 'pending',
        expectedReturnDate: { $lt: today }
      }).populate('user');

      console.log(`Found ${overdueLendings.length} potentially overdue lendings for user ${userId}`);

      const results = {
        processed: 0,
        gracePeriodSkipped: 0,
        remindersSent: {
          first: 0,
          second: 0,
          third: 0,
          final: 0,
          collection: 0,
          legal: 0
        },
        errors: []
      };

      for (const lending of overdueLendings) {
        try {
          const processingResult = await this.processEscalatingReminder(lending);
          results.processed++;

          if (processingResult.skippedDueToGrace) {
            results.gracePeriodSkipped++;
          } else if (processingResult.reminderSent) {
            results.remindersSent[processingResult.tier]++;
          }
        } catch (error) {
          console.error(`Error processing lending ${lending._id}:`, error);
          results.errors.push({
            lendingId: lending._id,
            error: error.message
          });
        }
      }

      console.log(`Completed processing overdue lendings for user ${userId}:`, results);
      return results;
    } catch (error) {
      console.error('Error in processUserOverdueLendings:', error);
      throw error;
    }
  }
}

module.exports = new OverdueReminderService();