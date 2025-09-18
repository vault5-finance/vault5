const { eventBusClient } = require('./httpClient');
const { logger } = require('../server');
const { v4: uuidv4 } = require('uuid');

class EventPublisher {
  constructor() {
    this.eventBusUrl = process.env.EVENT_BUS_URI || 'http://localhost:4000';
  }

  // Publish an event to the event bus
  async publish(eventType, eventData, correlationId = null) {
    try {
      const event = {
        id: uuidv4(),
        type: eventType,
        source: 'transaction-service',
        timestamp: new Date().toISOString(),
        correlationId: correlationId || uuidv4(),
        data: eventData
      };

      logger.info(`Publishing event: ${eventType}`, { eventId: event.id, correlationId: event.correlationId });

      await eventBusClient.post('/events', event);

      return event.id;
    } catch (error) {
      logger.error(`Failed to publish event ${eventType}:`, error);
      // Don't throw error - event publishing should not break the main flow
      return null;
    }
  }

  // Transaction events
  async transactionCreated(transaction, correlationId = null) {
    return this.publish('transaction.created', {
      transactionId: transaction.id,
      userId: transaction.userId,
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description,
      date: transaction.date
    }, correlationId);
  }

  async transactionUpdated(transaction, correlationId = null) {
    return this.publish('transaction.updated', {
      transactionId: transaction.id,
      userId: transaction.userId,
      amount: transaction.amount,
      type: transaction.type,
      changes: transaction // Include full updated transaction
    }, correlationId);
  }

  async transactionDeleted(transactionId, userId, correlationId = null) {
    return this.publish('transaction.deleted', {
      transactionId,
      userId
    }, correlationId);
  }

  // Allocation events
  async incomeAllocated(transactionId, userId, allocations, correlationId = null) {
    return this.publish('income.allocated', {
      transactionId,
      userId,
      allocations: allocations.map(alloc => ({
        accountId: alloc.accountId,
        accountType: alloc.accountType,
        amount: alloc.amount,
        status: alloc.status
      }))
    }, correlationId);
  }

  // Fraud detection events
  async fraudDetected(transactionId, userId, riskScore, flags, correlationId = null) {
    return this.publish('fraud.detected', {
      transactionId,
      userId,
      riskScore,
      flags,
      timestamp: new Date().toISOString()
    }, correlationId);
  }

  async highRiskTransaction(transactionId, userId, riskScore, correlationId = null) {
    return this.publish('transaction.high_risk', {
      transactionId,
      userId,
      riskScore,
      requiresReview: true
    }, correlationId);
  }

  // Account balance events
  async accountBalanceUpdated(accountId, userId, amount, operation, correlationId = null) {
    return this.publish('account.balance_updated', {
      accountId,
      userId,
      amount,
      operation, // 'add' or 'subtract'
      timestamp: new Date().toISOString()
    }, correlationId);
  }

  // Category events
  async categoryCreated(category, correlationId = null) {
    return this.publish('category.created', {
      categoryId: category.id,
      userId: category.userId,
      name: category.name,
      type: category.type
    }, correlationId);
  }

  async categoryUpdated(category, correlationId = null) {
    return this.publish('category.updated', {
      categoryId: category.id,
      userId: category.userId,
      name: category.name,
      type: category.type
    }, correlationId);
  }

  // Service health events
  async serviceHealthCheck(status, details = {}, correlationId = null) {
    return this.publish('service.health_check', {
      service: 'transaction-service',
      status, // 'healthy' or 'unhealthy'
      timestamp: new Date().toISOString(),
      details
    }, correlationId);
  }

  // Bulk events for efficiency
  async publishBulk(events, correlationId = null) {
    try {
      const bulkEvent = {
        id: uuidv4(),
        type: 'events.bulk',
        source: 'transaction-service',
        timestamp: new Date().toISOString(),
        correlationId: correlationId || uuidv4(),
        data: {
          events: events.map(event => ({
            id: uuidv4(),
            type: event.type,
            data: event.data,
            timestamp: new Date().toISOString()
          }))
        }
      };

      logger.info(`Publishing bulk events: ${events.length} events`, { correlationId: bulkEvent.correlationId });

      await eventBusClient.post('/events/bulk', bulkEvent);

      return bulkEvent.id;
    } catch (error) {
      logger.error('Failed to publish bulk events:', error);
      return null;
    }
  }
}

// Create singleton instance
const eventPublisher = new EventPublisher();

module.exports = eventPublisher;