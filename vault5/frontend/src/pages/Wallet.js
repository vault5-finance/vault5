import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  Settings,
  Shield,
  Lock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Target,
  Award,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Calendar,
  BarChart3,
  PieChart,
  Download,
  Filter,
  Search,
  MoreVertical,
  Zap,
  Heart,
  Phone,
  Mail,
  Globe,
  Receipt,
  Tag,
  Star
} from 'lucide-react';

const WalletPage = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState(null);

  useEffect(() => {
    loadWallet();
    loadRecentTransactions();
    loadMonthlyStats();
  }, []);

  const loadWallet = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/wallet');
      if (response.data) {
        setWallet(response.data);
      } else {
        setError('Failed to load wallet data');
      }
    } catch (err) {
      setError('Failed to load wallet');
      console.error('Load wallet error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentTransactions = async () => {
    try {
      const response = await api.get('/api/transactions?limit=5');
      setRecentTransactions(response.data || []);
    } catch (err) {
      console.error('Load recent transactions error:', err);
    }
  };

  const loadMonthlyStats = async () => {
    try {
      const response = await api.get('/api/transactions/analytics?period=month');
      setMonthlyStats(response.data || {});
    } catch (err) {
      console.error('Load monthly stats error:', err);
    }
  };

  const handleRecharge = async (amount) => {
    try {
      const response = await api.post('/api/wallet/recharge', { amount });
      if (response.data.success) {
        showSuccess('Wallet recharged successfully!');
        await loadWallet();
        return response;
      } else {
        showError(response.data.message);
        return response;
      }
    } catch (err) {
      showError('Failed to recharge wallet');
      console.error('Recharge error:', err);
      return { success: false, message: 'Failed to recharge wallet' };
    }
  };

  const handleTransfer = async (amount, recipient) => {
    try {
      const response = await api.post('/api/wallet/transfer', { amount, recipient });
      if (response.data.success) {
        showSuccess('Transfer completed successfully!');
        await loadWallet();
        return response;
      } else {
        showError(response.data.message);
        return response;
      }
    } catch (err) {
      showError('Failed to complete transfer');
      console.error('Transfer error:', err);
      return { success: false, message: 'Failed to complete transfer' };
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'recharge', name: 'Recharge', icon: <Plus className="w-4 h-4" /> },
    { id: 'history', name: 'History', icon: <History className="w-4 h-4" /> },
    { id: 'settings', name: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
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
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <motion.div
              className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-gray-600">Loading your wallet...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
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
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Wallet</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={loadWallet}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Try Again
            </button>
          </motion.div>
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
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
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
            <span className="text-sm font-medium text-gray-700">Financial Control Center</span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Digital Wallet
          </motion.h1>

          <motion.p
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Your secure financial hub for <span className="font-semibold text-blue-600">payments</span>,
            <span className="font-semibold text-purple-600"> transfers</span>, and
            <span className="font-semibold text-indigo-600"> management</span>.
          </motion.p>
        </motion.div>

        {/* Wallet Balance Hero Card */}
        {wallet && (
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 mb-12 text-white relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

            <div className="relative flex flex-col md:flex-row items-center justify-between">
              <div className="text-center md:text-left mb-6 md:mb-0">
                <div className="flex items-center gap-3 mb-2">
                  <motion.div
                    className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <Wallet className="w-6 h-6" />
                  </motion.div>
                  <div>
                    <h2 className="text-lg font-medium opacity-90">Wallet Balance</h2>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold">
                        {balanceVisible ? `KES ${wallet.balance?.toLocaleString() || '0'}` : '••••••'}
                      </span>
                      <button
                        onClick={() => setBalanceVisible(!balanceVisible)}
                        className="p-1 hover:bg-white/20 rounded"
                      >
                        {balanceVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="opacity-80">
                  Available: KES {wallet.availableBalance?.toLocaleString() || '0'}
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    wallet.status === 'active'
                      ? 'bg-green-400/20 text-green-100'
                      : 'bg-red-400/20 text-red-100'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      wallet.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    {wallet.status}
                  </div>
                  <p className="text-xs opacity-80 mt-1">Status</p>
                </div>

                <div className="text-center">
                  <div className="text-lg font-bold">Level {wallet.kycLevel}</div>
                  <p className="text-xs opacity-80">KYC</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <motion.button
            onClick={() => setActiveTab('recharge')}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.div
              className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors"
              whileHover={{ rotate: 5 }}
            >
              <Plus className="w-6 h-6 text-green-600" />
            </motion.div>
            <h3 className="font-semibold text-gray-900 mb-1">Recharge</h3>
            <p className="text-xs text-gray-600">Add funds</p>
          </motion.button>

          <motion.button
            onClick={() => setActiveTab('overview')}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.div
              className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors"
              whileHover={{ rotate: 5 }}
            >
              <ArrowUpRight className="w-6 h-6 text-blue-600" />
            </motion.div>
            <h3 className="font-semibold text-gray-900 mb-1">Transfer</h3>
            <p className="text-xs text-gray-600">Send money</p>
          </motion.button>

          <motion.button
            onClick={() => setActiveTab('history')}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <motion.div
              className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-colors"
              whileHover={{ rotate: 5 }}
            >
              <History className="w-6 h-6 text-purple-600" />
            </motion.div>
            <h3 className="font-semibold text-gray-900 mb-1">History</h3>
            <p className="text-xs text-gray-600">View transactions</p>
          </motion.button>

          <motion.button
            onClick={() => setActiveTab('settings')}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <motion.div
              className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-200 transition-colors"
              whileHover={{ rotate: 5 }}
            >
              <Settings className="w-6 h-6 text-indigo-600" />
            </motion.div>
            <h3 className="font-semibold text-gray-900 mb-1">Settings</h3>
            <p className="text-xs text-gray-600">Manage wallet</p>
          </motion.button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 mb-8">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50"
          >
            {activeTab === 'overview' && (
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                    <ArrowUpRight className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-900">
                      KES {monthlyStats?.totalIncome?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-green-700">Income This Month</div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
                    <ArrowDownLeft className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-900">
                      KES {monthlyStats?.totalExpenses?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-red-700">Expenses This Month</div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-900">
                      {monthlyStats?.transactionCount || 0}
                    </div>
                    <div className="text-sm text-blue-700">Transactions</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h3>
                    <div className="space-y-3">
                      {recentTransactions.slice(0, 5).map((transaction, index) => (
                        <motion.div
                          key={transaction._id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              {transaction.type === 'income' ? (
                                <ArrowUpRight className="w-5 h-5 text-green-600" />
                              ) : (
                                <ArrowDownLeft className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{transaction.description}</div>
                              <div className="text-sm text-gray-500">{transaction.category}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${
                              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'}KES {transaction.amount.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(transaction.date).toLocaleDateString()}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => setActiveTab('recharge')}
                        className="w-full p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center gap-3"
                      >
                        <Plus className="w-5 h-5" />
                        Recharge Wallet
                      </button>

                      <button
                        onClick={() => setActiveTab('history')}
                        className="w-full p-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 flex items-center gap-3"
                      >
                        <History className="w-5 h-5" />
                        View Full History
                      </button>

                      <button
                        onClick={() => setActiveTab('settings')}
                        className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center gap-3"
                      >
                        <Settings className="w-5 h-5" />
                        Wallet Settings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'recharge' && (
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Recharge Your Wallet</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[500, 1000, 2000].map((amount) => (
                    <motion.button
                      key={amount}
                      onClick={() => handleRecharge(amount)}
                      className="p-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 text-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="text-2xl font-bold mb-2">KES {amount.toLocaleString()}</div>
                      <div className="text-sm opacity-90">Quick recharge</div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Transaction History</h3>
                <div className="space-y-3">
                  {recentTransactions.map((transaction, index) => (
                    <motion.div
                      key={transaction._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'income' ? (
                            <ArrowUpRight className="w-5 h-5 text-green-600" />
                          ) : (
                            <ArrowDownLeft className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{transaction.description}</div>
                          <div className="text-sm text-gray-500">{transaction.category} • {new Date(transaction.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className={`font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}KES {transaction.amount.toFixed(2)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Wallet Settings</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                      <div className="text-sm text-gray-500">Add an extra layer of security</div>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Enable 2FA
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-medium text-gray-900">Transaction Notifications</div>
                      <div className="text-sm text-gray-500">Get notified of all wallet activity</div>
                    </div>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                      Configure
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-medium text-gray-900">KYC Verification</div>
                      <div className="text-sm text-gray-500">Current level: {wallet?.kycLevel || '1'}</div>
                    </div>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                      Upgrade
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WalletPage;