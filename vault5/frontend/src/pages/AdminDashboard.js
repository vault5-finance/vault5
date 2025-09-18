import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeUsers: 0,
    totalUsers: 0,
    revenue: 0,
    pendingLoans: 0,
    systemHealth: 'healthy'
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [timeFilter, setTimeFilter] = useState('24h');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Check if user is admin
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    loadDashboardStats();
    loadRecentActivity();
  }, [navigate, timeFilter]);

  const loadDashboardStats = async () => {
    try {
      // These would be real API calls in production
      setStats({
        activeUsers: 1250,
        totalUsers: 15420,
        revenue: 45678.90,
        pendingLoans: 23,
        systemHealth: 'healthy'
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      // Mock data - in production this would come from API
      const activities = [
        {
          id: 1,
          type: 'user',
          message: 'New user registered: john@example.com',
          time: '2 minutes ago',
          icon: '👤',
          color: 'blue',
          action: () => navigate('/admin/users')
        },
        {
          id: 2,
          type: 'loan',
          message: 'Loan #1234 approved for $5,000',
          time: '15 minutes ago',
          icon: '✅',
          color: 'green',
          action: () => navigate('/admin/loans')
        },
        {
          id: 3,
          type: 'transaction',
          message: 'Large transaction flagged: $50,000 transfer',
          time: '1 hour ago',
          icon: '⚠️',
          color: 'red',
          action: () => navigate('/admin/transactions')
        },
        {
          id: 4,
          type: 'system',
          message: 'System backup completed successfully',
          time: '3 hours ago',
          icon: '🔄',
          color: 'gray',
          action: null
        },
        {
          id: 5,
          type: 'user',
          message: 'User account suspended: suspicious activity',
          time: '5 hours ago',
          icon: '🚫',
          color: 'red',
          action: () => navigate('/admin/users')
        }
      ];
      setRecentActivity(activities);
    } catch (error) {
      console.error('Error loading activity:', error);
    }
  };

  const quickActions = [
    {
      title: 'Approve Loan',
      description: 'Review and approve pending loan applications',
      icon: '✅',
      action: () => navigate('/admin/loans'),
      color: 'green'
    },
    {
      title: 'Suspend User',
      description: 'Temporarily suspend user accounts',
      icon: '🚫',
      action: () => navigate('/admin/users'),
      color: 'red'
    },
    {
      title: 'Flag Transaction',
      description: 'Mark suspicious transactions for review',
      icon: '⚠️',
      action: () => navigate('/admin/transactions'),
      color: 'yellow'
    },
    {
      title: 'System Health',
      description: 'Check database and API status',
      icon: '🔧',
      action: () => navigate('/admin/settings'),
      color: 'blue'
    }
  ];

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white text-xl">Loading admin dashboard...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Admin Header */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-bold mr-4">
                ADMIN
              </div>
              <h1 className="text-2xl font-bold text-white">Vault5 Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  stats.systemHealth === 'healthy' ? 'bg-green-400' :
                  stats.systemHealth === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                }`}></div>
                <span className="text-sm text-gray-300">System: {stats.systemHealth}</span>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                User Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-gray-800 min-h-screen border-r border-gray-700">
          <div className="p-6">
            <div className="space-y-2">
              {[
                { name: 'Dashboard', active: true, path: '/admin', icon: '📊' },
                { name: 'Users', active: false, path: '/admin/users', icon: '👥' },
                { name: 'Transactions', active: false, path: '/admin/transactions', icon: '💳' },
                { name: 'Loans', active: false, path: '/admin/loans', icon: '💰' },
                { name: 'Reports', active: false, path: '/admin/reports', icon: '📈' },
                { name: 'Content', active: false, path: '/admin/content', icon: '📝' },
                { name: 'Audit Logs', active: false, path: '/admin/audit', icon: '📋' },
                { name: 'Settings', active: false, path: '/admin/settings', icon: '⚙️' }
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    item.active
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {[
              {
                name: 'Active Users',
                value: stats.activeUsers.toLocaleString(),
                change: '+12%',
                changeType: 'increase',
                trend: [1200, 1180, 1220, 1250],
                icon: '👥'
              },
              {
                name: 'Total Users',
                value: stats.totalUsers.toLocaleString(),
                change: '+8%',
                changeType: 'increase',
                trend: [15200, 15100, 15300, 15420],
                icon: '📈'
              },
              {
                name: 'Revenue',
                value: `$${stats.revenue.toLocaleString()}`,
                change: '+23%',
                changeType: 'increase',
                trend: [42000, 43000, 44500, 45678],
                icon: '💰'
              },
              {
                name: 'Pending Loans',
                value: stats.pendingLoans,
                change: '-5%',
                changeType: 'decrease',
                trend: [25, 24, 23, 23],
                icon: '📋',
                urgent: stats.pendingLoans > 20
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`bg-gray-800 rounded-lg p-6 border ${stat.urgent ? 'border-red-500' : 'border-gray-700'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{stat.name}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'increase' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-gray-500 text-sm ml-2">vs last week</span>
                    </div>
                  </div>
                  <div className="text-3xl">{stat.icon}</div>
                </div>
                {/* Mini sparkline */}
                <div className="mt-4 h-8 flex items-end space-x-1">
                  {stat.trend.map((value, i) => (
                    <div
                      key={i}
                      className="bg-blue-500 rounded-sm flex-1"
                      style={{ height: `${(value / Math.max(...stat.trend)) * 100}%` }}
                    ></div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.title}
                    onClick={action.action}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      action.color === 'green' ? 'bg-green-900/20 hover:bg-green-900/30 border border-green-700' :
                      action.color === 'red' ? 'bg-red-900/20 hover:bg-red-900/30 border border-red-700' :
                      action.color === 'yellow' ? 'bg-yellow-900/20 hover:bg-yellow-900/30 border border-yellow-700' :
                      'bg-blue-900/20 hover:bg-blue-900/30 border border-blue-700'
                    }`}
                  >
                    <span className="text-xl mr-3">{action.icon}</span>
                    <div className="text-left">
                      <div className="font-medium text-white">{action.title}</div>
                      <div className="text-sm text-gray-400">{action.description}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600"
                  >
                    <option value="1h">Last Hour</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                  </select>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`p-4 border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer transition-colors ${
                      activity.action ? 'cursor-pointer' : ''
                    }`}
                    onClick={activity.action}
                  >
                    <div className="flex items-center">
                      <span className="text-xl mr-3">{activity.icon}</span>
                      <div className="flex-1">
                        <p className="text-white font-medium">{activity.message}</p>
                        <p className="text-gray-400 text-sm">{activity.time}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        activity.color === 'green' ? 'bg-green-900 text-green-300' :
                        activity.color === 'red' ? 'bg-red-900 text-red-300' :
                        activity.color === 'blue' ? 'bg-blue-900 text-blue-300' :
                        'bg-gray-900 text-gray-300'
                      }`}>
                        {activity.type}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;