const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const {
  P2PLoan,
  Escrow,
  Account,
  Transaction,
  User,
} = require('../models');
const escrowService = require('../services/escrowService');
const { generateNotification } = require('./notificationsController');

// Policy defaults (can be overridden with environment variables)
const LOANS_2FA_THRESHOLD = Number(process.env.LOANS_2FA_THRESHOLD || 10000); // KES
const DAILY_BORROW_LIMIT = Number(process.env.LOANS_DAILY_LIMIT || 1);
const COOLING_HOURS = Number(process.env.LOANS_COOLING_HOURS || 48);
const GRACE_DAYS = Number(process.env.LOANS_GRACE_DAYS || 3);
const MAX_RETRIES = Number(process.env.LOANS_MAX_RETRY || 3);
const RETRY_BACKOFF_HOURS = Number(process.env.LOANS_RETRY_BACKOFF_HOURS || 24);
const DEFAULT_CURRENCY = process.env.DEFAULT_CURRENCY || 'KES';

// Helper: sum balances for all accounts of a user (privacy-safe consumer only receives derived caps)
async function sumUserBalances(userId) {
  const accounts = await Account.find({ user: userId }).select({ balance: 1 }).lean();
  return accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);
}

// Helper: compute eligibility without exposing raw balances
async function computeEligibility(borrowerId, lenderId) {
  const borrowerSum = await sumUserBalances(borrowerId);
  const lenderSum = await sumUserBalances(lenderId);
  const borrowerLimit = 0.75 * borrowerSum;
  const lenderLimit = 0.75 * lenderSum;
  const maxBorrowable = Math.max(0, Math.min(borrowerLimit, lenderLimit));

  // Simple protection score heuristic
  const protectionScore = lenderSum > 0 ? Math.min(1, (lenderLimit / (borrowerLimit + 1)) * 0.5 + 0.5) : 0.6;

  return {
    maxBorrowable: Math.floor(maxBorrowable),
    borrowerLimit: Math.floor(borrowerLimit),
    lenderLimit: Math.floor(lenderLimit),
    protectionScore: Number(protectionScore.toFixed(2)),
    requiredVerification: ['password', ...(maxBorrowable >= LOANS_2FA_THRESHOLD ? ['2fa_if_over_threshold'] : [])]
  };
}

// Helper: build repayment schedule
function buildRepaymentSchedule({ principal, interestRate = 0, scheduleType, frequency, installments = 1, firstPaymentDate, currency = DEFAULT_CURRENCY }) {
  const totalAmount = principal * (1 + (interestRate || 0));
  const start = firstPaymentDate ? new Date(firstPaymentDate) : new Date();
  const schedule = [];

  if (scheduleType === 'one-off' || installments <= 1) {
    schedule.push({ dueDate: start, amount: Math.round(totalAmount), paid: false });
  } else {
    const per = Math.round(totalAmount / installments);
    let date = new Date(start);
    for (let i = 0; i < installments; i++) {
      schedule.push({ dueDate: new Date(date), amount: per, paid: false });
      if (frequency === 'daily') {
        date.setDate(date.getDate() + 1);
      } else if (frequency === 'weekly') {
        date.setDate(date.getDate() + 7);
      } else if (frequency === 'biweekly') {
        date.setDate(date.getDate() + 14);
      } else { // monthly or default
        date.setMonth(date.getMonth() + 1);
      }
    }
    // Adjust for rounding differences on last item
    const scheduledSum = schedule.reduce((s, it) => s + it.amount, 0);
    if (scheduledSum !== Math.round(totalAmount)) {
      const diff = Math.round(totalAmount) - scheduledSum;
      schedule[schedule.length - 1].amount += diff;
    }
  }

  const nextItem = schedule.find(it => !it.paid);
  return {
    totalAmount: Math.round(totalAmount),
    schedule,
    nextPaymentDate: nextItem ? nextItem.dueDate : null,
    nextPaymentAmount: nextItem ? nextItem.amount : 0,
    currency
  };
}

