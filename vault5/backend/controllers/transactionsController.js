const { Transaction, User, Account } = require('../models');
const Wallet = require('../models/Wallet');
const bcrypt = require('bcryptjs');
const { analyzeTransaction } = require('../services/fraudDetection');
const { normalizePhoneNumber, arePhoneNumbersEqual, getNetworkProvider } = require('../utils/phoneUtils');
const { generateNotification } = require('./notificationsController');
const { generateUniqueTransactionCode } = require('../utils/txCode');
const { ensureWallet } = require('./walletController');

// Get all transactions for a user
const getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, limit = 100 } = req.query;
    let query = { user: req.user._id };

    // Add date filtering if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .populate('allocations.account', 'type percentage');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new transaction
const createTransaction = async (req, res) => {
  try {
    const { type, amount, description, category, date } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }

    const transaction = new Transaction({
      user: req.user._id,
      type,
      amount,
      description: description.trim(),
      category: category || null,
      date: date || new Date()
    });

    // Perform fraud analysis
    const fraudAnalysis = await analyzeTransaction(req.user._id, transaction);
    transaction.fraudRisk = {
      riskScore: fraudAnalysis.riskScore,
      isHighRisk: fraudAnalysis.isHighRisk,
      flags: fraudAnalysis.flags
    };

    await transaction.save();

    // If it's income, trigger allocation engine
    if (type === 'income') {
      const { allocateIncome } = require('./accountsController');
      try {
        await allocateIncome(req.user._id, amount, description, category);
      } catch (allocationError) {
        console.error('Allocation failed:', allocationError);
        // Don't fail the transaction if allocation fails
      }
    }

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('allocations.account', 'type percentage');

    res.status(201).json(populatedTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a transaction
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, description, category, date } = req.body;

    const transaction = await Transaction.findOne({ _id: id, user: req.user._id });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    transaction.type = type || transaction.type;
    transaction.amount = amount || transaction.amount;
    transaction.description = description || transaction.description;
    transaction.category = category || transaction.category;
    transaction.date = date || transaction.date;

    await transaction.save();

    const updatedTransaction = await Transaction.findById(id)
      .populate('allocations.account', 'type percentage');

    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a transaction
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOneAndDelete({ _id: id, user: req.user._id });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get transaction summary (for reports)
const getTransactionSummary = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    const userId = req.user._id;

    // Calculate date range based on period
    const now = new Date();
    let startDate;

    switch (period) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const transactions = await Transaction.find({
      user: userId,
      date: { $gte: startDate, $lte: now }
    });

    const summary = {
      period,
      totalIncome: 0,
      totalExpenses: 0,
      netCashFlow: 0,
      transactionCount: transactions.length,
      categories: {}
    };

    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        summary.totalIncome += transaction.amount;
      } else {
        summary.totalExpenses += transaction.amount;
      }

      // Category breakdown
      const category = transaction.category || 'Uncategorized';
      if (!summary.categories[category]) {
        summary.categories[category] = { income: 0, expenses: 0, count: 0 };
      }
      summary.categories[category][transaction.type === 'income' ? 'income' : 'expenses'] += transaction.amount;
      summary.categories[category].count += 1;
    });

    summary.netCashFlow = summary.totalIncome - summary.totalExpenses;

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Validate if phone number is tied to user's account for deposits
const validateDepositPhone = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const userId = req.user._id;

    if (!phoneNumber) {
      return res.status(400).json({
        message: 'Phone number is required',
        valid: false
      });
    }

    // Normalize the input phone number
    const normalizedInputPhone = normalizePhoneNumber(phoneNumber);
    if (!normalizedInputPhone) {
      return res.status(400).json({
        message: 'Invalid Kenyan phone number format. Please use format: +254XXXXXXXXX, 254XXXXXXXXX, 0XXXXXXXXX, or 07XXXXXXXX',
        valid: false
      });
    }

    // Get user details to check tied phone numbers
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        valid: false
      });
    }

    // Check if the phone number matches any of user's registered phones
    const isTiedToAccount = user.phones?.some(userPhone =>
      arePhoneNumbersEqual(userPhone.phone, normalizedInputPhone)
    );

    // Additional validation - check if phone is in user's trusted contacts
    const hasTrustedContact = user.trustedContacts?.some(contact =>
      arePhoneNumbersEqual(contact.phone, normalizedInputPhone)
    );

    const isValid = isTiedToAccount || hasTrustedContact;

    res.json({
      valid: isValid,
      tiedToAccount: isTiedToAccount,
      trustedContact: hasTrustedContact,
      message: isValid
        ? 'Phone number is authorized for deposits'
        : 'Phone number is not tied to your account. Only registered phone numbers can be used for deposits.',
      phoneInfo: {
        formatted: normalizedInputPhone,
        network: getNetworkProvider(normalizedInputPhone),
        original: phoneNumber
      }
    });

  } catch (error) {
    console.error('Phone validation error:', error);
    res.status(500).json({
      message: 'Phone validation failed',
      valid: false,
      error: error.message
    });
  }
};

