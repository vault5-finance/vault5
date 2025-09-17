const { Loan, Account, Transaction, User } = require('../models');

// Create loan
const createLoan = async (req, res) => {
  try {
    const { name, principal, interestRate, repaymentAmount, frequency, nextDueDate, accountDeduction } = req.body;

    const loan = new Loan({
      user: req.user._id,
      name,
      principal,
      interestRate: interestRate || 0,
      repaymentAmount,
      frequency,
      nextDueDate,
      remainingBalance: principal,
      accountDeduction
    });
    await loan.save();

    res.status(201).json(loan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's loans with progress
const getLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user._id });
    const loansWithProgress = loans.map(loan => {
      const progress = loan.principal > 0 ? ((loan.principal - loan.remainingBalance) / loan.principal * 100) : 100;
      loan.progress = Math.min(progress, 100);
      return loan;
    });
    res.json(loansWithProgress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Make repayment (auto-deduct from account)
const makeRepayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const loan = await Loan.findOne({ _id: id, user: req.user._id });
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.remainingBalance <= 0) {
      return res.status(400).json({ message: 'Loan already paid off' });
    }

    const repayment = Math.min(amount || loan.repaymentAmount, loan.remainingBalance);
    loan.remainingBalance -= repayment;
    if (loan.remainingBalance <= 0) {
      loan.status = 'paid';
      loan.nextDueDate = null;
    } else {
      // Schedule next due
      const now = new Date(loan.nextDueDate);
      if (loan.frequency === 'monthly') {
        now.setMonth(now.getMonth() + 1);
      } else if (loan.frequency === 'weekly') {
        now.setDate(now.getDate() + 7);
      } // daily +1
      loan.nextDueDate = now;
    }
    await loan.save();

    // Deduct from account
    if (loan.accountDeduction) {
      const account = await Account.findById(loan.accountDeduction);
      if (account.balance < repayment) {
        return res.status(400).json({ message: 'Insufficient balance in designated account' });
      }
      account.balance -= repayment;
      await account.save();

      const transaction = new Transaction({
        user: req.user._id,
        amount: repayment,
        type: 'expense',
        description: `Loan repayment for ${loan.name}`,
        allocations: [{ account: loan.accountDeduction, amount: repayment }]
      });
      await transaction.save();
      account.transactions.push(transaction._id);
      await account.save();
    }

    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update loan
const updateLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const loan = await Loan.findOne({ _id: id, user: req.user._id });
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    const updates = req.body;
    Object.assign(loan, updates);
    await loan.save();

    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete loan
const deleteLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const loan = await Loan.findOneAndDelete({ _id: id, user: req.user._id });
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    res.json({ message: 'Loan deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createLoan,
  getLoans,
  makeRepayment,
  updateLoan,
  deleteLoan
};