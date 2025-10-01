import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import { p2pLoansAPI, makeIdemKey } from '../services/api';
import LenderApprovalModal from '../components/LenderApprovalModal';
import P2PLoanRequestWizard from '../components/P2PLoanRequestWizard';
import {
  CreditCardIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  HandRaisedIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SparklesIcon,
  PlusIcon
} from '@heroicons/react/24/solid';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';

// Enhanced Status Pill with Icons and Animations
const StatusPill = ({ status }) => {
  const statusConfig = {
    pending_approval: {
      bg: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      icon: ClockIcon,
      pulse: true,
      label: 'Pending'
    },
    approved: {
      bg: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      icon: CheckCircleIcon,
      label: 'Approved'
    },
    funded: {
      bg: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400',
      icon: CurrencyDollarIcon,
      label: 'Funded'
    },
    active: {
      bg: 'bg-green-500/20 border-green-500/30 text-green-400',
      icon: CheckCircleIcon,
      label: 'Active'
    },
    overdue: {
      bg: 'bg-red-500/20 border-red-500/30 text-red-400',
      icon: ExclamationTriangleIcon,
      pulse: true,
      label: 'Overdue'
    },
    repaid: {
      bg: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      icon: CheckCircleIcon,
      label: 'Repaid'
    },
    written_off: {
      bg: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
      icon: XCircleIcon,
      label: 'Written Off'
    },
    declined: {
      bg: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
      icon: XCircleIcon,
      label: 'Declined'
    },
    cancelled: {
      bg: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
      icon: XCircleIcon,
      label: 'Cancelled'
    },
  };

  const config = statusConfig[status] || {
    bg: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
    icon: ClockIcon,
    label: String(status).replace(/_/g, ' ')
  };

  const IconComponent = config.icon;

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${config.bg} ${
        config.pulse ? 'animate-pulse' : ''
      }`}
    >
      <IconComponent className="w-3 h-3" />
      {config.label}
    </motion.span>
  );
};

// Enhanced Card with Glassmorphism
const Card = ({ children, className = '', variant = 'default' }) => {
  const variants = {
    default: 'bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg',
    stat: 'bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md border border-white/30 shadow-xl',
    loan: 'bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-6 ${variants[variant]} ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Empty State Component
const EmptyState = ({ icon, title, message }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-16"
  >
    <div className="text-6xl mb-4">{icon}</div>
    <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
    <p className="text-slate-400 text-lg max-w-md mx-auto">{message}</p>
  </motion.div>
);

export default function P2PLoans() {
  const { showError, showSuccess } = useToast();
  const showErrorRef = useRef(showError);
  useEffect(() => { showErrorRef.current = showError; }, [showError]);

  const [loading, setLoading] = useState(true);
  const [list, setList] = useState({ borrowed: [], lent: [], summary: { activeLoans: 0, pendingApprovals: 0, overdueAmount: 0 } });
  const [tab, setTab] = useState('borrowed'); // 'borrowed' | 'lent'
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [repayBusyId, setRepayBusyId] = useState(null);
  const [declineBusyId, setDeclineBusyId] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await p2pLoansAPI.list();
      setList(resp.data?.data || { borrowed: [], lent: [], summary: { activeLoans: 0, pendingApprovals: 0, overdueAmount: 0 } });
    } catch (e) {
      showErrorRef.current(e?.response?.data?.message || 'Failed to load P2P loans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const borrowed = useMemo(() => list.borrowed || [], [list]);
  const lent = useMemo(() => list.lent || [], [list]);

  const onApproveClick = (loan) => {
    setSelectedLoan(loan);
    setApproveOpen(true);
  };

  const onDecline = async (loanId) => {
    setDeclineBusyId(loanId);
    try {
      await p2pLoansAPI.decline(loanId, makeIdemKey('p2p-decline-ui'));
      showSuccess('Loan request declined');
      await reload();
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to decline loan');
    } finally {
      setDeclineBusyId(null);
    }
  };

  const onRepay = async (loan) => {
    const suggestion = loan.nextPaymentAmount && loan.nextPaymentAmount > 0 ? loan.nextPaymentAmount : Math.min(loan.remainingAmount || 0, 0);
    const input = window.prompt('Enter repayment amount (KES)', suggestion ? String(suggestion) : '');
    if (!input) return;
    const amount = Number(input);
    if (!(amount > 0)) {
      showError('Enter a valid amount');
      return;
    }
    setRepayBusyId(loan._id);
    try {
      await p2pLoansAPI.repay(loan._id, { amount }, makeIdemKey('p2p-repay-ui'));
      showSuccess('Repayment successful');
      await reload();
    } catch (e) {
      showError(e?.response?.data?.message || 'Repayment failed');
    } finally {
      setRepayBusyId(null);
    }
  };

  const renderLoanRow = (loan, isLent) => {
    const money = (n) => `KES ${Number(n || 0).toLocaleString()}`;
    const dueStr = loan.nextPaymentDate ? new Date(loan.nextPaymentDate).toLocaleDateString() : '-';
    const canApprove = isLent && loan.status === 'pending_approval';
    const canRepay = !isLent && ['active', 'funded', 'approved', 'overdue'].includes(loan.status);

    return (
      <Card key={loan._id}>
        <div className="flex justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="font-semibold">{isLent ? 'Your borrower' : 'Your lender'}</div>
              <StatusPill status={loan.status} />
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Principal: <span className="font-medium">{money(loan.principal)}</span> • Remaining:{' '}
              <span className="font-medium">{money(loan.remainingAmount)}</span> • Next due:{' '}
              <span className="font-medium">{dueStr}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Schedule: {loan.scheduleType} • {loan.scheduleFrequency}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canApprove && (
              <>
                <button
                  onClick={() => onApproveClick(loan)}
                  className="px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => onDecline(loan._id)}
                  disabled={declineBusyId === loan._id}
                  className="px-3 py-1.5 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
                >
                  {declineBusyId === loan._id ? 'Declining...' : 'Decline'}
                </button>
              </>
            )}
            {canRepay && (
              <button
                onClick={() => onRepay(loan)}
                disabled={repayBusyId === loan._id}
                className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {repayBusyId === loan._id ? 'Processing...' : 'Repay'}
              </button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  // Enhanced Loan Card Component
  const renderLoanCard = (loan, isLent) => {
    const money = (n) => `KES ${Number(n || 0).toLocaleString()}`;
    const dueStr = loan.nextPaymentDate ? new Date(loan.nextPaymentDate).toLocaleDateString() : 'No due date';
    const canApprove = isLent && loan.status === 'pending_approval';
    const canRepay = !isLent && ['active', 'funded', 'approved', 'overdue'].includes(loan.status);

    return (
      <Card variant="loan" className="group">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              {isLent ? <HandRaisedIcon className="w-5 h-5 text-white" /> : <CreditCardIcon className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{isLent ? 'Your Borrower' : 'Your Lender'}</h3>
              <p className="text-slate-400 text-sm">Loan #{loan._id.slice(-6)}</p>
            </div>
          </div>
          <StatusPill status={loan.status} />
        </div>

        {/* Financial Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Principal</p>
            <p className="text-lg font-bold text-white">{money(loan.principal)}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Remaining</p>
            <p className="text-lg font-bold text-white">{money(loan.remainingAmount)}</p>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white/5 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Next Payment Due</p>
              <p className="text-sm font-medium text-white">{dueStr}</p>
            </div>
            {loan.nextPaymentAmount && (
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase tracking-wide">Amount</p>
                <p className="text-sm font-medium text-green-400">{money(loan.nextPaymentAmount)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Schedule Info */}
        <div className="text-xs text-slate-400 mb-4">
          <span className="capitalize">{loan.scheduleType}</span> • {loan.scheduleFrequency}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {canApprove && (
            <>
              <motion.button
                onClick={() => onApproveClick(loan)}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <CheckCircleIcon className="w-4 h-4" />
                Approve
              </motion.button>
              <motion.button
                onClick={() => onDecline(loan._id)}
                disabled={declineBusyId === loan._id}
                className="flex-1 bg-white/10 hover:bg-white/20 text-slate-300 py-3 px-4 rounded-xl font-semibold border border-white/20 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {declineBusyId === loan._id ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <XCircleIcon className="w-4 h-4" />
                )}
                {declineBusyId === loan._id ? 'Declining...' : 'Decline'}
              </motion.button>
            </>
          )}
          {canRepay && (
            <motion.button
              onClick={() => onRepay(loan)}
              disabled={repayBusyId === loan._id}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {repayBusyId === loan._id ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <CurrencyDollarIcon className="w-4 h-4" />
              )}
              {repayBusyId === loan._id ? 'Processing...' : 'Make Payment'}
            </motion.button>
          )}
        </div>
      </Card>
    );
  };

  // Loading State with Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-1000"></div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded-xl w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white/10 rounded-2xl p-6 space-y-3">
                  <div className="h-4 bg-white/20 rounded w-1/2"></div>
                  <div className="h-8 bg-white/20 rounded w-3/4"></div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white/10 rounded-2xl p-6 space-y-3">
                  <div className="h-4 bg-white/20 rounded w-1/4"></div>
                  <div className="h-4 bg-white/20 rounded w-1/2"></div>
                  <div className="h-4 bg-white/20 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-1/3 right-10 w-1 h-1 bg-cyan-400 rounded-full animate-pulse delay-1500"></div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <div className="space-y-8">
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <HandRaisedIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white">P2P Loans</h1>
                <p className="text-slate-400 text-lg mt-2">Track, manage, and fund peer-to-peer loans in one place</p>
              </div>
            </div>

            {/* Enhanced CTA Button */}
            <motion.button
              onClick={() => setRequestOpen(true)}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white rounded-2xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-30 transition-opacity duration-500 rounded-2xl"></div>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"></div>
              <div className="relative flex items-center gap-3">
                <PlusIcon className="w-5 h-5" />
                <span>Request P2P Loan</span>
                <SparklesIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.button>
          </motion.div>

          {/* Enhanced Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Active Loans Card */}
            <Card variant="stat" className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <CreditCardIcon className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="flex items-center gap-1 text-green-400">
                    <ArrowUpIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">+12%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 text-sm font-medium">Active Loans</p>
                  <p className="text-3xl font-bold text-white">{list.summary?.activeLoans ?? 0}</p>
                  <p className="text-slate-500 text-xs">Performing well this month</p>
                </div>
              </div>
            </Card>

            {/* Pending Approvals Card */}
            <Card variant="stat" className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <ClockIcon className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    <ArrowDownIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">-5%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 text-sm font-medium">Pending Approvals</p>
                  <p className="text-3xl font-bold text-white">{list.summary?.pendingApprovals ?? 0}</p>
                  <p className="text-slate-500 text-xs">Awaiting lender decisions</p>
                </div>
              </div>
            </Card>

            {/* Overdue Amount Card */}
            <Card variant="stat" className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="flex items-center gap-1 text-red-400">
                    <ArrowUpIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">+8%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 text-sm font-medium">Overdue Amount</p>
                  <p className="text-3xl font-bold text-white">KES {Number(list.summary?.overdueAmount ?? 0).toLocaleString()}</p>
                  <p className="text-slate-500 text-xs">Needs attention</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Enhanced Segmented Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-2 flex gap-2">
              <motion.button
                onClick={() => setTab('borrowed')}
                className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 ${
                  tab === 'borrowed'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CreditCardIcon className="w-5 h-5" />
                <span>Borrowed</span>
                {tab === 'borrowed' && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl -z-10"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>

              <motion.button
                onClick={() => setTab('lent')}
                className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 ${
                  tab === 'lent'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <HandRaisedIcon className="w-5 h-5" />
                <span>Lent</span>
                {tab === 'lent' && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl -z-10"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Enhanced Loan Lists with Animations */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: tab === 'borrowed' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: tab === 'borrowed' ? 20 : -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {tab === 'borrowed' && (
                borrowed.length > 0 ? (
                  borrowed.map((loan, index) => (
                    <motion.div
                      key={loan._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {renderLoanCard(loan, false)}
                    </motion.div>
                  ))
                ) : (
                  <EmptyState
                    icon="💳"
                    title="No Borrowed Loans"
                    message="You don't have any borrowings right now — you're debt-free! 🎉"
                  />
                )
              )}

              {tab === 'lent' && (
                lent.length > 0 ? (
                  lent.map((loan, index) => (
                    <motion.div
                      key={loan._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {renderLoanCard(loan, true)}
                    </motion.div>
                  ))
                ) : (
                  <EmptyState
                    icon="🚀"
                    title="No Active Lendings"
                    message="Ready to fund someone's journey? Start lending today!"
                  />
                )
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Modals */}
        <LenderApprovalModal
          isOpen={approveOpen}
          onClose={() => { setApproveOpen(false); setSelectedLoan(null); }}
          loan={selectedLoan}
          onApproved={async () => { setApproveOpen(false); await reload(); showSuccess('Loan approved successfully! 🎉'); }}
        />
        <P2PLoanRequestWizard
          isOpen={requestOpen}
          onClose={() => setRequestOpen(false)}
          onSubmitted={async () => { setRequestOpen(false); await reload(); showSuccess('Loan request submitted successfully! 📝'); }}
        />
      </div>
    </div>
  );
}