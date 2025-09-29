'use strict';

const mongoose = require('mongoose');
const { Account, Transaction, Escrow, P2PLoan } = require('../models');
const { generateUniqueTransactionCode } = require('../utils/txCode');

/**
 * Lending pull priorities and default distribution
 * - Never touch Emergency or LongTerm by default
 * - Order: Fun (50%) -> Charity (30%) -> Daily (20%)
 */
const DEFAULT_DISTRIBUTION = [
  { type: 'Fun', weight: 0.50 },
  { type: 'Charity', weight: 0.30 },
  { type: 'Daily', weight: 0.20 },
];

/**
 * Compute a safe pull plan from lender accounts according to DEFAULT_DISTRIBUTION,
 * capping by available balances.
 *
 * @param {mongoose.Types.ObjectId} lenderId
 * @param {number} total
 * @returns {Promise<{plan: Array<{account: any, amount: number}>, totalAvailable: number}>}
 */
async function computePullPlan(lenderId, total) {
  const types = DEFAULT_DISTRIBUTION.map(d => d.type);
  const accounts = await Account.find({ user: lenderId, type: { $in: types } }).lean();
  const byType = Object.fromEntries(accounts.map(a => [a.type, a]));
  const totalAvailable = accounts.reduce((s, a) => s + Number(a.balance || 0), 0);

  // Initial target per weights
  const targets = DEFAULT_DISTRIBUTION.map(d => ({
    type: d.type,
    target: Math.floor(total * d.weight),
    available: Math.floor((byType[d.type]?.balance ?? 0)),
  }));

  // Adjust last target to fix rounding sum drift
  const tSum = targets.reduce((s, t) => s + t.target, 0);
  if (tSum !== total && targets.length > 0) {
    targets[targets.length - 1].target += (total - tSum);
  }

  // Clamp by available and then re-distribute shortage greedily in priority order
  const clamped = targets.map(t => ({ type: t.type, amount: Math.min(t.target, t.available) }));
  let granted = clamped.reduce((s, t) => s + t.amount, 0);
  let shortage = total - granted;

  if (shortage > 0) {
    for (const d of DEFAULT_DISTRIBUTION) {
      const idx = clamped.findIndex(x => x.type === d.type);
      const acc = byType[d.type];
      if (!acc) continue;
      const available = Math.floor((acc.balance ?? 0)) - clamped[idx].amount;
      if (available <= 0) continue;
      const give = Math.min(available, shortage);
      clamped[idx].amount += give;
      shortage -= give;
      if (shortage <= 0) break;
    }
  }

  const plan = clamped
    .filter(x => x.amount > 0)
    .map(x => ({ account: byType[x.type], amount: x.amount }));

  return { plan, totalAvailable };
}

/**
 * Hold lender funds into escrow (atomic).
 * - Deducts from lender's Fun/Charity/Daily according to DEFAULT_DISTRIBUTION
 * - Creates expense Transactions for the lender per account deduction
 * - Leaves Escrow document with amountHeld (created by controller)
 *
 * @param {P2PLoan} loan
 * @returns {Promise<{plan: Array, txIds: string[]}>}
 */
