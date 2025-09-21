import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const RULE_BADGES = {
  Daily: [
    { text: 'Unrestricted spend', color: 'bg-green-100 text-green-800' },
    { text: 'AI alert if >20%/day', color: 'bg-blue-100 text-blue-800' },
  ],
  Fun: [
    { text: 'Unlimited spend', color: 'bg-green-100 text-green-800' },
    { text: 'No internal transfers out', color: 'bg-yellow-100 text-yellow-800' },
    { text: 'Month-end sweep to Long-Term', color: 'bg-indigo-100 text-indigo-800' },
  ],
  Emergency: [
    { text: 'External payouts only', color: 'bg-rose-100 text-rose-800' },
    { text: '24h payout hold', color: 'bg-orange-100 text-orange-800' },
    { text: 'Max 2 withdrawals/month', color: 'bg-red-100 text-red-800' },
    { text: 'AI confirm required', color: 'bg-blue-100 text-blue-800' },
  ],
  LongTerm: [
    { text: 'Optional lock 3/6/12 mo.', color: 'bg-purple-100 text-purple-800' },
    { text: '3% early withdrawal penalty', color: 'bg-red-100 text-red-800' },
    { text: 'Reward at full term', color: 'bg-green-100 text-green-800' },
  ],
  Investment: [
    { text: '90-day lock', color: 'bg-purple-100 text-purple-800' },
    { text: 'Min withdrawal KES 50', color: 'bg-sky-100 text-sky-800' },
    { text: 'External payouts only', color: 'bg-rose-100 text-rose-800' },
  ],
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

  const onInternalTransfer = (acc) => {
    // Will open Internal Transfer modal later. Placeholder for now.
    showInfo(`Internal transfer from ${acc.type} coming soon`);
  };

  const onP2P = (acc) => {
    showInfo(`Send to Vault user from ${acc.type} coming soon`);
  };

  const onPayout = (acc) => {
    showInfo(`Payout from ${acc.type} to M-Pesa/Bank coming soon`);
  };

  if (loading) return <div className="p-8">Loading Accounts...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Accounts Center</h1>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => navigate('/transactions')}
          >
            View Transactions
          </button>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            onClick={() => navigate('/reports')}
          >
            View Reports
          </button>
        </div>
      </div>

      <p className="text-gray-600 mb-6">
        Manage your five Vault accounts. Each account has rules to promote financial discipline.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orderedAccounts.map((acc) => (
          <div key={acc._id} className="bg-white rounded-lg shadow p-5 border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{acc.type}</h3>
                <p className="text-sm text-gray-500">Target: {acc.percentage}%</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">KES {Number(acc.balance || 0).toFixed(2)}</div>
                <span
                  className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium"
                  style={{
                    backgroundColor:
                      acc.status === 'red'
                        ? 'var(--danger-light)'
                        : acc.status === 'blue'
                        ? 'var(--info-light)'
                        : 'var(--success-light)',
                    color:
                      acc.status === 'red'
                        ? 'var(--danger)'
                        : acc.status === 'blue'
                        ? 'var(--info)'
                        : 'var(--success)',
                  }}
                >
                  {acc.status === 'red' ? 'Behind' : acc.status === 'blue' ? 'Surplus' : 'On Target'}
                </span>
              </div>
            </div>

            <div className="mb-3">
              {(RULE_BADGES[acc.type] || []).map(r => badge(r.text, r.color))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <button
                onClick={() => onInternalTransfer(acc)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium"
              >
                Internal Transfer
              </button>
              <button
                onClick={() => onP2P(acc)}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium"
              >
                Send to Vault User
              </button>
              <button
                onClick={() => onPayout(acc)}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm font-medium"
              >
                Payout (M-Pesa/Bank)
              </button>
            </div>

            {/* Hints based on account */}
            {acc.type === 'Emergency' && (
              <p className="text-xs text-gray-500 mt-3">
                Emergency payouts are delayed by 24 hours and limited to two per month.
              </p>
            )}
            {acc.type === 'LongTerm' && (
              <p className="text-xs text-gray-500 mt-3">
                Early withdrawal while locked may incur a 3% penalty. Rewards apply at full term.
              </p>
            )}
            {acc.type === 'Investment' && (
              <p className="text-xs text-gray-500 mt-3">
                Minimum withdrawal KES 50 and 90-day lock from last deposit. External payouts only.
              </p>
            )}
            {acc.type === 'Fun' && (
              <p className="text-xs text-gray-500 mt-3">
                Fun balance sweeps to Long-Term at month-end. Internal transfers out are blocked.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}