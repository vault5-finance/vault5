const { User, Account } = require('../models');

// Get all users requiring KYC verification
const getKycQueue = async (req, res) => {
  try {
    const { status = 'pending', limit = 20, skip = 0 } = req.query;

    const users = await User.find({
      kycStatus: status,
      role: 'user' // Only regular users need KYC
    })
    .select('name emails phones kycStatus kycLevel accountStatus createdAt')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip));

    const total = await User.countDocuments({
      kycStatus: status,
      role: 'user'
    });

    res.json({
      users,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > parseInt(skip) + parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get KYC queue error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get KYC details for a specific user
const getKycDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('name emails phones kycStatus kycLevel accountStatus createdAt riskFlags')
      .populate('accounts', 'type balance status');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get transaction history for risk assessment
    const transactions = await require('./transactionsController').getTransactions({
      user: { _id: userId },
      query: { limit: 10 }
    });

    res.json({
      user,
      recentTransactions: transactions || []
    });
  } catch (error) {
    console.error('Get KYC details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve KYC for a user
const approveKyc = async (req, res) => {
  try {
    const { userId } = req.params;
    const { kycLevel = 'Tier1', notes } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.kycStatus !== 'pending') {
      return res.status(400).json({ message: 'User KYC is not pending' });
    }

    // Update KYC status
    user.kycStatus = 'approved';
    user.kycLevel = kycLevel;
    user.kycCompleted = true;

    // Remove any limitations if they were KYC-related
    if (user.limitationStatus === 'temporary_30' || user.limitationStatus === 'temporary_180') {
      user.limitationStatus = 'none';
      user.limitationReason = '';
    }

    // Update account limits based on KYC level
    if (kycLevel === 'Tier2') {
      user.limitsTier = 'premium';
    } else if (kycLevel === 'Tier1') {
      user.limitsTier = 'basic';
    }

    await user.save();

    // Log the approval
    console.log(`KYC approved for user ${userId} by admin ${req.user._id}. Level: ${kycLevel}`);

    res.json({
      message: 'KYC approved successfully',
      user: {
        id: user._id,
        name: user.name,
        kycStatus: user.kycStatus,
        kycLevel: user.kycLevel,
        limitsTier: user.limitsTier
      }
    });
  } catch (error) {
    console.error('Approve KYC error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reject KYC for a user
const rejectKyc = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, limitationPeriod = 'temporary_30' } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.kycStatus !== 'pending') {
      return res.status(400).json({ message: 'User KYC is not pending' });
    }

    // Update KYC status
    user.kycStatus = 'rejected';
    user.limitationStatus = limitationPeriod;
    user.limitationReason = reason || 'KYC verification failed';

    // Set limitation expiry
    if (limitationPeriod === 'temporary_30') {
      user.limitationExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    } else if (limitationPeriod === 'temporary_180') {
      user.limitationExpiresAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000); // 180 days
    }

    await user.save();

    // Log the rejection
    console.log(`KYC rejected for user ${userId} by admin ${req.user._id}. Reason: ${reason}`);

    res.json({
      message: 'KYC rejected',
      user: {
        id: user._id,
        name: user.name,
        kycStatus: user.kycStatus,
        limitationStatus: user.limitationStatus,
        limitationReason: user.limitationReason
      }
    });
  } catch (error) {
    console.error('Reject KYC error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get KYC statistics for dashboard
const getKycStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $match: { role: 'user' }
      },
      {
        $group: {
          _id: '$kycStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalUsers = await User.countDocuments({ role: 'user' });
    const pendingUsers = await User.countDocuments({ role: 'user', kycStatus: 'pending' });

    res.json({
      totalUsers,
      pendingUsers,
      stats: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      approved: stats.find(s => s._id === 'approved')?.count || 0,
      rejected: stats.find(s => s._id === 'rejected')?.count || 0,
      notRequired: stats.find(s => s._id === 'not_required')?.count || 0
    });
  } catch (error) {
    console.error('Get KYC stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Bulk approve KYC for multiple users
const bulkApproveKyc = async (req, res) => {
  try {
    const { userIds, kycLevel = 'Tier1' } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs array is required' });
    }

    const result = await User.updateMany(
      {
        _id: { $in: userIds },
        kycStatus: 'pending'
      },
      {
        kycStatus: 'approved',
        kycLevel: kycLevel,
        kycCompleted: true,
        limitationStatus: 'none',
        limitationReason: ''
      }
    );

    console.log(`Bulk KYC approved for ${result.modifiedCount} users by admin ${req.user._id}`);

    res.json({
      message: `${result.modifiedCount} users approved successfully`,
      approvedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk approve KYC error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getKycQueue,
  getKycDetails,
  approveKyc,
  rejectKyc,
  getKycStats,
  bulkApproveKyc
};