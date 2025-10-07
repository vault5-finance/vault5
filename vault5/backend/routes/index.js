const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const adminComplianceRoutes = require('./adminCompliance');
const adminFinanceRoutes = require('./adminFinance');
const adminSupportRoutes = require('./adminSupport');
const adminContentRoutes = require('./adminContent');
const adminSystemRoutes = require('./adminSystem');
const adminAccountsRoutes = require('./adminAccounts');
const legalRoutes = require('./legal');
const accountsRoutes = require('./accounts');
const goalsRoutes = require('./goals');
const lendingRoutes = require('./lending');
const reportsRoutes = require('./reports');
const loansRoutes = require('./loans');
const p2pLoansRoutes = require('./p2pLoans');
const investmentsRoutes = require('./investments');
const transactionsRoutes = require('./transactions');
const settingsRoutes = require('./settings');
const notificationsRoutes = require('./notifications');
const recommendationsRoutes = require('./recommendations');
const gamificationRoutes = require('./gamification');
const receiptsRoutes = require('./receipts');
const complianceRoutes = require('./compliance');
const paymentsRoutes = require('./payments');
const paymentMethodsRoutes = require('./paymentMethods');
const subscriptionsRoutes = require('./subscriptions');
const schedulerRoutes = require('./scheduler');
const gracePeriodRoutes = require('./gracePeriod');
const adminReminderRoutes = require('./adminReminder');

// Export all routes
module.exports = {
  authRoutes,
  adminRoutes,
  adminComplianceRoutes,
  adminFinanceRoutes,
  adminSupportRoutes,
  adminContentRoutes,
  adminSystemRoutes,
  adminAccountsRoutes,
  legalRoutes,
  accountsRoutes,
  goalsRoutes,
  lendingRoutes,
  reportsRoutes,
  loansRoutes,
  p2pLoansRoutes,
  investmentsRoutes,
  transactionsRoutes,
  settingsRoutes,
  notificationsRoutes,
  recommendationsRoutes,
  gamificationRoutes,
  receiptsRoutes,
  complianceRoutes,
  paymentsRoutes,
  paymentMethodsRoutes,
  subscriptionsRoutes,
  schedulerRoutes,
  gracePeriodRoutes,
  adminReminderRoutes
};