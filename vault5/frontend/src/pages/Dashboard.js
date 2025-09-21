import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import api from '../services/api';
import AddFundsModal from '../components/AddFundsModal';
import { useToast } from '../contexts/ToastContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

ChartJS.register(ArcElement, Tooltip, Legend);

// Generate AI insights based on user data
const generateInsights = (dashboardData, accounts, transactions) => {
  const insights = [];

  // Check allocation health
  const redAccounts = accounts.filter(acc => acc.status === 'red');
  if (redAccounts.length > 0) {
    insights.push({
      type: 'warning',
      title: 'Allocation Alert',
      message: `${redAccounts.length} account(s) are behind target. Consider adding more income or adjusting allocations.`,
      icon: '⚠️'
    });
  }

  // Check surplus accounts
  const surplusAccounts = accounts.filter(acc => acc.status === 'blue');
  if (surplusAccounts.length > 0) {
    insights.push({
      type: 'success',
      title: 'Surplus Detected',
      message: `You have surplus funds in ${surplusAccounts.length} account(s). Consider investing or lending.`,
      icon: '💰'
    });
  }

  // Recent transaction analysis
  const recentIncome = transactions.filter(t => t.type === 'income').slice(0, 3);
  if (recentIncome.length > 0) {
    const totalRecentIncome = recentIncome.reduce((sum, t) => sum + t.amount, 0);
    insights.push({
      type: 'info',
      title: 'Income Trend',
      message: `Recent income: KES ${totalRecentIncome.toFixed(2)}. Keep up the good work!`,
      icon: '📈'
    });
  }

  // Health score insights
  if (dashboardData.healthScore < 50) {
    insights.push({
      type: 'danger',
      title: 'Health Score Low',
      message: 'Your financial health score is below 50%. Focus on consistent income and disciplined spending.',
      icon: '🏥'
    });
  } else if (dashboardData.healthScore > 80) {
    insights.push({
      type: 'success',
      title: 'Excellent Health',
      message: 'Your financial health is excellent! You\'re on track for financial freedom.',
      icon: '🎉'
    });
  }

  // Empty state insights
  if (accounts.every(acc => acc.balance === 0)) {
    insights.push({
      type: 'info',
      title: 'Getting Started',
      message: 'Welcome to Vault5! Start by adding your first income to see your allocations in action.',
      icon: '🚀'
    });
  }

  return insights.slice(0, 3); // Return top 3 insights
};

