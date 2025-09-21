import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { EMITransferModal, EMIAddMoneyModal } from '../components/EMIModals';

const RULE_BADGES = {
  Daily: [
    { text: 'Unrestricted spend', color: 'bg-emerald-100 text-emerald-800', icon: '✓' },
    { text: 'AI alert if >20%/day', color: 'bg-blue-100 text-blue-800', icon: '🤖' },
  ],
  Fun: [
    { text: 'Unlimited spend', color: 'bg-emerald-100 text-emerald-800', icon: '✓' },
    { text: 'No internal transfers out', color: 'bg-amber-100 text-amber-800', icon: '🚫' },
    { text: 'Month-end sweep to Long-Term', color: 'bg-indigo-100 text-indigo-800', icon: '🔄' },
  ],
  Emergency: [
    { text: 'External payouts only', color: 'bg-rose-100 text-rose-800', icon: '🏦' },
    { text: '24h payout hold', color: 'bg-orange-100 text-orange-800', icon: '⏰' },
    { text: 'Max 2 withdrawals/month', color: 'bg-red-100 text-red-800', icon: '📊' },
    { text: 'AI confirm required', color: 'bg-blue-100 text-blue-800', icon: '🤖' },
  ],
  LongTerm: [
    { text: 'Optional lock 3/6/12 mo.', color: 'bg-purple-100 text-purple-800', icon: '🔒' },
    { text: '3% early withdrawal penalty', color: 'bg-red-100 text-red-800', icon: '⚠️' },
    { text: 'Reward at full term', color: 'bg-emerald-100 text-emerald-800', icon: '🎁' },
  ],
  Investment: [
    { text: '90-day lock', color: 'bg-purple-100 text-purple-800', icon: '🔒' },
    { text: 'Min withdrawal KES 50', color: 'bg-cyan-100 text-cyan-800', icon: '💰' },
    { text: 'External payouts only', color: 'bg-rose-100 text-rose-800', icon: '🏦' },
  ],
};

// Account-specific rules for actions
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
    canReceiveCard: true,
  },
  Fun: {
    canSendInternal: false, // No internal transfers out
    canSendP2P: true,
    canSendBank: true,
    canSendMpesa: true,
    canSendAirtel: true,
    canReceiveInternal: true,
    canReceiveP2P: true,
    canReceiveBank: true,
    canReceiveMpesa: true,
    canReceiveCard: true,
  },
  Emergency: {
    canSendInternal: false, // External only
    canSendP2P: false, // External only
    canSendBank: true,
    canSendMpesa: true,
    canSendAirtel: true,
    canReceiveInternal: true,
    canReceiveP2P: true,
    canReceiveBank: true,
    canReceiveMpesa: true,
    canReceiveCard: true,
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
    canReceiveCard: true,
  },
  Investment: {
    canSendInternal: false, // External only
    canSendP2P: false, // External only
    canSendBank: true,
    canSendMpesa: true,
    canSendAirtel: true,
    canReceiveInternal: true,
    canReceiveP2P: true,
    canReceiveBank: true,
    canReceiveMpesa: true,
    canReceiveCard: true,
  },
};

