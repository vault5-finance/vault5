const { eventBus } = require('./httpClient');
const { logger } = require('../server');
const { v4: uuidv4 } = require('uuid');

class EventPublisher {
  async publish(eventType, payload, correlationId = null) {
    try {
      const event = {
        id: uuidv4(),
        type: eventType,
        timestamp: new Date().toISOString(),
        source: 'user-service',
        correlationId: correlationId || uuidv4(),
        payload
      };

      logger.info(`Publishing event: ${eventType}`, { eventId: event.id, correlationId: event.correlationId });

      await eventBus.post('/events', event);

      return event.id;
    } catch (error) {
      logger.error(`Failed to publish event ${eventType}:`, error);
      // Don't throw error to avoid breaking the main flow
      // In production, you might want to implement retry logic or dead letter queue
    }
  }

  // User-related events
  async userRegistered(user) {
    return this.publish('user.registered', {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      registrationStep: user.registration_step
    });
  }

  async userLoggedIn(userId, userAgent, ipAddress) {
    return this.publish('user.logged_in', {
      userId,
      userAgent,
      ipAddress,
      timestamp: new Date().toISOString()
    });
  }

  async userProfileUpdated(userId, changes) {
    return this.publish('user.profile_updated', {
      userId,
      changes,
      timestamp: new Date().toISOString()
    });
  }

  async userPasswordChanged(userId) {
    return this.publish('user.password_changed', {
      userId,
      timestamp: new Date().toISOString()
    });
  }

  async userAccountCreated(userId, account) {
    return this.publish('user.account_created', {
      userId,
      accountId: account.id,
      accountType: account.type,
      percentage: account.percentage
    });
  }

  async userAccountUpdated(userId, accountId, changes) {
    return this.publish('user.account_updated', {
      userId,
      accountId,
      changes,
      timestamp: new Date().toISOString()
    });
  }

  async userSettingsUpdated(userId, settings) {
    return this.publish('user.settings_updated', {
      userId,
      settings,
      timestamp: new Date().toISOString()
    });
  }

  async userDeactivated(userId, reason) {
    return this.publish('user.deactivated', {
      userId,
      reason,
      timestamp: new Date().toISOString()
    });
  }

  async userReactivated(userId) {
    return this.publish('user.reactivated', {
      userId,
      timestamp: new Date().toISOString()
    });
  }

  // Authentication events
  async passwordResetRequested(userId, email) {
    return this.publish('auth.password_reset_requested', {
      userId,
      email,
      timestamp: new Date().toISOString()
    });
  }

  async passwordResetCompleted(userId) {
    return this.publish('auth.password_reset_completed', {
      userId,
      timestamp: new Date().toISOString()
    });
  }

  async tokenRefreshed(userId) {
    return this.publish('auth.token_refreshed', {
      userId,
      timestamp: new Date().toISOString()
    });
  }

  async suspiciousActivityDetected(userId, activity, details) {
    return this.publish('security.suspicious_activity', {
      userId,
      activity,
      details,
      timestamp: new Date().toISOString()
    });
  }

  // Batch publish multiple events
  async publishBatch(events) {
    const results = [];
    for (const event of events) {
      const result = await this.publish(event.type, event.payload, event.correlationId);
      results.push(result);
    }
    return results;
  }
}

const eventPublisher = new EventPublisher();

module.exports = {
  EventPublisher,
  eventPublisher
};