const Dashboard = () => {
  const { showInfo } = useToast();
  const [data, setData] = useState({ allocationData: [], healthScore: 0, totalBalance: 0 });
  const [accounts, setAccounts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [dashboardRes, accountsRes, transactionsRes] = await Promise.all([
          api.get('/api/reports/dashboard'),
          api.get('/api/accounts'),
          api.get('/api/transactions?limit=5')
        ]);

        setData(dashboardRes.data);
        setAccounts(accountsRes.data);
        setRecentTransactions(transactionsRes.data);

        // Generate AI insights
        const insights = generateInsights(dashboardRes.data, accountsRes.data, transactionsRes.data);
        setInsights(insights);

        setLoading(false);
      } catch (error) {
        console.error('Dashboard data error:', error);
        if (error.response?.status === 401) navigate('/login');
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  const pieData = {
    labels: data.allocationData.map(acc => acc.type),
    datasets: [{
      data: data.allocationData.map(acc => acc.balance),
      backgroundColor: data.allocationData.map(acc => acc.status === 'red' ? '#ef4444' : acc.status === 'green' ? '#10b981' : '#3b82f6'),
    }]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'red': return 'var(--danger)'; // debt
      case 'green': return 'var(--success)'; // on-target
      case 'blue': return 'var(--info)'; // surplus
      default: return 'var(--gray-500)';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'red': return 'var(--danger-light)';
      case 'green': return 'var(--success-light)';
      case 'blue': return 'var(--info-light)';
      default: return 'var(--gray-100)';
    }
  };

  const getProgressPercentage = (account) => {
    // Show allocation compliance % toward target allocation
    const targetAmount = data.totalBalance * (account.percentage / 100);
    if (targetAmount > 0) {
      return Math.min((account.balance / targetAmount) * 100, 100);
    }
    return 0; // Default to 0 if no target
  };


  const handleAddFunds = () => {
    setShowAddFundsModal(true);
  };

  const handleIncomeSuccess = () => {
    // Refresh dashboard data
    const fetchData = async () => {
      try {
        const [dashboardRes, accountsRes] = await Promise.all([
          api.get('/api/reports/dashboard'),
          api.get('/api/accounts')
        ]);
        setData(dashboardRes.data);
        setAccounts(accountsRes.data);
      } catch (error) {
        console.error('Failed to refresh data:', error);
      }
    };
    fetchData();
  };

  const handleViewReports = () => {
    navigate('/reports');
  };

  const handleManageInvestments = () => {
    navigate('/investments');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Primary Actions */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleAddFunds}
            className="p-4 md:p-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow hover:from-green-600 hover:to-emerald-700 transition font-semibold text-base md:text-lg"
          >
            + Add Funds
          </button>
          <button
            onClick={() => showInfo('Send Money feature coming soon!')}
            className="p-4 md:p-5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg shadow hover:from-indigo-600 hover:to-blue-700 transition font-semibold text-base md:text-lg"
          >
            ⇄ Send Money
          </button>
          <button
            onClick={() => navigate('/accounts')}
            className="p-4 md:p-5 bg-gradient-to-r from-slate-500 to-gray-600 text-white rounded-lg shadow hover:from-slate-600 hover:to-gray-700 transition font-semibold text-base md:text-lg"
          >
            Vault Accounts
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Total Balance</h2>
          <p className="text-2xl text-blue-600">KES {data.totalBalance?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Vault Wallet</h2>
          <p className="text-2xl text-indigo-600">KES {data.walletBalance?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Health Score</h2>
          <p className="text-2xl text-purple-600">{data.healthScore || 0}%</p>
        </div>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">AI Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {insights.map((insight, index) => (
              <div key={index} className={`p-4 rounded-lg shadow ${
                insight.type === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-400' :
                insight.type === 'success' ? 'bg-green-50 border-l-4 border-green-400' :
                insight.type === 'danger' ? 'bg-red-50 border-l-4 border-red-400' :
                'bg-blue-50 border-l-4 border-blue-400'
              }`}>
                <div className="flex items-start">
                  <span className="text-2xl mr-3">{insight.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{insight.title}</h3>
                    <p className="text-sm text-gray-700">{insight.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Features Quick Access */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">AI-Powered Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow border-l-4 border-blue-500">
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">📊</span>
              <h3 className="text-lg font-semibold">Cash Flow Forecasting</h3>
            </div>
            <p className="text-gray-600 mb-4">AI-powered predictions for your future cash flow based on spending patterns.</p>
            <button
              onClick={() => navigate('/reports')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              View Forecasts
            </button>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg shadow border-l-4 border-green-500">
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">🎯</span>
              <h3 className="text-lg font-semibold">Smart Recommendations</h3>
            </div>
            <p className="text-gray-600 mb-4">Personalized budget optimization and debt reduction strategies.</p>
            <button
              onClick={() => navigate('/reports')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              Get Recommendations
            </button>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg shadow border-l-4 border-purple-500">
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">🏆</span>
              <h3 className="text-lg font-semibold">Financial Wellness</h3>
            </div>
            <p className="text-gray-600 mb-4">Track your financial health score and earn achievements.</p>
            <button
              onClick={() => navigate('/reports')}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
            >
              View Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Recent Transactions</h2>
            <button
              onClick={() => navigate('/transactions')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All →
            </button>
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.type === 'income'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                          {transaction.type === 'income' ? '+' : '-'}KES {transaction.amount.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Accounts quick link */}
      <div className="mb-8">
        <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-1">Vault Accounts</h2>
            <p className="text-sm text-gray-600">Manage Daily, Fun, Emergency, Long-Term, and Investment rules and actions.</p>
          </div>
          <button
            onClick={() => navigate('/accounts')}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Open Accounts Center
          </button>
        </div>
      </div>

      {/* Charts and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Allocation Compliance</h2>
          {data.allocationData && data.allocationData.length > 0 ? (
            <Pie data={pieData} />
          ) : (
            <p className="text-gray-500">No allocation data available</p>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => showInfo('Send Money feature coming soon!')}
              className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 font-medium text-sm"
            >
              Send Money
            </button>
            <button
              onClick={() => showInfo('Pay Bills feature coming soon!')}
              className="p-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition duration-200 font-medium text-sm"
            >
              Pay Bills
            </button>
            <button
              onClick={handleViewReports}
              className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200 font-medium text-sm"
            >
              View History
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Summary Chart */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Weekly Summary</h2>
        {recentTransactions.length > 0 ? (
          <div className="h-64">
            <Bar
              data={{
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                  {
                    label: 'Income',
                    data: [1200, 0, 800, 0, 1500, 0, 0], // Mock data - would be calculated from actual transactions
                    backgroundColor: 'rgba(34, 197, 94, 0.8)',
                    borderColor: 'rgba(34, 197, 94, 1)',
                    borderWidth: 1,
                  },
                  {
                    label: 'Expenses',
                    data: [200, 150, 300, 100, 400, 250, 180], // Mock data - would be calculated from actual transactions
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return 'KES ' + value;
                      }
                    }
                  }
                },
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return context.dataset.label + ': KES ' + context.parsed.y;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">No transaction data yet</p>
              <p className="text-sm">Add some transactions to see your weekly summary</p>
            </div>
          </div>
        )}
      </div>

      <AddFundsModal
        isOpen={showAddFundsModal}
        onClose={() => setShowAddFundsModal(false)}
        onSuccess={handleIncomeSuccess}
      />
    </div>
  );
};

export default Dashboard;