import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import {
  Settings,
  Link,
  Bell,
  Shield,
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  Wallet,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Target,
  Award,
  ChevronRight,
  ChevronLeft,
  X,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  MapPin,
  Star,
  Heart,
  Zap,
  Lock,
  Globe,
  Receipt,
  Tag,
  MoreVertical,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
  BarChart3,
  Download,
  Filter,
  Search,
  Calendar,
  FileText,
  Calculator
} from 'lucide-react';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('accounts');
  const [settings, setSettings] = useState({
    linkedAccounts: [],
    notificationThresholds: { shortfall: 1000, goalProgress: 90, loanDueDays: 3 },
    lendingRules: { nonRepayCap: 3, safePercent: 50 },
    gracePeriodSettings: {
      enabled: true,
      channels: { email: true, sms: false, push: true, whatsapp: false },
      gracePeriods: { emergency: 1, nonEmergency: 3 },
      escalationSchedule: { firstReminder: 1, secondReminder: 7, thirdReminder: 14, finalReminder: 30 },
      preferredContactTimes: { startHour: 9, endHour: 18, timezone: 'Africa/Nairobi' },
      templates: { preferredTone: 'professional' }
    }
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [accLoading, setAccLoading] = useState(true);
  const [updatingAccountId, setUpdatingAccountId] = useState(null);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [newAccount, setNewAccount] = useState({ type: '', accountNumber: '' });
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const loadSettings = async () => {
      setLoading(true);
      try {
        // Load regular settings
        const settingsResponse = await api.get('/api/settings');

        // Load grace period settings
        const gracePeriodResponse = await api.get('/api/grace-period/settings');

        setSettings(prev => ({
          ...prev,
          ...settingsResponse.data,
          gracePeriodSettings: gracePeriodResponse.data.settings
        }));
      } catch (error) {
        console.error('Settings load error:', error);
        if (error.response && error.response.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [navigate]);
  
  // Load accounts for account preferences
  useEffect(() => {
    let mounted = true;
    setAccLoading(true);
    api.get('/api/accounts')
      .then(res => { if (mounted) setAccounts(res.data || []); })
      .catch(error => {
        console.error('Accounts load error:', error);
        if (error.response && error.response.status === 401) navigate('/login');
      })
      .finally(() => { if (mounted) setAccLoading(false); });
    return () => { mounted = false; };
  }, [navigate]);
  
  const refreshAccounts = async () => {
    setAccLoading(true);
    try {
      const res = await api.get('/api/accounts');
      setAccounts(res.data || []);
    } catch (error) {
      console.error('Accounts refresh error:', error);
    } finally {
      setAccLoading(false);
    }
  };
  
  const setWallet = async (accountId) => {
    setUpdatingAccountId(accountId);
    try {
      await api.patch(`/api/accounts/${accountId}/flags`, { isWallet: true });
      showSuccess('Wallet updated');
      await refreshAccounts();
    } catch (error) {
      console.error('Set wallet error:', error);
      showError(error.response?.data?.message || 'Failed to set wallet');
    } finally {
      setUpdatingAccountId(null);
    }
  };
  
  const toggleAutoDistribute = async (account, value) => {
    setUpdatingAccountId(account._id);
    try {
      await api.patch(`/api/accounts/${account._id}/flags`, { isAutoDistribute: value });
      showSuccess('Auto-distribute preference updated');
      await refreshAccounts();
    } catch (error) {
      console.error('Toggle auto-distribute error:', error);
      showError(error.response?.data?.message || 'Failed to update preference');
    } finally {
      setUpdatingAccountId(null);
    }
  };

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleLinkedAccountsChange = (e) => {
    const accounts = e.target.value.split(',').map(acc => acc.trim()).filter(acc => acc);
    setSettings(prev => ({
      ...prev,
      linkedAccounts: accounts
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      // Update regular settings
      const settingsResponse = await api.put('/api/settings', {
        notificationThresholds: settings.notificationThresholds,
        lendingRules: settings.lendingRules,
        linkedAccounts: settings.linkedAccounts
      });

      // Update grace period settings
      const gracePeriodResponse = await api.put('/api/grace-period/settings', settings.gracePeriodSettings);

      setSettings(prev => ({
        ...prev,
        ...settingsResponse.data.preferences,
        gracePeriodSettings: gracePeriodResponse.data.settings
      }));

      showSuccess('All settings updated successfully');
    } catch (error) {
      console.error('Update settings error:', error);
      showError(error.response?.data?.message || 'Error updating settings');
    } finally {
      setUpdating(false);
    }
  };

  const tabs = [
    { id: 'accounts', name: 'Linked Accounts', icon: <Link className="w-4 h-4" /> },
    { id: 'preferences', name: 'Account Preferences', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'notifications', name: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'lending', name: 'Lending Rules', icon: <Shield className="w-4 h-4" /> },
    { id: 'reminders', name: 'Overdue Reminders', icon: <Clock className="w-4 h-4" /> }
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
            <p className="text-gray-600">Loading your settings...</p>
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
            <span className="text-sm font-medium text-gray-700">Account Management</span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Settings & Preferences
          </motion.h1>

          <motion.p
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Customize your Vault5 experience with <span className="font-semibold text-blue-600">precision</span>,
            <span className="font-semibold text-purple-600"> control</span>, and
            <span className="font-semibold text-indigo-600"> security</span>.
          </motion.p>
        </motion.div>

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
            {activeTab === 'accounts' && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Linked Accounts</h3>
                  <motion.button
                    onClick={() => setShowAddAccountModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Account
                  </motion.button>
                </div>

                <div className="space-y-4">
                  {settings.linkedAccounts.map((account, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {account.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{account}</div>
                          <div className="text-sm text-gray-500">Linked account</div>
                        </div>
                      </div>
                      <button className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50">
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add New Account
                  </label>
                  <input
                    type="text"
                    placeholder="Enter account name (e.g., M-Pesa, Equity Bank)"
                    value={settings.linkedAccounts.join(', ')}
                    onChange={handleLinkedAccountsChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Account Preferences</h3>
                {accLoading ? (
                  <div className="text-center py-8">
                    <motion.div
                      className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="text-gray-600">Loading accounts...</p>
                  </div>
                ) : accounts.length === 0 ? (
                  <div className="text-center py-8">
                    <motion.div
                      className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <CreditCard className="w-8 h-8 text-gray-400" />
                    </motion.div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">No accounts found</h4>
                    <p className="text-gray-600 mb-4">Link your first account to get started with Vault5.</p>
                    <button
                      onClick={() => setActiveTab('accounts')}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Link Your First Account
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percent</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auto-Distribute</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {accounts.map((acc, index) => (
                          <motion.tr
                            key={acc._id}
                            className="hover:bg-gray-50 transition-colors duration-200"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                                  <span className="text-white font-bold text-sm">
                                    {acc.type.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{acc.type}</div>
                                  <div className="text-sm text-gray-500">{acc.accountNumber || 'N/A'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {acc.percentage}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              KES {Number(acc.balance || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <label className="inline-flex items-center">
                                <input
                                  type="radio"
                                  name="walletAccount"
                                  checked={!!acc.isWallet}
                                  onChange={() => setWallet(acc._id)}
                                  disabled={updatingAccountId === acc._id}
                                  className="text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2">{acc.isWallet ? 'Current Wallet' : 'Set as Wallet'}</span>
                              </label>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <label className="inline-flex items-center">
                                <input
                                  type="checkbox"
                                  checked={acc.isAutoDistribute !== false}
                                  onChange={(e) => toggleAutoDistribute(acc, e.target.checked)}
                                  disabled={updatingAccountId === acc._id}
                                  className="text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2">Include in auto-split</span>
                              </label>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="text-xs text-gray-500 mt-4">
                      Only one Wallet can be active at a time. Auto-Distribute determines which accounts receive splits.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Notification Thresholds</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shortfall Alert (KES)
                    </label>
                    <input
                      type="number"
                      value={settings.notificationThresholds.shortfall}
                      onChange={(e) => handleChange('notificationThresholds', 'shortfall', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Get notified when balance drops below this amount</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Goal Progress Alert (%)
                    </label>
                    <input
                      type="number"
                      value={settings.notificationThresholds.goalProgress}
                      onChange={(e) => handleChange('notificationThresholds', 'goalProgress', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0" max="100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Get notified when you reach this percentage of your goals</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loan Due Alert (days)
                    </label>
                    <input
                      type="number"
                      value={settings.notificationThresholds.loanDueDays}
                      onChange={(e) => handleChange('notificationThresholds', 'loanDueDays', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Get reminded this many days before loan payments are due</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'lending' && (
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Lending Rules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Non-Repayable Cap (per month)
                    </label>
                    <input
                      type="number"
                      value={settings.lendingRules.nonRepayCap}
                      onChange={(e) => handleChange('lendingRules', 'nonRepayCap', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Maximum amount you're willing to risk on non-repaying loans</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Safe Lending Percent (%)
                    </label>
                    <input
                      type="number"
                      value={settings.lendingRules.safePercent}
                      onChange={(e) => handleChange('lendingRules', 'safePercent', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0" max="100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Recommended: 50%. Adjust higher if you can take more risk</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reminders' && (
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Overdue Reminder Settings</h3>

                {/* Enable/Disable */}
                <div className="mb-8">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-semibold text-gray-900">Enable Overdue Reminders</h4>
                      <p className="text-sm text-gray-600">Receive automated reminders for overdue lendings</p>
                    </div>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.gracePeriodSettings.enabled}
                        onChange={(e) => handleChange('gracePeriodSettings', 'enabled', e.target.checked)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {settings.gracePeriodSettings.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Communication Channels */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Communication Channels</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'email', label: 'Email', icon: '📧', description: 'Professional email notifications' },
                      { key: 'sms', label: 'SMS', icon: '📱', description: 'Text message reminders' },
                      { key: 'push', label: 'Push Notifications', icon: '🔔', description: 'Mobile app notifications' },
                      { key: 'whatsapp', label: 'WhatsApp', icon: '💬', description: 'WhatsApp message reminders' }
                    ].map(channel => (
                      <div key={channel.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{channel.icon}</span>
                          <div>
                            <div className="font-medium text-gray-900">{channel.label}</div>
                            <div className="text-sm text-gray-600">{channel.description}</div>
                          </div>
                        </div>
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.gracePeriodSettings.channels[channel.key]}
                            onChange={(e) => handleChange('gracePeriodSettings', 'channels', {
                              ...settings.gracePeriodSettings.channels,
                              [channel.key]: e.target.checked
                            })}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grace Periods */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Grace Periods</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Loans (days)
                      </label>
                      <input
                        type="number"
                        value={settings.gracePeriodSettings.gracePeriods.emergency}
                        onChange={(e) => handleChange('gracePeriodSettings', 'gracePeriods', {
                          ...settings.gracePeriodSettings.gracePeriods,
                          emergency: parseInt(e.target.value) || 0
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0" max="7"
                      />
                      <p className="text-xs text-gray-500 mt-1">Days before reminders start for emergency loans</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Non-Emergency Loans (days)
                      </label>
                      <input
                        type="number"
                        value={settings.gracePeriodSettings.gracePeriods.nonEmergency}
                        onChange={(e) => handleChange('gracePeriodSettings', 'gracePeriods', {
                          ...settings.gracePeriodSettings.gracePeriods,
                          nonEmergency: parseInt(e.target.value) || 0
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0" max="14"
                      />
                      <p className="text-xs text-gray-500 mt-1">Days before reminders start for regular loans</p>
                    </div>
                  </div>
                </div>

                {/* Escalation Schedule */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Reminder Escalation Schedule</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { key: 'firstReminder', label: 'First Reminder', description: 'Friendly reminder' },
                      { key: 'secondReminder', label: 'Second Reminder', description: 'Firm reminder' },
                      { key: 'thirdReminder', label: 'Third Reminder', description: 'Urgent reminder' },
                      { key: 'finalReminder', label: 'Final Notice', description: 'Legal notice' }
                    ].map(reminder => (
                      <div key={reminder.key} className="p-4 border border-gray-200 rounded-xl">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {reminder.label}
                        </label>
                        <input
                          type="number"
                          value={settings.gracePeriodSettings.escalationSchedule[reminder.key]}
                          onChange={(e) => handleChange('gracePeriodSettings', 'escalationSchedule', {
                            ...settings.gracePeriodSettings.escalationSchedule,
                            [reminder.key]: parseInt(e.target.value) || 0
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="1" max="90"
                        />
                        <p className="text-xs text-gray-500 mt-1">{reminder.description}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    Days after due date when each reminder level is sent
                  </p>
                </div>

                {/* Contact Time Preferences */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Time Preferences</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Hour (24h)
                      </label>
                      <input
                        type="number"
                        value={settings.gracePeriodSettings.preferredContactTimes.startHour}
                        onChange={(e) => handleChange('gracePeriodSettings', 'preferredContactTimes', {
                          ...settings.gracePeriodSettings.preferredContactTimes,
                          startHour: parseInt(e.target.value) || 9
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0" max="23"
                      />
                      <p className="text-xs text-gray-500 mt-1">Earliest time to send reminders</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Hour (24h)
                      </label>
                      <input
                        type="number"
                        value={settings.gracePeriodSettings.preferredContactTimes.endHour}
                        onChange={(e) => handleChange('gracePeriodSettings', 'preferredContactTimes', {
                          ...settings.gracePeriodSettings.preferredContactTimes,
                          endHour: parseInt(e.target.value) || 18
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0" max="23"
                      />
                      <p className="text-xs text-gray-500 mt-1">Latest time to send reminders</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={settings.gracePeriodSettings.preferredContactTimes.timezone}
                        onChange={(e) => handleChange('gracePeriodSettings', 'preferredContactTimes', {
                          ...settings.gracePeriodSettings.preferredContactTimes,
                          timezone: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Africa/Nairobi">East Africa Time (EAT)</option>
                        <option value="Africa/Johannesburg">South Africa Time (SAST)</option>
                        <option value="Africa/Lagos">West Africa Time (WAT)</option>
                        <option value="UTC">UTC</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Your local timezone</p>
                    </div>
                  </div>
                </div>

                {/* Template Preferences */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Communication Style</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { key: 'professional', label: 'Professional', description: 'Formal business tone' },
                      { key: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
                      { key: 'firm', label: 'Firm', description: 'Direct and assertive' }
                    ].map(tone => (
                      <div key={tone.key} className="p-4 border border-gray-200 rounded-xl">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="tone"
                            value={tone.key}
                            checked={settings.gracePeriodSettings.templates.preferredTone === tone.key}
                            onChange={(e) => handleChange('gracePeriodSettings', 'templates', {
                              ...settings.gracePeriodSettings.templates,
                              preferredTone: e.target.value
                            })}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <div className="ml-3">
                            <div className="font-medium text-gray-900">{tone.label}</div>
                            <div className="text-sm text-gray-600">{tone.description}</div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Information Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <div className="text-blue-600 mt-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">How Grace Periods Work</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Grace periods give borrowers extra time before reminders start</li>
                        <li>• Emergency loans get shorter grace periods for faster follow-up</li>
                        <li>• Reminders escalate in tone and frequency as time passes</li>
                        <li>• All communications respect your preferred contact hours</li>
                        <li>• Multiple channels ensure important reminders are received</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Sticky Footer */}
        <motion.div
          className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 p-4"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Changes are saved automatically
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={updating}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;