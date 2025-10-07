import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Mail,
  MessageSquare,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  Target,
  Zap
} from 'lucide-react';

const AdminReminderAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/admin/reminder-analytics?days=${timeRange}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Analytics load error:', error);
      showError('Failed to load reminder analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
    showSuccess('Analytics refreshed');
  };

  const exportData = () => {
    // Export functionality would be implemented here
    showSuccess('Export feature coming soon');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-white rounded-xl shadow-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-white rounded-xl shadow-lg"></div>
              <div className="h-96 bg-white rounded-xl shadow-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reminder Analytics Dashboard</h1>
            <p className="text-gray-600">Monitor overdue reminder system performance and effectiveness</p>
          </div>

          <div className="flex items-center gap-4 mt-4 lg:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>

            <motion.button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>

            <motion.button
              onClick={exportData}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-4 h-4" />
              Export
            </motion.button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Total Reminders Sent',
              value: analytics?.totalReminders || 0,
              icon: <Mail className="w-6 h-6" />,
              color: 'bg-blue-500',
              change: analytics?.reminderChange || 0
            },
            {
              title: 'Effective Reminders',
              value: analytics?.effectiveReminders || 0,
              icon: <CheckCircle className="w-6 h-6" />,
              color: 'bg-green-500',
              change: analytics?.effectivenessChange || 0
            },
            {
              title: 'Recovery Rate',
              value: `${analytics?.recoveryRate || 0}%`,
              icon: <TrendingUp className="w-6 h-6" />,
              color: 'bg-purple-500',
              change: analytics?.recoveryChange || 0
            },
            {
              title: 'Active Overdue Cases',
              value: analytics?.activeCases || 0,
              icon: <AlertTriangle className="w-6 h-6" />,
              color: 'bg-red-500',
              change: analytics?.casesChange || 0
            }
          ].map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${metric.color}`}>
                  <div className="text-white">{metric.icon}</div>
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(metric.change)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
              <div className="text-sm text-gray-600">{metric.title}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Reminder Effectiveness by Tier */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Reminder Effectiveness by Tier
            </h3>
            <div className="space-y-4">
              {analytics?.tierEffectiveness?.map((tier, index) => (
                <div key={tier.tier} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      tier.tier === 'first' ? 'bg-green-500' :
                      tier.tier === 'second' ? 'bg-yellow-500' :
                      tier.tier === 'third' ? 'bg-orange-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {tier.tier} Reminder
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">{tier.effectiveness}%</div>
                      <div className="text-xs text-gray-500">{tier.sent} sent</div>
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          tier.effectiveness >= 80 ? 'bg-green-500' :
                          tier.effectiveness >= 60 ? 'bg-yellow-500' :
                          tier.effectiveness >= 40 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${tier.effectiveness}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No reminder data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Channel Performance */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              Channel Performance
            </h3>
            <div className="space-y-4">
              {analytics?.channelPerformance?.map((channel, index) => (
                <div key={channel.channel} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      channel.channel === 'email' ? 'bg-blue-100 text-blue-600' :
                      channel.channel === 'sms' ? 'bg-green-100 text-green-600' :
                      channel.channel === 'push' ? 'bg-purple-100 text-purple-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {channel.channel === 'email' ? <Mail className="w-4 h-4" /> :
                       channel.channel === 'sms' ? <MessageSquare className="w-4 h-4" /> :
                       channel.channel === 'push' ? <Smartphone className="w-4 h-4" /> :
                       <MessageSquare className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {channel.channel}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">{channel.successRate}%</div>
                    <div className="text-xs text-gray-500">{channel.sent} sent</div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  <PieChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No channel data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Reminders */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Recent Reminder Activity
            </h3>
            <div className="space-y-4">
              {analytics?.recentActivity?.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      activity.tier === 'first' ? 'bg-green-100 text-green-600' :
                      activity.tier === 'second' ? 'bg-yellow-100 text-yellow-600' :
                      activity.tier === 'third' ? 'bg-orange-100 text-orange-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {activity.borrowerName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {activity.tier} reminder • {activity.channel} • {new Date(activity.sentAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    activity.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    activity.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {activity.status}
                  </div>
                </motion.div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* System Health & Alerts */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              System Health
            </h3>
            <div className="space-y-4">
              {analytics?.systemHealth?.map((metric, index) => (
                <div key={metric.name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{metric.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${
                      metric.status === 'healthy' ? 'text-green-600' :
                      metric.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {metric.value}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${
                      metric.status === 'healthy' ? 'bg-green-500' :
                      metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>System health data unavailable</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  View Failed Reminders
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  Export Report
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  Configure Alerts
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReminderAnalytics;