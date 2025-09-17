const authRoutes = require('./auth');
const accountsRoutes = require('./accounts');
const goalsRoutes = require('./goals');
const lendingRoutes = require('./lending');
const reportsRoutes = require('./reports');
const loansRoutes = require('./loans');
const investmentsRoutes = require('./investments');
const transactionsRoutes = require('./transactions');
const settingsRoutes = require('./settings');
const notificationsRoutes = require('./notifications');

// Export all routes
module.exports = {
  authRoutes,
  accountsRoutes,
  goalsRoutes,
  lendingRoutes,
  reportsRoutes,
  loansRoutes,
  investmentsRoutes,
  transactionsRoutes,
  settingsRoutes,
  notificationsRoutes
};