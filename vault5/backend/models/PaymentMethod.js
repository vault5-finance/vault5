const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: String,
    required: true,
    enum: ['stripe'], // Expandable for future providers like PayPal
    default: 'stripe'
  },
  providerId: {
    type: String,
    required: true // Stripe PaymentMethod ID (tokenized)
  },
  last4: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 4
  },
  brand: {
    type: String,
    required: true,
    enum: ['visa', 'mastercard', 'amex', 'discover', 'diners', 'jcb', 'unionpay', 'unknown']
  },
  expMonth: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  expYear: {
    type: Number,
    required: true,
    min: new Date().getFullYear(),
    max: new Date().getFullYear() + 20
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  // Device and security metadata for velocity checks
  deviceId: {
    type: String,
    default: ''
  },
  ip: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  },
  // Audit: when linked
  linkedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure only one default per user
paymentMethodSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Indexes
paymentMethodSchema.index({ user: 1, provider: 1 });
paymentMethodSchema.index({ user: 1, isDefault: 1 });
paymentMethodSchema.index({ providerId: 1 }); // Unique per provider

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);