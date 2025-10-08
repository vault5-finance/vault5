/**
 * Payment Service Provider (PSP) Abstraction Layer
 *
 * This service provides a unified interface for multiple payment gateways:
 * - Stripe (International cards)
 * - Flutterwave (African payments)
 * - Pesapal (East African payments)
 * - M-Pesa (Kenyan mobile money)
 */

class PaymentService {
  constructor() {
    this.providers = new Map();
    this.initializeProviders();
  }

  /**
   * Initialize payment providers
   */
  initializeProviders() {
    // Stripe for international card payments
    if (process.env.STRIPE_SECRET_KEY) {
      this.providers.set('stripe', {
        name: 'Stripe',
        type: 'card',
        regions: ['global'],
        initialize: () => require('stripe')(process.env.STRIPE_SECRET_KEY),
        processPayment: this.processStripePayment.bind(this),
        verifyPayment: this.verifyStripePayment.bind(this)
      });
    }

    // Flutterwave for African payments
    if (process.env.FLUTTERWAVE_SECRET_KEY) {
      this.providers.set('flutterwave', {
        name: 'Flutterwave',
        type: 'multi',
        regions: ['africa'],
        initialize: () => ({
          secretKey: process.env.FLUTTERWAVE_SECRET_KEY,
          publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY
        }),
        processPayment: this.processFlutterwavePayment.bind(this),
        verifyPayment: this.verifyFlutterwavePayment.bind(this)
      });
    }

    // Pesapal for East African payments
    if (process.env.PESAPAL_CONSUMER_KEY) {
      this.providers.set('pesapal', {
        name: 'Pesapal',
        type: 'multi',
        regions: ['kenya', 'uganda', 'tanzania'],
        initialize: () => ({
          consumerKey: process.env.PESAPAL_CONSUMER_KEY,
          consumerSecret: process.env.PESAPAL_CONSUMER_SECRET
        }),
        processPayment: this.processPesapalPayment.bind(this),
        verifyPayment: this.verifyPesapalPayment.bind(this)
      });
    }

    // M-Pesa for Kenyan mobile money
    if (process.env.MPESA_CONSUMER_KEY) {
      this.providers.set('mpesa', {
        name: 'M-Pesa',
        type: 'mobile_money',
        regions: ['kenya'],
        initialize: () => ({
          consumerKey: process.env.MPESA_CONSUMER_KEY,
          consumerSecret: process.env.MPESA_CONSUMER_SECRET,
          shortcode: process.env.MPESA_SHORTCODE,
          passkey: process.env.MPESA_PASSKEY
        }),
        processPayment: this.processMpesaPayment.bind(this),
        verifyPayment: this.verifyMpesaPayment.bind(this)
      });
    }
  }

  /**
   * Get available providers for a region and payment type
   * @param {string} region - Region (e.g., 'kenya', 'africa', 'global')
   * @param {string} type - Payment type ('card', 'mobile_money', 'bank', 'multi')
   * @returns {Array} - Available providers
   */
  getAvailableProviders(region = 'global', type = null) {
    const available = [];

    for (const [key, provider] of this.providers) {
      const regionMatch = provider.regions.includes(region) || provider.regions.includes('global');
      const typeMatch = !type || provider.type === type || provider.type === 'multi';

      if (regionMatch && typeMatch) {
        available.push({
          id: key,
          name: provider.name,
          type: provider.type,
          regions: provider.regions
        });
      }
    }

    return available;
  }

  /**
   * Process a payment through the appropriate provider
   * @param {Object} paymentData - Payment data
   * @param {string} paymentData.provider - Payment provider
   * @param {string} paymentData.type - Payment type
   * @param {number} paymentData.amount - Amount in smallest currency unit
   * @param {string} paymentData.currency - Currency code
   * @param {Object} paymentData.customer - Customer details
   * @param {Object} paymentData.metadata - Additional metadata
   * @returns {Object} - Payment result
   */
  async processPayment(paymentData) {
    const { provider: providerId, type, amount, currency, customer, metadata = {} } = paymentData;

    if (!this.providers.has(providerId)) {
      throw new Error(`Payment provider '${providerId}' not available`);
    }

    const provider = this.providers.get(providerId);

    try {
      const result = await provider.processPayment({
        type,
        amount,
        currency,
        customer,
        metadata
      });

      return {
        success: true,
        provider: providerId,
        transactionId: result.transactionId,
        reference: result.reference,
        status: result.status,
        amount,
        currency,
        metadata: result.metadata || {}
      };
    } catch (error) {
      console.error(`Payment processing error with ${providerId}:`, error);
      return {
        success: false,
        provider: providerId,
        error: error.message,
        code: error.code || 'PAYMENT_FAILED'
      };
    }
  }

  /**
   * Verify a payment status
   * @param {string} providerId - Payment provider
   * @param {string} transactionId - Transaction ID to verify
   * @returns {Object} - Verification result
   */
  async verifyPayment(providerId, transactionId) {
    if (!this.providers.has(providerId)) {
      throw new Error(`Payment provider '${providerId}' not available`);
    }

    const provider = this.providers.get(providerId);

    try {
      const result = await provider.verifyPayment(transactionId);
      return {
        success: true,
        provider: providerId,
        transactionId,
        status: result.status,
        amount: result.amount,
        currency: result.currency,
        verifiedAt: new Date(),
        metadata: result.metadata || {}
      };
    } catch (error) {
      console.error(`Payment verification error with ${providerId}:`, error);
      return {
        success: false,
        provider: providerId,
        transactionId,
        error: error.message,
        verifiedAt: new Date()
      };
    }
  }