// POST /api/p2p-loans/eligibility-check
async function eligibilityCheck(req, res) {
  try {
    const { targetContact } = req.body || {};
    if (!targetContact || (typeof targetContact !== 'object')) {
      return res.status(400).json({ message: 'targetContact is required { email | phone }' });
    }

    // Resolve lender by email or phone
    const match = [];
    if (targetContact.email) match.push({ 'emails.email': String(targetContact.email).toLowerCase() });
    if (targetContact.phone) match.push({ 'phones.phone': String(targetContact.phone) });

    if (match.length === 0) {
      return res.status(400).json({ message: 'Provide email or phone in targetContact' });
    }

    const lender = await User.findOne({ $or: match }).select({ _id: 1 });
    if (!lender) {
      // For non Vault users, still return conservative suggestion
      return res.json({
        eligibility: {
          maxBorrowableForThisPair: 0,
          suggestedAmount: 0,
          lenderResponseTimeHint: 'unknown',
          lenderProtectionScore: 0.5,
          requiredVerification: ['password']
        }
      });
    }

    const { maxBorrowable, borrowerLimit, lenderLimit, protectionScore, requiredVerification } =
      await computeEligibility(req.user._id, lender._id);

    const suggestedAmount = Math.floor(maxBorrowable * 0.7); // conservative suggestion

    return res.json({
      eligibility: {
        maxBorrowableForThisPair: maxBorrowable,
        suggestedAmount,
        lenderResponseTimeHint: 'usually within 2 hours',
        lenderProtectionScore: protectionScore,
        requiredVerification
      }
    });
  } catch (err) {
    console.error('eligibilityCheck error:', err);
    return res.status(500).json({ message: err.message });
  }
}

// GET /api/p2p-loans
async function listLoans(req, res) {
  try {
    const userId = req.user._id;

    const [borrowed, lent] = await Promise.all([
      P2PLoan.find({ borrowerId: userId }).sort({ createdAt: -1 }).lean(),
      P2PLoan.find({ lenderId: userId }).sort({ createdAt: -1 }).lean(),
    ]);

    const summary = {
      activeLoans: [...borrowed, ...lent].filter(l => ['active', 'funded', 'approved', 'overdue'].includes(l.status)).length,
      pendingApprovals: lent.filter(l => l.status === 'pending_approval').length,
      overdueAmount: borrowed.filter(l => l.status === 'overdue').reduce((s, l) => s + (l.remainingAmount || 0), 0),
    };

    // Redact as needed; no raw balance exposure present in this model
    return res.json({
      success: true,
      data: { borrowed, lent, summary }
    });
  } catch (err) {
    console.error('listLoans error:', err);
    return res.status(500).json({ message: err.message });
  }
}

