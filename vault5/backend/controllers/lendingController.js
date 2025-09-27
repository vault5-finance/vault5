const { Lending, Account, Transaction, User } = require('../models');
const { generateNotification } = require('./notificationsController');

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
// Expose safe amount calculation as an endpoint
const calculateSafeAmount = async (req, res) => {
  try {
    const { requestedAmount, approvedEmergency = false } = req.body || {};
    const amountNum = Number(requestedAmount);

    if (requestedAmount === undefined || requestedAmount === null || Number.isNaN(amountNum)) {
      return res.status(400).json({ message: 'requestedAmount is required and must be a number' });
    }
    if (amountNum < 0) {
      return res.status(400).json({ message: 'requestedAmount must be >= 0' });
    }

    // Base safe amount calculation
    const result = await calculateSafeLendingAmount(req.user._id, amountNum, approvedEmergency);

    // Enrich with policy insight: monthly cap usage and cool-off status
    const userDoc = await User.findById(req.user._id);
    const monthlyCap = (userDoc?.preferences?.lendingRules?.nonRepayCap ?? 3);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextAllowedDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Non-repayable usage in current month
    const capsUsed = await Lending.countDocuments({
      user: req.user._id,
      createdAt: { $gte: monthStart },
      $or: [{ repayable: false }, { status: 'written_off' }]
    });

    // Cool-off computation from last 90 days non-repayables
    const window90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const last90Count = await Lending.countDocuments({
      user: req.user._id,
      createdAt: { $gte: window90 },
      $or: [{ repayable: false }, { status: 'written_off' }]
    });
    const coolOffDays = last90Count >= 3 ? 60 : (last90Count >= 2 ? 30 : 0);
    const coolOffEndsAt = coolOffDays > 0 ? new Date(Date.now() + coolOffDays * 24 * 60 * 60 * 1000) : null;

    return res.json({
      ...result,
      policy: {
        monthlyCap,
        capsUsed,
        nextAllowedDate,
        coolOffDays,
        coolOffEndsAt,
        last90NonRepayables: last90Count
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Borrower Trust Score endpoint
const getBorrowerScore = async (req, res) => {
  try {
    const { contact, name } = req.query || {};
    if (!contact && !name) {
      return res.status(400).json({ message: 'Provide contact or name query parameter' });
    }

    const match = {
      user: req.user._id,
      $or: []
    };
    if (contact) match.$or.push({ borrowerContact: contact });
    if (name) match.$or.push({ borrowerName: name });

    const lendings = await Lending.find(match).sort({ createdAt: 1 });
    const total = lendings.length;
    const repaid = lendings.filter(l => l.status === 'repaid').length;
    const overdue = lendings.filter(l => l.status === 'overdue').length;
    const writtenOff = lendings.filter(l => l.status === 'written_off').length;
    const amounts = lendings.map(l => l.amount || 0);
    const avgAmount = amounts.length ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0;

    let monthsActive = 0;
    if (total > 0) {
      const first = lendings[0].createdAt;
      const now = new Date();
      monthsActive = Math.max(1, Math.round((now - first) / (1000 * 60 * 60 * 24 * 30)));
    }

    const repaymentRate = total > 0 ? repaid / total : 0;
    const overdueFrac = total > 0 ? overdue / total : 0;
    const historyFrac = Math.min(1, monthsActive / 12);
    const activityFrac = Math.min(1, total / 10);

    // Heuristic scoring 0-100
    let raw =
      60 * repaymentRate +     // reward paying back
      20 * historyFrac +       // reward long history
      10 * activityFrac -      // reward more data points
      40 * overdueFrac;        // penalize overdue

    raw = Math.max(0, Math.min(100, Math.round(raw)));

    return res.json({
      score: raw,
      factors: {
        total,
        repaid,
        overdue,
        writtenOff,
        avgAmount,
        monthsActive,
        repaymentRate: Number(repaymentRate.toFixed(2))
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Create lending request
const createLending = async (req, res) => {
  try {
    const {
      borrowerName,
      borrowerContact,
      amount,
      type = 'non-emergency',
      expectedReturnDate,
      notes,
      approvedEmergency = false,
      repayable = true
    } = req.body || {};

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    const isNonRepayableRequest = (repayable === false) || (String(type).toLowerCase() === 'non-emergency');

    // Load user for per-user lending rules
    const userDoc = await User.findById(req.user._id);
    const monthlyCap = (userDoc?.preferences?.lendingRules?.nonRepayCap ?? 3);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextAllowedDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Enforce monthly cap for non-repayables
    if (isNonRepayableRequest) {
      const monthNonRepCount = await Lending.countDocuments({
        user: req.user._id,
        createdAt: { $gte: monthStart },
        $or: [{ repayable: false }, { status: 'written_off' }]
      });

      if (monthNonRepCount >= monthlyCap) {
        return res.status(400).json({
          message: 'Exceeded non-repayable lending cap for this month',
          capsUsed: monthNonRepCount,
          monthlyCap,
          nextAllowedDate
        });
      }
    }

    // Enforce cool-off windows based on last 90 days non-repayables
    if (isNonRepayableRequest) {
      const window90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const last90Count = await Lending.countDocuments({
        user: req.user._id,
        createdAt: { $gte: window90 },
        $or: [{ repayable: false }, { status: 'written_off' }]
      });
      const coolOffDays = last90Count >= 3 ? 60 : (last90Count >= 2 ? 30 : 0);
      if (coolOffDays > 0) {
        const coolOffEndsAt = new Date(Date.now() + coolOffDays * 24 * 60 * 60 * 1000);
        return res.status(429).json({
          message: 'Cool-off period in effect for non-repayable lending',
          last90NonRepayables: last90Count,
          coolOffDays,
          coolOffEndsAt
        });
      }
    }

    // Safe lending calculation and enforcement
    const safeLending = await calculateSafeLendingAmount(req.user._id, amount, approvedEmergency);

    if (amount > safeLending.recommendedAmount) {
      return res.status(400).json({
        message: 'Requested amount exceeds safe lending capacity',
        recommendedAmount: safeLending.recommendedAmount,
        sourceBreakdown: safeLending.sourceBreakdown
      });
    }

    // Resolve source accounts by type
    const sourceEntries = Object.entries(safeLending.sourceBreakdown);
    const resolvedSources = [];
    for (const [accountType, amt] of sourceEntries) {
      if (amt <= 0) continue;
      const acc = await Account.findOne({ user: req.user._id, type: accountType });
      if (acc) {
        resolvedSources.push({ account: acc._id, amount: amt });
      }
    }

    // Create lending record
    const lending = new Lending({
      user: req.user._id,
      borrowerName,
      borrowerContact,
      amount,
      type,
      repayable,
      expectedReturnDate,
      notes,
      sourceAccounts: resolvedSources
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

    // Notify about outstanding lending debt
    await generateNotification(
      req.user._id,
      'lending_debt',
      'Outstanding Lending Debt',
      `You have lent KES ${amount} to ${borrowerName}. Expected return: ${expectedReturnDate ? new Date(expectedReturnDate).toLocaleDateString() : 'N/A'}`,
      lending._id,
      'medium'
    );

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

// Get lending analytics (frequency by period)
const getLendingAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = 'month' } = req.query; // month, quarter, year

    const now = new Date();
    let startDate;

    if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'quarter') {
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const lendings = await Lending.find({
      user: userId,
      createdAt: { $gte: startDate }
    });

    const totalLent = lendings.reduce((sum, l) => sum + l.amount, 0);
    const repaid = lendings.filter(l => l.status === 'repaid').length;
    const outstanding = lendings.filter(l => l.status === 'pending' || l.status === 'overdue').length;
    const writtenOff = lendings.filter(l => l.status === 'written_off').length;

    res.json({
      period,
      startDate,
      totalLendings: lendings.length,
      totalAmountLent: totalLent,
      repaidCount: repaid,
      outstandingCount: outstanding,
      writtenOffCount: writtenOff,
      repaymentRate: lendings.length > 0 ? (repaid / lendings.length * 100).toFixed(2) : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createLending,
  getLendings,
  updateLendingStatus,
  getLendingLedger,
  calculateSafeLendingAmount,
  calculateSafeAmount,
  getBorrowerScore,
  getLendingAnalytics
};