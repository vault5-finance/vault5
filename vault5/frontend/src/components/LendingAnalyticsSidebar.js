import React from 'react';
import { motion } from 'framer-motion';

const LendingAnalyticsSidebar = ({ analytics, overdueSummary }) => {
  const funnelData = analytics?.funnel || {
    requested: 0,
    funded: 0,
    repaid: 0,
    defaulted: 0
  };

  const repaymentRate = analytics?.repaymentRate || 0;
  const totalOutstanding = analytics?.totalOutstanding || 0;

  const getFunnelStep = (label, count, total, color, icon) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return { label, count, percentage, color, icon };
  };

  const funnelSteps = [
    getFunnelStep('Requested', funnelData.requested, funnelData.requested, 'bg-blue-500', '📝'),
    getFunnelStep('Funded', funnelData.funded, funnelData.requested, 'bg-purple-500', '💰'),
    getFunnelStep('Repaid', funnelData.repaid, funnelData.funded, 'bg-green-500', '✅'),
    getFunnelStep('Defaulted', funnelData.defaulted, funnelData.funded, 'bg-red-500', '❌')
  ];

  return (
    <div className="space-y-6">
      {/* Overdue Alert Card */}
      {overdueSummary && overdueSummary.totalCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🚨</span>
            <h3 className="font-semibold text-red-800">Overdue Alert</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-red-700">Items Overdue</span>
              <span className="font-bold text-red-800">{overdueSummary.totalCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-red-700">Total Amount</span>
              <span className="font-bold text-red-800">
                KES {overdueSummary.totalAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-red-700">Avg Days Overdue</span>
              <span className="font-bold text-red-800">
                {Math.round(overdueSummary.lendings.reduce((sum, l) => sum + l.daysOverdue, 0) / overdueSummary.totalCount)} days
              </span>
            </div>
          </div>

          <motion.button
            className="w-full mt-4 bg-red-600 text-white py-2 px-4 rounded-xl font-medium hover:bg-red-700 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Process Overdue Reminders
          </motion.button>
        </motion.div>
      )}

      {/* Lending Funnel */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-xl">📊</span>
          Lending Funnel
        </h3>

        <div className="space-y-3">
          {funnelSteps.map((step, index) => (
            <div key={step.label} className="relative">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{step.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{step.label}</span>
                </div>
                <div className="text-sm font-bold text-gray-900">{step.count}</div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${step.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${step.percentage}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              </div>

              <div className="text-xs text-gray-500 mt-1">
                {step.percentage.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-xl">📈</span>
          Key Metrics
        </h3>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Repayment Rate</span>
            <div className={`text-lg font-bold ${repaymentRate >= 80 ? 'text-green-600' : repaymentRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {repaymentRate.toFixed(1)}%
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Outstanding</span>
            <div className="text-lg font-bold text-gray-900">
              KES {totalOutstanding.toLocaleString()}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Fund → Repay Time</span>
            <div className="text-lg font-bold text-gray-900">
              {analytics?.avgRepaymentDays || 0} days
            </div>
          </div>
        </div>
      </div>

      {/* Repayment Heatmap Placeholder */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-xl">📅</span>
          Repayment Patterns
        </h3>

        <div className="text-center py-8 text-gray-500">
          <div className="text-3xl mb-2">📊</div>
          <p className="text-sm">Heatmap visualization</p>
          <p className="text-xs">Coming soon</p>
        </div>
      </div>

      {/* Top Borrowers */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-xl">👥</span>
          Top Borrowers
        </h3>

        <div className="space-y-3">
          {analytics?.topBorrowers?.slice(0, 3).map((borrower, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {borrower.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{borrower.name}</div>
                  <div className="text-xs text-gray-500">{borrower.repaymentRate}% repayment</div>
                </div>
              </div>
              <div className="text-sm font-bold text-gray-900">
                KES {borrower.totalAmount.toLocaleString()}
              </div>
            </div>
          )) || (
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm">No borrower data yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LendingAnalyticsSidebar;