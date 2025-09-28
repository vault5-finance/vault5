const mongoose = require('mongoose');

/**
 * P2P Loan model (Loans v2)
 * One-to-one privacy-first borrower ↔ lender loans with escrow and flexible schedules.
 * This is distinct from personal/business Loan.js which tracks user's own external loans.
 */
const repaymentItemSchema = new mongoose.Schema({
  dueDate: { type: Date, required: true },
  amount: { type: Number, required: true, min: 0 },
  paid: { type: Boolean, default: false },
  paidDate: { type: Date },
  method: { type: String, enum: ['wallet', 'mobileMoney', 'bank', 'manual'], default: 'wallet' },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }
}, { _id: false });

const p2pLoanSchema = new mongoose.Schema({
  // Parties
  borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  lenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  // Core amounts
  principal: { type: Number, required: true, min: 0 },
  interestRate: { type: Number, default: 0, min: 0 }, // decimal e.g., 0.05
  currency: { type: String, default: 'KES' },

  // Totals and progress
  totalAmount: { type: Number, required: true, min: 0 }, // principal + interest (estimated)
  remainingAmount: { type: Number, required: true, min: 0 },
  nextPaymentDate: { type: Date },
  nextPaymentAmount: { type: Number, default: 0 },

  // Status lifecycle
  status: {
    type: String,
    enum: ['pending_approval', 'approved', 'funded', 'active', 'overdue', 'repaid', 'defaulted', 'written_off', 'declined', 'cancelled'],
    default: 'pending_approval',
    index: true
  },

  // Schedule
  scheduleType: { type: String, enum: ['one-off', 'installments'], default: 'installments' },
  scheduleFrequency: { type: String, enum: ['daily', 'weekly', 'biweekly', 'monthly', 'custom'], default: 'weekly' },
  repaymentSchedule: { type: [repaymentItemSchema], default: [] },

  // Escrow and disbursement
  escrowId: { type: mongoose.Schema.Types.ObjectId, ref: 'Escrow' },
  escrowStatus: { type: String, enum: ['none', 'held', 'disbursed', 'refunded'], default: 'none' },
  disburseImmediately: { type: Boolean, default: true },

  // Auto-deduction settings
  autoDeduct: { type: Boolean, default: true },
  accountDeductionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },

  // Privacy & risk fields (snapshots at request/approval time)
  protectionScore: { type: Number, default: 0 }, // 0..1
  riskFlags: [{ type: String }],
  borrowerCreditScoreAtRequest: { type: Number, default: 0 },
  lenderLimitAtApproval: { type: Number, default: 0 },
  borrowerLimitAtApproval: { type: Number, default: 0 },

  // Metadata and messaging
  purpose: { type: String, default: '' },
  notes: { type: String, default: '' },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: Date
  }],

  // Cooling-off window before lender approves
  coolingOffExpiry: { type: Date },

  // Audit trail reference
  auditTrailRef: { type: mongoose.Schema.Types.ObjectId, ref: 'AuditLog' }
}, {
  timestamps: true
});

// Helpful compound indexes
p2pLoanSchema.index({ borrowerId: 1, lenderId: 1, status: 1 });
p2pLoanSchema.index({ nextPaymentDate: 1, status: 1 });
p2pLoanSchema.index({ createdAt: -1 });

module.exports = mongoose.model('P2PLoan', p2pLoanSchema);