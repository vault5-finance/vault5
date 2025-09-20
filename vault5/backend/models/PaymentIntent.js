const mongoose = require('mongoose');

const PaymentIntentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    type: { type: String, enum: ['deposit', 'payout'], required: true },
    amount: { type: Number, min: 1, required: true },
    currency: { type: String, default: 'KES' },
    targetAccount: { type: String, default: 'wallet' }, // 'wallet' or specific Account _id as string
    provider: { type: String, enum: ['mpesa', 'airtel', 'bank', 'simulation'], required: true },
    phone: { type: String }, // MSISDN required for mpesa/airtel
    status: {
      type: String,
      enum: ['created', 'pending', 'awaiting_user', 'success', 'failed', 'canceled', 'expired'],
      default: 'created',
      index: true,
    },
    providerRef: { type: String, unique: true, sparse: true },
    providerMeta: { type: Object },
    error: { type: String },
  },
  { timestamps: true }
);

// Indexes for dashboards and reconciliation
PaymentIntentSchema.index({ user: 1, createdAt: -1 });
PaymentIntentSchema.index({ type: 1, provider: 1, createdAt: -1 });

// Helper to present a safe client-facing shape
PaymentIntentSchema.methods.toPublicJSON = function () {
  return {
    id: String(this._id),
    type: this.type,
    amount: this.amount,
    currency: this.currency,
    targetAccount: this.targetAccount,
    provider: this.provider,
    status: this.status,
    providerRef: this.providerRef || null,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('PaymentIntent', PaymentIntentSchema);