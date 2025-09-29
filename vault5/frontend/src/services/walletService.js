import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class WalletService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Get user's wallet
  async getWallet() {
    try {
      const response = await this.api.get('/wallet');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Create wallet for user
  async createWallet() {
    try {
      const response = await this.api.post('/wallet');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Recharge wallet
  async rechargeWallet(rechargeData) {
    try {
      const response = await this.api.post('/wallet/recharge', rechargeData);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Transfer from wallet to account
  async transferToAccount(transferData) {
    try {
      const response = await this.api.post('/wallet/transfer', transferData);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Transfer money to another Vault user (goes to their main wallet first)
  async transferToVaultUser(transferData) {
    try {
      const response = await this.api.post('/transactions/transfer', {
        ...transferData,
        transferToWallet: true // Explicit flag to ensure wallet-first for Vault users
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Get wallet transaction history
  async getWalletHistory(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await this.api.get(`/wallet/history?${queryString}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Add payment method
  async addPaymentMethod(paymentMethodData) {
    try {
      const response = await this.api.post('/wallet/payment-method', paymentMethodData);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Set wallet PIN
  async setWalletPin(pinData) {
    try {
      const response = await this.api.post('/wallet/pin', pinData);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Get wallet statistics
  async getWalletStats() {
    try {
      const response = await this.api.get('/wallet/stats');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Get wallet limits
  async getWalletLimits() {
    try {
      const response = await this.api.get('/wallet/limits');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Verify payment method
  async verifyPaymentMethod(verificationData) {
    try {
      const response = await this.api.post('/wallet/verify-payment-method', verificationData);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Remove payment method
  async removePaymentMethod(methodId) {
    try {
      const response = await this.api.delete(`/wallet/payment-method/${methodId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Get wallet overview with analytics
  async getWalletOverview(timeRange = '30d') {
    try {
      const response = await this.api.get(`/wallet/overview?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Get wallet health score
  async getWalletHealthScore() {
    try {
      const response = await this.api.get('/wallet/health-score');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Get monthly wallet report
  async getMonthlyReport(year, month) {
    try {
      const response = await this.api.get(`/wallet/reports/monthly?year=${year}&month=${month}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Get wallet insights
  async getWalletInsights() {
    try {
      const response = await this.api.get('/wallet/insights');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Get supported payment methods
  async getSupportedPaymentMethods() {
    try {
      const response = await this.api.get('/wallet/payment-methods/supported');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Update wallet settings
  async updateWalletSettings(settings) {
    try {
      const response = await this.api.put('/wallet/settings', settings);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Handle API errors
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        message: error.response.data.message || 'An error occurred',
        status: error.response.status,
        errors: error.response.data.errors
      };
    } else if (error.request) {
      // Network error
      return {
        success: false,
        message: 'Network error - please check your connection',
        status: 0
      };
    } else {
      // Other error
      return {
        success: false,
        message: error.message || 'An unexpected error occurred'
      };
    }
  }
}

export default new WalletService();