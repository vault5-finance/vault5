const { Lending, Account, Transaction, User } = require('../models');

// Rule engine for lending - calculate safe amount from allowed accounts
const calculateSafeLendingAmount = async (userId, requestedAmount, approvedEmergency = false) => {
  try {
    const user = await User.findById(userId).populate('accounts');
    const accounts = user.accounts;

    let safeAmount = 0;
    let sourceBreakdown = {};

    // Allowed sources: Fun (50%), Charity (30%), Daily (20%)
    const funAccount = accounts.find(acc => acc.type === 'Fun');
    const charityAccount = accounts.find(acc => acc.type === 'Charity');
    const dailyAccount = accounts.find(acc => acc.type === 'Daily');

    if (funAccount) {
      const maxFromFun = funAccount.balance * 0.5;
      safeAmount += Math.min(maxFromFun, funAccount.balance);
      sourceBreakdown.Fun = Math.min(maxFromFun, funAccount.balance);
    }

    if (charityAccount) {
      const maxFromCharity = charityAccount.balance * 0.3;
      safeAmount += Math.min(maxFromCharity, charityAccount.balance);
      sourceBreakdown.Charity = Math.min(maxFromCharity, charityAccount.balance);
    }

    if (dailyAccount) {
      const maxFromDaily = dailyAccount.balance * 0.2;
      safeAmount += Math.min(maxFromDaily, dailyAccount.balance);
      sourceBreakdown.Daily = Math.min(maxFromDaily, dailyAccount.balance);
    }

    // If approved, add from restricted accounts (Emergency, LongTerm) but limited
    if (approvedEmergency) {
      const emergencyAccount = accounts.find(acc => acc.type === 'Emergency');
      const longTermAccount = accounts.find(acc => acc.type === 'LongTerm');
      if (emergencyAccount) {
        const maxFromEmergency = emergencyAccount.balance * 0.1; // Strict limit
        safeAmount += Math.min(maxFromEmergency, emergencyAccount.balance);
        sourceBreakdown.Emergency = Math.min(maxFromEmergency, emergencyAccount.balance);
      }
      if (longTermAccount) {
        const maxFromLongTerm = longTermAccount.balance * 0.1;
        safeAmount += Math.min(maxFromLongTerm, longTermAccount.balance);
        sourceBreakdown.LongTerm = Math.min(maxFromLongTerm, longTermAccount.balance);
      }
    }

    const recommendedAmount = Math.min(requestedAmount, safeAmount);
    return { safeAmount, recommendedAmount, sourceBreakdown };
  } catch (error) {
    throw new Error(`Rule engine error: ${error.message}`);
  }
};

// Create lending request
const createLending = async (req, res) => {
  try {
    const { borrowerName, borrowerContact, amount, type, expectedReturnDate, notes, approvedEmergency = false } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    const safeLending = await calculateSafeLendingAmount(req.user._id, amount, approvedEmergency);

    if (amount > safeLending.recommendedAmount) {
      return res.status(400).json({
        message: 'Requested amount exceeds safe lending capacity',
        recommendedAmount: safeLending.recommendedAmount,
        sourceBreakdown: safeLending.sourceBreakdown
      });
    }

    // Create lending record
    const lending = new Lending({
      user: req.user._id,
      borrowerName,
      borrowerContact,
      amount,
      type,
      expectedReturnDate,
      notes,
      sourceAccounts: Object.entries(safeLending.sourceBreakdown).map(([accountType, amt]) => {
        const account = req.user.accounts.find(acc => acc.type === accountType);
        return { account: account._id, amount: amt };
      })
    });
    await lending.save();

    // Deduct from source accounts (create transactions)
    for (const source of lending.sourceAccounts) {
      const account = await Account.findById(source.account);
      account.balance -= source.amount;
      await account.save();

      const deductionTransaction = new Transaction({
        user: req.user._id,
        amount: source.amount,
        type: 'expense',
        description: `Lending to ${borrowerName} from ${account.type}`,
        allocations: [{ account: source.account, amount: source.amount }]
      });
      await deductionTransaction.save();
      account.transactions.push(deductionTransaction._id);
      await account.save();
    }

    // Check for cap on non-repayable (simple check, e.g., max 3 per month - implement user setting later)
    const recentLendings = await Lending.countDocuments({
      user: req.user._id,
      type: 'non-emergency',
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });
    if (recentLendings > 3 && type === 'non-emergency') {
      return res.status(400).json({ message: 'Exceeded non-repayable lending cap for this period' });
    }

    res.status(201).json(lending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get lending history
const getLendings = async (req, res) => {
  try {
    const lendings = await Lending.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(lendings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update lending status (repaid, written_off, overdue)
const updateLendingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, actualReturnDate } = req.body;

    const lending = await Lending.findOne({ _id: id, user: req.user._id });
    if (!lending) {
      return res.status(404).json({ message: 'Lending not found' });
    }

    lending.status = status;
    if (actualReturnDate) lending.actualReturnDate = actualReturnDate;

    if (status === 'repaid') {
      // Add back to accounts or create income transaction
      for (const source of lending.sourceAccounts) {
        const account = await Account.findById(source.account);
        account.balance += source.amount;
        await account.save();

        const returnTransaction = new Transaction({
          user: req.user._id,
          amount: source.amount,
          type: 'income',
          description: `Repayment from ${lending.borrowerName} to ${account.type}`,
          allocations: [{ account: source.account, amount: source.amount }]
        });
        await returnTransaction.save();
        account.transactions.push(returnTransaction._id);
        await account.save();
      }
    }

    await lending.save();
    res.json(lending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get lending ledger (outstanding, expected returns)
const getLendingLedger = async (req, res) => {
  try {
    const lendings = await Lending.find({ user: req.user._id, status: { $in: ['pending', 'overdue'] } });
    const totalOutstanding = lendings.reduce((sum, l) => sum + l.amount, 0);
    res.json({ lendings, totalOutstanding });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createLending,
  getLendings,
  updateLendingStatus,
  getLendingLedger,
  calculateSafeLendingAmount
};