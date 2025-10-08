// src/pages/AccountsCenter.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Activity,
  Plus,
  Send,
  Download,
  BarChart3,
  Sparkles,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  PiggyBank,
  Shield,
  Banknote,
  User,
  Settings,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import WalletAnalytics from '../components/WalletAnalytics';
import WalletHistory from '../components/WalletHistory';

/*
  Improved AccountsCenter.jsx
  - Token guard + redirect
  - Fetch accounts with simple cache + TTL
  - Optimistic transfer & deposit functions with rollback
  - Inline Transfer & AddMoney modals (small, functional)
  - Buttons and actions wired to routes and functions
  - Toasts for feedback, loading indicators, refresh
  - Small performance optimizations (useMemo, refs)
*/

// Themes, rules and badges (kept from your file)
const ACCOUNT_THEMES = {
  Daily: {
    color: 'emerald',
    gradient: 'from-emerald-500 to-green-600',
    emoji: '💰',
    description: 'Smart spending with alerts'
  },
  Fun: {
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    emoji: '🎉',
    description: 'Entertainment & lifestyle'
  },
  Emergency: {
    color: 'rose',
    gradient: 'from-rose-500 to-red-600',
    emoji: '🚨',
    description: 'Safety net protection'
  },
  LongTerm: {
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-600',
    emoji: '🏦',
    description: 'Future security & growth'
  },
  Investment: {
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    emoji: '📈',
    description: 'Wealth building & returns'
  }
};

const RULE_BADGES = {
  Daily: [
    { text: 'Unrestricted spend', color: 'bg-emerald-100 text-emerald-800', icon: '✓' },
    { text: 'AI alert if >20%/day', color: 'bg-blue-100 text-blue-800', icon: '🤖' }
  ],
  Fun: [
    { text: 'Unlimited spend', color: 'bg-emerald-100 text-emerald-800', icon: '✓' },
    { text: 'No internal transfers out', color: 'bg-amber-100 text-amber-800', icon: '🚫' },
    { text: 'Month-end sweep to Long-Term', color: 'bg-indigo-100 text-indigo-800', icon: '🔄' }
  ],
  Emergency: [
    { text: 'External payouts only', color: 'bg-rose-100 text-rose-800', icon: '🏦' },
    { text: '24h payout hold', color: 'bg-orange-100 text-orange-800', icon: '⏰' },
    { text: 'Max 2 withdrawals/month', color: 'bg-red-100 text-red-800', icon: '📊' },
    { text: 'AI confirm required', color: 'bg-blue-100 text-blue-800', icon: '🤖' }
  ],
  LongTerm: [
    { text: 'Optional lock 3/6/12 mo.', color: 'bg-purple-100 text-purple-800', icon: '🔒' },
    { text: '3% early withdrawal penalty', color: 'bg-red-100 text-red-800', icon: '⚠️' },
    { text: 'Reward at full term', color: 'bg-emerald-100 text-emerald-800', icon: '🎁' }
  ],
  Investment: [
    { text: '90-day lock', color: 'bg-purple-100 text-purple-800', icon: '🔒' },
    { text: 'Min withdrawal KES 50', color: 'bg-cyan-100 text-cyan-800', icon: '💰' },
    { text: 'External payouts only', color: 'bg-rose-100 text-rose-800', icon: '🏦' }
  ]
};

const ACCOUNT_RULES = {
  Daily: {
    canSendInternal: true,
    canSendP2P: true,
    canSendBank: true,
    canSendMpesa: true,
    canSendAirtel: true,
    canReceiveInternal: true,
    canReceiveP2P: true,
    canReceiveBank: true,
    canReceiveMpesa: true,
    canReceiveCard: true
  },
  Fun: {
    canSendInternal: false,
    canSendP2P: true,
    canSendBank: true,
    canSendMpesa: true,
    canSendAirtel: true,
    canReceiveInternal: true,
    canReceiveP2P: true,
    canReceiveBank: true,
    canReceiveMpesa: true,
    canReceiveCard: true
  },
  Emergency: {
    canSendInternal: false,
    canSendP2P: false,
    canSendBank: true,
    canSendMpesa: true,
    canSendAirtel: true,
    canReceiveInternal: true,
    canReceiveP2P: true,
    canReceiveBank: true,
    canReceiveMpesa: true,
    canReceiveCard: true
  },
  LongTerm: {
    canSendInternal: true,
    canSendP2P: true,
    canSendBank: true,
    canSendMpesa: true,
    canSendAirtel: true,
    canReceiveInternal: true,
    canReceiveP2P: true,
    canReceiveBank: true,
    canReceiveMpesa: true,
    canReceiveCard: true
  },
  Investment: {
    canSendInternal: false,
    canSendP2P: false,
    canSendBank: true,
    canSendMpesa: true,
    canSendAirtel: true,
    canReceiveInternal: true,
    canReceiveP2P: true,
    canReceiveBank: true,
    canReceiveMpesa: true,
    canReceiveCard: true
  }
};

