const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Flutterwave = require('flutterwave-node-v3');
const Pesapal = require('pesapal-node');

class PaymentService {
  constructor() {
    // Initialize payment providers
    this.flutterwave = new Flutterwave(
      process.env.FLUTTERWAVE_PUBLIC_KEY,
      process.env.FLUTTERWAVE_SECRET_KEY
    );

    this.pesapal = new Pesapal({
      consumerKey: process.env.PESAPAL_CONSUMER_KEY,
      consumerSecret: process.env.PESAPAL_CONSUMER_SECRET,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
    });
  }

  // Process payment based on provider
  async processPayment(amount, paymentMethod, user, type = 'recharge') {
    try {
      const provider = paymentMethod.type;

      switch (provider) {
        case 'card':
          return await this.processStripePayment(amount, paymentMethod, user, type);
        case 'mpesa':
          return await this.processMpesaPayment(amount, paymentMethod, user, type);
        case 'bank_transfer':
          return await this.processBankTransfer(amount, paymentMethod, user, type);
        case 'paypal':
          return await this.processPaypalPayment(amount, paymentMethod, user, type);
        default:
          throw new Error(`Unsupported payment method: ${provider}`);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        message: error.message || 'Payment processing failed'
      };
    }
  }

  // Stripe payment processing
  async processStripePayment(amount, paymentMethod, user, type) {
    try {
      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'kes',
        customer: user.stripeCustomerId, // Assuming user has Stripe customer ID
        payment_method: paymentMethod.identifier,
        off_session: true,
        confirm: true,
        metadata: {
          userId: user._id.toString(),
          type: type,
          description: `Vault5 ${type}`
        }
      });

      return {
        success: true,
        reference: paymentIntent.id,
        status: paymentIntent.status,
        message: 'Payment processed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // M-Pesa payment processing via Flutterwave
  async processMpesaPayment(amount, paymentMethod, user, type) {
    try {
      const payload = {
        phone_number: paymentMethod.identifier,
        amount: amount,
        currency: 'KES',
        email: user.email,
        tx_ref: `VAULT5_${Date.now()}_${user._id}`,
        narration: `Vault5 ${type}`,
        meta: {
          userId: user._id.toString(),
          type: type
        }
      };

      const response = await this.flutterwave.MobileMoney.mpesa(payload);

      return {
        success: true,
        reference: response.data.id,
        status: response.data.status,
        message: 'M-Pesa payment initiated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Bank transfer processing
  async processBankTransfer(amount, paymentMethod, user, type) {
    try {
      // For bank transfers, we generate a virtual account or use Pesapal
      const reference = `BT_${Date.now()}_${user._id}`;

      // In a real implementation, you would:
      // 1. Generate a virtual account number
      // 2. Set up webhooks for payment confirmation
      // 3. Handle reconciliation

      return {
        success: true,
        reference: reference,
        status: 'pending',
        message: 'Bank transfer initiated. Please complete the transfer using the provided details.',
        virtualAccount: {
          accountNumber: `VA${user._id.toString().slice(-8)}`,
          bankName: 'Virtual Bank',
          amount: amount,
          reference: reference
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // PayPal payment processing
  async processPaypalPayment(amount, paymentMethod, user, type) {
    try {
      // Create PayPal order
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer('return=representation');
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'KES',
            value: amount.toString()
          },
          description: `Vault5 ${type}`,
          custom_id: user._id.toString()
        }],
        application_context: {
          return_url: `${process.env.FRONTEND_URL}/wallet/success`,
          cancel_url: `${process.env.FRONTEND_URL}/wallet/cancel`
        }
      });

      const order = await paypalClient.execute(request);

      return {
        success: true,
        reference: order.result.id,
        status: order.result.status,
        message: 'PayPal payment initiated',
        approvalUrl: order.result.links.find(link => link.rel === 'approve').href
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Verify payment status
  async verifyPayment(reference, provider) {
    try {
      switch (provider) {
        case 'stripe':
          return await this.verifyStripePayment(reference);
        case 'mpesa':
          return await this.verifyMpesaPayment(reference);
        case 'bank_transfer':
          return await this.verifyBankTransfer(reference);
        case 'paypal':
          return await this.verifyPaypalPayment(reference);
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Verify Stripe payment
  async verifyStripePayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        success: paymentIntent.status === 'succeeded',
        status: paymentIntent.status,
        amount: paymentIntent.amount_received / 100,
        currency: paymentIntent.currency,
        message: `Payment ${paymentIntent.status}`
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Verify M-Pesa payment
  async verifyMpesaPayment(transactionId) {
    try {
      const response = await this.flutterwave.Transaction.verify({ id: transactionId });

      return {
        success: response.data.status === 'successful',
        status: response.data.status,
        amount: response.data.amount,
        currency: response.data.currency,
        message: `M-Pesa payment ${response.data.status}`
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Verify bank transfer
  async verifyBankTransfer(reference) {
    try {
      // In a real implementation, check with bank API or database
      // For now, return pending status
      return {
        success: false,
        status: 'pending',
        message: 'Bank transfer verification pending'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Verify PayPal payment
  async verifyPaypalPayment(orderId) {
    try {
      const request = new paypal.orders.OrdersGetRequest(orderId);
      const order = await paypalClient.execute(request);

      return {
        success: order.result.status === 'COMPLETED',
        status: order.result.status,
        amount: order.result.purchase_units[0].amount.value,
        currency: order.result.purchase_units[0].amount.currency_code,
        message: `PayPal payment ${order.result.status}`
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Get supported payment methods
  getSupportedMethods() {
    return [
      {
        type: 'mpesa',
        name: 'M-Pesa',
        currencies: ['KES'],
        limits: {
          min: 10,
          max: 150000
        }
      },
      {
        type: 'card',
        name: 'Card',
        currencies: ['KES', 'USD', 'EUR'],
        limits: {
          min: 50,
          max: 500000
        }
      },
      {
        type: 'bank_transfer',
        name: 'Bank Transfer',
        currencies: ['KES', 'USD'],
        limits: {
          min: 100,
          max: 1000000
        }
      },
      {
        type: 'paypal',
        name: 'PayPal',
        currencies: ['USD', 'EUR', 'GBP'],
        limits: {
          min: 100,
          max: 100000
        }
      }
    ];
  }

  // Check if payment method is supported for currency
  isMethodSupportedForCurrency(method, currency) {
    const supportedMethods = this.getSupportedMethods();
    const methodInfo = supportedMethods.find(m => m.type === method);
    return methodInfo && methodInfo.currencies.includes(currency);
  }
}

module.exports = new PaymentService();