// Backend Middleware for Vault5
// Central export hub for middleware

const { protect, authorize } = require('./auth');
const {
  geoGate,
  ipDenyGate,
  deviceGate,
  limitationGate,
  limitationGateOutgoing,
  capsGate,
  velocityGate,
  loanEligibilityGate,
} = require('./compliance');

module.exports = {
  protect,
  authorize,
  geoGate,
  ipDenyGate,
  deviceGate,
  limitationGate,
  limitationGateOutgoing,
  capsGate,
  velocityGate,
  loanEligibilityGate,
};