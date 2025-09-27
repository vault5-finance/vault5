const { Lending, User } = require('../models');
const emailService = require('./emailService');
const { generateNotification } = require('../controllers/notificationsController');

/**
 * Overdue Reminder Service
 * Handles daily checks for overdue lendings and sends reminders
 */
class OverdueReminderService {
  /**
   * Process overdue lendings - mark as overdue and send reminders
   * This method should be called daily by a cron job or scheduler
   */
  async processOverdueLendings() {
    try {
      console.log('Starting overdue lending check...');

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today

      // Find all pending lendings that are past their expected return date
      const overdueLendings = await Lending.find({
        status: 'pending',
        expectedReturnDate: { $lt: today }
      }).populate('user');

      console.log(`Found ${overdueLendings.length} overdue lendings`);

      const results = {
        processed: 0,
        emailsSent: 0,
        notificationsCreated: 0,
        errors: []
      };

      // Process each overdue lending
      for (const lending of overdueLendings) {
        try {
          await this.processSingleOverdueLending(lending, results);
          results.processed++;
        } catch (error) {
          console.error(`Error processing lending ${lending._id}:`, error);
          results.errors.push({
            lendingId: lending._id,
            error: error.message
          });
        }
      }

      console.log('Overdue lending check completed:', results);
      return results;
    } catch (error) {
      console.error('Error in processOverdueLendings:', error);
      throw error;
    }
  }

  /**
   * Process a single overdue lending
   * @param {Object} lending - The lending document
   * @param {Object} results - Results accumulator
   */
  async processSingleOverdueLending(lending, results) {
    // Mark lending as overdue
    lending.status = 'overdue';
    await lending.save();

    const user = lending.user;
    const daysOverdue = Math.floor((new Date() - lending.expectedReturnDate) / (1000 * 60 * 60 * 24));

    // Send email reminder
    try {
      await this.sendOverdueEmailReminder(user, lending, daysOverdue);
      results.emailsSent++;
    } catch (error) {
      console.error(`Failed to send email for lending ${lending._id}:`, error);
    }

    // Create in-app notification
    try {
      await this.createOverdueNotification(user._id, lending, daysOverdue);
      results.notificationsCreated++;
    } catch (error) {
      console.error(`Failed to create notification for lending ${lending._id}:`, error);
    }
  }

  /**
   * Send overdue email reminder
   * @param {Object} user - User document
   * @param {Object} lending - Lending document
   * @param {number} daysOverdue - Number of days overdue
   */
  async sendOverdueEmailReminder(user, lending, daysOverdue) {
    const subject = `Overdue Lending Reminder: ${lending.borrowerName}`;
    const message = this.generateOverdueEmailMessage(lending, daysOverdue);

    await emailService.sendNotificationEmail(
      user.email,
      subject,
      message,
      user.username || user.firstName || 'User'
    );
  }

  /**
   * Generate overdue email message
   * @param {Object} lending - Lending document
   * @param {number} daysOverdue - Number of days overdue
   * @returns {string} - Email message
   */
  generateOverdueEmailMessage(lending, daysOverdue) {
    const overdueText = daysOverdue === 1 ? '1 day' : `${daysOverdue} days`;
    const expectedDate = lending.expectedReturnDate.toLocaleDateString();

    return `
Your lending of KES ${lending.amount.toLocaleString()} to ${lending.borrowerName} is now ${overdueText} overdue.

Lending Details:
- Borrower: ${lending.borrowerName}
- Contact: ${lending.borrowerContact || 'Not provided'}
- Amount: KES ${lending.amount.toLocaleString()}
- Expected Return Date: ${expectedDate}
- Days Overdue: ${overdueText}

Please contact ${lending.borrowerName} to follow up on this lending. If you've already received payment, please update the lending status in your Vault5 app.

Thank you for using Vault5!
    `.trim();
  }

  /**
   * Create in-app notification for overdue lending
   * @param {string} userId - User ID
   * @param {Object} lending - Lending document
   * @param {number} daysOverdue - Number of days overdue
   */
  async createOverdueNotification(userId, lending, daysOverdue) {
    const overdueText = daysOverdue === 1 ? 'day' : 'days';
    const title = 'Lending Overdue';
    const message = `Your lending of KES ${lending.amount.toLocaleString()} to ${lending.borrowerName} is ${daysOverdue} ${overdueText} overdue. Please follow up with the borrower.`;

    await generateNotification(
      userId,
      'lending_overdue',
      title,
      message,
      lending._id,
      'high', // High severity for overdue items
      {
        lendingId: lending._id,
        borrowerName: lending.borrowerName,
        amount: lending.amount,
        daysOverdue: daysOverdue,
        expectedReturnDate: lending.expectedReturnDate
      }
    );
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
      console.log(`Processing overdue lendings for user ${userId}...`);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overdueLendings = await Lending.find({
        user: userId,
        status: 'pending',
        expectedReturnDate: { $lt: today }
      }).populate('user');

      const results = {
        processed: 0,
        emailsSent: 0,
        notificationsCreated: 0,
        errors: []
      };

      for (const lending of overdueLendings) {
        try {
          await this.processSingleOverdueLending(lending, results);
          results.processed++;
        } catch (error) {
          console.error(`Error processing lending ${lending._id}:`, error);
          results.errors.push({
            lendingId: lending._id,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error in processUserOverdueLendings:', error);
      throw error;
    }
  }
}

module.exports = new OverdueReminderService();