import React, { useEffect, useState, useCallback } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const AdminFinance = () => {
  const { showError, showSuccess, showInfo } = useToast();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  // User search and selection
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Adjustment form
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('Finance admin adjustment');
  const [actionType, setActionType] = useState('credit'); // credit | debit
  const [target, setTarget] = useState('auto'); // auto | wallet
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/admin/finance/health');
      setHealth(res.data);
    } catch (e) {
      console.error('Finance health error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // debounced search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await api.get(`/api/admin/finance/users?q=${encodeURIComponent(query.trim())}`);
        if (!cancelled) setResults(res.data || []);
      } catch (e) {
        console.error('User search error:', e);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  const pickUser = (u) => {
    setSelectedUser(u);
    setResults([]);
    setQuery(u.emails?.find?.(e => e.isPrimary)?.email || u.email || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return showError('Select a user first');
    const amt = Number(amount);
    if (!(amt > 0)) return showError('Enter a valid positive amount');

    setSubmitting(true);
    try {
      const payload = {
        email: selectedUser.emails?.find?.(e => e.isPrimary)?.email || selectedUser.email,
        amount: amt,
        currency: 'KES',
        description: description?.trim() || (actionType === 'credit' ? 'Admin credit' : 'Admin debit'),
        target
      };

      const endpoint = actionType === 'credit'
        ? '/api/admin/finance/credit-income'
        : '/api/admin/finance/debit';

      const res = await api.post(endpoint, payload);
      setLastResult(res.data);
      showSuccess(`${actionType === 'credit' ? 'Credited' : 'Debited'} successfully. Tx: ${res.data?.transactionCode || res.data?.transactionId || 'N/A'}`);
      // Hint to check the user's notification center for real-time notice
      showInfo('A notification was sent to the user. Ask them to check Notifications.');
      setAmount('');
    } catch (err) {
      console.error('Adjustment error:', err);
      showError(err.response?.data?.message || 'Adjustment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const collinsQuickFill = () => {
    setQuery('collins@gmail.com');
    showInfo('Type at least two letters to trigger search. If Collins exists, click the result to select.');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading Finance...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-3">
            <AdminSidebar />
          </div>
          <div className="md:col-span-9 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
              <button
                onClick={collinsQuickFill}
                className="text-sm px-3 py-1.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              >
                Quick-fill Collins
              </button>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
                <p className="text-3xl font-bold text-orange-600">—</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900">Today's Transactions</h3>
                <p className="text-3xl font-bold text-blue-600">—</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900">Flagged Items</h3>
                <p className="text-3xl font-bold text-red-600">—</p>
              </div>
            </div>

            {/* Finance Adjustment Panel */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Disburse / Adjust Balance</h2>

              {/* Search user */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search user by email or name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setSelectedUser(null);
                    }}
                    placeholder="Type to search... e.g. collins@gmail.com"
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {searching && (
                    <div className="absolute right-2 top-2 text-gray-400 animate-pulse text-sm">
                      searching…
                    </div>
                  )}
                </div>

                {results.length > 0 && (
                  <div className="mt-2 border rounded divide-y bg-white max-h-64 overflow-y-auto">
                    {results.map((u) => (
                      <button
                        key={u._id}
                        type="button"
                        onClick={() => pickUser(u)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50"
                      >
                        <div className="font-medium text-gray-900">{u.name || '—'}</div>
                        <div className="text-sm text-gray-600">
                          {u.emails?.find?.(e => e.isPrimary)?.email || u.email || 'no-email'}
                        </div>
                        <div className="text-xs text-gray-400">role: {u.role} • status: {u.accountStatus}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected user summary */}
              {selectedUser && (
                <div className="mb-6 p-3 rounded border bg-gray-50">
                  <div className="text-sm text-gray-600">Selected User</div>
                  <div className="font-semibold text-gray-900">
                    {selectedUser.name || '—'}
                  </div>
                  <div className="text-sm">
                    {selectedUser.emails?.find?.(e => e.isPrimary)?.email || selectedUser.email || 'no-email'}
                  </div>
                </div>
              )}

              {/* Adjustment form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                    <select
                      value={actionType}
                      onChange={(e) => setActionType(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="credit">Credit</option>
                      <option value="debit">Debit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                    <select
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      disabled={actionType === 'debit'} // debit defaults to wallet/Daily
                    >
                      <option value="auto">Auto Allocation</option>
                      <option value="wallet">Wallet / Primary</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KES)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      placeholder="e.g. 50000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder={actionType === 'credit' ? 'Reason for credit' : 'Reason for debit'}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={!selectedUser || submitting}
                    className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? 'Processing…' : actionType === 'credit' ? 'Credit User' : 'Debit User'}
                  </button>
                  <div className="text-xs text-gray-500">
                    A M-Pesa‑style transaction code will be generated and a notification sent to the user.
                  </div>
                </div>
              </form>

              {lastResult && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Result</h3>
                  <div className="bg-gray-50 border rounded p-3 overflow-x-auto text-sm">
                    <pre>{JSON.stringify(lastResult, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>

            {/* Service Status */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">Service Status</h2>
              <pre className="text-sm bg-gray-50 p-3 rounded border overflow-x-auto">
                {JSON.stringify(health, null, 2)}
              </pre>
              <p className="text-sm text-gray-600 mt-2">
                Approvals, disbursements, and policy endpoints are stubs. Loan and payments modules will integrate next.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFinance;