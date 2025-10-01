import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import api from '../services/api';
import AddFundsModal from '../components/AddFundsModal';
import SendMoneyModal from '../components/SendMoneyModal';

import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { PaperAirplaneIcon, PlusCircleIcon, FlagIcon, ArrowTrendingUpIcon, ArrowDownCircleIcon, BanknotesIcon, ShoppingBagIcon, HeartIcon, ShieldCheckIcon, PiggyBankIcon, ChartBarIcon, XMarkIcon, CheckIcon, EyeIcon } from '@heroicons/react/24/solid';
import { InformationCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import DashboardSkeleton from '../components/DashboardSkeleton';
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
  const [data, setData] = useState({ allocationData: [], healthScore: 0, totalBalance: 0 });
  const [accounts, setAccounts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showSendMoneyModal, setShowSendMoneyModal] = useState(false);
  const navigate = useNavigate();

  // Local-time greeting with emoji context
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const firstName = (user?.name || '').split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greetingData =
    hour < 12 ? { text: 'Good morning', emoji: '🌅', subtext: 'Start your day with financial clarity' } :
    hour < 17 ? { text: 'Good afternoon', emoji: '🌞', subtext: 'Keep building your financial future' } :
    { text: 'Good evening', emoji: '🌙', subtext: 'Review your progress and plan ahead' };

  const fetchDashboardData = React.useCallback(async () => {
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
      const generated = generateInsights(dashboardRes.data, accountsRes.data, transactionsRes.data);
      setInsights(generated);

      setLoading(false);
    } catch (error) {
      console.error('Dashboard data error:', error);
      if (error.response?.status === 401) navigate('/login');
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [navigate, fetchDashboardData]);

  const handleIncomeSuccess = () => {
    fetchDashboardData();
  };

  const handleSendMoneySuccess = () => {
    fetchDashboardData();
  };

  if (loading) return <DashboardSkeleton />;

  const pieData = {
    labels: data.allocationData.map(acc => acc.type),
    datasets: [{
      data: data.allocationData.map(acc => acc.balance),
      backgroundColor: data.allocationData.map(acc =>
        acc.status === 'red' ? 'rgb(239 68 68)' :
        acc.status === 'green' ? 'rgb(5 150 105)' :
        'rgb(15 76 140)'
      ),
      borderColor: data.allocationData.map(acc =>
        acc.status === 'red' ? 'rgb(220 38 38)' :
        acc.status === 'green' ? 'rgb(5 150 105)' :
        'rgb(15 76 140)'
      ),
      borderWidth: 2,
    }]
  };



  const handleSendMoney = () => {
    setShowSendMoneyModal(true);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900">
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Enhanced Header with Command Center Feel */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Greeting Section */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{greetingData.emoji}</span>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                {greetingData.text}, <span className="text-blue-600 dark:text-blue-400">{firstName}</span>
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">{greetingData.subtext}</p>
          </div>

          {/* Floating Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <motion.button
              onClick={handleSendMoney}
              className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-3 font-semibold overflow-hidden"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              title="Send funds instantly"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <PaperAirplaneIcon className="h-5 w-5 relative z-10" />
              <span className="relative z-10">Send Money</span>
            </motion.button>

            <motion.button
              onClick={() => navigate('/accounts')}
              className="group relative px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-3 font-semibold overflow-hidden"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              title="Create a savings bucket"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <PlusCircleIcon className="h-5 w-5 relative z-10" />
              <span className="relative z-10">Add Account</span>
            </motion.button>

            <motion.button
              onClick={() => navigate('/accounts#goals')}
              className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-3 font-semibold overflow-hidden"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              title="Set a financial goal"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <FlagIcon className="h-5 w-5 relative z-10" />
              <span className="relative z-10">Create Goal</span>
            </motion.button>
          </div>
        </motion.div>

      {/* Primary Actions moved to header Quick Actions */}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="relative bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 hover:border-emi-blue/20 group">
          <div className="absolute right-4 top-4 w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
            <BanknotesIcon className="h-5 w-5 text-emi-blue" />
          </div>
          <h2 className="text-sm font-medium text-gray-500 mb-2">Vault Wallet</h2>
          <p className="text-3xl font-bold text-emi-blue">
            KES <CountUp end={Number(data.walletBalance || 0)} duration={1.5} decimals={2} separator="," />
          </p>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-primary rounded-b-xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
        </div>
        <div className="relative bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 hover:border-emi-teal/20 group">
          <div className="absolute right-4 top-4 w-10 h-10 bg-gradient-info rounded-full flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowTrendingUpIcon className="h-5 w-5 text-emi-teal" />
          </div>
          <h2 className="text-sm font-medium text-gray-500 mb-2">Health Score</h2>
          <p className="text-3xl font-bold text-emi-teal">
            <CountUp end={Number(data.healthScore || 0)} duration={1.5} suffix="%" />
          </p>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-info rounded-b-xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
        </div>
        <div className="relative bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 hover:border-emi-green/20 group">
          <div className="absolute right-4 top-4 w-10 h-10 bg-gradient-success rounded-full flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowDownCircleIcon className="h-5 w-5 text-emi-green" />
          </div>
          <h2 className="text-sm font-medium text-gray-500 mb-2">Active Accounts</h2>
          <p className="text-3xl font-bold text-emi-green">
            <CountUp end={Number(accounts.length || 0)} duration={1} />
          </p>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-success rounded-b-xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
        </div>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">AI Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-xl shadow ${
                  insight.type === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-400' :
                  insight.type === 'success' ? 'bg-green-50 border-l-4 border-green-400' :
                  insight.type === 'danger' ? 'bg-red-50 border-l-4 border-red-400' :
                  'bg-blue-50 border-l-4 border-blue-400'
                }`}
              >
                <div className="flex items-start">
                  <div className="bg-white p-2 rounded-full shadow mr-3">
                    <span className="text-xl">{insight.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{insight.title}</h3>
                    <p className="text-sm text-gray-700">{insight.message}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* AI Features Quick Access */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">AI-Powered Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group relative p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1" style={{ background: 'linear-gradient(135deg, rgba(15,76,140,0.05), rgba(59,130,246,0.1))' }}>
            <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity">
              <span className="text-lg">📊</span>
            </div>
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cash Flow Forecasting</h3>
            </div>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">AI-powered predictions for your future cash flow based on spending patterns.</p>
            <button
              onClick={() => navigate('/reports')}
              className="w-full md:w-auto px-4 py-2 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-md"
              style={{ background: 'var(--gradient-primary)' }}
            >
              View Forecasts
            </button>
          </div>

          <div className="group relative p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1" style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.05), rgba(16,185,129,0.1))' }}>
            <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-success rounded-full flex items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity">
              <span className="text-lg">🎯</span>
            </div>
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Smart Recommendations</h3>
            </div>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">Personalized budget optimization and debt reduction strategies.</p>
            <button
              onClick={() => navigate('/reports')}
              className="w-full md:w-auto px-4 py-2 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-md"
              style={{ background: 'var(--gradient-success)' }}
            >
              Get Recommendations
            </button>
          </div>

          <div className="group relative p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1" style={{ background: 'linear-gradient(135deg, rgba(8,145,178,0.05), rgba(6,182,212,0.1))' }}>
            <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-info rounded-full flex items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity">
              <span className="text-lg">🏆</span>
            </div>
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Financial Wellness</h3>
            </div>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">Track your financial health score and earn achievements.</p>
            <button
              onClick={() => navigate('/reports')}
              className="w-full md:w-auto px-4 py-2 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-md"
              style={{ background: 'var(--gradient-info)' }}
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              View My Activity →
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
                    <tr key={transaction._id} className="odd:bg-gray-50 hover:bg-gray-100">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {transaction.type === 'income' ? (
                            <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDownCircleIcon className="h-4 w-4 text-red-600" />
                          )}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            transaction.type === 'income'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.type}
                          </span>
                        </div>
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
            <div className="px-4 py-3 border-t">
              <button
                onClick={() => navigate('/transactions')}
                className="w-full inline-flex items-center justify-center px-4 py-2 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-md"
                style={{ background: 'var(--gradient-primary)' }}
              >
                View My Activity →
              </button>
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Allocation Compliance</h2>
            <InformationCircleIcon className="h-5 w-5 text-gray-400" title="Distribution across accounts with status colors" />
          </div>
          {data.allocationData && data.allocationData.length > 0 ? (
            <Pie data={pieData} />
          ) : (
            <p className="text-gray-500">No allocation data available</p>
          )}
        </div>
        {/* Quick Actions card removed as per new header placement */}
      </div>

      {/* Weekly Summary Chart */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Weekly Summary</h2>
          <InformationCircleIcon className="h-5 w-5 text-gray-400" title="Income vs Expenses by day" />
        </div>
        {recentTransactions.length > 0 ? (
          <div className="h-64">
            <Bar
              data={{
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                  {
                    label: 'Income',
                    data: [1200, 0, 800, 0, 1500, 0, 0],
                    backgroundColor: 'rgba(5, 150, 105, 0.8)',
                    borderColor: 'rgba(5, 150, 105, 1)',
                    borderWidth: 2,
                    borderRadius: 6,
                    borderSkipped: false,
                  },
                  {
                    label: 'Expenses',
                    data: [200, 150, 300, 100, 400, 250, 180],
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 2,
                    borderRadius: 6,
                    borderSkipped: false,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    grid: { color: '#f3f4f6' }
                  },
                  y: {
                    beginAtZero: true,
                    grid: { color: '#f3f4f6' },
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
      </div>

      <AddFundsModal
        isOpen={showAddFundsModal}
        onClose={() => setShowAddFundsModal(false)}
        onSuccess={handleIncomeSuccess}
      />

      {showSendMoneyModal && (
        <SendMoneyModal
          onClose={() => setShowSendMoneyModal(false)}
          onSuccess={handleSendMoneySuccess}
        />
      )}
    </div>
  );
};

export default Dashboard;