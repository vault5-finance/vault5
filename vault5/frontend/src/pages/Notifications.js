import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import {
  Bell,
  DollarSign,
  AlertTriangle,
  Target,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Search,
  Filter,
  Check,
  Clock,
  Calendar,
  TrendingUp,
  MoreVertical,
  RefreshCw,
  Sun,
  Moon,
  Sparkles,
  Heart,
  Zap,
  Shield,
  CreditCard,
  Gift,
  Star,
  Award,
  ChevronDown,
  ChevronUp,
  X,
  Settings,
  Download,
  Archive,
  Inbox,
  ArchiveX,
  Users
} from 'lucide-react';

const Notifications = () => {
  const { showError, showSuccess } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [groupByTime, setGroupByTime] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchNotifications();
  }, [navigate]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/api/notifications');
      setNotifications(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Notifications fetch error:', error);
      if (error.response?.status === 401) navigate('/login');
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications(notifications.map(n =>
        n._id === id ? { ...n, read: true } : n
      ));
      showSuccess('Notification marked as read');
    } catch (error) {
      showError('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      showSuccess('All notifications marked as read');
      setSelectedNotifications([]);
      setShowBulkActions(false);
    } catch (error) {
      showError('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
      showSuccess('Notification deleted');
    } catch (error) {
      showError('Failed to delete notification');
    }
  };

  const deleteSelected = async () => {
    try {
      await Promise.all(selectedNotifications.map(id => api.delete(`/api/notifications/${id}`)));
      setNotifications(notifications.filter(n => !selectedNotifications.includes(n._id)));
      setSelectedNotifications([]);
      setShowBulkActions(false);
      showSuccess(`${selectedNotifications.length} notifications deleted`);
    } catch (error) {
      showError('Failed to delete selected notifications');
    }
  };

  const handleActionClick = (notification) => {
    // Navigate based on notification type
    if (notification.type === 'missed_deposit' && notification.relatedId) {
      navigate(`/accounts`);
    } else if (notification.type === 'surplus_deposit' && notification.relatedId) {
      navigate(`/accounts`);
    } else if (notification.type === 'goal_achievement') {
      navigate(`/goals`);
    } else if (notification.type === 'lending_reminder') {
      navigate(`/lending`);
    } else if (notification.type === 'loan_due') {
      navigate(`/loans`);
    } else if (notification.type === 'money_received' || notification.type === 'money_debited') {
      navigate(`/transactions`);
    }
  };

  const handleSelectNotification = (id) => {
    setSelectedNotifications(prev =>
      prev.includes(id)
        ? prev.filter(nid => nid !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n._id));
    }
  };


  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'money_received':
      case 'money_debited':
        return <DollarSign className="w-5 h-5" />;
      case 'goal_achievement':
        return <Target className="w-5 h-5" />;
      case 'loan_due':
      case 'missed_deposit':
      case 'surplus_deposit':
        return <AlertTriangle className="w-5 h-5" />;
      case 'lending_reminder':
        return <Users className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'money_received':
      case 'money_debited':
        return 'from-green-500 to-emerald-500';
      case 'goal_achievement':
        return 'from-blue-500 to-purple-500';
      case 'loan_due':
      case 'missed_deposit':
      case 'surplus_deposit':
        return 'from-yellow-500 to-orange-500';
      case 'lending_reminder':
        return 'from-indigo-500 to-blue-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };


  // Group notifications by time
  const groupedNotifications = useMemo(() => {
    if (!groupByTime) return { all: notifications };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    return notifications.reduce((groups, notification) => {
      const createdAt = new Date(notification.createdAt);
      if (createdAt >= today) {
        groups.today = groups.today || [];
        groups.today.push(notification);
      } else if (createdAt >= weekAgo) {
        groups.thisWeek = groups.thisWeek || [];
        groups.thisWeek.push(notification);
      } else {
        groups.earlier = groups.earlier || [];
        groups.earlier.push(notification);
      }
      return groups;
    }, {});
  }, [notifications, groupByTime]);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const matchesSearch = searchTerm === '' ||
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === 'all' || notification.type === typeFilter;
      const matchesSeverity = severityFilter === 'all' || notification.severity === severityFilter;

      return matchesSearch && matchesType && matchesSeverity;
    });
  }, [notifications, searchTerm, typeFilter, severityFilter]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const totalCount = notifications.length;

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header skeleton */}
          <div className={`mb-8 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-xl rounded-2xl border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} p-6`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-300 rounded-2xl animate-pulse"></div>
                <div>
                  <div className="h-8 bg-gray-300 rounded w-48 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded w-64 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications skeleton */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} animate-pulse`}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-300 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-32"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50'} relative overflow-hidden`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <motion.div
          className={`mb-8 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-xl rounded-3xl border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} p-8`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-6">
              <motion.div
                className="relative p-4 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl"
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <Bell className="w-10 h-10 text-white" />
                {unreadCount > 0 && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <span className="text-xs font-bold text-white">{unreadCount}</span>
                  </motion.div>
                )}
              </motion.div>
              <div>
                <motion.h1
                  className={`text-5xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Notifications
                </motion.h1>
                <motion.p
                  className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Stay updated with your financial activities
                </motion.p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Theme toggle */}
              <motion.button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-3 rounded-xl transition-all ${
                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.button>

              {/* Refresh button */}
              <motion.button
                onClick={fetchNotifications}
                className={`p-3 rounded-xl transition-all ${
                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className={`text-center p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
              <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total</div>
            </div>
            <div className={`text-center p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
              <div className="text-2xl font-bold text-green-600">{unreadCount}</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Unread</div>
            </div>
            <div className={`text-center p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
              <div className="text-2xl font-bold text-yellow-600">{notifications.filter(n => n.severity === 'high').length}</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>High Priority</div>
            </div>
            <div className={`text-center p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
              <div className="text-2xl font-bold text-purple-600">{notifications.filter(n => n.type === 'goal_achievement').length}</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Achievements</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          className={`mb-8 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-xl rounded-2xl border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} p-6`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 rounded-lg text-sm transition-all ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                  } border focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                } border focus:ring-2 focus:ring-blue-500`}
              >
                <option value="all">All Types</option>
                <option value="money_received">Money Received</option>
                <option value="money_debited">Money Debited</option>
                <option value="goal_achievement">Goal Achievement</option>
                <option value="loan_due">Loan Due</option>
                <option value="lending_reminder">Lending Reminder</option>
              </select>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                } border focus:ring-2 focus:ring-blue-500`}
              >
                <option value="all">All Severity</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setGroupByTime(!groupByTime)}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  groupByTime
                    ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800')
                    : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600')
                }`}
              >
                {groupByTime ? 'Grouped' : 'List View'}
              </button>

              {selectedNotifications.length > 0 && (
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <span className="text-sm text-blue-600">{selectedNotifications.length} selected</span>
                  <button
                    onClick={markAllAsRead}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Mark Read
                  </button>
                  <button
                    onClick={deleteSelected}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Notifications Content */}
        <div className="space-y-6">
          {filteredNotifications.length === 0 ? (
            <motion.div
              className={`text-center py-16 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-xl rounded-2xl border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.div
                className="text-8xl mb-6"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                🔔
              </motion.div>
              <h3 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                You're all caught up! 🎉
              </h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No new notifications at the moment. We'll notify you when something important happens.
              </p>
            </motion.div>
          ) : (
            <>
              {/* Grouped by Time */}
              {groupByTime ? (
                Object.entries(groupedNotifications).map(([timeGroup, groupNotifications]) => (
                  <motion.div
                    key={timeGroup}
                    className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-xl rounded-2xl border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} overflow-hidden`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {timeGroup === 'today' ? 'Today' : timeGroup === 'thisWeek' ? 'This Week' : 'Earlier'}
                          </h3>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {groupNotifications.length} notifications
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      {groupNotifications.map((notification, index) => (
                        <NotificationCard
                          key={notification._id}
                          notification={notification}
                          isDarkMode={isDarkMode}
                          onMarkRead={markAsRead}
                          onDelete={deleteNotification}
                          onAction={handleActionClick}
                          onSelect={handleSelectNotification}
                          isSelected={selectedNotifications.includes(notification._id)}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))
              ) : (
                /* List View */
                <motion.div
                  className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-xl rounded-2xl border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} overflow-hidden`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        All Notifications ({filteredNotifications.length})
                      </h3>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-600">Select All</span>
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {filteredNotifications.map((notification, index) => (
                      <NotificationCard
                        key={notification._id}
                        notification={notification}
                        isDarkMode={isDarkMode}
                        onMarkRead={markAsRead}
                        onDelete={deleteNotification}
                        onAction={handleActionClick}
                        onSelect={handleSelectNotification}
                        isSelected={selectedNotifications.includes(notification._id)}
                        showCheckbox={true}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Notification Card Component
const NotificationCard = ({
  notification,
  isDarkMode,
  onMarkRead,
  onDelete,
  onAction,
  onSelect,
  isSelected,
  showCheckbox = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'money_received':
      case 'money_debited':
        return <DollarSign className="w-5 h-5" />;
      case 'goal_achievement':
        return <Target className="w-5 h-5" />;
      case 'loan_due':
      case 'missed_deposit':
      case 'surplus_deposit':
        return <AlertTriangle className="w-5 h-5" />;
      case 'lending_reminder':
        return <Users className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'money_received':
      case 'money_debited':
        return 'from-green-500 to-emerald-500';
      case 'goal_achievement':
        return 'from-blue-500 to-purple-500';
      case 'loan_due':
      case 'missed_deposit':
      case 'surplus_deposit':
        return 'from-yellow-500 to-orange-500';
      case 'lending_reminder':
        return 'from-indigo-500 to-blue-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <motion.div
      className={`p-6 transition-all duration-300 ${
        isSelected ? (isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50') : ''
      } ${isDarkMode ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50'} ${
        !notification.read ? 'border-l-4 border-blue-500' : ''
      }`}
      whileHover={{ scale: 1.01 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      layout
    >
      <div className="flex items-start gap-4">
        {showCheckbox && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(notification._id)}
            className="mt-1 rounded border-gray-300"
          />
        )}

        <div className={`p-3 rounded-xl bg-gradient-to-r ${getNotificationColor(notification.type)}`}>
          {getNotificationIcon(notification.type)}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : (isDarkMode ? 'text-gray-300' : 'text-gray-600')}`}>
              {notification.title}
            </h3>
            {!notification.read && (
              <motion.span
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                New
              </motion.span>
            )}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(notification.severity)}`}>
              {notification.severity}
            </span>
          </div>

          <p className={`mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {notification.message}
          </p>

          {/* Transaction Details */}
          {(notification.type === 'money_received' || notification.type === 'money_debited') && notification.meta && (
            <div className={`p-3 rounded-lg mb-3 ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div>
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Amount:</span>
                  <span className="font-medium ml-1">{notification.meta.currency} {Number(notification.meta.amount || 0).toFixed(2)}</span>
                </div>
                {notification.meta.transactionCode && (
                  <div>
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Transaction:</span>
                    <span className="font-medium ml-1">{notification.meta.transactionCode}</span>
                  </div>
                )}
                {typeof notification.meta.balanceAfter === 'number' && (
                  <div>
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>New Balance:</span>
                    <span className="font-medium ml-1">{notification.meta.currency} {Number(notification.meta.balanceAfter).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{new Date(notification.createdAt).toLocaleString()}</span>
            </div>

            <AnimatePresence>
              {isHovered && (
                <motion.div
                  className="flex gap-2"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  {!notification.read && (
                    <motion.button
                      onClick={() => onMarkRead(notification._id)}
                      className="p-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Check className="w-4 h-4" />
                    </motion.button>
                  )}

                  {(notification.type === 'missed_deposit' ||
                    notification.type === 'surplus_deposit' ||
                    notification.type === 'goal_achievement' ||
                    notification.type === 'lending_reminder' ||
                    notification.type === 'loan_due' ||
                    notification.type === 'money_received' ||
                    notification.type === 'money_debited') && (
                    <motion.button
                      onClick={() => onAction(notification)}
                      className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                  )}

                  <motion.button
                    onClick={() => onDelete(notification._id)}
                    className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Notifications;