  // Provider-specific implementations

  /**
   * Process Stripe payment
   */
  async processStripePayment({ type, amount, currency, customer, metadata }) {
    const stripe = this.providers.get('stripe').initialize();

    if (type === 'card') {
      // Create PaymentIntent for card payments
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: currency.toLowerCase(),
        customer: customer.stripeCustomerId,
        metadata: {
          vault5_user_id: customer.userId,
          ...metadata
        }
      });

      return {
        transactionId: paymentIntent.id,
        reference: paymentIntent.client_secret,
        status: 'pending',
        metadata: { clientSecret: paymentIntent.client_secret }
      };
    }

    throw new Error(`Unsupported payment type '${type}' for Stripe`);
  }

  /**
   * Verify Stripe payment
   */
  async verifyStripePayment(transactionId) {
    const stripe = this.providers.get('stripe').initialize();

    const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);

    return {
      status: paymentIntent.status === 'succeeded' ? 'completed' : paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata
    };
  }

  /**
   * Process Flutterwave payment
   */
  async processFlutterwavePayment({ type, amount, currency, customer, metadata }) {
    // Flutterwave API integration would go here
    // This is a placeholder implementation
    const reference = `FW-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      transactionId: reference,
      reference,
      status: 'pending',
      metadata: { flutterwave_reference: reference }
    };
  }

  /**
   * Verify Flutterwave payment
   */
  async verifyFlutterwavePayment(transactionId) {
    // Flutterwave verification logic would go here
    return {
      status: 'completed',
      amount: 1000, // Placeholder
      currency: 'KES',
      metadata: {}
    };
  }

  /**
   * Process Pesapal payment
   */
  async processPesapalPayment({ type, amount, currency, customer, metadata }) {
    // Pesapal API integration would go here
    const reference = `PSP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      transactionId: reference,
      reference,
      status: 'pending',
      metadata: { pesapal_reference: reference }
    };
  }

  /**
   * Verify Pesapal payment
   */
  async verifyPesapalPayment(transactionId) {
    // Pesapal verification logic would go here
    return {
      status: 'completed',
      amount: 1000, // Placeholder
      currency: 'KES',
      metadata: {}
    };
  }

  /**
   * Process M-Pesa payment
   */
  async processMpesaPayment({ type, amount, currency, customer, metadata }) {
    if (type !== 'mobile_money') {
      throw new Error('M-Pesa only supports mobile money payments');
    }

    // M-Pesa STK Push integration would go here
    const reference = `MP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Generate timestamp and password for M-Pesa
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const mpesaConfig = this.providers.get('mpesa').initialize();

    // This would make actual M-Pesa API call
    // For now, return placeholder response

    return {
      transactionId: reference,
      reference,
      status: 'pending',
      metadata: {
        mpesa_reference: reference,
        phone_number: customer.phoneNumber,
        timestamp
      }
    };
  }

  /**
   * Verify M-Pesa payment
   */
  async verifyMpesaPayment(transactionId) {
    // M-Pesa verification logic would go here
    // Check transaction status via M-Pesa API
    return {
      status: 'completed',
      amount: 1000, // Placeholder
      currency: 'KES',
      metadata: {}
    };
  }

  /**
   * Get provider capabilities and fees
   * @param {string} providerId - Provider ID
   * @returns {Object} - Provider capabilities
   */
  getProviderCapabilities(providerId) {
    if (!this.providers.has(providerId)) {
      return null;
    }

    const provider = this.providers.get(providerId);

    return {
      id: providerId,
      name: provider.name,
      type: provider.type,
      regions: provider.regions,
      capabilities: {
        card: ['visa', 'mastercard', 'amex'],
        mobile_money: providerId === 'mpesa' ? ['mpesa'] : [],
        bank_transfer: ['bank_transfer'],
        wallet: ['wallet']
      },
      fees: {
        percentage: 0.029, // 2.9%
        fixed: 0, // No fixed fee
        currency: 'KES'
      },
      limits: {
        min: 10, // Minimum 10 KES
        max: 150000, // Maximum 150,000 KES
        daily: 500000 // Daily limit 500,000 KES
      }
    };
  }

  /**
   * Calculate payment fees
   * @param {string} providerId - Provider ID
   * @param {number} amount - Amount in smallest currency unit
   * @returns {Object} - Fee breakdown
   */
  calculateFees(providerId, amount) {
    const capabilities = this.getProviderCapabilities(providerId);
    if (!capabilities) return null;

    const percentageFee = Math.round(amount * capabilities.fees.percentage);
    const totalFee = percentageFee + capabilities.fees.fixed;

    return {
      provider: providerId,
      amount,
      percentageFee,
      fixedFee: capabilities.fees.fixed,
      totalFee,
      netAmount: amount - totalFee
    };
  }
}

module.exports = new PaymentService();