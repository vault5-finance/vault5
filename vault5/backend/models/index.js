// Vault5 Backend Models - Centralized Export

const User = require('./User');
const Account = require('./Account');
const Transaction = require('./Transaction');
const Goal = require('./Goal');
const Loan = require('./Loan'); // personal/business loans (existing)
const Investment = require('./Investment');
const Lending = require('./Lending'); // legacy/simple lending records
const Milestone = require('./Milestone');
const Badge = require('./Badge');
const FinancialScore = require('./FinancialScore');
const AuditLog = require('./AuditLog');
const PaymentIntent = require('./PaymentIntent');
const Notification = require('./Notification');
const ReminderHistory = require('./ReminderHistory');
const Wallet = require('./Wallet');
// Loans v2 P2P models
const P2PLoan = require('./P2PLoan');
const Escrow = require('./Escrow');
// Payment methods
const PaymentMethod = require('./PaymentMethod');
// Subscriptions
const Subscription = require('./Subscription');
const { Limitation, ReserveHold, PayoutRequest, KycRequest, GeoPolicy, IpDenylist, DeviceRule, LimitTier, VelocityCounter, RiskEvent } = require('./Compliance');

module.exports = {
  User,
  Account,
  Transaction,
  Goal,
  Loan,
  Investment,
  Lending,
  Milestone,
  Badge,
  FinancialScore,
  AuditLog,
  PaymentIntent,
  Notification,
  ReminderHistory,
  Wallet,
  // P2P Loans v2
  P2PLoan,
  Escrow,
  // Payment methods
  PaymentMethod,
  // Subscriptions
  Subscription,
  // Compliance & Risk models
  Limitation,
  ReserveHold,
  PayoutRequest,
  KycRequest,
  GeoPolicy,
  IpDenylist,
  DeviceRule,
  LimitTier,
  VelocityCounter,
  RiskEvent
};