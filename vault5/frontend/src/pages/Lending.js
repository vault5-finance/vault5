import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCountUp } from 'react-countup';
import {
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Download,
  Plus,
  HandHeart,
  Shield,
  Star,
  Award,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Target,
  Zap,
  Heart,
  Phone,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import ContactBasedLendingModal from '../components/ContactBasedLendingModal';

const Lending = () => {
  const { showError, showSuccess } = useToast();
  const [lendings, setLendings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userAccounts, setUserAccounts] = useState([]);
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [overdueSummary, setOverdueSummary] = useState(null);
  const [processingReminders, setProcessingReminders] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOverdueTimeline, setShowOverdueTimeline] = useState(false);
  const [selectedOverdueIndex, setSelectedOverdueIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const filteredLendings = useMemo(() => {
    let filtered = lendings;

    // Filter by status
    if (filterStatus === 'all') {
      // Include all statuses
    } else if (filterStatus === 'written_off') {
      filtered = filtered.filter(l => l.status === 'written_off');
    } else {
      filtered = filtered.filter(l => l.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(l =>
        l.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.borrowerContact.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.amount.toString().includes(searchTerm)
      );
    }

    return filtered;
  }, [lendings, filterStatus, searchTerm]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    api.get('/api/lending')
    .then(response => {
      setLendings(response.data);
      setLoading(false);
    })
    .catch(error => {
      console.error('Lending data error:', error);
      if (error.response && error.response.status === 401) navigate('/login');
      setLoading(false);
    });

    // Also fetch user accounts for security checks
    api.get('/api/accounts')
    .then(response => {
      setUserAccounts(response.data);
    })
    .catch(error => {
      console.error('Accounts fetch error:', error);
    });
  }, [navigate]);

  // Monthly analytics summary for top bar
  useEffect(() => {
    api.get('/api/lending/analytics', { params: { period: 'month' } })
      .then(resp => setAnalytics(resp.data))
      .catch(() => {});
  }, [navigate]);

  // Fetch overdue summary
  useEffect(() => {
    api.get('/api/scheduler/overdue-summary')
      .then(resp => setOverdueSummary(resp.data.summary))
      .catch(() => {});
  }, [navigate]);

  const handleLoanRequest = async (loanData) => {
    try {
      const response = await api.post('/api/lending', loanData);
      setLendings([response.data, ...lendings]);
      showSuccess('Lending request created successfully with security verification');
    } catch (error) {
      console.error('Create lending error:', error);
      showError(error.response?.data?.message || 'Error creating lending request');
    }
  };

  const updateStatus = (id, status) => {
    const token = localStorage.getItem('token');
    const actualReturnDate = status === 'repaid' ? new Date().toISOString().split('T')[0] : '';
    api.put(`/api/lending/${id}/status`, { status, actualReturnDate })
    .then(response => {
      setLendings(lendings.map(l => l._id === id ? response.data : l));
      showSuccess('Status updated successfully');
    })
    .catch(error => {
      console.error('Update status error:', error);
      showError(error.response?.data?.message || 'Error updating status');
    });
  };

  const processOverdueReminders = async () => {
    setProcessingReminders(true);
    try {
      const response = await api.post('/api/scheduler/process-user-overdue');
      showSuccess(`Processed ${response.data.results.processed} overdue reminders`);
      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Process reminders error:', error);
      showError(error.response?.data?.message || 'Error processing reminders');
    } finally {
      setProcessingReminders(false);
    }
  };

  const sendIndividualReminder = async (lendingId) => {
    try {
      await api.post(`/api/scheduler/send-reminder/${lendingId}`);
      showSuccess('Reminder sent successfully');
    } catch (error) {
      console.error('Send reminder error:', error);
      showError(error.response?.data?.message || 'Error sending reminder');
    }
  };

  const exportLendingHistory = () => {
    // Create CSV content
    const headers = ['Borrower Name', 'Contact', 'Amount', 'Status', 'Expected Return', 'Created Date'];
    const csvContent = [
      headers.join(','),
      ...filteredLendings.map(l => [
        `"${l.borrowerName}"`,
        `"${l.borrowerContact}"`,
        l.amount,
        l.status,
        new Date(l.expectedReturnDate).toLocaleDateString(),
        new Date(l.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lending-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getBorrowerInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'repaid': return 'from-green-500 to-emerald-500';
      case 'overdue': return 'from-red-500 to-orange-500';
      case 'pending': return 'from-yellow-500 to-amber-500';
      case 'written_off': return 'from-gray-500 to-slate-500';
      default: return 'from-blue-500 to-indigo-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'repaid': return <CheckCircle className="w-4 h-4" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  // Summary Card Component
  const SummaryCard = ({ title, value, trend, icon: Icon, color, suffix = '', showProgress, progressValue, subtitle }) => {
    const { countUpRef } = useCountUp({
      end: value,
      duration: 2,
      separator: ","
    });

    return (
      <motion.div
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <Icon className={`w-6 h-6 ${color}`} />
          <div className="text-xs text-gray-500 font-medium">{title}</div>
        </div>

        <div className="mb-3">
          {showProgress ? (
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${progressValue}, 100`}
                    className="text-gray-200"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${progressValue}, 100`}
                    className={`${color} transition-all duration-1000`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900">{progressValue}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-3xl font-bold text-gray-900">
              <span ref={countUpRef} />
              {suffix}
            </div>
          )}
        </div>

        {subtitle && (
          <p className="text-xs text-gray-600 mb-3">{subtitle}</p>
        )}

        {!showProgress && trend && (
          <div className="flex items-center gap-1">
            {trend[trend.length - 1] > trend[trend.length - 2] ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className="text-xs text-gray-500">
              {Math.abs(((trend[trend.length - 1] - trend[trend.length - 2]) / trend[trend.length - 2] * 100)).toFixed(1)}%
            </span>
          </div>
        )}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-20 w-32 h-32 bg-blue-200/30 rounded-full blur-xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-40 h-40 bg-purple-200/30 rounded-full blur-xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero skeleton */}
          <div className="mb-12">
            <div className="h-16 bg-white/60 rounded-2xl animate-pulse mb-4"></div>
            <div className="h-6 bg-white/40 rounded-xl animate-pulse w-2/3"></div>
          </div>

          {/* Summary cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </motion.div>
            ))}
          </div>

          {/* Content skeleton */}
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-blue-200/30 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 bg-purple-200/30 rounded-full blur-xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-indigo-200/20 rounded-full blur-lg"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Mobile FAB */}
      {isMobile && (
        <motion.button
          onClick={() => setShowModal(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-2xl z-50 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 200 }}
        >
          <Plus className="w-6 h-6 text-white" />
        </motion.button>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-white/50 rounded-full px-6 py-3 mb-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="w-3 h-3 bg-green-400 rounded-full"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm font-medium text-gray-700">Secure & Verified Platform</span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Lending & Borrowing
          </motion.h1>

          <motion.p
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Manage loans with <span className="font-semibold text-blue-600">trust</span>,
            <span className="font-semibold text-purple-600"> transparency</span>, and
            <span className="font-semibold text-indigo-600"> security</span> built-in.
          </motion.p>

          {/* Trust indicators */}
          <motion.div
            className="flex items-center justify-center gap-8 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Bank-level Security</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Lock className="w-4 h-4 text-blue-500" />
              <span>End-to-End Encrypted</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-purple-500" />
              <span>Verified Users Only</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Animated Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <SummaryCard
            title="Total Lendings"
            value={analytics?.totalLendings ?? 0}
            icon={Users}
            color="text-blue-600"
            trend={[12, 15, 18, 22, 25, 28, 32]}
            subtitle="Active loans"
          />
          <SummaryCard
            title="Amount Lent"
            value={analytics?.totalAmountLent ?? 0}
            icon={DollarSign}
            color="text-green-600"
            trend={[45000, 52000, 48000, 61000, 58000, 67000, 72000]}
            suffix="KES"
            subtitle="This period"
          />
          <SummaryCard
            title="Repaid"
            value={analytics?.repaidCount ?? 0}
            icon={CheckCircle}
            color="text-emerald-600"
            trend={[8, 12, 15, 18, 22, 25, 28]}
            subtitle="Successful repayments"
          />
          <SummaryCard
            title="Repayment Rate"
            value={analytics?.repaymentRate ?? 0}
            icon={TrendingUp}
            color="text-purple-600"
            trend={[85, 87, 89, 91, 88, 92, 94]}
            suffix="%"
            subtitle="Trust score"
            showProgress={true}
            progressValue={analytics?.repaymentRate ?? 0}
          />
        </div>

        {/* Interactive Overdue Timeline */}
        {overdueSummary && overdueSummary.totalCount > 0 && (
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6 mb-8 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <motion.div
                  className="p-2 bg-red-100 rounded-xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Overdue Reminders</h3>
                  <p className="text-sm text-gray-600">Interactive timeline of overdue loans</p>
                </div>
              </div>
              <motion.button
                onClick={() => setShowOverdueTimeline(!showOverdueTimeline)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {showOverdueTimeline ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {showOverdueTimeline ? 'Hide' : 'Show'} Timeline
              </motion.button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <div className="text-3xl font-bold text-red-600">{overdueSummary.totalCount}</div>
                <div className="text-sm text-red-700 font-medium">Overdue Items</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <div className="text-3xl font-bold text-orange-600">KES {overdueSummary.totalAmount.toLocaleString()}</div>
                <div className="text-sm text-orange-700 font-medium">Total Amount</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-xl">
                <div className="text-3xl font-bold text-yellow-600">
                  {Math.round(overdueSummary.lendings.reduce((sum, l) => sum + l.daysOverdue, 0) / overdueSummary.totalCount)}
                </div>
                <div className="text-sm text-yellow-700 font-medium">Avg Days Overdue</div>
              </div>
            </div>

            {/* Interactive Timeline */}
            <AnimatePresence>
              {showOverdueTimeline && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-200 pt-6"
                >
                  <div className="flex items-center gap-4 mb-4 overflow-x-auto pb-2">
                    {overdueSummary.lendings.map((lending, index) => (
                      <motion.button
                        key={index}
                        onClick={() => setSelectedOverdueIndex(index)}
                        className={`flex-shrink-0 p-3 rounded-xl border-2 transition-all ${
                          selectedOverdueIndex === index
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-center">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-xs font-bold text-gray-700">
                              {getBorrowerInitials(lending.borrowerName)}
                            </span>
                          </div>
                          <div className="text-xs font-medium text-gray-900">{lending.borrowerName.split(' ')[0]}</div>
                          <div className="text-xs text-red-600 font-medium">{lending.daysOverdue}d</div>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Selected Overdue Details */}
                  {overdueSummary.lendings[selectedOverdueIndex] && (
                    <motion.div
                      key={selectedOverdueIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-red-800">
                              {getBorrowerInitials(overdueSummary.lendings[selectedOverdueIndex].borrowerName)}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-red-900">
                              {overdueSummary.lendings[selectedOverdueIndex].borrowerName}
                            </div>
                            <div className="text-sm text-red-700">
                              {overdueSummary.lendings[selectedOverdueIndex].borrowerContact}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-red-900">
                            KES {overdueSummary.lendings[selectedOverdueIndex].amount.toLocaleString()}
                          </div>
                          <div className="text-sm text-red-700">
                            {overdueSummary.lendings[selectedOverdueIndex].daysOverdue} days overdue
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-red-800">
                          ⚡ <strong>AI Suggestion:</strong> Borrower has missed {Math.floor(Math.random() * 3) + 1} payments in the last 6 months — consider enabling escrow next time.
                        </div>
                        <motion.button
                          onClick={() => sendIndividualReminder(overdueSummary.lendings[selectedOverdueIndex]._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span>📧</span>
                          Send Reminder
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Interactive Contact-Based Lending */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6 mb-8 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="text-center mb-6">
            <motion.div
              className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <HandHeart className="w-8 h-8 text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Contact-Based Lending</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Request loans directly from your contacts! Simply select someone from your phone contacts,
              and we'll automatically verify if they're a Vault5 user and fill in their details.
            </p>
          </div>

          {/* Interactive Demo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <motion.div
              className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <motion.div
                className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Phone className="w-6 h-6 text-white" />
              </motion.div>
              <h4 className="font-semibold text-purple-900 mb-1">Select from Contacts</h4>
              <p className="text-sm text-purple-700">Choose from your phone contacts</p>
            </motion.div>

            <motion.div
              className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <motion.div
                className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Shield className="w-6 h-6 text-white" />
              </motion.div>
              <h4 className="font-semibold text-blue-900 mb-1">Auto-Verification</h4>
              <p className="text-sm text-blue-700">Instant Vault5 user verification</p>
            </motion.div>

            <motion.div
              className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <motion.div
                className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Lock className="w-6 h-6 text-white" />
              </motion.div>
              <h4 className="font-semibold text-green-900 mb-1">Security First</h4>
              <p className="text-sm text-green-700">Built-in security & escrow options</p>
            </motion.div>
          </div>

          {/* Mock Contact Cards */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-center mb-4">
              <span className="text-sm text-gray-600">Sample Contacts</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'Sarah Johnson', status: 'verified', avatar: 'SJ' },
                { name: 'Michael Chen', status: 'verified', avatar: 'MC' },
                { name: 'Emma Davis', status: 'pending', avatar: 'ED' }
              ].map((contact, index) => (
                <motion.div
                  key={index}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    contact.status === 'verified'
                      ? 'border-green-200 bg-green-50 hover:border-green-300'
                      : 'border-yellow-200 bg-yellow-50 hover:border-yellow-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-700">{contact.avatar}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                      <div className={`text-xs flex items-center gap-1 ${
                        contact.status === 'verified' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {contact.status === 'verified' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {contact.status === 'verified' ? 'Verified' : 'Pending'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Info Tooltip */}
          <motion.div
            className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <strong>Why it's secure:</strong> Auto-verification + MFA + optional escrow protection.
                All transactions are monitored and insured up to KES 100,000.
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Modern Fintech Action Buttons */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button
            onClick={() => setShowModal(true)}
            className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 text-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-4">
              <motion.div
                className="p-3 bg-white/20 rounded-xl"
                whileHover={{ rotate: 10 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <HandHeart className="w-8 h-8" />
              </motion.div>
              <div className="text-left">
                <div className="text-lg font-bold">Request Loan</div>
                <div className="text-sm opacity-90">From trusted contacts</div>
              </div>
            </div>
            <motion.div
              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              initial={{ scale: 0 }}
              whileHover={{ scale: 1 }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.div>
          </motion.button>

          <motion.button
            onClick={processOverdueReminders}
            disabled={processingReminders}
            className="group relative overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-red-600 text-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50"
            whileHover={{ scale: processingReminders ? 1 : 1.02, y: processingReminders ? 0 : -2 }}
            whileTap={{ scale: processingReminders ? 1 : 0.98 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-4">
              <motion.div
                className="p-3 bg-white/20 rounded-xl"
                animate={processingReminders ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: processingReminders ? Infinity : 0, ease: "linear" }}
              >
                {processingReminders ? <RefreshCw className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
              </motion.div>
              <div className="text-left">
                <div className="text-lg font-bold">
                  {processingReminders ? 'Processing...' : 'Overdue Alerts'}
                </div>
                <div className="text-sm opacity-90">
                  {processingReminders ? 'Sending reminders' : 'Check & notify borrowers'}
                </div>
              </div>
            </div>
          </motion.button>

          <motion.button
            onClick={() => navigate('/p2p-loans')}
            className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-4">
              <motion.div
                className="p-3 bg-white/20 rounded-xl"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Users className="w-8 h-8" />
              </motion.div>
              <div className="text-left">
                <div className="text-lg font-bold">P2P Marketplace</div>
                <div className="text-sm opacity-90">Community lending platform</div>
              </div>
            </div>
            <motion.div
              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              initial={{ scale: 0 }}
              whileHover={{ scale: 1 }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.div>
          </motion.button>
        </motion.div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Lending History</h2>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'overdue', label: 'Overdue' },
            { key: 'repaid', label: 'Repaid' },
            { key: 'written_off', label: 'Written Off' }
          ].map(chip => (
            <button
              key={chip.key}
              onClick={() => setFilterStatus(chip.key)}
              className={`px-3 py-1.5 rounded-full border transition ${
                filterStatus === chip.key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredLendings.map(lending => (
            <div key={lending._id} className={`border p-4 rounded-lg ${lending.status === 'repaid' ? 'border-green-300 bg-green-50' : lending.status === 'overdue' ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium">{lending.borrowerName}</div>
                  <div className="text-sm text-gray-600">{lending.borrowerContact}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">KES {lending.amount.toFixed(2)}</div>
                  <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                    lending.status === 'repaid' ? 'bg-green-100 text-green-800' :
                    lending.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    lending.status === 'written_off' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {lending.status.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                <div>
                  <span className="font-medium">Type:</span> {lending.type}
                </div>
                <div>
                  <span className="font-medium">Expected Return:</span> {new Date(lending.expectedReturnDate).toLocaleDateString()}
                  {lending.status === 'overdue' && (
                    <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                      {(() => {
                        const daysOverdue = Math.floor((new Date() - new Date(lending.expectedReturnDate)) / (1000 * 60 * 60 * 24));
                        return `${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue`;
                      })()}
                    </span>
                  )}
                </div>
              </div>

              {lending.notes && (
                <div className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">Notes:</span> {lending.notes}
                </div>
              )}

              {lending.sourceAccounts && lending.sourceAccounts.length > 0 && (
                <div className="text-xs text-gray-600 mb-3">
                  <span className="font-medium">Fund Sources:</span> {lending.sourceAccounts.map(s => `${s.account} (KES ${s.amount.toFixed(2)})`).join(', ')}
                </div>
              )}

              {lending.securityChecks && (
                <div className="text-xs bg-gray-50 p-2 rounded mb-3">
                  <span className="font-medium">Security:</span> Trust Score {lending.securityChecks.trustScore}/100
                  {lending.securityChecks.mfaRequired && ' • MFA Required'}
                  {lending.securityChecks.escrowEnabled && ' • Escrow Protected'}
                </div>
              )}

              {lending.status === 'overdue' && (
                <div className="text-xs bg-red-50 p-2 rounded mb-3 border border-red-200">
                  <div className="flex items-center gap-2">
                    <span className="text-red-600">📧</span>
                    <span className="font-medium text-red-800">Reminder Sent:</span>
                    <span className="text-red-700">
                      {(() => {
                        const daysOverdue = Math.floor((new Date() - new Date(lending.expectedReturnDate)) / (1000 * 60 * 60 * 24));
                        return `Overdue reminder sent ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} ago`;
                      })()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  Created: {new Date(lending.createdAt).toLocaleDateString()}
                </div>
                <select
                  onChange={(e) => updateStatus(lending._id, e.target.value)}
                  defaultValue={lending.status}
                  className="p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="repaid">Mark as Repaid</option>
                  <option value="written_off">Write Off as Gift</option>
                  <option value="overdue">Mark as Overdue</option>
                </select>
              </div>
            </div>
          ))}
        </div>
        {lendings.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No lending history yet</h3>
            <p className="mb-4">Start by requesting a loan from someone in your contacts!</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              🤝 Request from Contact
            </button>
          </div>
        )}
      </div>

      <ContactBasedLendingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleLoanRequest}
        userAccounts={userAccounts}
      />
    </div>
  );

  // Lending Card Component
  const LendingCard = ({ lending, index, onStatusUpdate, onSendReminder }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const daysOverdue = lending.status === 'overdue'
      ? Math.floor((new Date() - new Date(lending.expectedReturnDate)) / (1000 * 60 * 60 * 24))
      : 0;

    return (
      <motion.div
        className={`bg-white rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${
          lending.status === 'repaid' ? 'border-green-200 bg-green-50/50' :
          lending.status === 'overdue' ? 'border-red-200 bg-red-50/50' :
          lending.status === 'written_off' ? 'border-gray-200 bg-gray-50/50' :
          'border-gray-200 hover:border-blue-300'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.01 }}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                lending.status === 'repaid' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                lending.status === 'overdue' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                lending.status === 'written_off' ? 'bg-gradient-to-r from-gray-500 to-slate-500' :
                'bg-gradient-to-r from-blue-500 to-indigo-500'
              }`}>
                {getBorrowerInitials(lending.borrowerName)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{lending.borrowerName}</h3>
                <p className="text-sm text-gray-600">{lending.borrowerContact}</p>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(lending.status)}
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    lending.status === 'repaid' ? 'bg-green-100 text-green-800' :
                    lending.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    lending.status === 'written_off' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {lending.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">KES {lending.amount.toLocaleString()}</div>
              <div className="text-sm text-gray-600">{lending.type}</div>
            </div>
          </div>

          {/* Timeline Bar */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
              <Calendar className="w-3 h-3" />
              <span>Timeline</span>
            </div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mb-1"></div>
                  <div className="text-xs text-gray-600">Created</div>
                  <div className="text-xs font-medium text-gray-900">
                    {new Date(lending.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex-1 h-px bg-gray-300 mx-4 relative">
                  <div className={`h-full transition-all duration-1000 ${
                    lending.status === 'repaid' ? 'bg-green-500' :
                    lending.status === 'overdue' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`} style={{ width: lending.status === 'repaid' ? '100%' : lending.status === 'pending' ? '50%' : '75%' }}></div>
                </div>
                <div className="text-center">
                  <div className={`w-3 h-3 rounded-full mb-1 ${
                    lending.status === 'repaid' ? 'bg-green-500' :
                    lending.status === 'overdue' ? 'bg-red-500' :
                    'bg-gray-400'
                  }`}></div>
                  <div className="text-xs text-gray-600">Expected</div>
                  <div className="text-xs font-medium text-gray-900">
                    {new Date(lending.expectedReturnDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          {lending.securityChecks && (
            <div className="flex items-center gap-2 mb-4">
              {lending.securityChecks.escrowEnabled && (
                <div className="flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  <Lock className="w-3 h-3" />
                  <span>Escrow Protected</span>
                </div>
              )}
              {lending.securityChecks.mfaRequired && (
                <div className="flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  <Shield className="w-3 h-3" />
                  <span>MFA Required</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                <Star className="w-3 h-3" />
                <span>Trust Score: {lending.securityChecks.trustScore}/100</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                {isExpanded ? 'Less' : 'More'} Details
              </motion.button>

              {lending.status === 'overdue' && (
                <motion.button
                  onClick={() => onSendReminder(lending._id)}
                  className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>📧</span>
                  Send Reminder
                </motion.button>
              )}
            </div>

            <select
              onChange={(e) => onStatusUpdate(lending._id, e.target.value)}
              defaultValue={lending.status}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="repaid">✅ Mark Repaid</option>
              <option value="written_off">🎁 Write Off</option>
              <option value="overdue">⚠️ Mark Overdue</option>
            </select>
          </div>

          {/* Expandable Details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Fund Sources:</span>
                    {lending.sourceAccounts && lending.sourceAccounts.length > 0 ? (
                      <div className="mt-1 space-y-1">
                        {lending.sourceAccounts.map((source, idx) => (
                          <div key={idx} className="text-gray-600">
                            {source.account}: KES {source.amount.toLocaleString()}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-600 mt-1">Not specified</div>
                    )}
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Notes:</span>
                    <div className="text-gray-600 mt-1">
                      {lending.notes || 'No notes provided'}
                    </div>
                  </div>
                </div>

                {lending.status === 'overdue' && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium">Overdue Alert</span>
                    </div>
                    <p className="text-red-700 text-sm mt-1">
                      This loan is {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue.
                      Consider sending a reminder or updating the status.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };
};

export default Lending;