// Real-time user verification for transfers (enforce single mode and identifier)
const verifyRecipient = async (req, res) => {
  try {
    const { mode, recipientEmail, recipientPhone } = req.body;
    const senderId = req.user._id;

    // Enforce selection
    if (!mode || !['email', 'phone'].includes(mode)) {
      return res.status(400).json({ message: 'Select a mode: email or phone' });
    }
    if (recipientEmail && recipientPhone) {
      return res.status(400).json({ message: 'Provide either email or phone, not both' });
    }
    if (mode === 'email' && !recipientEmail) {
      return res.status(400).json({ message: 'Recipient email is required' });
    }
    if (mode === 'phone' && !recipientPhone) {
      return res.status(400).json({ message: 'Recipient phone is required' });
    }

    let recipient = null;
    let foundBy = null;

    if (mode === 'email') {
      const emailLower = String(recipientEmail).toLowerCase();
      // Find by new emails array first, then legacy email
      recipient = await User.findOne({ 'emails.email': emailLower });
      if (!recipient) {
        recipient = await User.findOne({ email: emailLower });
      }
      if (!recipient) {
        // Email must exist to proceed (block)
        return res.status(404).json({
          message: 'No Vault5 user with this email',
          verified: false,
          vaultUser: false,
          canProceed: false
        });
      }
      foundBy = 'email';
    }

    if (mode === 'phone') {
      const normalized = normalizePhoneNumber(recipientPhone);
      if (!normalized) {
        return res.status(400).json({ message: 'Invalid phone format' });
      }
      // Match any registered phone (primary or secondary)
      recipient = await User.findOne({ 'phones.phone': normalized });
      if (recipient) {
        foundBy = 'phone';
      } else {
        // Simulate cross-network directory for non-Vault users
        const network = getNetworkProvider(normalized);
        const obfuscated = `User ${normalized.slice(0, 6)}****`;
        return res.json({
          verified: true,
          vaultUser: false,
          canProceed: true,
          recipient: {
            name: obfuscated,
            phone: normalized,
            network,
            avatar: '👤'
          },
          fees: { transferType: 'external', network }
        });
      }
    }

    // Prevent sending to self
    if (recipient && recipient._id.toString() === senderId.toString()) {
      return res.status(400).json({
        message: 'Cannot send to yourself',
        verified: false,
        vaultUser: true,
        canProceed: false
      });
    }

    // Compose display fields
    let primaryEmail = recipient.email;
    if (recipient.emails && recipient.emails.length > 0) {
      const entry = recipient.emails.find(e => e.isPrimary) || recipient.emails[0];
      primaryEmail = entry?.email || primaryEmail;
    }
    let primaryPhone = recipient.phone;
    if (recipient.phones && recipient.phones.length > 0) {
      const entry = recipient.phones.find(p => p.isPrimary) || recipient.phones[0];
      primaryPhone = entry?.phone || primaryPhone;
    }

    // Basic account sanity info
    const isBlocked = ['blocked', 'suspended', 'banned'].includes(String(recipient.accountStatus || '').toLowerCase());
    const hasDaily = await Account.exists({ user: recipient._id, type: 'Daily' });

    return res.json({
      verified: true,
      vaultUser: true,
      canProceed: !isBlocked && Boolean(hasDaily),
      recipient: {
        id: recipient._id,
        name: recipient.name,
        email: primaryEmail || null,
        phone: primaryPhone || null,
        avatar: recipient.avatar || '👤'
      },
      foundBy: foundBy || mode,
      fees: { transferType: 'vault' }
    });
  } catch (error) {
    console.error('Recipient verification error:', error);
    res.status(500).json({
      message: 'Verification failed',
      verified: false,
      error: error.message
    });
  }
};

