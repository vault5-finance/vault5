const { Investment, Account, Transaction, User } = require('../models');

// Create investment
const createInvestment = async (req, res) => {
  try {
    const { name, type, amount, expectedReturn, maturityDate, accountSource } = req.body;

    // Deduct from source account if specified
    if (accountSource) {
      const account = await Account.findById(accountSource);
      if (account.balance < amount) {
        return res.status(400).json({ message: 'Insufficient balance in source account' });
      }
      account.balance -= amount;
      await account.save();

      const transaction = new Transaction({
        user: req.user._id,
        amount,
        type: 'expense',
        description: `Investment in ${name} from ${account.type}`,
        allocations: [{ account: accountSource, amount }]
      });
      await transaction.save();
      account.transactions.push(transaction._id);
      await account.save();
    }

    const investment = new Investment({
      user: req.user._id,
      name,
      type,
      amount,
      expectedReturn: expectedReturn || 0,
      currentValue: amount,
      maturityDate
    });
    await investment.save();

    res.status(201).json(investment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's investments with growth
const getInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user._id });
    const investmentsWithGrowth = investments.map(inv => {
      const growth = inv.currentValue - inv.amount;
      const returnRate = inv.amount > 0 ? (growth / inv.amount * 100) : 0;
      inv.growth = growth;
      inv.returnRate = returnRate;
      inv.daysToMaturity = inv.maturityDate ? Math.max(0, Math.ceil((new Date(inv.maturityDate) - new Date()) / (1000 * 60 * 60 * 24))) : 0;
      return inv;
    });
    res.json(investmentsWithGrowth);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update investment (e.g., currentValue, status)
const updateInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    const investment = await Investment.findOne({ _id: id, user: req.user._id });
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    const updates = req.body;
    Object.assign(investment, updates);

    if (updates.currentValue) {
      // Update growth
      investment.growth = updates.currentValue - investment.amount;
    }

    if (investment.maturityDate && new Date(investment.maturityDate) <= new Date()) {
      investment.status = 'matured';
    }

    await investment.save();
    res.json(investment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete investment (add back to account if needed)
const deleteInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    const investment = await Investment.findOneAndDelete({ _id: id, user: req.user._id });
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    // Refund to account if sold or deleted
    if (investment.status === 'sold' || investment.currentValue > 0) {
      const user = await User.findById(req.user._id).populate('accounts');
      const defaultAccount = user.accounts.find(acc => acc.type === 'Daily'); // Default refund
      if (defaultAccount) {
        defaultAccount.balance += investment.currentValue;
        await defaultAccount.save();

        const transaction = new Transaction({
          user: req.user._id,
          amount: investment.currentValue,
          type: 'income',
          description: `Refund from sold investment ${investment.name}`,
          allocations: [{ account: defaultAccount._id, amount: investment.currentValue }]
        });
        await transaction.save();
        defaultAccount.transactions.push(transaction._id);
        await defaultAccount.save();
      }
    }

    res.json({ message: 'Investment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createInvestment,
  getInvestments,
  updateInvestment,
  deleteInvestment
};