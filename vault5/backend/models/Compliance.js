const mongoose = require('mongoose');

const { Schema } = mongoose;

// Limitation: PayPal-style account limitations
const limitationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['temporary_30', 'temporary_180', 'permanent'],
      required: true,
    },
    reason: { type: String, default: '' },
    imposedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // admin who imposed
    imposedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date }, // set for temporary limitations
    status: {
      type: String,
      enum: ['active', 'lifted', 'expired'],
      default: 'active',
      index: true,
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

limitationSchema.index({ user: 1, status: 1 });
limitationSchema.index({ expiresAt: 1 });

// ReserveHold: funds held (e.g., 180-day reserve)
const reserveHoldSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'KES' },
    createdAt: { type: Date, default: Date.now },
    releaseAt: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ['active', 'released', 'forfeited'],
      default: 'active',
      index: true,
    },
    sourceTxIds: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }],
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// PayoutRequest: user requests payout after eligibility (e.g., 180 days)
const payoutRequestSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'KES' },
    destination: {
      bankName: { type: String, required: true },
      accountName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      bankCode: { type: String, default: '' },
      // additional fields (swift, branch) can be added later
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'paid'],
      default: 'pending',
      index: true,
    },
    reviewer: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
    rejectionReason: { type: String, default: '' },
  },
  { timestamps: true }
);

payoutRequestSchema.index({ status: 1, createdAt: -1 });

// KycRequest: KYC workflow with documents and status
const kycDocumentSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['nat_id', 'passport', 'utility_bill', 'bank_statement', 'selfie', 'other'],
      required: true,
    },
    url: { type: String, required: true },
    status: {
      type: String,
      enum: ['uploaded', 'approved', 'rejected', 'needs_more_info'],
      default: 'uploaded',
    },
    notes: { type: String, default: '' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const kycRequestSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    levelRequested: { type: String, enum: ['Tier1', 'Tier2'], required: true },
    documents: [kycDocumentSchema],
    status: { type: String, enum: ['pending', 'more_info', 'approved', 'rejected'], default: 'pending', index: true },
    reviewer: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// GeoPolicy: allowlist for countries
const geoPolicySchema = new Schema(
  {
    mode: { type: String, enum: ['allowlist'], default: 'allowlist' },
    countries: [{ type: String }], // e.g., ['KE']
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// IpDenylist: CIDR-based blocks
const ipDenylistSchema = new Schema(
  {
    cidrs: [{ type: String }], // e.g., ['1.2.3.0/24']
    reason: { type: String, default: '' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// DeviceRule: basic device/cookie checks
const deviceRuleSchema = new Schema(
  {
    requireCookies: { type: Boolean, default: true },
    forbidHeadless: { type: Boolean, default: true },
    minSignals: { type: Number, default: 1 }, // reserved for future device-signal thresholding
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// LimitTier: caps by tier
const limitTierSchema = new Schema(
  {
    name: { type: String, enum: ['Tier0', 'Tier1', 'Tier2'], unique: true, required: true },
    dailyLimit: { type: Number, required: true }, // KES
    monthlyLimit: { type: Number, required: true }, // KES
    maxHoldBalance: { type: Number, default: 0 }, // optional ceiling for wallet
    minAccountAgeDays: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// VelocityCounter: per-window usage
const velocityCounterSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    window: { type: String, enum: ['day', 'week', 'month'], required: true },
    count: { type: Number, default: 0 },
    amount: { type: Number, default: 0 }, // KES
    resetAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

velocityCounterSchema.index({ user: 1, window: 1 }, { unique: true });

// RiskEvent: for analytics and security signals
const riskEventSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    kind: { type: String, required: true }, // e.g., 'login_geo_block', 'ip_block', 'device_block', 'cap_hit', etc.
    score: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

module.exports = {
  Limitation: mongoose.models.Limitation || mongoose.model('Limitation', limitationSchema),
  ReserveHold: mongoose.models.ReserveHold || mongoose.model('ReserveHold', reserveHoldSchema),
  PayoutRequest: mongoose.models.PayoutRequest || mongoose.model('PayoutRequest', payoutRequestSchema),
  KycRequest: mongoose.models.KycRequest || mongoose.model('KycRequest', kycRequestSchema),
  GeoPolicy: mongoose.models.GeoPolicy || mongoose.model('GeoPolicy', geoPolicySchema),
  IpDenylist: mongoose.models.IpDenylist || mongoose.model('IpDenylist', ipDenylistSchema),
  DeviceRule: mongoose.models.DeviceRule || mongoose.model('DeviceRule', deviceRuleSchema),
  LimitTier: mongoose.models.LimitTier || mongoose.model('LimitTier', limitTierSchema),
  VelocityCounter: mongoose.models.VelocityCounter || mongoose.model('VelocityCounter', velocityCounterSchema),
  RiskEvent: mongoose.models.RiskEvent || mongoose.model('RiskEvent', riskEventSchema),
};