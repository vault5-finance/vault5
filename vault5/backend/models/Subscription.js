const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  merchantName: {
    type: String,
    required: true,
    trim: true
  },
  merchantUrl: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'KES',
    enum: ['KES', 'USD', 'EUR'] // Expandable
  },
  interval: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
  },
  nextBillingDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'canceled', 'expired', 'failed'],
    default: 'active'
  },
  paymentSource: {
    type: String,
    enum: ['wallet', 'card'],
    default: 'wallet'
  },
  paymentMethodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentMethod' // For card payments
  },
  // Billing history
  history: [{
    date: { type: Date, default: Date.now },
    amount: Number,
    status: { type: String, enum: ['success', 'failed', 'pending'] },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    error: String
  }],
  // Retry logic
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  lastRetryDate: Date,
  // Metadata
  description: String,
  tags: [String],
  // Cancellation
  canceledAt: Date,
  cancelReason: String
}, {
  timestamps: true
});

// Indexes
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ nextBillingDate: 1, status: 1 });
subscriptionSchema.index({ user: 1, merchantName: 1 });

// Virtual for days until next billing
subscriptionSchema.virtual('daysUntilNextBilling').get(function() {
  if (!this.nextBillingDate) return null;
  const now = new Date();
  const diffTime = this.nextBillingDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Helper method to calculate next billing date
subscriptionSchema.methods.calculateNextBillingDate = function() {
  const now = new Date();
  const intervals = {
    daily: 1,
    weekly: 7,
    monthly: 30, // Approximate
    quarterly: 90,
    yearly: 365
  };
  const days = intervals[this.interval] || 30;
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
};

// Pre-save: auto-set nextBillingDate if not set
subscriptionSchema.pre('save', function(next) {
  if (this.isNew && !this.nextBillingDate) {
    this.nextBillingDate = this.calculateNextBillingDate();
  }
  next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);