const { Subscription, PaymentMethod, Notification } = require('../models');
const { debitWallet } = require('./walletController');
const { secrets } = require('../utils/secretsLoader');
const stripe = require('stripe')(secrets.STRIPE_SECRET_KEY);
const catchAsync = require('../utils/catchAsync');
const { auditLog } = require('../utils/audit');

// CREATE subscription
const createSubscription = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { merchantName, merchantUrl, amount, currency = 'KES', interval, paymentSource = 'wallet', paymentMethodId, description, tags } = req.body;

  // Validate payment source
  if (paymentSource === 'card' && !paymentMethodId) {
    return res.status(400).json({ success: false, message: 'paymentMethodId required for card payments' });
  }

  if (paymentSource === 'card') {
    const pm = await PaymentMethod.findOne({ _id: paymentMethodId, user: userId });
    if (!pm) {
      return res.status(404).json({ success: false, message: 'Payment method not found' });
    }
  }

  const subscription = await Subscription.create({
    user: userId,
    merchantName,
    merchantUrl,
    amount,
    currency,
    interval,
    paymentSource,
    paymentMethodId,
    description,
    tags
  });

  auditLog(userId, 'subscription_created', { subscriptionId: subscription._id });

  // Notification
  await Notification.create({
    user: userId,
    type: 'subscription',
    title: 'Subscription Created',
    message: `New subscription to ${merchantName} for ${currency} ${amount} ${interval}`,
    data: { subscriptionId: subscription._id }
  });

  res.status(201).json({ success: true, data: subscription });
});

// LIST subscriptions
const listSubscriptions = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { status, page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const filter = { user: userId };
  if (status) filter.status = status;

  const subscriptions = await Subscription.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('paymentMethodId', 'last4 brand');

  const total = await Subscription.countDocuments(filter);

  res.json({
    success: true,
    data: subscriptions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// GET single subscription
const getSubscription = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const subscription = await Subscription.findOne({ _id: id, user: userId })
    .populate('paymentMethodId', 'last4 brand');

  if (!subscription) {
    return res.status(404).json({ success: false, message: 'Subscription not found' });
  }

  res.json({ success: true, data: subscription });
});

// CANCEL subscription
const cancelSubscription = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const { reason } = req.body;

  const subscription = await Subscription.findOne({ _id: id, user: userId });
  if (!subscription) {
    return res.status(404).json({ success: false, message: 'Subscription not found' });
  }

  if (subscription.status === 'canceled') {
    return res.status(400).json({ success: false, message: 'Subscription already canceled' });
  }

  subscription.status = 'canceled';
  subscription.canceledAt = new Date();
  subscription.cancelReason = reason;
  await subscription.save();

  auditLog(userId, 'subscription_canceled', { subscriptionId: id });

  // Notification
  await Notification.create({
    user: userId,
    type: 'subscription',
    title: 'Subscription Canceled',
    message: `Subscription to ${subscription.merchantName} has been canceled`,
    data: { subscriptionId: id }
  });

  res.json({ success: true, message: 'Subscription canceled' });
});

// RESUME subscription
const resumeSubscription = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const subscription = await Subscription.findOne({ _id: id, user: userId });
  if (!subscription) {
    return res.status(404).json({ success: false, message: 'Subscription not found' });
  }

  if (subscription.status !== 'paused') {
    return res.status(400).json({ success: false, message: 'Subscription not paused' });
  }

  subscription.status = 'active';
  subscription.nextBillingDate = subscription.calculateNextBillingDate();
  await subscription.save();

  auditLog(userId, 'subscription_resumed', { subscriptionId: id });

  res.json({ success: true, message: 'Subscription resumed' });
});

// CHARGE NOW (test endpoint)
const chargeNow = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const subscription = await Subscription.findOne({ _id: id, user: userId });
  if (!subscription) {
    return res.status(404).json({ success: false, message: 'Subscription not found' });
  }

  if (subscription.status !== 'active') {
    return res.status(400).json({ success: false, message: 'Subscription not active' });
  }

  let success = false;
  let error = null;
  let transactionId = null;

  try {
    if (subscription.paymentSource === 'wallet') {
      const { transaction } = await debitWallet(
        userId,
        subscription.amount,
        `Subscription: ${subscription.merchantName}`,
        { subscriptionId: subscription._id }
      );
      transactionId = transaction._id;
      success = true;
    } else if (subscription.paymentSource === 'card') {
      // Charge card via Stripe
      const pm = await PaymentMethod.findById(subscription.paymentMethodId);
      if (!pm) throw new Error('Payment method not found');

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(subscription.amount * 100), // cents
        currency: subscription.currency.toLowerCase(),
        payment_method: pm.providerId,
        customer: req.user.stripeCustomerId,
        off_session: true,
        confirm: true,
        metadata: { subscriptionId: subscription._id.toString() }
      });

      if (paymentIntent.status === 'succeeded') {
        success = true;
        transactionId = paymentIntent.id;
      } else {
        error = `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`;
      }
    }
  } catch (e) {
    error = e.message;
  }

  // Record in history
  subscription.history.push({
    amount: subscription.amount,
    status: success ? 'success' : 'failed',
    transactionId,
    error
  });

  if (!success) {
    subscription.retryCount += 1;
    if (subscription.retryCount >= subscription.maxRetries) {
      subscription.status = 'failed';
    }
  } else {
    subscription.nextBillingDate = subscription.calculateNextBillingDate();
    subscription.retryCount = 0;
  }

  await subscription.save();

  // Notification
  await Notification.create({
    user: userId,
    type: 'subscription',
    title: success ? 'Subscription Charged' : 'Subscription Charge Failed',
    message: success
      ? `Charged ${subscription.currency} ${subscription.amount} for ${subscription.merchantName}`
      : `Failed to charge subscription for ${subscription.merchantName}: ${error}`,
    data: { subscriptionId: id, success }
  });

  auditLog(userId, success ? 'subscription_charged' : 'subscription_charge_failed', { subscriptionId: id });

  res.json({
    success,
    message: success ? 'Subscription charged successfully' : `Charge failed: ${error}`,
    data: { transactionId }
  });
});

module.exports = {
  createSubscription,
  listSubscriptions,
  getSubscription,
  cancelSubscription,
  resumeSubscription,
  chargeNow
};