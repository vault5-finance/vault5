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
  FinancialScore
};