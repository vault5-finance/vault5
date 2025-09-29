#!/usr/bin/env node

/**
 * Loans Auto-Deduction Scheduler (P2P Loans v2)
 *
 * Runs periodic auto-deductions for due P2P loans with autoDeduct enabled.
 * - Selects loans where:
 *   - autoDeduct = true
 *   - status in ['active','funded','approved','overdue']
 *   - remainingAmount > 0
 *   - nextPaymentDate <= now
 *   - (nextAutoAttemptAt is null OR nextAutoAttemptAt <= now)
 *   - autoRetryCount < MAX_RETRIES
 * - Attempts settlement transfer borrower -> lender for nextPaymentAmount using escrowService.
 * - On success:
 *   - Applies schedule payment logic (marks installments paid/partial).
 *   - Resets autoRetryCount, clears nextAutoAttemptAt.
 *   - Updates status to 'active' or 'repaid' accordingly.
 * - On insufficient funds:
 *   - Increments autoRetryCount, sets nextAutoAttemptAt = now + RETRY_BACKOFF_HOURS.
 *   - If retry limit reached: leaves status 'overdue' and logs.
 *
 * Usage:
 *  - Cron: every 15 minutes: /usr/bin/node /path/to/vault5/backend/scripts/loans-auto-deduct.js
 *  - Manual: node vault5/backend/scripts/loans-auto-deduct.js
 */

'use strict';

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { loadSecrets } = require('../utils/secretsLoader');
const { P2PLoan } = require('../models');
const escrowService = require('../services/escrowService');

dotenv.config();

// Policy defaults
const MAX_RETRIES = Number(process.env.LOANS_MAX_RETRY || 3);
const RETRY_BACKOFF_HOURS = Number(process.env.LOANS_RETRY_BACKOFF_HOURS || 24);
const BATCH_SIZE = Number(process.env.LOANS_AUTODEDUCT_BATCH || 50);

/**
 * Apply repayment amount to loan schedule in-memory (same logic as controller).
 * Mutates the loan document fields: repaymentSchedule, remainingAmount, nextPaymentDate/Amount, status.
 * @param {import('mongoose').Document & { repaymentSchedule: any[], remainingAmount: number, status: string }} loan
 * @param {number} amount
 */
function applyRepaymentToSchedule(loan, amount) {
  let remainingPay = Math.min(amount, loan.remainingAmount);
  for (const item of loan.repaymentSchedule) {
    if (remainingPay <= 0) break;
    if (item.paid) continue;
    if (remainingPay >= item.amount) {
      remainingPay -= item.amount;
      item.paid = true;
      item.paidDate = new Date();
    } else {
      // Partial on this installment
      item.amount -= remainingPay;
      remainingPay = 0;
    }
  }

  loan.remainingAmount = Math.max(0, loan.remainingAmount - Math.min(amount, loan.remainingAmount));
  const nextItem = loan.repaymentSchedule.find(i => !i.paid);
  loan.nextPaymentDate = nextItem ? nextItem.dueDate : null;
  loan.nextPaymentAmount = nextItem ? nextItem.amount : 0;

  if (loan.remainingAmount === 0) {
    loan.status = 'repaid';
  } else if (loan.nextPaymentDate && loan.nextPaymentDate < new Date()) {
    loan.status = 'overdue';
  } else if (loan.status === 'approved' || loan.status === 'funded' || loan.status === 'overdue') {
    loan.status = 'active';
  }
}

/**
 * Process a single loan auto-deduction attempt.
 * @param {import('mongoose').Document} loan
 * @returns {Promise<{success: boolean, reason?: string}>}
 */
async function processLoanAutoDeduct(loan) {
  const amount = Number(loan.nextPaymentAmount || 0);
  if (!(amount > 0)) {
    // Nothing due
    loan.autoRetryCount = 0;
    loan.nextAutoAttemptAt = null;
    await loan.save();
    return { success: true };
  }

  try {
    await escrowService.settlementTransfer(loan, { amount });
  } catch (e) {
    if (e && e.code === 'INSUFFICIENT_FUNDS') {
      loan.autoRetryCount = Number(loan.autoRetryCount || 0) + 1;
      const next = new Date(Date.now() + RETRY_BACKOFF_HOURS * 60 * 60 * 1000);
      loan.nextAutoAttemptAt = next;
      // If we've reached the max retry threshold, ensure status reflects overdue
      if (loan.autoRetryCount >= MAX_RETRIES) {
        // Do not advance schedule; mark overdue for visibility
        if (loan.status !== 'repaid') {
          loan.status = 'overdue';
        }
      }
      await loan.save();
      return { success: false, reason: 'INSUFFICIENT_FUNDS' };
    }
    // Unknown error: surface and allow retry next cycle
    throw e;
  }

  // Settlement success - apply schedule and reset retry metadata
  applyRepaymentToSchedule(loan, amount);
  loan.autoRetryCount = 0;
  loan.lastAutoAttemptAt = new Date();
  loan.nextAutoAttemptAt = null;
  await loan.save();

  return { success: true };
}

/**
 * Process auto-deductions in batches.
 */
async function runAutoDeductBatch() {
  const now = new Date();
  const q = {
    autoDeduct: true,
    status: { $in: ['active', 'funded', 'approved', 'overdue'] },
    remainingAmount: { $gt: 0 },
    nextPaymentDate: { $ne: null, $lte: now },
    $or: [{ nextAutoAttemptAt: null }, { nextAutoAttemptAt: { $lte: now } }],
    autoRetryCount: { $lt: MAX_RETRIES },
  };

  const loans = await P2PLoan.find(q).sort({ nextPaymentDate: 1 }).limit(BATCH_SIZE);
  const summary = {
    scanned: loans.length,
    attempted: 0,
    succeeded: 0,
    insufficientFunds: 0,
    failed: 0,
    errors: [],
  };

  for (const loan of loans) {
    summary.attempted++;
    try {
      const res = await processLoanAutoDeduct(loan);
      if (res.success) {
        summary.succeeded++;
      } else if (res.reason === 'INSUFFICIENT_FUNDS') {
        summary.insufficientFunds++;
      } else {
        summary.failed++;
      }
    } catch (e) {
      summary.failed++;
      summary.errors.push({ loanId: loan._id, message: e.message });
      // Do not throw; continue processing others
    }
  }

  return summary;
}

/**
 * Entrypoint
 */
async function main() {
  try {
    console.log('[auto-deduct] Start', new Date().toISOString());
    const secretsLoaded = await loadSecrets();
    if (!secretsLoaded) {
      console.warn('[auto-deduct] Secrets not loaded from AWS - using local env');
    }

    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/vault5';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('[auto-deduct] Mongo connected');

    const summary = await runAutoDeductBatch();
    console.log('[auto-deduct] Summary:', summary);

    await mongoose.connection.close();
    console.log('[auto-deduct] Done', new Date().toISOString());
  } catch (err) {
    console.error('[auto-deduct] Error:', err);
    try {
      await mongoose.connection.close();
    } catch {}
    process.exit(1);
  }
}

// If executed directly, run main()
if (require.main === module) {
  // eslint-disable-next-line no-console
  main();
}

// Export for programmatic use (e.g., scheduler routes or workers)
module.exports = {
  runAutoDeductBatch,
  processLoanAutoDeduct,
};