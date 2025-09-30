const mongoose = require('mongoose');
const { Subscription } = require('../models');
const { debitWallet } = require('../controllers/walletController');
const { secrets } = require('../utils/secretsLoader');
const stripe = require('stripe')(secrets.STRIPE_SECRET_KEY);
const { Notification } = require('../models');

// Connect to MongoDB
async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vault5');
  console.log('Connected to MongoDB');
}

// Process due subscriptions
async function processDueSubscriptions() {
  const now = new Date();
  console.log(`Processing subscriptions due before ${now.toISOString()}`);

  // Find active subscriptions due for billing
  const dueSubscriptions = await Subscription.find({
    status: 'active',
    nextBillingDate: { $lte: now }
  }).populate('user', 'name email stripeCustomerId');

  console.log(`Found ${dueSubscriptions.length} subscriptions to process`);

  for (const sub of dueSubscriptions) {
    try {
      console.log(`Processing subscription ${sub._id} for user ${sub.user._id}`);

      let success = false;
      let error = null;
      let transactionId = null;

      if (sub.paymentSource === 'wallet') {
        try {
          const { transaction } = await debitWallet(sub.user._id, sub.amount, `Subscription: ${sub.merchantName}`, { subscriptionId: sub._id });
          transactionId = transaction._id;
          success = true;
        } catch (e) {
          error = e.message;
        }
      } else if (sub.paymentSource === 'card') {
        try {
          const pm = await mongoose.model('PaymentMethod').findById(sub.paymentMethodId);
          if (!pm) throw new Error('Payment method not found');

          const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(sub.amount * 100),
            currency: sub.currency.toLowerCase(),
            payment_method: pm.providerId,
            customer: sub.user.stripeCustomerId,
            off_session: true,
            confirm: true,
            metadata: { subscriptionId: sub._id.toString() }
          });

          if (paymentIntent.status === 'succeeded') {
            success = true;
            transactionId = paymentIntent.id;
          } else {
            error = `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`;
          }
        } catch (e) {
          error = e.message;
        }
      }

      // Record in history
      sub.history.push({
        amount: sub.amount,
        status: success ? 'success' : 'failed',
        transactionId,
        error
      });

      if (!success) {
        sub.retryCount += 1;
        if (sub.retryCount >= sub.maxRetries) {
          sub.status = 'failed';
        }
      } else {
        sub.nextBillingDate = sub.calculateNextBillingDate();
        sub.retryCount = 0;
      }

      await sub.save();

      // Notification
      await Notification.create({
        user: sub.user._id,
        type: 'subscription',
        title: success ? 'Subscription Charged' : 'Subscription Charge Failed',
        message: success
          ? `Charged ${sub.currency} ${sub.amount} for ${sub.merchantName}`
          : `Failed to charge subscription for ${sub.merchantName}: ${error}`,
        data: { subscriptionId: sub._id, success }
      });

      console.log(`Subscription ${sub._id} processed: ${success ? 'SUCCESS' : 'FAILED'}`);
    } catch (e) {
      console.error(`Error processing subscription ${sub._id}:`, e.message);
    }
  }

  console.log('Subscription processing complete');
}

// Main execution
async function main() {
  try {
    await connectDB();
    await processDueSubscriptions();
  } catch (error) {
    console.error('Script error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { processDueSubscriptions };