// POST /api/p2p-loans
async function createLoanRequest(req, res) {
  try {
    const {
      contact, // { email | phone }
      amount,
      schedule = {}, // { type, frequency, installments, firstPaymentDate, autoDeduct }
      purpose = '',
      autoApprove = false,
      interestRate = Number(process.env.DEFAULT_LOAN_INTEREST || 0)
    } = req.body || {};

    if (!contact || (!contact.email && !contact.phone)) {
      return res.status(400).json({ message: 'contact { email | phone } is required' });
    }
    const requestedAmount = Number(amount || 0);
    if (!(requestedAmount > 0)) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    // Resolve lender
    const lender = await User.findOne({
      $or: [
        contact.email ? { 'emails.email': String(contact.email).toLowerCase() } : null,
        contact.phone ? { 'phones.phone': String(contact.phone) } : null
      ].filter(Boolean)
    }).select({ _id: 1 });

    if (!lender) {
      return res.status(404).json({ message: 'Lender not found on Vault5' });
    }
    if (String(lender._id) === String(req.user._id)) {
      return res.status(400).json({ message: 'Cannot request a loan from yourself' });
    }

    // Enforce daily borrow limit: count today created
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayCount = await P2PLoan.countDocuments({
      borrowerId: req.user._id,
      createdAt: { $gte: today }
    });
    if (todayCount >= DAILY_BORROW_LIMIT) {
      return res.status(422).json({ message: 'Daily borrow limit reached' });
    }

    // Eligibility
    const eligibility = await computeEligibility(req.user._id, lender._id);
    const recommended = Math.min(requestedAmount, eligibility.maxBorrowable);
    if (recommended <= 0) {
      return res.status(422).json({
        message: 'Requested amount exceeds allowed capacity for this borrower-lender pair',
        eligibilitySummary: eligibility
      });
    }

    // Build schedule preview
    const scheduleType = schedule.type || (schedule.installments && schedule.installments > 1 ? 'installments' : 'one-off');
    const frequency = schedule.frequency || (scheduleType === 'installments' ? 'weekly' : 'custom');
    const installments = schedule.installments || (scheduleType === 'installments' ? 4 : 1);
    const preview = buildRepaymentSchedule({
      principal: recommended,
      interestRate,
      scheduleType,
      frequency,
      installments,
      firstPaymentDate: schedule.firstPaymentDate
    });

    const coolingOffExpiry = new Date(Date.now() + COOLING_HOURS * 60 * 60 * 1000);

    // Create P2P loan request
    const loan = await P2PLoan.create({
      borrowerId: req.user._id,
      lenderId: lender._id,
      principal: recommended,
      interestRate,
      currency: DEFAULT_CURRENCY,
      totalAmount: preview.totalAmount,
      remainingAmount: preview.totalAmount,
      nextPaymentDate: preview.nextPaymentDate,
      nextPaymentAmount: preview.nextPaymentAmount,
      status: 'pending_approval',
      scheduleType,
      scheduleFrequency: frequency,
      repaymentSchedule: preview.schedule,
      autoDeduct: Boolean(schedule.autoDeduct ?? true),
      accountDeductionId: schedule.accountDeductionId || null,
      protectionScore: eligibility.protectionScore,
      borrowerCreditScoreAtRequest: 0,
      lenderLimitAtApproval: eligibility.lenderLimit,
      borrowerLimitAtApproval: eligibility.borrowerLimit,
      purpose,
      coolingOffExpiry
    });

    // Notify lender of a new loan request (using existing enum 'outstanding_lending')
    try {
      await generateNotification(
        lender._id,
        'outstanding_lending',
        'New Loan Request',
        `${req.user.name || 'A contact'} requested KES ${recommended.toLocaleString()} as a P2P loan.`,
        loan._id,
        'high',
        {
          loanId: loan._id,
          borrowerId: String(req.user._id),
          amount: recommended,
          currency: DEFAULT_CURRENCY,
          scheduleType,
          frequency
        }
      );
    } catch (e) { /* non-blocking */ }

    return res.status(201).json({
      success: true,
      data: {
        loanId: loan._id,
        status: loan.status,
        eligibilitySummary: {
          maxBorrowable: eligibility.maxBorrowable,
          borrowerLimit: eligibility.borrowerLimit,
          lenderLimit: eligibility.lenderLimit,
          protectionScore: eligibility.protectionScore
        },
        estimatedRepayment: {
          installmentAmount: preview.schedule[0]?.amount || preview.totalAmount,
          totalAmount: preview.totalAmount,
          firstPaymentDate: preview.nextPaymentDate
        }
      }
    });
  } catch (err) {
    console.error('createLoanRequest error:', err);
    return res.status(500).json({ message: err.message });
  }
}

// GET /api/p2p-loans/:id
async function getLoan(req, res) {
  try {
    const loan = await P2PLoan.findById(req.params.id);
    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    const uid = String(req.user._id);
    if (String(loan.borrowerId) !== uid && String(loan.lenderId) !== uid) {
      return res.status(403).json({ message: 'Not authorized to view this loan' });
    }

    return res.json({ success: true, data: loan });
  } catch (err) {
    console.error('getLoan error:', err);
    return res.status(500).json({ message: err.message });
  }
}

