const mongoose = require('mongoose');

const PaymentIntentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },

    // High-level type (legacy)
    type: { type: String, enum: ['deposit', 'payout'], required: true },

    // New: kind of money movement inside the platform
    // deposit | internal | p2p | payout
    kind: { type: String, enum: ['deposit', 'internal', 'p2p', 'payout'], default: 'deposit', index: true },

    amount: { type: Number, min: 1, required: true },
    currency: { type: String, default: 'KES' },

    // For deposits we previously used targetAccount; keep for compatibility
    targetAccount: { type: String, default: 'wallet' }, // 'wallet' or Account _id (string)

    // For transfers/payouts we need explicit source/dest
    sourceAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    destAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },

    // Counterparty details for P2P and payouts
    counterparty: {
      type: {
        type: String, // 'user' | 'external'
        enum: ['user', 'external'],
      },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      phone: { type: String },
      email: { type: String },
      bankRef: { type: Object }, // { name, accountName, accountNumber, bankCode, ... }
    },

    // Provider for external operations (deposits/payouts)
    provider: { type: String, enum: ['mpesa', 'airtel', 'bank', 'simulation'], required: true },
    phone: { type: String }, // MSISDN for mpesa/airtel

    status: {
      type: String,
      enum: ['created', 'pending', 'awaiting_user', 'pending_hold', 'success', 'failed', 'canceled', 'expired'],
      default: 'created',
      index: true,
    },

    // Fees, penalties and net credited/debited
    feeAmount: { type: Number, default: 0 },
    penaltyAmount: { type: Number, default: 0 },
    netAmount: { type: Number, default: 0 },

    // For delayed releases (e.g., Emergency 24h delay)
    delayReleaseAt: { type: Date },

    // Provider references and metadata
    providerRef: { type: String, unique: true, sparse: true },
    providerMeta: { type: Object },

    // Rule engine meta (what rules applied/blocked)
    ruleMeta: { type: Object },

    error: { type: String },
  },
  { timestamps: true }
);

// Indexes for dashboards and reconciliation
PaymentIntentSchema.index({ user: 1, createdAt: -1 });
PaymentIntentSchema.index({ type: 1, provider: 1, createdAt: -1 });
PaymentIntentSchema.index({ kind: 1, createdAt: -1 });
PaymentIntentSchema.index({ delayReleaseAt: 1 });

// Helper to present a safe client-facing shape
PaymentIntentSchema.methods.toPublicJSON = function () {
  return {
    id: String(this._id),
    type: this.type,
    kind: this.kind,
    amount: this.amount,
    currency: this.currency,
    targetAccount: this.targetAccount,
    sourceAccountId: this.sourceAccountId || null,
    destAccountId: this.destAccountId || null,
    counterparty: this.counterparty || null,
    provider: this.provider,
    status: this.status,
    feeAmount: this.feeAmount || 0,
    penaltyAmount: this.penaltyAmount || 0,
    netAmount: this.netAmount || 0,
    delayReleaseAt: this.delayReleaseAt || null,
    providerRef: this.providerRef || null,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('PaymentIntent', PaymentIntentSchema);