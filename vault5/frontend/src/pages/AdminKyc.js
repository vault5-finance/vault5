import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Eye,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Sun,
  Moon,
  RefreshCw,
  AlertTriangle,
  UserCheck,
  UserX,
  Calendar,
  Mail,
  Phone,
  MapPin,
  FileText,
  Image,
  Download,
  MoreVertical,
  Check,
  X,
  Shield,
  Star,
  Award,
  Activity,
  BarChart3,
  Settings,
  ArrowUpDown,
  Loader2,
  Info,
  Zap,
  Target
} from 'lucide-react';

// Enhanced Stat Card Component
const StatCard = ({ title, value, icon: Icon, trend, color, isDarkMode }) => (
  <motion.div
    className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
      isDarkMode
        ? 'bg-gray-800/50 border border-gray-700/50 hover:border-gray-600'
        : 'bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300 shadow-lg hover:shadow-xl'
    }`}
    whileHover={{ scale: 1.02, y: -2 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-2 rounded-lg bg-gradient-to-r ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="text-sm font-medium">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

// Skeleton Card Component
const SkeletonCard = ({ isDarkMode }) => (
  <div className={`animate-pulse rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-300 rounded w-16"></div>
      </div>
    </div>
  </div>
);

// Enhanced Table Row Component
const TableRow = ({ user, onView, isDarkMode, onSelect, isSelected }) => (
  <motion.tr
    className={`transition-all duration-200 ${
      isSelected ? (isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50') : ''
    } ${isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'}`}
    whileHover={{ scale: 1.01 }}
  >
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <div className="flex-shrink-0 h-12 w-12">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
            {user.name?.charAt(0) || 'U'}
          </div>
        </div>
        <div className="ml-4">
          <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
            {user.name || 'Unknown'}
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            ID: {user._id?.substring(0, 8)}...
          </div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
        {user.emails?.[0]?.email || 'No email'}
      </div>
      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {user.phones?.[0]?.phone || 'No phone'}
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
        user.kycStatus === 'approved' ? 'bg-green-100 text-green-800' :
        user.kycStatus === 'rejected' ? 'bg-red-100 text-red-800' :
        user.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {user.kycStatus}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
        user.kycLevel === 'Tier2' ? 'bg-purple-100 text-purple-800' :
        user.kycLevel === 'Tier1' ? 'bg-blue-100 text-blue-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {user.kycLevel}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {new Date(user.createdAt).toLocaleDateString()}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
      <motion.button
        onClick={() => onView(user._id)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
          isDarkMode
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Eye className="w-4 h-4" />
        View Details
      </motion.button>
    </td>
  </motion.tr>
);

const AdminKyc = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useToast();

  // Enhanced state management
  const [kycQueue, setKycQueue] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectDuration, setRejectDuration] = useState('temporary_30');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchKycData();

    // Auto-refresh every 30 seconds
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchKycData, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [navigate, autoRefresh]);

  const fetchKycData = async () => {
    try {
      const [queueRes, statsRes] = await Promise.all([
        api.get('/api/kyc/queue?limit=50'),
        api.get('/api/kyc/stats')
      ]);

      setKycQueue(queueRes.data.users || []);
      setStats(statsRes.data);

      // Show subtle refresh notification
      if (!loading) {
        showInfo('KYC queue refreshed');
      }
    } catch (error) {
      console.error('Fetch KYC data error:', error);
      showError('Failed to load KYC data');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort functionality
  const filteredAndSortedQueue = React.useMemo(() => {
    let filtered = kycQueue;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.emails?.[0]?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user._id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.kycStatus === statusFilter);
    }

    // Apply level filter
    if (levelFilter !== 'all') {
      filtered = filtered.filter(user => user.kycLevel === levelFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'createdAt') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [kycQueue, searchTerm, statusFilter, levelFilter, sortBy, sortOrder]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === filteredAndSortedQueue.length
        ? []
        : filteredAndSortedQueue.map(user => user._id)
    );
  };

  const handleBulkApprove = async (kycLevel = 'Tier1') => {
    if (selectedUsers.length === 0) return;

    setActionLoading(true);
    try {
      await Promise.all(
        selectedUsers.map(userId => api.post(`/api/kyc/${userId}/approve`, { kycLevel }))
      );
      showSuccess(`Approved ${selectedUsers.length} users successfully`);
      setSelectedUsers([]);
      fetchKycData();
    } catch (error) {
      showError('Failed to approve selected users');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedUsers.length === 0) return;

    setActionLoading(true);
    try {
      await Promise.all(
        selectedUsers.map(userId => api.post(`/api/kyc/${userId}/reject`, {
          reason: rejectReason,
          limitationPeriod: rejectDuration
        }))
      );
      showSuccess(`Rejected ${selectedUsers.length} users successfully`);
      setSelectedUsers([]);
      setShowRejectModal(false);
      setRejectReason('');
      fetchKycData();
    } catch (error) {
      showError('Failed to reject selected users');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const response = await api.get(`/api/kyc/${userId}`);
      setSelectedUser(response.data);
      setShowUserDetails(true);
    } catch (error) {
      console.error('View user error:', error);
      showError('Failed to load user details');
    }
  };

  const handleApproveKyc = async (userId, kycLevel = 'Tier1') => {
    setActionLoading(true);
    try {
      await api.post(`/api/kyc/${userId}/approve`, { kycLevel });
      showSuccess('KYC approved successfully');
      fetchKycData(); // Refresh data
      setShowUserDetails(false);
    } catch (error) {
      console.error('Approve KYC error:', error);
      showError('Failed to approve KYC');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectKyc = async (userId, reason, limitationPeriod = 'temporary_30') => {
    setActionLoading(true);
    try {
      await api.post(`/api/kyc/${userId}/reject`, { reason, limitationPeriod });
      showSuccess('KYC rejected successfully');
      fetchKycData(); // Refresh data
      setShowUserDetails(false);
    } catch (error) {
      console.error('Reject KYC error:', error);
      showError('Failed to reject KYC');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getKycLevelColor = (level) => {
    switch (level) {
      case 'Tier2': return 'text-purple-600 bg-purple-100';
      case 'Tier1': return 'text-blue-600 bg-blue-100';
      case 'Tier0': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-blue-50/30'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <div className="w-24 h-10 bg-gray-300 rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Stats cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <SkeletonCard key={i} isDarkMode={isDarkMode} />
            ))}
          </div>

          {/* Table skeleton */}
          <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-xl rounded-2xl border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} overflow-hidden`}>
            <div className="p-6 border-b border-gray-200">
              <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
            </div>
            <div className="p-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="mb-4 p-4 border border-gray-200 rounded-lg animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50'
    }`}>
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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <Shield className="w-10 h-10 text-white" />
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <div>
                <motion.h1
                  className={`text-5xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  KYC Management
                </motion.h1>
                <motion.p
                  className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Review and manage user KYC verifications
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

              {/* Auto-refresh toggle */}
              <motion.button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-3 rounded-xl transition-all ${
                  autoRefresh
                    ? (isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-100 hover:bg-green-200')
                    : (isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200')
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
              </motion.button>

              {/* Back button */}
              <motion.button
                onClick={() => navigate('/admin')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back to Admin
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers || 0}
            icon={Users}
            trend={12}
            color="from-blue-500 to-blue-600"
            isDarkMode={isDarkMode}
          />
          <StatCard
            title="Pending KYC"
            value={stats.pendingUsers || 0}
            icon={Clock}
            trend={-5}
            color="from-yellow-500 to-orange-500"
            isDarkMode={isDarkMode}
          />
          <StatCard
            title="Approved"
            value={stats.approved || 0}
            icon={CheckCircle}
            trend={8}
            color="from-green-500 to-green-600"
            isDarkMode={isDarkMode}
          />
          <StatCard
            title="Rejected"
            value={stats.rejected || 0}
            icon={XCircle}
            trend={2}
            color="from-red-500 to-red-600"
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Progress Overview */}
        <motion.div
          className={`mb-8 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-xl rounded-2xl border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} p-6`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-blue-600" />
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              KYC Completion Progress
            </h3>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, ((stats.approved || 0) / (stats.totalUsers || 1)) * 100)}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {Math.round(((stats.approved || 0) / (stats.totalUsers || 1)) * 100)}% of users have completed KYC verification
          </p>
        </motion.div>

        {/* Enhanced KYC Queue */}
        <motion.div
          className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-xl rounded-2xl border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} overflow-hidden`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Enhanced Header with Search & Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <UserCheck className="w-6 h-6 text-blue-600" />
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  KYC Queue ({filteredAndSortedQueue.length})
                </h2>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
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
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
                  } border focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
                  } border focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="all">All Levels</option>
                  <option value="Tier0">Tier 0</option>
                  <option value="Tier1">Tier 1</option>
                  <option value="Tier2">Tier 2</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <motion.div
                className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800">
                    {selectedUsers.length} users selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBulkApprove('Tier1')}
                      disabled={actionLoading}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                    >
                      Approve Tier 1
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={actionLoading}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Enhanced Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'} sticky top-0`}>
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredAndSortedQueue.length && filteredAndSortedQueue.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                    >
                      User
                      {sortBy === 'name' && (
                        <ArrowUpDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('kycStatus')}
                      className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                    >
                      Status
                      {sortBy === 'kycStatus' && (
                        <ArrowUpDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('kycLevel')}
                      className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                    >
                      KYC Level
                      {sortBy === 'kycLevel' && (
                        <ArrowUpDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('createdAt')}
                      className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                    >
                      Joined
                      {sortBy === 'createdAt' && (
                        <ArrowUpDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'bg-gray-900/20' : 'bg-white/50'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredAndSortedQueue.map((user) => (
                  <tr key={user._id} className={`${isDarkMode ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50'} transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleSelectUser(user._id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {user.name?.charAt(0) || 'U'}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                            {user.name || 'Unknown'}
                          </div>
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            ID: {user._id?.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        {user.emails?.[0]?.email || 'No email'}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {user.phones?.[0]?.phone || 'No phone'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.kycStatus === 'approved' ? 'bg-green-100 text-green-800' :
                        user.kycStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                        user.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.kycStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.kycLevel === 'Tier2' ? 'bg-purple-100 text-purple-800' :
                        user.kycLevel === 'Tier1' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.kycLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <motion.button
                        onClick={() => handleViewUser(user._id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                          isDarkMode
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </motion.button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAndSortedQueue.length === 0 && (
            <motion.div
              className="px-6 py-12 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <UserX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                No users found
              </h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {searchTerm || statusFilter !== 'all' || levelFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No users require KYC review at this time'
                }
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Enhanced User Details Modal */}
        <AnimatePresence>
          {showUserDetails && selectedUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className={`bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden`}
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                        {selectedUser.user.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          KYC Review - {selectedUser.user.name}
                        </h3>
                        <p className="text-gray-600">
                          User ID: {selectedUser.user._id}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => setShowUserDetails(false)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <X className="w-6 h-6 text-gray-400" />
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* User Information */}
                    <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-center gap-2 mb-4">
                        <User className="w-5 h-5 text-blue-600" />
                        <h4 className="text-lg font-semibold text-gray-900">User Information</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{selectedUser.user.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Primary Email:</span>
                          <span className="font-medium">{selectedUser.user.emails?.[0]?.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Primary Phone:</span>
                          <span className="font-medium">{selectedUser.user.phones?.[0]?.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Account Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedUser.user.accountStatus === 'active' ? 'bg-green-100 text-green-800' :
                            selectedUser.user.accountStatus === 'suspended' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedUser.user.accountStatus}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Joined:</span>
                          <span className="font-medium">{new Date(selectedUser.user.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Account Information */}
                    <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-center gap-2 mb-4">
                        <CreditCard className="w-5 h-5 text-green-600" />
                        <h4 className="text-lg font-semibold text-gray-900">Account Information</h4>
                      </div>
                      <div className="space-y-3">
                        {selectedUser.user.accounts?.map((account, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                            <span className="text-gray-600 capitalize">{account.type}:</span>
                            <span className="font-bold text-green-600">KES {account.balance?.toLocaleString()}</span>
                          </div>
                        ))}
                        {!selectedUser.user.accounts?.length && (
                          <p className="text-gray-500 text-center py-4">No accounts found</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Document Preview Section */}
                  <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-8`}>
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="w-5 h-5 text-purple-600" />
                      <h4 className="text-lg font-semibold text-gray-900">Document Preview</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {['National ID', 'Selfie', 'Proof of Address'].map((docType, index) => (
                        <div key={index} className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                          <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">{docType}</p>
                          <p className="text-xs text-gray-500 mt-1">Preview not available</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Activity Logs */}
                  <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-8`}>
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="w-5 h-5 text-orange-600" />
                      <h4 className="text-lg font-semibold text-gray-900">Activity Logs</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">KYC submitted on {new Date(selectedUser.user.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">Account created and verified</span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-end">
                    <motion.button
                      onClick={() => {
                        setShowRejectModal(true);
                      }}
                      disabled={actionLoading}
                      className="px-6 py-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 disabled:opacity-50 font-semibold flex items-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <XCircle className="w-5 h-5" />
                      {actionLoading ? 'Processing...' : 'Reject KYC'}
                    </motion.button>
                    <motion.button
                      onClick={() => handleApproveKyc(selectedUser.user._id, 'Tier1')}
                      disabled={actionLoading}
                      className="px-6 py-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 disabled:opacity-50 font-semibold flex items-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <CheckCircle className="w-5 h-5" />
                      {actionLoading ? 'Processing...' : 'Approve Tier 1'}
                    </motion.button>
                    <motion.button
                      onClick={() => handleApproveKyc(selectedUser.user._id, 'Tier2')}
                      disabled={actionLoading}
                      className="px-6 py-3 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 disabled:opacity-50 font-semibold flex items-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Star className="w-5 h-5" />
                      {actionLoading ? 'Processing...' : 'Approve Tier 2'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Reject Modal */}
        <AnimatePresence>
          {showRejectModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md"
              >
                <div className="text-center">
                  <motion.div
                    className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  >
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </motion.div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Reject KYC Application
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Please select a reason for rejection and specify the limitation period.
                  </p>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rejection Reason
                      </label>
                      <select
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="">Select a reason...</option>
                        <option value="fake_id">Fake or Invalid ID</option>
                        <option value="blurry_document">Blurry or Unreadable Document</option>
                        <option value="mismatched_info">Information Mismatch</option>
                        <option value="expired_document">Expired Document</option>
                        <option value="suspicious_activity">Suspicious Activity</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Limitation Period
                      </label>
                      <select
                        value={rejectDuration}
                        onChange={(e) => setRejectDuration(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="temporary_30">Temporary (30 days)</option>
                        <option value="temporary_180">Extended (180 days)</option>
                        <option value="permanent">Permanent</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <motion.button
                      onClick={() => setShowRejectModal(false)}
                      className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 font-semibold"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={handleBulkReject}
                      disabled={actionLoading || !rejectReason}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 disabled:opacity-50 font-semibold"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {actionLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Rejecting...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <XCircle className="w-4 h-4" />
                          Reject KYC
                        </div>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminKyc;