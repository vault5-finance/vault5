'use strict';

const bcrypt = require('bcryptjs');
const { User, P2PLoan } = require('../models');

/**
 * Middleware: Re-authenticate user with password and, if threshold is met, require 2FA code.
 * Specific to P2P Loan approval workflow:
 *  - Loads loan by :id and attaches as req.loan
 *  - Ensures current user is the lender for this loan
 *  - Verifies password against current user's hash
 *  - If loan.principal >= LOANS_2FA_THRESHOLD, requires twoFactorCode presence (MVP: format check)
 *
 * Inputs (from request body):
 *  - password: string (required)
 *  - twoFactorCode: string (required only if over threshold)
 *
 * Env:
 *  - LOANS_2FA_THRESHOLD (number, default 10000)
 */
async function reAuth2FAP2PLoan(req, res, next) {
  try {
    const threshold = Number(process.env.LOANS_2FA_THRESHOLD || 10000);
    const loanId = req.params.id;

    const loan = await P2PLoan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    // Only lender can approve
    if (String(loan.lenderId) !== String(req.user?._id)) {
      return res.status(403).json({ message: 'Only lender can approve this loan' });
    }

    const { password, twoFactorCode } = req.body || {};
    if (!password || String(password).length < 4) {
      return res.status(401).json({ message: 'Password is required' });
    }

    const lenderFull = await User.findById(req.user._id).select('+password');
    if (!lenderFull || !(await bcrypt.compare(String(password), lenderFull.password))) {
      return res.status(401).json({ message: 'Password verification failed' });
    }

    if (Number(loan.principal) >= threshold) {
      if (!twoFactorCode || String(twoFactorCode).length < 4) {
        return res.status(401).json({ message: '2FA required for this approval' });
      }
      // TODO: Integrate real 2FA provider verification for non-dev environments
    }

    // Attach loan to req to avoid re-fetch in controller
    req.loan = loan;
    req.reAuthOk = true;

    return next();
  } catch (err) {
    // Avoid leaking sensitive detail
    return res.status(500).json({ message: 'Re-authentication failed' });
  }
}

module.exports = {
  reAuth2FAP2PLoan,
};