async function holdFunds(loan) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const amount = Number(loan.principal);
    if (!(amount > 0)) throw new Error('Invalid principal');

    const { plan, totalAvailable } = await computePullPlan(loan.lenderId, amount);
    const sumPlan = plan.reduce((s, p) => s + p.amount, 0);
    if (sumPlan < amount) {
      throw Object.assign(new Error('Insufficient lending capacity across allowed accounts'), {
        code: 'INSUFFICIENT_LENDING_CAPACITY',
        totalAvailable,
        required: amount,
        allowed: sumPlan,
      });
    }

    const txIds = [];

    for (const { account, amount: amt } of plan) {
      // Atomic balance decrement
      const updated = await Account.findOneAndUpdate(
        { _id: account._id, balance: { $gte: amt } },
        { $inc: { balance: -amt } },
        { new: true, session }
      );
      if (!updated) {
        throw new Error(`Insufficient balance in ${account.type}`);
      }

      // Expense transaction for lender
      const code = await generateUniqueTransactionCode(Transaction);
      const tx = await Transaction.create(
        [{
          user: loan.lenderId,
          amount: amt,
          type: 'expense',
          description: `P2P loan hold for loan ${loan._id}`,
          tag: 'p2p_loan_hold',
          currency: loan.currency || 'KES',
          transactionCode: code,
          allocations: [{ account: updated._id, amount: amt }],
        }],
        { session }
      );
      txIds.push(String(tx[0]._id));
    }

    // Escrow exists; leave amountHeld as is, optionally sanity check
    if (loan.escrowId) {
      await Escrow.updateOne(
        { _id: loan.escrowId },
        { $set: { amountHeld: amount, holdStatus: 'held' } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();
    return { plan, txIds };
  } catch (err) {
    await session.abortTransaction().catch(() => {});
    session.endSession();
    throw err;
  }
}

/**
 * Disburse held funds to borrower (atomic).
 * - Credits borrower's Daily account (or first available if missing)
 * - Creates income Transaction for borrower
 * - Marks Escrow released/disbursed
 *
 * @param {P2PLoan} loan
 * @returns {Promise<{transactionId: string, accountId: string}>}
 */
async function disburse(loan) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const amount = Number(loan.principal);
    const borrowerAccounts = await Account.find({ user: loan.borrowerId }).session(session);
    let dest = borrowerAccounts.find(a => a.type === 'Daily') || borrowerAccounts[0];
    if (!dest) {
      throw new Error('Borrower has no destination account');
    }

    // Credit borrower account
    dest.balance = Number(dest.balance || 0) + amount;
    await dest.save({ session });

    // Income transaction
    const code = await generateUniqueTransactionCode(Transaction);
    const txDoc = await Transaction.create(
      [{
        user: loan.borrowerId,
        amount,
        type: 'income',
        description: `P2P loan disbursement for loan ${loan._id}`,
        tag: 'p2p_loan_disburse',
        currency: loan.currency || 'KES',
        transactionCode: code,
        allocations: [{ account: dest._id, amount }],
      }],
      { session }
    );

    // Escrow release
    if (loan.escrowId) {
      await Escrow.updateOne(
        { _id: loan.escrowId },
        { $set: { holdStatus: 'released', disbursementTxId: txDoc[0]._id, releasedAt: new Date() } },
        { session }
      );
    }

    // Update loan flags
    await P2PLoan.updateOne(
      { _id: loan._id },
      { $set: { escrowStatus: 'disbursed', status: 'active' } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return { transactionId: String(txDoc[0]._id), accountId: String(dest._id) };
  } catch (err) {
    await session.abortTransaction().catch(() => {});
    session.endSession();
    throw err;
  }
}

/**
 * Transfer a repayment from borrower to lender (atomic).
 * - Debits borrower (Daily or loan.accountDeductionId)
 * - Credits lender (Daily)
 * - Creates two Transactions (expense for borrower, income for lender)
 *
 * @param {P2PLoan} loan
 * @param {{ amount: number, payerId?: string }} opts
 * @returns {Promise<{borrowerTxId: string, lenderTxId: string}>}
 */
async function settlementTransfer(loan, { amount, payerId } = {}) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const amt = Number(amount);
    if (!(amt > 0)) throw new Error('Invalid repayment amount');

    // Borrower side
    const borrowerAccounts = await Account.find({ user: loan.borrowerId }).session(session);
    const borrowerPreferred = loan.accountDeductionId
      ? borrowerAccounts.find(a => String(a._id) === String(loan.accountDeductionId))
      : borrowerAccounts.find(a => a.type === 'Daily') || borrowerAccounts[0];
    if (!borrowerPreferred) throw new Error('Borrower has no deduction account');

    const borrowerUpdated = await Account.findOneAndUpdate(
      { _id: borrowerPreferred._id, balance: { $gte: amt } },
      { $inc: { balance: -amt } },
      { new: true, session }
    );
    if (!borrowerUpdated) throw Object.assign(new Error('Insufficient borrower funds'), { code: 'INSUFFICIENT_FUNDS' });

    const borrowerCode = await generateUniqueTransactionCode(Transaction);
    const borrowerTx = await Transaction.create(
      [{
        user: loan.borrowerId,
        amount: amt,
        type: 'expense',
        description: `P2P loan repayment for loan ${loan._id}`,
        tag: 'p2p_loan_repay',
        currency: loan.currency || 'KES',
        transactionCode: borrowerCode,
        allocations: [{ account: borrowerUpdated._id, amount: amt }],
      }],
      { session }
    );

    // Lender side
    const lenderAccounts = await Account.find({ user: loan.lenderId }).session(session);
    const lenderDest = lenderAccounts.find(a => a.type === 'Daily') || lenderAccounts[0];
    if (!lenderDest) throw new Error('Lender has no destination account');

    lenderDest.balance = Number(lenderDest.balance || 0) + amt;
    await lenderDest.save({ session });

    const lenderCode = await generateUniqueTransactionCode(Transaction);
    const lenderTx = await Transaction.create(
      [{
        user: loan.lenderId,
        amount: amt,
        type: 'income',
        description: `P2P loan repayment received for loan ${loan._id}`,
        tag: 'p2p_loan_repay_receive',
        currency: loan.currency || 'KES',
        transactionCode: lenderCode,
        allocations: [{ account: lenderDest._id, amount: amt }],
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return { borrowerTxId: String(borrowerTx[0]._id), lenderTxId: String(lenderTx[0]._id) };
  } catch (err) {
    await session.abortTransaction().catch(() => {});
    session.endSession();
    throw err;
  }
}

/**
 * Refund escrow to lender if loan is cancelled before disbursement.
 * - Credits lender Daily account with amountHeld
 * - Marks Escrow refunded
 *
 * @param {P2PLoan} loan
 * @returns {Promise<{refundTxId: string}>}
 */
async function refund(loan) {
  if (!loan.escrowId) throw new Error('No escrow to refund');
  const escrow = await Escrow.findById(loan.escrowId);
  if (!escrow) throw new Error('Escrow not found');
  if (escrow.holdStatus !== 'held') throw new Error('Escrow not in held state');

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const amt = Number(escrow.amountHeld || 0);
    const lenderAccounts = await Account.find({ user: loan.lenderId }).session(session);
    const dest = lenderAccounts.find(a => a.type === 'Daily') || lenderAccounts[0];
    if (!dest) throw new Error('Lender has no destination account');

    dest.balance = Number(dest.balance || 0) + amt;
    await dest.save({ session });

    const code = await generateUniqueTransactionCode(Transaction);
    const tx = await Transaction.create(
      [{
        user: loan.lenderId,
        amount: amt,
        type: 'income',
        description: `P2P loan escrow refund for loan ${loan._id}`,
        tag: 'p2p_loan_refund',
        currency: loan.currency || 'KES',
        transactionCode: code,
        allocations: [{ account: dest._id, amount: amt }],
      }],
      { session }
    );

    await Escrow.updateOne(
      { _id: escrow._id },
      { $set: { holdStatus: 'refunded', refundTxId: tx[0]._id, releasedAt: new Date() } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return { refundTxId: String(tx[0]._id) };
  } catch (err) {
    await session.abortTransaction().catch(() => {});
    session.endSession();
    throw err;
  }
}

module.exports = {
  holdFunds,
  disburse,
  settlementTransfer,
  refund,
};