// Vault5 Backend Models - Centralized Export

const User = require('./User');
const Account = require('./Account');
const Transaction = require('./Transaction');
const Goal = require('./Goal');
const Loan = require('./Loan');
const Investment = require('./Investment');
const Lending = require('./Lending');
const Milestone = require('./Milestone');
const Badge = require('./Badge');
const FinancialScore = require('./FinancialScore');
const AuditLog = require('./AuditLog');
const PaymentIntent = require('./PaymentIntent');
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