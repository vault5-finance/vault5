const mongoose = require('mongoose');

/**
 * Escrow model for P2P Loans v2
 * Tracks funds held from lender and released to borrower or refunded.
 */
const escrowSchema = new mongoose.Schema({
  loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'P2PLoan', index: true },
  lenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  amountHeld: { type: Number, required: true, min: 0 },
  holdStatus: { type: String, enum: ['held', 'released', 'refunded'], default: 'held', index: true },

  holderAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }, // internal ledger account or wallet id
  disbursementTxId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  refundTxId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },

  protectionDetails: {
    requireAck: { type: Boolean, default: false },
    releaseAfter: { type: Date },
    notes: { type: String, default: '' }
  },

  createdAt: { type: Date, default: Date.now },
  releasedAt: { type: Date }
}, {
  timestamps: true
});

escrowSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Escrow', escrowSchema);