const axios = require('axios');
const { logger } = require('../server');

// Create axios instance with default config
const httpClient = axios.create({
  timeout: 5000, // 5 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'User-Service/1.0'
  }
});

// Request interceptor for logging
httpClient.interceptors.request.use(
  (config) => {
    logger.info(`Outgoing HTTP request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    logger.error('HTTP request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
httpClient.interceptors.response.use(
  (response) => {
    logger.info(`HTTP response: ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    logger.error(`HTTP response error: ${error.response?.status} from ${error.config?.url}`, error.message);
    return Promise.reject(error);
  }
);

class ServiceClient {
  constructor(baseURL, serviceName) {
    this.baseURL = baseURL;
    this.serviceName = serviceName;
    this.client = axios.create({
      baseURL,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `User-Service/1.0`
      }
    });

    // Add interceptors
    this.client.interceptors.request.use(
      (config) => {
        logger.info(`${serviceName} request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error(`${serviceName} request error:`, error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.info(`${serviceName} response: ${response.status}`);
        return response;
      },
      (error) => {
        logger.error(`${serviceName} response error: ${error.response?.status}`, error.message);
        return Promise.reject(error);
      }
    );
  }

  async get(endpoint, config = {}) {
    try {
      const response = await this.client.get(endpoint, config);
      return response.data;
    } catch (error) {
      throw new Error(`${this.serviceName} GET ${endpoint} failed: ${error.message}`);
    }
  }

  async post(endpoint, data = {}, config = {}) {
    try {
      const response = await this.client.post(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw new Error(`${this.serviceName} POST ${endpoint} failed: ${error.message}`);
    }
  }

  async put(endpoint, data = {}, config = {}) {
    try {
      const response = await this.client.put(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw new Error(`${this.serviceName} PUT ${endpoint} failed: ${error.message}`);
    }
  }

  async delete(endpoint, config = {}) {
    try {
      const response = await this.client.delete(endpoint, config);
      return response.data;
    } catch (error) {
      throw new Error(`${this.serviceName} DELETE ${endpoint} failed: ${error.message}`);
    }
  }
}

// Specific service clients
const notificationService = new ServiceClient(
  process.env.NOTIFICATION_SERVICE_URI || 'http://localhost:3002',
  'NotificationService'
);

const transactionService = new ServiceClient(
  process.env.TRANSACTION_SERVICE_URI || 'http://localhost:3003',
  'TransactionService'
);

const eventBus = new ServiceClient(
  process.env.EVENT_BUS_URI || 'http://localhost:4000',
  'EventBus'
);

module.exports = {
  httpClient,
  ServiceClient,
  notificationService,
  transactionService,
  eventBus
};