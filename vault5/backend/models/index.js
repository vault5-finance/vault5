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
// Loans v2 P2P models
const P2PLoan = require('./P2PLoan');
const Escrow = require('./Escrow');
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
  // P2P Loans v2
  P2PLoan,
  Escrow,
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