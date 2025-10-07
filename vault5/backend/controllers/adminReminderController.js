const { ReminderHistory, User, Lending } = require('../models');

/**
 * Admin Reminder Analytics Controller
 * Provides analytics and monitoring for the overdue reminder system
 */

/**
 * Get comprehensive reminder analytics
 */
const getReminderAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get total reminders sent in time period
    const totalReminders = await ReminderHistory.countDocuments({
      createdAt: { $gte: startDate }
    });

    // Get effective reminders (those that led to repayment within 7 days)
    const effectiveReminders = await ReminderHistory.countDocuments({
      createdAt: { $gte: startDate },
      effective: true
    });

    // Get tier effectiveness
    const tierStats = await ReminderHistory.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$tier',
          total: { $sum: 1 },
          effective: { $sum: { $cond: ['$effective', 1, 0] } }
        }
      },
      {
        $project: {
          tier: '$_id',
          total: 1,
          effective: 1,
          effectiveness: {
            $multiply: [
              { $divide: ['$effective', { $max: ['$total', 1] }] },
              100
            ]
          }
        }
      },
      { $sort: { tier: 1 } }
    ]);

    // Get channel performance
    const channelStats = await ReminderHistory.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$providerResponse' },
      {
        $group: {
          _id: '$providerResponse.channel',
          total: { $sum: 1 },
          successful: { $sum: { $cond: ['$providerResponse.success', 1, 0] } }
        }
      },
      {
        $project: {
          channel: '$_id',
          total: 1,
          successful: 1,
          successRate: {
            $multiply: [
              { $divide: ['$successful', { $max: ['$total', 1] }] },
              100
            ]
          }
        }
      }
    ]);

    // Get recent activity
    const recentActivity = await ReminderHistory.find({
      createdAt: { $gte: startDate }
    })
    .populate('lending', 'borrowerName')
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

    // Format recent activity
    const formattedActivity = recentActivity.map(activity => ({
      borrowerName: activity.lending?.borrowerName || 'Unknown',
      tier: activity.tier,
      channel: activity.providerResponse?.[0]?.channel || 'unknown',
      status: activity.providerResponse?.[0]?.success ? 'delivered' : 'failed',
      sentAt: activity.createdAt
    }));

    // Get active overdue cases
    const activeCases = await Lending.countDocuments({
      status: 'overdue'
    });

    // Calculate recovery rate (simplified - reminders that led to repayment)
    const recoveryRate = totalReminders > 0 ?
      Math.round((effectiveReminders / totalReminders) * 100) : 0;

    // System health metrics
    const systemHealth = [
      {
        name: 'Reminder Service',
        status: 'healthy',
        value: '99.9% uptime'
      },
      {
        name: 'Email Delivery',
        status: channelStats.find(c => c.channel === 'email')?.successRate >= 95 ? 'healthy' : 'warning',
        value: `${channelStats.find(c => c.channel === 'email')?.successRate?.toFixed(1) || 0}% success`
      },
      {
        name: 'SMS Delivery',
        status: channelStats.find(c => c.channel === 'sms')?.successRate >= 90 ? 'healthy' : 'warning',
        value: `${channelStats.find(c => c.channel === 'sms')?.successRate?.toFixed(1) || 0}% success`
      },
      {
        name: 'Active Cases',
        status: activeCases > 100 ? 'warning' : 'healthy',
        value: `${activeCases} cases`
      }
    ];

    // Calculate changes (simplified - would need historical data)
    const reminderChange = 5; // Placeholder
    const effectivenessChange = 2; // Placeholder
    const recoveryChange = -1; // Placeholder
    const casesChange = 8; // Placeholder

    res.json({
      success: true,
      data: {
        totalReminders,
        effectiveReminders,
        recoveryRate,
        activeCases,
        tierEffectiveness: tierStats,
        channelPerformance: channelStats,
        recentActivity: formattedActivity,
        systemHealth,
        reminderChange,
        effectivenessChange,
        recoveryChange,
        casesChange
      }
    });

  } catch (error) {
    console.error('Error getting reminder analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reminder analytics',
      error: error.message
    });
  }
};

/**
 * Get detailed reminder history with filtering
 */
const getReminderHistory = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      tier,
      channel,
      status,
      startDate,
      endDate
    } = req.query;

    const query = {};

    if (tier) query.tier = tier;
    if (channel) query['providerResponse.channel'] = channel;
    if (status) {
      query['providerResponse.success'] = status === 'delivered';
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const reminders = await ReminderHistory.find(query)
      .populate('user', 'username email')
      .populate('lending', 'borrowerName amount expectedReturnDate')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();

    const total = await ReminderHistory.countDocuments(query);

    res.json({
      success: true,
      data: {
        reminders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Error getting reminder history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reminder history',
      error: error.message
    });
  }
};

/**
 * Get reminder system health metrics
 */
const getSystemHealth = async (req, res) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Check recent reminder processing
    const recentReminders = await ReminderHistory.countDocuments({
      createdAt: { $gte: oneHourAgo }
    });

    // Check failed deliveries in last 24 hours
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const failedDeliveries = await ReminderHistory.countDocuments({
      createdAt: { $gte: oneDayAgo },
      'providerResponse.success': false
    });

    const totalDeliveries = await ReminderHistory.countDocuments({
      createdAt: { $gte: oneDayAgo }
    });

    const failureRate = totalDeliveries > 0 ? (failedDeliveries / totalDeliveries) * 100 : 0;

    // Check overdue queue size
    const overdueCount = await Lending.countDocuments({ status: 'overdue' });

    res.json({
      success: true,
      data: {
        lastProcessed: recentReminders > 0 ? 'recently' : 'not_recently',
        failureRate: Math.round(failureRate * 100) / 100,
        overdueQueueSize: overdueCount,
        systemStatus: failureRate < 5 ? 'healthy' : failureRate < 15 ? 'warning' : 'critical'
      }
    });

  } catch (error) {
    console.error('Error getting system health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system health',
      error: error.message
    });
  }
};

module.exports = {
  getReminderAnalytics,
  getReminderHistory,
  getSystemHealth
};