// P2P Money Transfer between Vault5 users (supports linked accounts)
const transferToUser = async (req, res) => {
  try {
    const { recipientEmail, recipientPhone, amount, fromAccountId, description, source = 'wallet' } = req.body;
    const senderId = req.user._id;

    if ((!recipientEmail && !recipientPhone) || !amount) {
      return res.status(400).json({ message: 'Recipient email or phone and amount are required' });
    }
    const amt = Number(amount);
    if (!(amt > 0)) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    // Resolve recipient
    let recipient = null;
    let foundBy = '';
    let linkedAccountInfo = null;

    if (recipientEmail) {
      recipient = await User.findOne({ 'emails.email': recipientEmail.toLowerCase() });
      if (recipient) foundBy = 'email';
    }

    if (!recipient && recipientPhone) {
      recipient = await User.findOne({ 'phones.phone': recipientPhone });
      if (recipient) foundBy = 'phone';
    }

    // Linked accounts lookup (legacy support)
    if (!recipient) {
      const usersWithLinkedAccounts = await User.find({
        'preferences.linkedAccounts': {
          $elemMatch: {
            $or: [
              { accountNumber: recipientEmail || recipientPhone },
              { accountName: recipientEmail || recipientPhone }
            ],
            isVerified: true,
            status: 'active'
          }
        }
      });

      if (usersWithLinkedAccounts.length > 0) {
        recipient = usersWithLinkedAccounts[0];
        const linkedAccount = recipient.preferences.linkedAccounts.find(acc =>
          (acc.accountNumber === recipientEmail || acc.accountNumber === recipientPhone) ||
          (acc.accountName === recipientEmail || acc.accountName === recipientPhone)
        );
        if (linkedAccount) {
          foundBy = 'linked_account';
          linkedAccountInfo = {
            accountType: linkedAccount.accountType,
            accountNumber: linkedAccount.accountNumber,
            accountName: linkedAccount.accountName
          };
        }
      }
    }

    if (!recipient) {
      return res.status(404).json({
        message: 'Recipient not found',
        searchedBy: recipientEmail ? 'email' : 'phone'
      });
    }

    if (recipient._id.toString() === senderId.toString()) {
      return res.status(400).json({ message: 'Cannot transfer to yourself' });
    }

    // Optional password enforcement
    const requirePassword = String(process.env.TRANSFER_REQUIRE_PASSWORD || 'true').toLowerCase() === 'true';
    if (requirePassword) {
      const provided = String(req.body.password || '');
      if (!provided) {
        return res.status(401).json({ message: 'Password required to complete transfer' });
      }
      const me = await User.findById(senderId).select('+password');
      if (!me) return res.status(404).json({ message: 'User not found' });
      const match = await bcrypt.compare(provided, me.password);
      if (!match) {
        return res.status(401).json({ message: 'Invalid password' });
      }
    }

    // Prepare sender debit based on source
    let senderAccount = null;
    let senderWallet = null;

    if (String(source) === 'account') {
      if (fromAccountId) {
        senderAccount = await Account.findOne({ _id: fromAccountId, user: senderId });
      } else {
        senderAccount = await Account.findOne({ user: senderId, type: 'Daily' });
      }
      if (!senderAccount) {
        return res.status(404).json({ message: 'Sender account not found' });
      }
      if (senderAccount.balance < amt) {
        return res.status(400).json({ message: 'Insufficient funds in selected account' });
      }
    } else {
      // Default: wallet
      senderWallet = await ensureWallet(senderId);
      if (!senderWallet || senderWallet.status !== 'active') {
        return res.status(400).json({ message: 'Wallet not available' });
      }
      if (senderWallet.balance < amt) {
        return res.status(400).json({ message: 'Insufficient wallet balance' });
      }
    }

    // Recipient wallet (create if missing)
    const recipientWallet = await ensureWallet(recipient._id);

    // Start transaction session
    const session = await Account.startSession();
    session.startTransaction();

    try {
      // Debit sender
      if (senderWallet) {
        senderWallet.balance = parseFloat((senderWallet.balance - amt).toFixed(2));
        senderWallet.updateStats?.(amt, 'spend');
        await senderWallet.save({ session });
      } else {
        senderAccount.balance = parseFloat((senderAccount.balance - amt).toFixed(2));
        await senderAccount.save({ session });
      }

      // Credit recipient wallet
      recipientWallet.balance = parseFloat((recipientWallet.balance + amt).toFixed(2));
      recipientWallet.updateStats?.(amt, 'recharge');
      await recipientWallet.save({ session });

      // Transaction codes
      const txCode = await generateUniqueTransactionCode(Transaction, 10);

      // Sender transaction
      const senderTx = new Transaction({
        user: senderId,
        type: 'expense',
        amount: amt,
        description: `Transfer to ${recipient.name} - ${description || 'P2P Transfer'}`,
        category: 'Transfer',
        date: new Date(),
        currency: 'KES',
        transactionCode: txCode,
        balanceAfter: senderWallet ? senderWallet.balance : undefined,
        metadata: {
          counterpartyId: recipient._id,
          source: senderWallet ? 'wallet' : (senderAccount ? senderAccount.type : 'account'),
          transferKind: 'p2p'
        }
      });

      // Recipient transaction
      const recipientTx = new Transaction({
        user: recipient._id,
        type: 'income',
        amount: amt,
        description: `Transfer from ${req.user.name} - ${description || 'P2P Transfer'}`,
        category: 'Transfer',
        date: new Date(),
        currency: 'KES',
        transactionCode: txCode,
        balanceAfter: recipientWallet.balance,
        metadata: {
          counterpartyId: senderId,
          destination: 'wallet',
          transferKind: 'p2p'
        }
      });

      await senderTx.save({ session });
      await recipientTx.save({ session });

      await session.commitTransaction();

      // Notify recipient
      await generateNotification(
        recipient._id,
        'money_received',
        'Funds Received',
        `Congrats! You have received KES ${amt.toFixed(2)} from ${req.user.name}. New wallet balance: KES ${recipientWallet.balance.toFixed(2)}. Tx: ${txCode}.`,
        recipientTx._id,
        'low',
        { amount: amt, currency: 'KES', transactionCode: txCode, balanceAfter: recipientWallet.balance, sender: req.user.name }
      );

      res.status(200).json({
        message: 'Transfer completed successfully',
        transfer: {
          amount: amt,
          recipient: {
            name: recipient.name,
            email: recipientEmail,
            phone: recipientPhone,
            foundBy: foundBy,
            linkedAccount: linkedAccountInfo || (foundBy === 'email' ? 'email' : 'phone')
          },
          source: senderWallet ? 'wallet' : 'account',
          senderAccount: senderAccount ? senderAccount.type : 'Wallet',
          recipientAccount: 'Wallet',
          linkedAccountInfo: linkedAccountInfo ? {
            accountType: linkedAccountInfo.accountType,
            accountNumber: linkedAccountInfo.accountNumber,
            accountName: linkedAccountInfo.accountName
          } : null,
          transactionCode: txCode
        }
      });

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (error) {
    console.error('P2P Transfer error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Transfer to linked account
const transferToLinkedAccount = async (req, res) => {
  try {
    const { linkedAccountId, amount, description } = req.body;
    const senderId = req.user._id;

    if (!linkedAccountId || !amount) {
      return res.status(400).json({
        message: 'Linked account ID and amount are required'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    // Find the linked account owner
    const recipient = await User.findOne({
      'preferences.linkedAccounts._id': linkedAccountId,
      'preferences.linkedAccounts.isVerified': true,
      'preferences.linkedAccounts.status': 'active'
    });

    if (!recipient) {
      return res.status(404).json({
        message: 'Linked account not found or not verified'
      });
    }

    // Don't allow self-transfer
    if (recipient._id.toString() === senderId.toString()) {
      return res.status(400).json({ message: 'Cannot transfer to your own linked account' });
    }

    // Get the linked account details
    const linkedAccount = recipient.preferences.linkedAccounts.id(linkedAccountId);
    if (!linkedAccount) {
      return res.status(404).json({ message: 'Linked account not found' });
    }

    // Check linked account limits
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthlyStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get recent transactions to this linked account
    const recentTransactions = await Transaction.find({
      'metadata.linkedAccountId': linkedAccountId,
      date: { $gte: today }
    });

    const dailyTotal = recentTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const monthlyTotal = await Transaction.find({
      'metadata.linkedAccountId': linkedAccountId,
      date: { $gte: monthlyStart }
    }).then(txs => txs.reduce((sum, tx) => sum + tx.amount, 0));

    if (dailyTotal + amount > linkedAccount.limits.dailyLimit) {
      return res.status(400).json({
        message: `Daily limit exceeded. Available: KES ${(linkedAccount.limits.dailyLimit - dailyTotal).toFixed(2)}`
      });
    }

    if (monthlyTotal + amount > linkedAccount.limits.monthlyLimit) {
      return res.status(400).json({
        message: `Monthly limit exceeded. Available: KES ${(linkedAccount.limits.monthlyLimit - monthlyTotal).toFixed(2)}`
      });
    }

    // Find sender's account (use Daily account as default)
    const senderAccount = await Account.findOne({
      user: senderId,
      type: 'Daily'
    });

    if (!senderAccount) {
      return res.status(404).json({ message: 'Sender Daily account not found' });
    }

    if (senderAccount.balance < amount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    // Find recipient's Daily account (default receiving account)
    const recipientDailyAccount = await Account.findOne({
      user: recipient._id,
      type: 'Daily'
    });

    if (!recipientDailyAccount) {
      return res.status(404).json({ message: 'Recipient Daily account not found' });
    }

    // Start transaction
    const session = await Account.startSession();
    session.startTransaction();

    try {
      // Deduct from sender's account
      senderAccount.balance -= amount;
      await senderAccount.save({ session });

      // Add to recipient's account
      recipientDailyAccount.balance += amount;
      await recipientDailyAccount.save({ session });

      // Update linked account last used
      linkedAccount.lastUsed = new Date();
      await recipient.save({ session });

      // Create transaction records for both users
      const senderTransaction = new Transaction({
        user: senderId,
        type: 'expense',
        amount: amount,
        description: `Transfer to ${linkedAccount.accountName} (${linkedAccount.accountType}) - ${description || 'Linked Account Transfer'}`,
        category: 'Transfer',
        date: new Date(),
        metadata: {
          linkedAccountId: linkedAccountId,
          linkedAccountType: linkedAccount.accountType,
          recipientName: recipient.name
        }
      });

      const recipientTransaction = new Transaction({
        user: recipient._id,
        type: 'income',
        amount: amount,
        description: `Transfer from ${req.user.name} via linked account - ${description || 'Linked Account Transfer'}`,
        category: 'Transfer',
        date: new Date(),
        metadata: {
          linkedAccountId: linkedAccountId,
          linkedAccountType: linkedAccount.accountType,
          senderName: req.user.name
        }
      });

      await senderTransaction.save({ session });
      await recipientTransaction.save({ session });

      // Commit transaction
      await session.commitTransaction();

      res.status(200).json({
        message: 'Transfer to linked account completed successfully',
        transfer: {
          amount,
          recipient: {
            name: recipient.name,
            linkedAccount: {
              accountType: linkedAccount.accountType,
              accountNumber: linkedAccount.accountNumber,
              accountName: linkedAccount.accountName
            }
          },
          senderAccount: senderAccount.type,
          recipientAccount: recipientDailyAccount.type,
          limits: {
            dailyUsed: dailyTotal + amount,
            dailyLimit: linkedAccount.limits.dailyLimit,
            monthlyUsed: monthlyTotal + amount,
            monthlyLimit: linkedAccount.limits.monthlyLimit
          }
        }
      });

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (error) {
    console.error('Linked Account Transfer error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Simple fee calculator for client previews
function computeFees({ amount, transferType, network = 'Safaricom', international = false }) {
  const amt = Number(amount || 0);
  if (!(amt > 0)) return { fee: 0, total: 0, breakdown: [] };

  if (transferType === 'vault' && !international) {
    // Vault-to-Vault domestic: tiered, cheaper than telcos
    // Example schedule: 0-999: 8, 1000-4999: 18, 5000-19999: 35, 20000+: 60
    let fee = 0;
    if (amt <= 999) fee = 8;
    else if (amt <= 4999) fee = 18;
    else if (amt <= 19999) fee = 35;
    else fee = 60;
    return { fee, total: amt + fee, breakdown: [{ label: 'Vault fee', value: fee }] };
  }

  if (transferType === 'vault' && international) {
    // International Vault-to-Vault: 1.2% capped at 250, min 20
    let fee = Math.max(20, Math.min(250, Math.round(amt * 0.012)));
    return { fee, total: amt + fee, breakdown: [{ label: 'Intl fee', value: fee }] };
  }

  // External network: approximate telco fees (simplified)
  const telcoTables = {
    Safaricom: [
      { upTo: 999, fee: 15 },
      { upTo: 4999, fee: 35 },
      { upTo: 19999, fee: 55 },
      { upTo: Infinity, fee: 100 }
    ],
    Airtel: [
      { upTo: 999, fee: 12 },
      { upTo: 4999, fee: 30 },
      { upTo: 19999, fee: 50 },
      { upTo: Infinity, fee: 90 }
    ],
    Default: [
      { upTo: 999, fee: 15 },
      { upTo: 4999, fee: 35 },
      { upTo: 19999, fee: 55 },
      { upTo: Infinity, fee: 100 }
    ]
  };
  const table = telcoTables[network] || telcoTables.Default;
  const fee = table.find(t => amt <= t.upTo).fee;
  return { fee, total: amt + fee, breakdown: [{ label: `${network} fee`, value: fee }] };
}

const calculateFees = async (req, res) => {
  try {
    const { amount, transferType, network, international } = req.body || {};
    const result = computeFees({ amount, transferType, network, international });
    return res.json({ success: true, ...result });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to calculate fees' });
  }
};


// External transfer to non-Vault users via telco/bank rails
const transferExternal = async (req, res) => {
  try {
    const { recipientPhone, amount, description, international = false } = req.body || {};
    const senderId = req.user._id;

    if (!(amount > 0)) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }
    const normalized = normalizePhoneNumber(recipientPhone || '');
    if (!normalized) {
      return res.status(400).json({ message: 'Valid recipient phone is required' });
    }

    // Determine network for fees
    const network = getNetworkProvider(normalized);

    // Compute fees using shared schedule
    const feeResult = computeFees({ amount, transferType: 'external', network, international: Boolean(international) });
    const totalDebit = feeResult.total;

    // Deduct from sender's Daily account by default
    let senderAccount = await Account.findOne({ user: senderId, type: 'Daily' });
    if (!senderAccount) {
      return res.status(404).json({ message: 'Sender Daily account not found' });
    }
    if (senderAccount.balance < totalDebit) {
      return res.status(400).json({ message: `Insufficient funds. Required: KES ${totalDebit}` });
    }

    // Simulate payout processing; integrate with PSP in production
    const session = await Account.startSession();
    session.startTransaction();
    try {
      senderAccount.balance -= totalDebit;
      await senderAccount.save({ session });

      // Record sender transaction with fee metadata
      const senderTransaction = new Transaction({
        user: senderId,
        type: 'expense',
        amount: totalDebit,
        description: `External transfer to ${normalized} (${network}) - ${description || 'P2P External'}`,
        category: 'Transfer',
        date: new Date(),
        allocations: [],
        fraudRisk: { riskScore: 0, isHighRisk: false, flags: [] },
      });
      await senderTransaction.save({ session });

      await session.commitTransaction();
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }

    return res.status(200).json({
      message: 'External transfer initiated successfully',
      transfer: {
        amount,
        fee: feeResult.fee,
        totalDebited: totalDebit,
        network,
        recipientPhone: normalized,
        international: Boolean(international),
      },
    });
  } catch (error) {
    console.error('External transfer error:', error);
    return res.status(500).json({ message: 'Failed to process external transfer' });
  }
};

const { creditWallet } = require('./walletController');

// Request a reversal by transactionCode with business rules (<=25s auto, <=24h pending)
const requestReversal = async (req, res) => {
  try {
    const { transactionCode } = req.body || {};
    if (!transactionCode) {
      return res.status(400).json({ message: 'transactionCode is required' });
    }

    // Find the sender transaction for this user
    const senderTx = await Transaction.findOne({
      user: req.user._id,
      transactionCode
    }).sort({ date: -1 });

    if (!senderTx) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if ((senderTx.metadata && senderTx.metadata.transferKind) !== 'p2p') {
      return res.status(400).json({ message: 'Only P2P transfers are eligible for self-service reversal' });
    }

    // Find counterparty
    const counterpartyId = senderTx.metadata?.counterpartyId;
    if (!counterpartyId) {
      return res.status(400).json({ message: 'Counterparty not linked on transaction' });
    }

    const recipientUser = await User.findById(counterpartyId);
    if (!recipientUser) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Time window checks
    const now = Date.now();
    const createdAt = (senderTx.date || senderTx.createdAt || new Date()).getTime();
    const ageMs = now - createdAt;

    // Locate recipient's mirror transaction
    const recipientTx = await Transaction.findOne({
      user: counterpartyId,
      transactionCode
    }).sort({ date: -1 });

    if (!recipientTx) {
      return res.status(404).json({ message: 'Recipient transaction not found' });
    }

    // Auto reverse if within 25 seconds and recipient is an individual
    if (ageMs <= 25 * 1000 && !Boolean(recipientUser.isOrganization)) {
      // Debit recipient wallet (use negativeBalance if insufficient), credit back to sender wallet
      const recipientWallet = await ensureWallet(counterpartyId);
      const amount = Number(recipientTx.amount || 0);

      // Apply debit from recipient wallet, rolling into negativeBalance if needed
      let deficit = 0;
      if (Number(recipientWallet.balance || 0) >= amount) {
        recipientWallet.balance = parseFloat((recipientWallet.balance - amount).toFixed(2));
      } else {
        deficit = parseFloat((amount - Number(recipientWallet.balance || 0)).toFixed(2));
        recipientWallet.balance = 0;
        recipientWallet.negativeBalance = parseFloat((Number(recipientWallet.negativeBalance || 0) + deficit).toFixed(2));
      }
      await recipientWallet.save();

      // Credit sender wallet using wallet credit utility (handles any sender negativeBalance)
      await creditWallet(req.user._id, amount, `Auto-reversal for ${transactionCode}`, { reversal: true }, 'KES');

      // Mark transactions metadata
      senderTx.metadata = Object.assign({}, senderTx.metadata, { reversalStatus: 'auto_reversed', reversalAt: new Date() });
      recipientTx.metadata = Object.assign({}, recipientTx.metadata, { reversalStatus: 'auto_reversed', reversalAt: new Date(), deficitApplied: deficit });
      await senderTx.save();
      await recipientTx.save();

      // Notify both parties
      await generateNotification(
        req.user._id,
        'money_received',
        'Reversal Completed',
        `Your transfer ${transactionCode} was auto-reversed within 25s. Funds returned to your wallet.`,
        senderTx._id,
        'low',
        { transactionCode, amount, kind: 'reversal' }
      );

      await generateNotification(
        recipientUser._id,
        'money_debited',
        'Reversal Debit',
        `A reversal for ${transactionCode} was processed. KES ${amount.toFixed(2)} debited. ${deficit > 0 ? 'Negative balance applied.' : ''}`,
        recipientTx._id,
        'medium',
        { transactionCode, amount, deficitApplied: deficit, kind: 'reversal' }
      );

      return res.json({ success: true, autoReversed: true, transactionCode });
    }

    // Between 25s and 24h: create pending request, notify recipient to approve
    if (ageMs <= 24 * 60 * 60 * 1000) {
      senderTx.metadata = Object.assign({}, senderTx.metadata, {
        reversalStatus: 'pending',
        reversalRequestedAt: new Date()
      });
      recipientTx.metadata = Object.assign({}, recipientTx.metadata, {
        reversalStatus: 'pending',
        reversalRequestedAt: new Date()
      });
      await senderTx.save();
      await recipientTx.save();

      await generateNotification(
        recipientUser._id,
        'money_debited',
        'Reversal Requested',
        `A reversal was requested for ${transactionCode}. Please approve or deny this request within 24 hours.`,
        recipientTx._id,
        'medium',
        { transactionCode, amount: Number(senderTx.amount || 0), actionRequired: true }
      );

      return res.json({ success: true, pending: true, transactionCode, message: 'Reversal request sent to recipient for approval' });
    }

    // >24h: support only
    return res.status(400).json({ message: 'Reversal window expired. Contact support.' });

  } catch (error) {
    console.error('requestReversal error:', error);
    return res.status(500).json({ message: 'Failed to request reversal' });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
  transferToUser,
  transferToLinkedAccount,
  verifyRecipient,
  validateDepositPhone,
  calculateFees,
  transferExternal,
  requestReversal
};