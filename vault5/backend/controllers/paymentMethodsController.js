const { User, PaymentMethod, Notification } = require('../models');
const { secrets } = require('../utils/secretsLoader');
let stripe = null;
try {
  if (secrets.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(secrets.STRIPE_SECRET_KEY);
  } else {
    console.warn('STRIPE_SECRET_KEY not configured');
  }
} catch (e) {
  console.warn('Stripe initialization failed:', e.message);
}
const catchAsync = require('../utils/catchAsync');
const { auditLog } = require('../utils/audit');

// GET /api/payment-methods/stripe/config
const getStripeConfig = catchAsync(async (req, res) => {
  if (!secrets.STRIPE_PUBLISHABLE_KEY) {
    return res.status(500).json({ success: false, message: 'Stripe not configured' });
  }
  res.json({ success: true, publishableKey: secrets.STRIPE_PUBLISHABLE_KEY });
});

// POST /api/payment-methods/stripe/setup-intent
const createSetupIntent = catchAsync(async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ success: false, message: 'Stripe not configured' });
  }
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Create or retrieve Stripe customer
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.emails.find(e => e.isPrimary)?.email || user.email,
      name: user.name,
      metadata: { userId: userId.toString() }
    });
    customerId = customer.id;
    user.stripeCustomerId = customerId;
    await user.save();
  }

  // Create SetupIntent
  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ['card'],
    usage: 'off_session' // For future charges
  });

  auditLog(userId, 'setup_intent_created', { setupIntentId: setupIntent.id });

  res.json({
    success: true,
    clientSecret: setupIntent.client_secret,
    setupIntentId: setupIntent.id
  });
});

// POST /api/payment-methods/cards/link
const linkCard = catchAsync(async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ success: false, message: 'Stripe not configured' });
  }
  const userId = req.user._id;
  const { paymentMethodId } = req.body;
  if (!paymentMethodId) {
    return res.status(400).json({ success: false, message: 'paymentMethodId required' });
  }

  const user = await User.findById(userId);
  if (!user || !user.stripeCustomerId) {
    return res.status(400).json({ success: false, message: 'Stripe customer not set up' });
  }

  // Retrieve PM from Stripe
  const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
  if (pm.customer !== user.stripeCustomerId) {
    return res.status(403).json({ success: false, message: 'Payment method not owned by user' });
  }

  // Check if already linked
  const existing = await PaymentMethod.findOne({ user: userId, providerId: paymentMethodId });
  if (existing) {
    return res.status(409).json({ success: false, message: 'Card already linked' });
  }

  // Create PaymentMethod record
  const card = pm.card;
  const newPm = await PaymentMethod.create({
    user: userId,
    provider: 'stripe',
    providerId: paymentMethodId,
    last4: card.last4,
    brand: card.brand,
    expMonth: card.exp_month,
    expYear: card.exp_year,
    deviceId: req.deviceId || '',
    ip: req.ip || '',
    userAgent: req.get('User-Agent') || ''
  });

  auditLog(userId, 'card_linked', { paymentMethodId, last4: card.last4 });

  // Notification
  await Notification.create({
    user: userId,
    type: 'payment_method',
    title: 'Card Linked',
    message: `Your ${card.brand} ending in ${card.last4} has been linked successfully`,
    data: { paymentMethodId: newPm._id }
  });

  res.json({ success: true, data: newPm });
});

// GET /api/payment-methods/cards
const listCards = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const cards = await PaymentMethod.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
  res.json({ success: true, data: cards });
});

// PATCH /api/payment-methods/cards/:id/default
const setDefaultCard = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const pm = await PaymentMethod.findOne({ _id: id, user: userId });
  if (!pm) {
    return res.status(404).json({ success: false, message: 'Card not found' });
  }

  // This will trigger pre-save to unset others
  pm.isDefault = true;
  await pm.save();

  auditLog(userId, 'default_card_set', { paymentMethodId: id });

  res.json({ success: true, message: 'Default card updated' });
});

// DELETE /api/payment-methods/cards/:id
const removeCard = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const pm = await PaymentMethod.findOneAndDelete({ _id: id, user: userId });
  if (!pm) {
    return res.status(404).json({ success: false, message: 'Card not found' });
  }

  // Detach from Stripe
  if (stripe) {
    try {
      await stripe.paymentMethods.detach(pm.providerId);
    } catch (e) {
      console.warn('Stripe detach failed:', e.message);
    }
  }

  auditLog(userId, 'card_removed', { paymentMethodId: id });

  // Notification
  await Notification.create({
    user: userId,
    type: 'payment_method',
    title: 'Card Removed',
    message: `Your card ending in ${pm.last4} has been removed`,
    data: { paymentMethodId: id }
  });

  res.json({ success: true, message: 'Card removed' });
});

module.exports = {
  getStripeConfig,
  createSetupIntent,
  linkCard,
  listCards,
  setDefaultCard,
  removeCard
};