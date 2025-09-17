// Backend Controllers for Vault5 - Centralized Export

const authController = require('./authController');
const accountsController = require('./accountsController');
const goalsController = require('./goalsController');
const lendingController = require('./lendingController');
const reportsController = require('./reportsController');

module.exports = {
  authController,
  accountsController,
  goalsController,
  lendingController,
  reportsController
};