// POST /api/p2p-loans/:id/approve
async function approveLoan(req, res) {
  try {
    const { disburseImmediately = true, disburseAt = null } = req.body || {};
    const loan = req.loan || await P2PLoan.findById(req.params.id);
    if (!loan) return res.status(404).json({ message: 'Loan not found' });
 
    if (String(loan.lenderId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only lender can approve this loan' });
    }
    if (loan.status !== 'pending_approval') {
      return res.status(400).json({ message: 'Loan is not pending approval' });
    }
 
    // If re-auth middleware didn't run, verify here (fallback)
    if (!req.reAuthOk) {
      const { password, twoFactorCode } = req.body || {};
      const lenderFull = await User.findById(req.user._id).select('+password');
      if (!lenderFull || !(await bcrypt.compare(String(password || ''), lenderFull.password))) {
        return res.status(401).json({ message: 'Password verification failed' });
      }
      if (loan.principal >= LOANS_2FA_THRESHOLD) {
        if (!twoFactorCode || String(twoFactorCode).length < 4) {
          return res.status(401).json({ message: '2FA required for this approval' });
        }
        // TODO: verify twoFactorCode against provider
      }
    }
 
    // Create escrow record and mark as held
    const escrow = await Escrow.create({
      loanId: loan._id,
      lenderId: loan.lenderId,
      borrowerId: loan.borrowerId,
      amountHeld: loan.principal,
      holdStatus: 'held',
      protectionDetails: {
        requireAck: false,
        releaseAfter: disburseAt ? new Date(disburseAt) : null,
        notes: 'Auto-created on approval'
      }
    });
 
    loan.escrowId = escrow._id;
    loan.escrowStatus = 'held';
    loan.status = 'approved';
    await loan.save();
 
    // Hold funds from lender accounts (atomic)
    try {
      await escrowService.holdFunds(loan);
    } catch (e) {
      // Rollback visible state if hold failed
      loan.status = 'pending_approval';
      loan.escrowStatus = 'none';
      await loan.save();
      return res.status(422).json({
        message: e.message || 'Unable to hold funds for escrow',
        code: e.code || 'ESCROW_HOLD_FAILED',
        meta: { required: loan.principal, ...(e.totalAvailable !== undefined ? { totalAvailable: e.totalAvailable } : {}) }
      });
    }
 
    // Optionally disburse immediately
    let disbursementTxId = null;
    if (disburseImmediately) {
      const disb = await escrowService.disburse(loan);
      disbursementTxId = disb.transactionId;
    }
 
    const updated = await P2PLoan.findById(loan._id).lean();
 
    // Notifications: lender debited (hold), borrower credited (if disbursed)
    try {
      await generateNotification(
        loan.lenderId,
        'money_debited',
        'Loan Funds Held in Escrow',
        `KES ${loan.principal.toLocaleString()} reserved for borrower.`,
        loan._id,
        'medium',
        { loanId: loan._id, amount: loan.principal, escrowId: escrow._id }
      );
      if (disburseImmediately) {
        await generateNotification(
          loan.borrowerId,
          'money_received',
          'Loan Disbursed',
          `You received KES ${loan.principal.toLocaleString()} from your lender.`,
          loan._id,
          'high',
          { loanId: loan._id, amount: loan.principal, escrowId: escrow._id }
        );
      }
    } catch (e) { /* non-blocking */ }

    return res.json({
      success: true,
      data: {
        loanId: updated._id,
        status: updated.status,
        escrowTxId: escrow._id,
        disbursementTxId,
        nextSteps: disburseImmediately
          ? ['Funds disbursed to borrower', 'Repayment schedule is active']
          : ['Funds held in escrow', 'Lender may disburse later'],
        securityInfo: {
          escrowProtected: true,
          twoFactorRequired: updated.principal >= LOANS_2FA_THRESHOLD,
          lenderProtectionScore: updated.protectionScore
        }
      }
    });
  } catch (err) {
    console.error('approveLoan error:', err);
    return res.status(500).json({ message: err.message });
  }
}

// POST /api/p2p-loans/:id/decline
async function declineLoan(req, res) {
  try {
    const loan = await P2PLoan.findById(req.params.id);
    if (!loan) return res.status(404).json({ message: 'Loan not found' });
    if (String(loan.lenderId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only lender can decline this loan' });
    }
    if (loan.status !== 'pending_approval') {
      return res.status(400).json({ message: 'Loan is not pending approval' });
    }
    loan.status = 'declined';
    await loan.save();

    // Notify both parties
    try {
      await generateNotification(
        loan.borrowerId,
        'outstanding_lending',
        'Loan Request Declined',
        'Your loan request was declined by the lender.',
        loan._id,
        'medium',
        { loanId: loan._id }
      );
      await generateNotification(
        loan.lenderId,
        'outstanding_lending',
        'Loan Request Declined',
        'You declined a pending loan request.',
        loan._id,
        'low',
        { loanId: loan._id }
      );
    } catch (e) { /* non-blocking */ }

    return res.json({ success: true, data: { status: 'declined' } });
  } catch (err) {
    console.error('declineLoan error:', err);
    return res.status(500).json({ message: err.message });
  }
}

// POST /api/p2p-loans/:id/repay
async function repayLoan(req, res) {
  try {
    const { amount, paymentMethod = 'wallet', autoPay = false } = req.body || {};
    const loan = await P2PLoan.findById(req.params.id);
    if (!loan) return res.status(404).json({ message: 'Loan not found' });
 
    const uid = String(req.user._id);
    if (String(loan.borrowerId) !== uid && String(loan.lenderId) !== uid) {
      return res.status(403).json({ message: 'Not authorized to operate on this loan' });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }
    if (!['active', 'overdue', 'funded', 'approved'].includes(loan.status)) {
      return res.status(400).json({ message: `Loan not in repayable state: ${loan.status}` });
    }
 
    // Move money borrower -> lender (atomic)
    let transferRes;
    try {
      transferRes = await escrowService.settlementTransfer(loan, { amount });
    } catch (e) {
      if (e && e.code === 'INSUFFICIENT_FUNDS') {
        return res.status(400).json({ message: 'Insufficient borrower funds' });
      }
      throw e;
    }
 
    // Apply to earliest unpaid schedule entries
    let remainingPay = Math.min(amount, loan.remainingAmount);
    for (const item of loan.repaymentSchedule) {
      if (remainingPay <= 0) break;
      if (item.paid) continue;
      if (remainingPay >= item.amount) {
        remainingPay -= item.amount;
        item.paid = true;
        item.paidDate = new Date();
      } else {
        // Partial pay on this installment
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
    } else if (loan.status === 'approved' || loan.status === 'funded') {
      loan.status = 'active';
    }
    await loan.save();

    // Notifications for repayment
    try {
      await generateNotification(
        loan.lenderId,
        'money_received',
        'Loan Repayment Received',
        `KES ${Number(amount).toLocaleString()} received from borrower.`,
        loan._id,
        'high',
        { loanId: loan._id, amount: Number(amount), borrowerTxId: transferRes.borrowerTxId, lenderTxId: transferRes.lenderTxId }
      );
      await generateNotification(
        loan.borrowerId,
        'money_debited',
        'Loan Repayment Sent',
        `You repaid KES ${Number(amount).toLocaleString()} to your lender.`,
        loan._id,
        'medium',
        { loanId: loan._id, amount: Number(amount), borrowerTxId: transferRes.borrowerTxId }
      );
    } catch (e) { /* non-blocking */ }
 
    return res.json({
      success: true,
      data: {
        borrowerTxId: transferRes.borrowerTxId,
        lenderTxId: transferRes.lenderTxId,
        remainingAmount: loan.remainingAmount,
        nextPaymentDate: loan.nextPaymentDate,
        nextPaymentAmount: loan.nextPaymentAmount,
        creditScoreDelta: 0,
        rewards: {}
      }
    });
  } catch (err) {
    console.error('repayLoan error:', err);
    return res.status(500).json({ message: err.message });
  }
}

// POST /api/p2p-loans/:id/reschedule
async function rescheduleLoan(req, res) {
  try {
    const { proposedSchedule } = req.body || {};
    const loan = await P2PLoan.findById(req.params.id);
    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    const uid = String(req.user._id);
    if (String(loan.borrowerId) !== uid && String(loan.lenderId) !== uid) {
      return res.status(403).json({ message: 'Not authorized to modify this loan' });
    }
    if (!proposedSchedule) {
      return res.status(400).json({ message: 'proposedSchedule is required' });
    }

    // Store proposal in notes (MVP). In a full version we would create a separate change-request record requiring lender approval.
    loan.notes = `[Reschedule Request @${new Date().toISOString()}] ${JSON.stringify(proposedSchedule).slice(0, 1000)}\n${loan.notes || ''}`;
    await loan.save();

    return res.json({ success: true, data: { status: 'pending_reschedule_review' } });
  } catch (err) {
    console.error('rescheduleLoan error:', err);
    return res.status(500).json({ message: err.message });
  }
}

// POST /api/p2p-loans/:id/writeoff
async function writeoffLoan(req, res) {
  try {
    const loan = await P2PLoan.findById(req.params.id);
    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    // Allow lender or admin-like roles to writeoff (MVP: lender only)
    if (String(loan.lenderId) !== String(req.user._id) && req.user.role === 'user') {
      return res.status(403).json({ message: 'Not authorized to write off this loan' });
    }

    loan.status = 'written_off';
    await loan.save();

    // Notify both parties
    try {
      await generateNotification(
        loan.borrowerId,
        'outstanding_lending',
        'Loan Written Off',
        'Your lender wrote off the remaining balance.',
        loan._id,
        'medium',
        { loanId: loan._id }
      );
      await generateNotification(
        loan.lenderId,
        'outstanding_lending',
        'Loan Written Off',
        'You wrote off this loan.',
        loan._id,
        'low',
        { loanId: loan._id }
      );
    } catch (e) { /* non-blocking */ }
 
    return res.json({ success: true, data: { status: 'written_off' } });
  } catch (err) {
    console.error('writeoffLoan error:', err);
    return res.status(500).json({ message: err.message });
  }
}

module.exports = {
  eligibilityCheck,
  listLoans,
  createLoanRequest,
  getLoan,
  approveLoan,
  declineLoan,
  repayLoan,
  rescheduleLoan,
  writeoffLoan
};