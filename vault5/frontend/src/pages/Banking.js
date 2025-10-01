import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, CheckCircle, AlertCircle, RefreshCw, TrendingUp, TrendingDown, ArrowRight, Shield, Zap, Target, CreditCard, ChevronRight, Home } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const Banking = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      // Check if user has Plaid connection
      const response = await api.get('/api/plaid/transactions');
      if (response.data.transactions) {
        setConnected(true);
        setTransactions(response.data.transactions.slice(0, 5)); // Show last 5 transactions
      }
    } catch (error) {
      // Not connected yet
      setConnected(false);
    }
  };

  const connectBankAccount = async () => {
    setLoading(true);
    try {
      // Get link token from backend
      const response = await api.post('/api/plaid/link-token');
      const linkToken = response.data.link_token;

      // Load Plaid Link script dynamically
      const script = document.createElement('script');
      script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
      script.onload = () => {
        const handler = window.Plaid.create({
          token: linkToken,
          onSuccess: async (public_token, metadata) => {
            try {
              // Exchange public token for access token
              await api.post('/api/plaid/exchange-token', { public_token });
              setConnected(true);
              await checkConnectionStatus();
              showSuccess('Bank account connected successfully!');
            } catch (error) {
              showError('Failed to connect bank account');
            }
          },
          onExit: (err, metadata) => {
            if (err) {
              console.error('Plaid Link error:', err);
            }
          },
        });
        handler.open();
      };
      document.head.appendChild(script);
    } catch (error) {
      showError('Failed to initialize bank connection');
    } finally {
      setLoading(false);
    }
  };

  const syncTransactions = async () => {
    setLoading(true);
    try {
      await api.get('/api/plaid/transactions');
      await checkConnectionStatus();
      showSuccess('Transactions synced successfully!');
    } catch (error) {
      showError('Failed to sync transactions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400 mb-6"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Home className="w-4 h-4 mr-1" />
            Dashboard
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 dark:text-white font-medium">Banking</span>
        </motion.nav>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-teal-500 to-cyan-600 rounded-3xl p-8 md:p-12 mb-8 shadow-2xl"
        >
          {/* Floating Shapes Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white rounded-full animate-pulse delay-500"></div>
          </div>

          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6"
              >
                <Building2 className="w-10 h-10 text-white" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold text-white mb-4"
              >
                Seamless Banking Integration
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-blue-100 mb-8 max-w-2xl"
              >
                Connect your accounts, track transactions, and stay in control effortlessly.
              </motion.p>

              {!connected && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  onClick={connectBankAccount}
                  disabled={loading}
                  className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-blue-50 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? (
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  ) : (
                    <CreditCard className="w-6 h-6" />
                  )}
                  {loading ? 'Connecting...' : 'Connect Your Bank'}
                </motion.button>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex-shrink-0"
            >
              <div className="relative">
                <div className="w-64 h-64 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                      <Shield className="w-12 h-12 text-white" />
                    </div>
                    <div className="text-white font-semibold text-lg">Secure Connection</div>
                    <div className="text-blue-100 text-sm">Bank-level encryption</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Connection Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                connected
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                {connected ? (
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Connection Status</h2>
                <p className={`text-lg font-medium ${
                  connected
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {connected ? 'Bank account connected' : 'No bank account connected'}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              {connected ? (
                <button
                  onClick={syncTransactions}
                  disabled={loading}
                  className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-5 h-5" />
                  )}
                  {loading ? 'Syncing...' : 'Sync Transactions'}
                </button>
              ) : (
                <button
                  onClick={connectBankAccount}
                  disabled={loading}
                  className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  ) : (
                    <Building2 className="w-6 h-6" />
                  )}
                  {loading ? 'Connecting...' : 'Connect Bank Account'}
                </button>
              )}
            </div>
          </div>

          {/* Timeline Indicator */}
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                connected ? 'bg-green-100 dark:bg-green-900/30' : 'bg-slate-100 dark:bg-slate-700'
              }`}>
                <span className={`text-sm font-bold ${
                  connected ? 'text-green-600 dark:text-green-400' : 'text-slate-400'
                }`}>1</span>
              </div>
              <span className={`text-sm font-medium ${
                connected ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'
              }`}>Request Link Token</span>
            </div>

            <div className={`w-12 h-0.5 ${connected ? 'bg-green-400' : 'bg-slate-300 dark:bg-slate-600'}`}></div>

            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                connected ? 'bg-green-100 dark:bg-green-900/30' : 'bg-slate-100 dark:bg-slate-700'
              }`}>
                <span className={`text-sm font-bold ${
                  connected ? 'text-green-600 dark:text-green-400' : 'text-slate-400'
                }`}>2</span>
              </div>
              <span className={`text-sm font-medium ${
                connected ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'
              }`}>Bank Linked</span>
            </div>

            <div className={`w-12 h-0.5 ${connected ? 'bg-green-400' : 'bg-slate-300 dark:bg-slate-600'}`}></div>

            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                connected ? 'bg-green-100 dark:bg-green-900/30' : 'bg-slate-100 dark:bg-slate-700'
              }`}>
                <span className={`text-sm font-bold ${
                  connected ? 'text-green-600 dark:text-green-400' : 'text-slate-400'
                }`}>3</span>
              </div>
              <span className={`text-sm font-medium ${
                connected ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'
              }`}>Transactions Synced</span>
            </div>
          </div>
        </motion.div>

        {/* Recent Transactions */}
        {connected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recent Transactions</h2>
              <button
                onClick={() => navigate('/transactions')}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {transaction.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{transaction.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{transaction.date}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-wide">{transaction.category}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`flex items-center gap-2 font-bold text-lg ${
                        transaction.amount > 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.amount > 0 ? (
                          <TrendingUp className="w-5 h-5" />
                        ) : (
                          <TrendingDown className="w-5 h-5" />
                        )}
                        <span>${Math.abs(transaction.amount).toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        {transaction.amount > 0 ? 'Deposit' : 'Expense'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No transactions found</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">Try syncing your account to see recent activity.</p>
                <button
                  onClick={syncTransactions}
                  disabled={loading}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Sync Transactions
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500 to-teal-500 rounded-3xl"></div>
          </div>

          <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Why Connect Your Bank?</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Unlock powerful financial insights and automation with secure bank integration
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <Zap className="w-8 h-8" />,
                  color: 'from-blue-500 to-blue-600',
                  bgColor: 'bg-blue-100 dark:bg-blue-900/30',
                  title: 'Automatic Import',
                  description: 'No more manual entry - transactions sync automatically from your bank.'
                },
                {
                  icon: <Target className="w-8 h-8" />,
                  color: 'from-green-500 to-green-600',
                  bgColor: 'bg-green-100 dark:bg-green-900/30',
                  title: 'Real-time Updates',
                  description: 'See your account balances and transactions update in real-time.'
                },
                {
                  icon: <Shield className="w-8 h-8" />,
                  color: 'from-purple-500 to-purple-600',
                  bgColor: 'bg-purple-100 dark:bg-purple-900/30',
                  title: 'Smart Categorization',
                  description: 'Transactions are automatically categorized for better financial insights.'
                },
                {
                  icon: <Building2 className="w-8 h-8" />,
                  color: 'from-yellow-500 to-orange-600',
                  bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
                  title: 'Bank-Level Security',
                  description: 'Your data is protected with bank-level encryption and security standards.'
                }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="group text-center"
                >
                  <div className={`w-16 h-16 ${benefit.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                    <div className={`text-white bg-gradient-to-br ${benefit.color} rounded-xl p-3`}>
                      {benefit.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{benefit.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Banking;