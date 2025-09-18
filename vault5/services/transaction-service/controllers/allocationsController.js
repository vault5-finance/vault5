const Allocation = require('../models/allocation');
const Transaction = require('../models/transaction');
const { logger } = require('../server');
const axios = require('axios');

// Allocation engine function
const allocateIncome = async (userId, transactionId, amount, description) => {
  try {
    logger.info(`Starting income allocation for user ${userId}, amount: ${amount}`);

    // Get user accounts from user-service
    const userServiceUrl = process.env.USER_SERVICE_URI;
    if (!userServiceUrl) {
      throw new Error('USER_SERVICE_URI not configured');
    }

    const accountsResponse = await axios.get(`${userServiceUrl}/api/accounts`, {
      headers: {
        // In production, pass service-to-service auth token
        'Authorization': `Bearer ${process.env.SERVICE_TOKEN || 'internal'}`
      },
      params: { userId }
    });

    const accounts = accountsResponse.data.accounts || accountsResponse.data;

    if (!accounts || accounts.length === 0) {
      logger.warn(`No accounts found for user ${userId}, skipping allocation`);
      return { message: 'No accounts configured for allocation', allocations: [] };
    }

    // Check if total percentage is 100
    const totalPercentage = accounts.reduce((sum, acc) => sum + (acc.percentage || 0), 0);
    if (totalPercentage !== 100) {
      throw new Error(`Account percentages do not sum to 100% (current: ${totalPercentage}%)`);
    }

    const allocations = [];
    const allocationRecords = [];

    for (const account of accounts) {
      const splitAmount = Math.round((amount * (account.percentage / 100)) * 100) / 100; // Round to 2 decimal places

      if (splitAmount <= 0) continue;

      // Create allocation record
      const allocation = await Allocation.create({
        userId,
        transactionId,
        accountId: account.id,
        amount: splitAmount,
        accountType: account.type,
        status: 'green' // Default status
      });

      allocationRecords.push(allocation);

      // Update account balance in user-service
      try {
        await axios.put(`${userServiceUrl}/api/accounts/${account.id}/balance`, {
          operation: 'add',
          amount: splitAmount
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.SERVICE_TOKEN || 'internal'}`
          }
        });
      } catch (balanceError) {
        logger.error(`Failed to update balance for account ${account.id}:`, balanceError.message);
        // Continue with other allocations
      }

      allocations.push({
        account: account.type,
        accountId: account.id,
        amount: splitAmount,
        percentage: account.percentage
      });
    }

    logger.info(`Income allocation completed for user ${userId}: ${allocations.length} allocations created`);

    return {
      message: 'Income allocated successfully',
      allocations: allocationRecords,
      summary: allocations
    };
  } catch (error) {
    logger.error('Income allocation error:', error);
    throw new Error(`Allocation failed: ${error.message}`);
  }
};

// Get allocations for a user
const getAllocations = async (req, res) => {
  try {
    const { accountId, status, limit = 50, offset = 0 } = req.query;
    const userId = req.user.id;

    const filters = {};
    if (accountId) filters.accountId = accountId;
    if (status) filters.status = status;

    const pagination = {
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    const allocations = await Allocation.findByUserId(userId, filters, pagination);

    res.json({
      allocations,
      pagination: {
        limit: pagination.limit,
        offset: pagination.offset
      }
    });
  } catch (error) {
    logger.error('Get allocations error:', error);
    res.status(500).json({ message: 'Failed to retrieve allocations' });
  }
};

// Get allocations for a specific transaction
const getTransactionAllocations = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;

    // Verify transaction ownership
    const transaction = await Transaction.findById(transactionId);
    if (!transaction || transaction.userId !== userId) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const allocations = await Allocation.findByTransactionId(transactionId);

    res.json({ allocations });
  } catch (error) {
    logger.error('Get transaction allocations error:', error);
    res.status(500).json({ message: 'Failed to retrieve transaction allocations' });
  }
};

// Update allocation status
const updateAllocationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!['red', 'green', 'blue'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be red, green, or blue' });
    }

    // Verify allocation ownership
    const allocations = await Allocation.findByUserId(userId, {}, { limit: 1 });
    const allocation = allocations.find(a => a.id === id);

    if (!allocation) {
      return res.status(404).json({ message: 'Allocation not found' });
    }

    const updatedAllocation = await Allocation.updateStatus(id, status);

    res.json(updatedAllocation);
  } catch (error) {
    logger.error('Update allocation status error:', error);
    res.status(500).json({ message: 'Failed to update allocation status' });
  }
};

// Get allocation summary
const getAllocationSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();

    const summary = await Allocation.getUserAllocationSummary(userId, start, end);

    res.json({
      summary,
      period: {
        startDate: start,
        endDate: end
      }
    });
  } catch (error) {
    logger.error('Get allocation summary error:', error);
    res.status(500).json({ message: 'Failed to get allocation summary' });
  }
};

// Manual allocation trigger (for testing/admin purposes)
const triggerAllocation = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const userId = req.user.id;

    // Verify transaction ownership and type
    const transaction = await Transaction.findById(transactionId);
    if (!transaction || transaction.userId !== userId) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.type !== 'income') {
      return res.status(400).json({ message: 'Allocation only available for income transactions' });
    }

    // Check if already allocated
    const existingAllocations = await Allocation.findByTransactionId(transactionId);
    if (existingAllocations.length > 0) {
      return res.status(400).json({ message: 'Transaction already allocated' });
    }

    const result = await allocateIncome(userId, transactionId, transaction.amount, transaction.description);

    res.json(result);
  } catch (error) {
    logger.error('Trigger allocation error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  allocateIncome,
  getAllocations,
  getTransactionAllocations,
  updateAllocationStatus,
  getAllocationSummary,
  triggerAllocation
};