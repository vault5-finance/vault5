import React, { useState, useEffect } from 'react';
import walletService from '../services/walletService';

const WalletAnalytics = ({ wallet }) => {
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadAnalytics();
    loadInsights();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await walletService.getWalletOverview(timeRange);
      if (response.success) {
        setAnalytics(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to load analytics');
      console.error('Load analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadInsights = async () => {
    try {
      const response = await walletService.getWalletInsights();
      if (response.success) {
        setInsights(response.data);
      }
    } catch (err) {
      console.error('Load insights error:', err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'strongly_increasing':
      case 'increasing':
        return <span className="text-green-500">↗</span>;
      case 'strongly_decreasing':
      case 'decreasing':
        return <span className="text-red-500">↘</span>;
      default:
        return <span className="text-gray-500">→</span>;
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'warning':
        return <span className="text-yellow-500">⚠️</span>;
      case 'danger':
        return <span className="text-red-500">🚨</span>;
      case 'info':
        return <span className="text-blue-500">ℹ️</span>;
      default:
        return <span className="text-gray-500">💡</span>;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">Error</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={loadAnalytics}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Wallet Analytics</h2>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>

        {/* Key Metrics */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Current Balance</div>
              <div className="text-2xl font-bold text-blue-900">
                {formatCurrency(analytics.wallet.balance)}
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Total Recharged</div>
              <div className="text-2xl font-bold text-green-900">
                {formatCurrency(analytics.stats.totalRecharged)}
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600 font-medium">Total Spent</div>
              <div className="text-2xl font-bold text-purple-900">
                {formatCurrency(analytics.stats.totalSpent)}
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm text-orange-600 font-medium">Transactions</div>
              <div className="text-2xl font-bold text-orange-900">
                {analytics.stats.transactionCount}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Trends */}
      {analytics && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Spending Trends</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">
                {getTrendIcon(analytics.trends.rechargeTrend)}
              </div>
              <div className="text-sm text-gray-600">Recharge Trend</div>
              <div className="font-medium capitalize">
                {analytics.trends.rechargeTrend.replace('_', ' ')}
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl mb-2">
                {getTrendIcon(analytics.trends.spendingTrend)}
              </div>
              <div className="text-sm text-gray-600">Spending Trend</div>
              <div className="font-medium capitalize">
                {analytics.trends.spendingTrend.replace('_', ' ')}
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl mb-2">
                {getTrendIcon(analytics.trends.volumeTrend)}
              </div>
              <div className="text-sm text-gray-600">Volume Trend</div>
              <div className="font-medium capitalize">
                {analytics.trends.volumeTrend.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spending Patterns */}
      {analytics && analytics.spendingPatterns && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Spending by Account</h3>
          <div className="space-y-3">
            {Object.entries(analytics.spendingPatterns.byAccount)
              .sort(([,a], [,b]) => b.total - a.total)
              .slice(0, 5)
              .map(([account, data]) => (
                <div key={account} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium capitalize">{account}</div>
                    <div className="text-sm text-gray-600">
                      {data.count} transactions
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(data.total)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Avg: {formatCurrency(data.average)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Insights */}
      {insights && insights.insights && insights.insights.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Insights & Recommendations</h3>

          {/* Health Score */}
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <div className="flex items-center justify-between">
              <span className="font-medium">Wallet Health Score</span>
              <span className={`text-2xl font-bold ${
                insights.healthScore >= 80 ? 'text-green-600' :
                insights.healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {insights.healthScore}/100
              </span>
            </div>
          </div>

          {/* Insights */}
          <div className="space-y-3">
            {insights.insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                <span className="text-lg">{getInsightIcon(insight.type)}</span>
                <div>
                  <div className="font-medium">{insight.message}</div>
                  {insight.action && (
                    <div className="text-sm text-gray-600 mt-1">
                      Suggested action: {insight.action.replace('_', ' ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          {insights.recommendations && insights.recommendations.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Recommendations</h4>
              <ul className="space-y-2">
                {insights.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Payment Methods */}
      {analytics && analytics.spendingPatterns && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Recharge Methods</h3>
          <div className="space-y-3">
            {Object.entries(analytics.rechargePatterns.byMethod)
              .sort(([,a], [,b]) => b.total - a.total)
              .slice(0, 5)
              .map(([method, data]) => (
                <div key={method} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium capitalize">{method}</div>
                    <div className="text-sm text-gray-600">
                      {data.count} recharges
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(data.total)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Avg: {formatCurrency(data.average)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletAnalytics;