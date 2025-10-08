import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Clock,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import api from '../services/api';

const WalletAnalytics = ({ walletId, period = 'month' }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, [walletId, period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/wallet/analytics?period=${period}`);
      if (response.data && response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (err) {
      setError('Failed to load analytics');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="text-center text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Analytics data not available</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => `KES ${amount?.toLocaleString() || '0'}`;

  const spendingCategories = analytics.spendingByCategory || [];
  const monthlyTrend = analytics.monthlyTrend || [];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-blue-600" />
            <span className="text-xs font-medium text-blue-600 bg-blue-200 px-2 py-1 rounded-full">
              This Period
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-900 mb-1">
            {formatCurrency(analytics.totalSpent)}
          </div>
          <div className="text-sm text-blue-700">Total Spent</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <span className="text-xs font-medium text-green-600 bg-green-200 px-2 py-1 rounded-full">
              +{analytics.transactionCount}
            </span>
          </div>
          <div className="text-2xl font-bold text-green-900 mb-1">
            {analytics.averageTransaction?.toFixed(0) || 0}
          </div>
          <div className="text-sm text-green-700">Avg Transaction</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 text-purple-600" />
            <span className="text-xs font-medium text-purple-600 bg-purple-200 px-2 py-1 rounded-full">
              Active
            </span>
          </div>
          <div className="text-2xl font-bold text-purple-900 mb-1">
            {analytics.activeDays || 0}
          </div>
          <div className="text-sm text-purple-700">Active Days</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-orange-600" />
            <span className="text-xs font-medium text-orange-600 bg-orange-200 px-2 py-1 rounded-full">
              Goal
            </span>
          </div>
          <div className="text-2xl font-bold text-orange-900 mb-1">
            {analytics.savingsRate || 0}%
          </div>
          <div className="text-sm text-orange-700">Savings Rate</div>
        </div>
      </div>

      {/* Spending Breakdown */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <PieChart className="w-6 h-6 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Spending Breakdown</h3>
        </div>

        {spendingCategories.length > 0 ? (
          <div className="space-y-4">
            {spendingCategories.slice(0, 5).map((category, index) => (
              <div key={category._id || index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="font-medium text-gray-900 capitalize">
                    {category._id || 'Other'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(category.total)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {category.count} transactions
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <PieChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No spending data available</p>
          </div>
        )}
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-6 h-6 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Monthly Trend</h3>
        </div>

        {monthlyTrend.length > 0 ? (
          <div className="space-y-4">
            {monthlyTrend.slice(-6).map((month, index) => (
              <div key={month._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900">
                    {new Date(month._id.year, month._id.month - 1).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short'
                    })}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(month.totalSpent)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {month.transactionCount} transactions
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No trend data available</p>
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-indigo-900">Financial Insights</h3>
        </div>

        <div className="space-y-3">
          {analytics.insights?.map((insight, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
              <div className={`p-1 rounded-full ${
                insight.type === 'positive' ? 'bg-green-100' :
                insight.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
              }`}>
                {insight.type === 'positive' ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : insight.type === 'warning' ? (
                  <TrendingDown className="w-4 h-4 text-yellow-600" />
                ) : (
                  <Activity className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{insight.title}</p>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
            </div>
          )) || (
            <div className="text-center py-4 text-indigo-700">
              <p className="text-sm">Keep using your wallet to see personalized insights!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletAnalytics;