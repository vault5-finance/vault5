const axios = require('axios');
const { logger } = require('../server');

class HttpClient {
  constructor(baseURL, serviceName) {
    this.client = axios.create({
      baseURL,
      timeout: 10000, // 10 seconds
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Name': 'transaction-service'
      }
    });

    this.serviceName = serviceName;

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.info(`HTTP Request to ${serviceName}: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error(`HTTP Request error to ${serviceName}:`, error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.info(`HTTP Response from ${serviceName}: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
        return response;
      },
      (error) => {
        logger.error(`HTTP Response error from ${serviceName}:`, {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
          method: error.config?.method?.toUpperCase()
        });
        return Promise.reject(error);
      }
    );
  }

  // Set authorization token for requests
  setAuthToken(token) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Remove authorization token
  removeAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }

  // Generic GET request
  async get(url, config = {}) {
    try {
      const response = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to GET ${url} from ${this.serviceName}: ${error.message}`);
    }
  }

  // Generic POST request
  async post(url, data = {}, config = {}) {
    try {
      const response = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to POST ${url} to ${this.serviceName}: ${error.message}`);
    }
  }

  // Generic PUT request
  async put(url, data = {}, config = {}) {
    try {
      const response = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to PUT ${url} to ${this.serviceName}: ${error.message}`);
    }
  }

  // Generic DELETE request
  async delete(url, config = {}) {
    try {
      const response = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to DELETE ${url} from ${this.serviceName}: ${error.message}`);
    }
  }
}

// Create instances for different services
const userServiceClient = new HttpClient(
  process.env.USER_SERVICE_URI || 'http://localhost:3001',
  'user-service'
);

const eventBusClient = new HttpClient(
  process.env.EVENT_BUS_URI || 'http://localhost:4000',
  'event-bus'
);

// Set service-to-service authentication token if available
if (process.env.SERVICE_TOKEN) {
  userServiceClient.setAuthToken(process.env.SERVICE_TOKEN);
  eventBusClient.setAuthToken(process.env.SERVICE_TOKEN);
}

module.exports = {
  HttpClient,
  userServiceClient,
  eventBusClient
};