// CACHE utils (simple)
const CACHE_KEY = 'vault5_accounts_cache';
const CACHE_TTL = 30 * 1000; // 30 seconds

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
}

// Small Transfer Modal (inline)
function TransferModal({ isOpen, account, onClose, onConfirm, loading }) {
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setToAccountId('');
      setAmount('');
    }
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-3">Transfer from {account?.type || 'Account'}</h3>
        <div className="space-y-3">
          <label className="text-sm">To Account ID</label>
          <input value={toAccountId} onChange={(e) => setToAccountId(e.target.value)} className="w-full p-3 border rounded-md" placeholder="Recipient account id" />
          <label className="text-sm">Amount (KES)</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-3 border rounded-md" placeholder="e.g. 1500" type="number" />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-md border">Cancel</button>
          <button
            onClick={() => onConfirm({ toAccountId, amount: Number(amount) })}
            disabled={loading || !toAccountId || !amount}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Small Add Money Modal (inline)
function AddMoneyModal({ isOpen, account, onClose, onConfirm, loading }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('mpesa');

  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setMethod('mpesa');
    }
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-3">Add Money to {account?.type || 'Account'}</h3>
        <div className="space-y-3">
          <label className="text-sm">Method</label>
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full p-3 border rounded-md">
            <option value="mpesa">M-Pesa</option>
            <option value="card">Card</option>
            <option value="bank">Bank</option>
          </select>
          <label className="text-sm">Amount (KES)</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-3 border rounded-md" placeholder="e.g. 2000" type="number" />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-md border">Cancel</button>
          <button
            onClick={() => onConfirm({ amount: Number(amount), method })}
            disabled={loading || !amount}
            className="px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Add Money'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AccountsCenter() {
  const { showError, showSuccess, showInfo } = useToast();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);
  const [insights, setInsights] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const [transferModal, setTransferModal] = useState({ isOpen: false, account: null });
  const [addMoneyModal, setAddMoneyModal] = useState({ isOpen: false, account: null });

  const [actionLoading, setActionLoading] = useState(false);
  const optimisticRef = useRef(null); // store optimistic backups

  // user
  const user = useMemo(() => JSON.parse(localStorage.getItem('user') || '{}'), []);
  const firstName = (user?.name || '').split(' ')[0] || 'there';

  // order accounts
  const orderedAccounts = useMemo(() => {
    const order = ['Daily', 'Fun', 'Emergency', 'LongTerm', 'Investment'];
    return (accounts || []).filter(a => a.type !== 'Charity')
      .sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
  }, [accounts]);

  // calculate total balance
  const calculatedTotalBalance = useMemo(() => {
    return orderedAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  }, [orderedAccounts]);

  // AI insights generation (local quick insights)
  useEffect(() => {
    if (!orderedAccounts.length) return setInsights(null);
    const daily = orderedAccounts.find(a => a.type === 'Daily');
    const fun = orderedAccounts.find(a => a.type === 'Fun');
    const emergency = orderedAccounts.find(a => a.type === 'Emergency');

    if (daily && daily.balance > 50000) {
      setInsights({
        type: 'savings',
        title: '💰 Surplus Detected',
        message: `Your Daily account has KES ${daily.balance.toLocaleString()}. Consider moving some to Long-Term.`,
        action: 'Transfer to Long-Term',
        actionType: 'transfer',
        payload: { toType: 'LongTerm', amount: Math.max(20000, Math.floor((daily.balance - 20000) / 2)) }
      });
    } else if (fun && fun.balance < 10000) {
      setInsights({
        type: 'warning',
        title: '🎉 Fun Account Low',
        message: 'Your Fun account balance is low. Top up from Daily to keep your lifestyle allocation.',
        action: 'Top Up Fun',
        actionType: 'transfer',
        payload: { toType: 'Fun', amount: 5000 }
      });
    } else if (emergency && emergency.balance < 50000) {
      setInsights({
        type: 'alert',
        title: '🚨 Emergency Fund Low',
        message: 'Emergency fund below recommended level. Consider contributing more.',
        action: 'Add to Emergency',
        actionType: 'deposit',
        payload: { toType: 'Emergency', amount: 10000 }
      });
    } else {
      setInsights(null);
    }
  }, [orderedAccounts]);

  // keep totalBalance visually animated
  useEffect(() => {
    const t = setTimeout(() => setTotalBalance(calculatedTotalBalance), 500);
    return () => clearTimeout(t);
  }, [calculatedTotalBalance]);

  // --- fetch accounts with cache + token guard
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const cached = readCache();
        if (cached) {
          setAccounts(cached);
          setLoading(false);
          // Also attempt background refresh
          api.get('/api/accounts').then(res => {
            if (!mounted) return;
            setAccounts(res.data || []);
            writeCache(res.data || []);
          }).catch(() => {});
          return;
        }

        const res = await api.get('/api/accounts');
        if (!mounted) return;
        setAccounts(res.data || []);
        writeCache(res.data || []);
      } catch (err) {
        console.error('Failed to load accounts', err);
        showError('Failed to load account data');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [navigate, showError]);

  // refresh accounts function
  const refreshAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/accounts');
      setAccounts(res.data || []);
      writeCache(res.data || []);
      showSuccess('Accounts refreshed');
    } catch (err) {
      console.error(err);
      showError('Refresh failed');
    } finally {
      setLoading(false);
    }
  };

  // Optimistic transfer function
  const transfer = async ({ fromAccountId, toAccountId, amount }) => {
    // Basic validation
    if (!fromAccountId || !toAccountId || !amount || amount <= 0) {
      showError('Invalid transfer parameters');
      throw new Error('Invalid transfer parameters');
    }

    setActionLoading(true);

    // Create optimistic snapshot for rollback
    const snapshot = accounts.map(a => ({ ...a }));
    optimisticRef.current = snapshot;

    // apply optimistic update locally
    setAccounts(prev => prev.map(a => {
      if (a._id === fromAccountId) return { ...a, balance: (a.balance || 0) - amount };
      if (a._id === toAccountId) return { ...a, balance: (a.balance || 0) + amount };
      return a;
    }));

    try {
      const res = await api.post('/api/accounts/transfer', { fromAccountId, toAccountId, amount });
      // update with authoritative response if available
      if (res?.data?.accounts) {
        setAccounts(res.data.accounts);
        writeCache(res.data.accounts);
      }
      showSuccess(`Transferred KES ${amount.toLocaleString()}`);
      return res.data;
    } catch (err) {
      // rollback
      setAccounts(snapshot);
      showError(err.response?.data?.message || 'Transfer failed — rolled back');
      throw err;
    } finally {
      optimisticRef.current = null;
      setActionLoading(false);
    }
  };

  // Optimistic deposit/add money
  const addMoney = async ({ accountId, amount, method }) => {
    if (!accountId || !amount || amount <= 0) {
      showError('Invalid deposit parameters');
      throw new Error('Invalid deposit parameters');
    }

    setActionLoading(true);
    const snapshot = accounts.map(a => ({ ...a }));
    optimisticRef.current = snapshot;

    // optimistic update
    setAccounts(prev => prev.map(a => a._id === accountId ? { ...a, balance: (a.balance || 0) + amount } : a));

    try {
      const res = await api.post(`/api/accounts/${accountId}/deposit`, { amount, method });
      if (res?.data?.account) {
        // replace single account in list
        setAccounts(prev => prev.map(a => a._id === accountId ? res.data.account : a));
        writeCache(accounts);
      }
      showSuccess(`Added KES ${amount.toLocaleString()} via ${method}`);
      return res.data;
    } catch (err) {
      setAccounts(snapshot);
      showError(err.response?.data?.message || 'Deposit failed — rolled back');
      throw err;
    } finally {
      optimisticRef.current = null;
      setActionLoading(false);
    }
  };

  // Quick action handler
  const handleQuickAction = (acc, action) => {
    const rules = ACCOUNT_RULES[acc.type] || {};
    if (action === 'internal') {
      if (!rules.canSendInternal) return showError(`${acc.type} cannot send internal transfers`);
      // navigate to transfer page with pre-filled from account
      navigate('/transfer', { state: { fromAccountId: acc._id } });
      return;
    }
    if (action === 'mpesa') {
      if (!rules.canReceiveMpesa) return showError(`${acc.type} cannot receive M-Pesa`);
      // Open add money modal
      setAddMoneyModal({ isOpen: true, account: acc });
      return;
    }
    // other actions: p2p, bank etc.
  };

  // handle insight CTA
  const handleInsightAction = (insight) => {
    if (!insight) return;
    const { actionType, payload } = insight;
    if (actionType === 'transfer') {
      // find source (Daily) and target (payload.toType)
      const from = orderedAccounts.find(a => a.type === 'Daily');
      const to = orderedAccounts.find(a => a.type === payload.toType);
      if (!from || !to) {
        showError('Required accounts not available for suggested transfer');
        return;
      }
      // open modal prefilled
      setTransferModal({ isOpen: true, account: from, preset: { toAccountId: to._id, amount: payload.amount } });
    } else if (actionType === 'deposit') {
      const to = orderedAccounts.find(a => a.type === payload.toType);
      if (!to) {
        showError('Target account missing');
        return;
      }
      setAddMoneyModal({ isOpen: true, account: to, preset: { amount: payload.amount } });
    }
  };

  // helper: open transfer modal (from account)
  const openTransferModal = (acc, type = '') => setTransferModal({ isOpen: true, account: acc, type });

  // helper: open add money modal
  const openAddMoneyModal = (acc, type = '') => setAddMoneyModal({ isOpen: true, account: acc, type });

  // small account card renderer
  const AccountCard = ({ acc }) => {
    const theme = ACCOUNT_THEMES[acc.type] || ACCOUNT_THEMES.Daily;
    const rules = ACCOUNT_RULES[acc.type] || {};
    const percentage = Math.min(((acc.balance || 0) / 100000) * 100, 100);

    return (
      <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
        <div className="relative flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-lg`}>
              <span className="text-2xl">{theme.emoji}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{acc.type}</h3>
              <p className="text-sm text-gray-600">{theme.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              KES {(acc.balance || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Available</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {(RULE_BADGES[acc.type] || []).map((rule, idx) => (
              <span key={idx} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${rule.color} shadow-sm`}>
                <span>{rule.icon}</span>{rule.text}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {rules.canSendInternal && (
            <button onClick={() => handleQuickAction(acc, 'internal')}
              className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95">
              <ArrowUpRight className="w-4 h-4" /> Transfer
            </button>
          )}

          {rules.canReceiveMpesa && (
            <button onClick={() => handleQuickAction(acc, 'mpesa')}
              className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95">
              <Plus className="w-4 h-4" /> Add Money
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button onClick={() => navigate(`/account/${acc._id}`)} className="text-sm text-indigo-600">View Details</button>
          <div className="text-xs text-gray-500">ID: {String(acc._id).substring(0, 8)}...</div>
        </div>
      </div>
    );
  };

  // UI - Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4 animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading your financial ecosystem...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background visuals */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="relative backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {(() => {
                    const hour = new Date().getHours();
                    if (hour < 12) return `Good morning, ${firstName}!`;
                    if (hour < 17) return `Good afternoon, ${firstName}!`;
                    return `Good evening, ${firstName}!`;
                  })()}
                </h1>
                <p className="text-gray-600">Welcome to your financial command center</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">KES {totalBalance.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Balance</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{orderedAccounts.length}</div>
                <div className="text-sm text-gray-600">Active Accounts</div>
              </div>

              <button onClick={refreshAccounts} className="p-2 rounded-xl bg-white/60 hover:bg-white/80 border">
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Progress Rings */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            {orderedAccounts.map(acc => <div key={acc._id}>
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ACCOUNT_THEMES[acc.type]?.gradient || 'from-gray-300 to-gray-400'} flex items-center justify-center shadow-lg`}>
                    <span className="text-xl">{ACCOUNT_THEMES[acc.type]?.emoji || '💠'}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{acc.type}</span>
                </div>

                <div className="relative w-20 h-20 mx-auto mb-4">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-200" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={`url(#grad-${acc._id})`} strokeWidth="2" strokeLinecap="round" strokeDasharray={`${Math.min(100, ((acc.balance || 0) / 100000) * 100) * 2.84} 283`} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">{Math.round(Math.min(100, ((acc.balance || 0) / 100000) * 100))}%</span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">KES {(acc.balance || 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Balance</div>
                </div>
              </div>
            </div>)}
          </div>

          {/* AI Insights */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
            </div>

            {insights ? (
              <div className={`p-4 rounded-xl border-l-4 ${insights.type === 'alert' ? 'border-red-500 bg-red-50' : insights.type === 'warning' ? 'border-yellow-500 bg-yellow-50' : 'border-green-500 bg-green-50'}`}>
                <h4 className="font-semibold text-gray-900 mb-2">{insights.title}</h4>
                <p className="text-sm text-gray-700 mb-3">{insights.message}</p>
                <div className="flex gap-2">
                  <button onClick={() => handleInsightAction(insights)} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg">{insights.action}</button>
                  <button onClick={() => setInsights(null)} className="px-4 py-2 border rounded-lg">Dismiss</button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Analyzing your financial patterns...</p>
              </div>
            )}
          </div>
        </div>

        {/* Account cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {orderedAccounts.map(acc => <AccountCard key={acc._id} acc={acc} />)}
        </div>

        {/* Analytics toggle */}
        <div className="text-center mb-8">
          <button onClick={() => setShowAnalytics(!showAnalytics)} className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95">
            <BarChart3 className="w-5 h-5 inline mr-2" />
            {showAnalytics ? 'Hide Analytics' : 'View Analytics'}
          </button>
        </div>

        {showAnalytics && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              {/* If WalletAnalytics component exists it will be used; otherwise basic placeholder */}
              {WalletAnalytics ? (
                <WalletAnalytics accounts={accounts} />
              ) : (
                <div className="text-center text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Analytics feature coming soon</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating action bar */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
        <button onClick={() => navigate('/transfer')} className="w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110">
          <Send className="w-6 h-6" />
        </button>

        <button onClick={() => navigate('/add-money')} className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110">
          <Plus className="w-6 h-6" />
        </button>

        <button onClick={() => navigate('/transactions')} className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110">
          <Activity className="w-6 h-6" />
        </button>
      </div>

      {/* inline modals */}
      <TransferModal
        isOpen={transferModal.isOpen}
        account={transferModal.account}
        onClose={() => setTransferModal({ isOpen: false, account: null })}
        loading={actionLoading}
        onConfirm={async ({ toAccountId, amount }) => {
          try {
            const fromId = transferModal.account?._id;
            await transfer({ fromAccountId: fromId, toAccountId, amount });
            setTransferModal({ isOpen: false, account: null });
          } catch (err) {
            // handled inside transfer()
          }
        }}
      />

      <AddMoneyModal
        isOpen={addMoneyModal.isOpen}
        account={addMoneyModal.account}
        onClose={() => setAddMoneyModal({ isOpen: false, account: null })}
        loading={actionLoading}
        onConfirm={async ({ amount, method }) => {
          try {
            const accountId = addMoneyModal.account?._id;
            await addMoney({ accountId, amount, method });
            setAddMoneyModal({ isOpen: false, account: null });
          } catch (err) {
            // handled inside addMoney()
          }
        }}
      />

      {/* Wallet history inline (if component exists) */}
      <div aria-hidden className="sr-only">
        {/* placeholder to ensure imports are used; remove if you prefer */}
      </div>
    </div>
  );
}