export default function AccountsCenter() {
  const { showInfo, showError, showSuccess } = useToast();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const orderedAccounts = useMemo(() => {
    const order = ['Daily', 'Fun', 'Emergency', 'LongTerm', 'Investment'];
    const filtered = (accounts || []).filter(a => a.type !== 'Charity');
    return filtered.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
  }, [accounts]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const fetch = async () => {
      try {
        const res = await api.get('/api/accounts');
        setAccounts(res.data || []);
      } catch (e) {
        showError('Failed to load accounts');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [navigate, showError]);

  const badge = (text, color) => (
    <span key={text} className={`inline-block px-2 py-1 rounded text-xs font-medium mr-1 mb-1 ${color}`}>{text}</span>
  );

  // EMI-style action handlers with modal integration
  const onSendMoney = (acc, type) => {
    const rules = ACCOUNT_RULES[acc.type];
    if (!rules[`canSend${type.replace(' ', '')}`]) {
      showError(`${acc.type} account cannot send via ${type}`);
      return;
    }
    setTransferModal({ isOpen: true, account: acc, type });
  };

  const onAddMoney = (acc, type) => {
    const rules = ACCOUNT_RULES[acc.type];
    if (!rules[`canReceive${type.replace(' ', '').replace('-', '')}`]) {
      showError(`${acc.type} account cannot receive via ${type}`);
      return;
    }
    setAddMoneyModal({ isOpen: true, account: acc, type });
  };

  const onInternalTransfer = (acc) => {
    if (!ACCOUNT_RULES[acc.type].canSendInternal) {
      showError(`${acc.type} account cannot send internal transfers`);
      return;
    }
    setTransferModal({ isOpen: true, account: acc, type: 'Internal Transfer' });
  };

  const onP2P = (acc) => {
    if (!ACCOUNT_RULES[acc.type].canSendP2P) {
      showError(`${acc.type} account cannot send to other Vault users`);
      return;
    }
    setTransferModal({ isOpen: true, account: acc, type: 'Send to Vault User' });
  };

  const onPayout = (acc) => {
    const rules = ACCOUNT_RULES[acc.type];
    if (!rules.canSendBank && !rules.canSendMpesa && !rules.canSendAirtel) {
      showError(`${acc.type} account cannot make external payouts`);
      return;
    }
    setTransferModal({ isOpen: true, account: acc, type: 'Bank Transfer' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="emi-loading mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your Vault accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* EMI-style Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold emi-gradient-text">Vault Accounts</h1>
              <p className="text-gray-600 mt-1">Manage your financial ecosystem</p>
            </div>
            <div className="flex gap-3">
              <button
                className="emi-quick-action"
                onClick={() => navigate('/transactions')}
              >
                📊 Transactions
              </button>
              <button
                className="emi-quick-action"
                onClick={() => navigate('/reports')}
              >
                📈 Reports
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <p className="text-lg text-gray-700">
            Your five Vault accounts work together to promote financial discipline and growth.
            Each account has specific rules and purposes.
          </p>
        </div>

        {/* EMI-style Account Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orderedAccounts.map((acc) => {
            const rules = ACCOUNT_RULES[acc.type];
            const accountClass = `account-card-${acc.type.toLowerCase().replace(' ', '')}`;

            return (
              <div key={acc._id} className={`emi-card ${accountClass} p-6`}>
                {/* Account Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                      <span className="text-2xl">
                        {acc.type === 'Daily' && '💰'}
                        {acc.type === 'Fun' && '🎉'}
                        {acc.type === 'Emergency' && '🚨'}
                        {acc.type === 'LongTerm' && '🏦'}
                        {acc.type === 'Investment' && '📈'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{acc.type}</h3>
                      <p className="text-sm text-gray-600">Target: {acc.percentage}%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      KES {Number(acc.balance || 0).toLocaleString()}
                    </div>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      acc.status === 'red'
                        ? 'bg-red-100 text-red-800'
                        : acc.status === 'blue'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-current"></span>
                      {acc.status === 'red' ? 'Behind' : acc.status === 'blue' ? 'Surplus' : 'On Target'}
                    </span>
                  </div>
                </div>

                {/* EMI-style Rule Badges */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {(RULE_BADGES[acc.type] || []).map((rule, index) => (
                      <span key={index} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${rule.color}`}>
                        <span>{rule.icon}</span>
                        {rule.text}
                      </span>
                    ))}
                  </div>
                </div>

                {/* EMI-style Action Buttons */}
                <div className="space-y-3">
                  {/* Send Money Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span>📤</span> Send Money
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {rules.canSendInternal && (
                        <button
                          onClick={() => onInternalTransfer(acc)}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Internal
                        </button>
                      )}
                      {rules.canSendP2P && (
                        <button
                          onClick={() => onP2P(acc)}
                          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Vault User
                        </button>
                      )}
                      {rules.canSendBank && (
                        <button
                          onClick={() => onPayout(acc)}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Bank
                        </button>
                      )}
                      {rules.canSendMpesa && (
                        <button
                          onClick={() => onPayout(acc)}
                          className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          M-Pesa
                        </button>
                      )}
                      {rules.canSendAirtel && (
                        <button
                          onClick={() => onPayout(acc)}
                          className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Airtel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Add Money Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span>📥</span> Add Money
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {rules.canReceiveMpesa && (
                        <button
                          onClick={() => onAddMoney(acc)}
                          className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          M-Pesa
                        </button>
                      )}
                      {rules.canReceiveBank && (
                        <button
                          onClick={() => onAddMoney(acc)}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Bank
                        </button>
                      )}
                      {rules.canReceiveCard && (
                        <button
                          onClick={() => onAddMoney(acc)}
                          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Card
                        </button>
                      )}
                      {rules.canReceiveP2P && (
                        <button
                          onClick={() => onAddMoney(acc)}
                          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Vault User
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* EMI-style Account Hints */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {acc.type === 'Emergency' && (
                    <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-3 rounded-lg">
                      <span>⚠️</span>
                      <div>
                        <p className="font-medium">Emergency Account Rules:</p>
                        <p>24h delay • Max 2/month • External payouts only</p>
                      </div>
                    </div>
                  )}
                  {acc.type === 'LongTerm' && (
                    <div className="flex items-start gap-2 text-xs text-blue-700 bg-blue-50 p-3 rounded-lg">
                      <span>🔒</span>
                      <div>
                        <p className="font-medium">Long-Term Account:</p>
                        <p>3% early withdrawal penalty • Rewards at full term</p>
                      </div>
                    </div>
                  )}
                  {acc.type === 'Investment' && (
                    <div className="flex items-start gap-2 text-xs text-purple-700 bg-purple-50 p-3 rounded-lg">
                      <span>📈</span>
                      <div>
                        <p className="font-medium">Investment Account:</p>
                        <p>90-day lock • Min KES 50 • External payouts only</p>
                      </div>
                    </div>
                  )}
                  {acc.type === 'Fun' && (
                    <div className="flex items-start gap-2 text-xs text-orange-700 bg-orange-50 p-3 rounded-lg">
                      <span>🎉</span>
                      <div>
                        <p className="font-medium">Fun Account:</p>
                        <p>Month-end sweep to Long-Term • No internal transfers out</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* EMI-style Quick Stats */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{orderedAccounts.length}</div>
              <div className="text-sm text-gray-600">Active Accounts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                KES {orderedAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Balance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {orderedAccounts.filter(acc => acc.status === 'green').length}
              </div>
              <div className="text-sm text-gray-600">On Target</div>
            </div>
          </div>
        </div>
      </div>

      {/* EMI-style Modals */}
      <EMITransferModal
        isOpen={transferModal.isOpen}
        onClose={() => setTransferModal({ isOpen: false, account: null, type: '' })}
        account={transferModal.account}
        type={transferModal.type}
      />

      <EMIAddMoneyModal
        isOpen={addMoneyModal.isOpen}
        onClose={() => setAddMoneyModal({ isOpen: false, account: null, type: '' })}
        account={addMoneyModal.account}
        type={addMoneyModal.type}
      />
    </div>
  );
}