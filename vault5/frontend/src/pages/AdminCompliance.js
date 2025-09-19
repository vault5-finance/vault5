import React, { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import api from '../services/api';
import ConfirmGate from '../components/ConfirmGate';

const AdminCompliance = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  // Tabs: 'audit' | 'kyc' | 'limits' | 'payouts'
  const [activeTab, setActiveTab] = useState('audit');

  // KYC queue
  const [kycItems, setKycItems] = useState([]);
  const [loadingKyc, setLoadingKyc] = useState(false);

  // Limitations
  const [limitations, setLimitations] = useState([]);
  const [loadingLimits, setLoadingLimits] = useState(false);

  // Payouts
  const [payouts, setPayouts] = useState([]);
  const [loadingPayouts, setLoadingPayouts] = useState(false);

  // Impose limitation modal
  const [showImpose, setShowImpose] = useState(false);
  const [imposeForm, setImposeForm] = useState({
    userId: '',
    type: 'temporary_30',
    reason: ''
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuper = user?.role === 'super_admin';

  const loadLogs = async () => {
    try {
      const res = await api.get('/api/admin/compliance/audit-logs');
      setLogs(res.data.data || []);
    } catch (e) {
      console.error('Load audit logs error:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadKyc = async (status) => {
    setLoadingKyc(true);
    try {
      const params = status ? `?status=${encodeURIComponent(status)}` : '';
      const res = await api.get(`/api/admin/compliance/kyc${params}`);
      setKycItems(res.data?.data || []);
    } catch (e) {
      console.error('Load KYC error:', e);
    } finally {
      setLoadingKyc(false);
    }
  };

  const loadLimitations = async (status) => {
    setLoadingLimits(true);
    try {
      const params = status ? `?status=${encodeURIComponent(status)}` : '';
      const res = await api.get(`/api/admin/compliance/limitations${params}`);
      setLimitations(res.data?.data || []);
    } catch (e) {
      console.error('Load limitations error:', e);
    } finally {
      setLoadingLimits(false);
    }
  };

  const loadPayouts = async (status) => {
    setLoadingPayouts(true);
    try {
      const params = status ? `?status=${encodeURIComponent(status)}` : '';
      const res = await api.get(`/api/admin/compliance/payouts${params}`);
      setPayouts(res.data?.data || []);
    } catch (e) {
      console.error('Load payouts error:', e);
    } finally {
      setLoadingPayouts(false);
    }
  };
 
  // ConfirmGate state
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: '',
    cautions: [],
    onConfirm: null,
  });
  const openConfirm = ({ title, cautions, onConfirm }) => setConfirmState({ open: true, title, cautions, onConfirm });
  const closeConfirm = () => setConfirmState((s) => ({ ...s, open: false }));

  // KYC actions
  const kycAction = (kyc, action) => {
    openConfirm({
      title: `KYC: ${action} for user ${String(kyc.user).slice(-6)}`,
      cautions: [
        'I have reviewed the submitted documents',
        'This action is compliant with policy',
      ],
      onConfirm: async (reason) => {
        try {
          await api.patch(`/api/admin/compliance/kyc/${kyc._id}`, { action, notes: reason });
          await loadKyc();
          alert('KYC updated');
        } catch (e) {
          console.error('KYC action error', e);
          alert('Failed to update KYC');
        } finally {
          closeConfirm();
        }
      }
    });
  };

  // Limitation actions
  const openImpose = () => setShowImpose(true);
  const submitImpose = (e) => {
    e.preventDefault();
    openConfirm({
      title: `Impose limitation (${imposeForm.type})`,
      cautions: [
        'User has been risk-reviewed',
        'I understand this restricts account capabilities'
      ],
      onConfirm: async () => {
        try {
          await api.post('/api/admin/compliance/limitations', imposeForm);
          setShowImpose(false);
          setImposeForm({ userId: '', type: 'temporary_30', reason: '' });
          await loadLimitations('active');
          alert('Limitation imposed');
        } catch (e) {
          console.error('Impose limitation error', e);
          alert('Failed to impose limitation');
        } finally {
          closeConfirm();
        }
      }
    });
  };

  const liftLimitation = (lim) => {
    openConfirm({
      title: `Lift limitation for user ${String(lim.user).slice(-6)}`,
      cautions: [
        'I confirm the risk has been mitigated',
        'Regulatory requirements have been met'
      ],
      onConfirm: async () => {
        try {
          await api.patch(`/api/admin/compliance/limitations/${lim._id}/lift`);
          await loadLimitations('active');
          alert('Limitation lifted');
        } catch (e) {
          console.error('Lift limitation error', e);
          alert('Failed to lift limitation');
        } finally {
          closeConfirm();
        }
      }
    });
  };

  // Payout actions
  const payoutAction = (p, action) => {
    openConfirm({
      title: `Payout ${action} for user ${String(p.user).slice(-6)}`,
      cautions: [
        'Bank details verified',
        'AML/Compliance checks passed (SAR if needed)'
      ],
      onConfirm: async (reason) => {
        try {
          await api.patch(`/api/admin/compliance/payouts/${p._id}`, { action, rejectionReason: reason });
          await loadPayouts('pending');
          alert('Payout updated');
        } catch (e) {
          console.error('Payout action error', e);
          alert('Failed to update payout');
        } finally {
          closeConfirm();
        }
      }
    });
  };

  const purgeLogs = async () => {
    if (!isSuper) return;
    openConfirm({
      title: 'Purge all audit logs',
      cautions: [
        'This permanently deletes all audit log records (cannot be undone)',
        'Regulatory retention requirements have been considered',
        'I accept responsibility for this critical action',
      ],
      onConfirm: async (reason) => {
        try {
          await api.delete('/api/admin/overview/audit-logs', { headers: { 'x-reason': reason } });
          await loadLogs();
        } catch (e) {
          console.error('Purge logs error:', e);
        } finally {
          closeConfirm();
        }
      },
    });
  };

  useEffect(() => {
    // Initial fetch default tab
    setLoading(true);
    loadLogs().then(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Fetch per active tab
    if (activeTab === 'kyc') loadKyc();
    if (activeTab === 'limits') loadLimitations('active');
    if (activeTab === 'payouts') loadPayouts('pending');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const exportCsv = async () => {
    try {
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      const url = `/api/admin/compliance/audit-logs.csv?${params.toString()}`;
      window.open(url, '_blank');
    } catch (e) {
      console.error('Export CSV error:', e);
    }
  };

  const filtered = logs.filter((l) => {
    if (!q) return true;
    const term = q.toLowerCase();
    return (
      (l.action || '').toLowerCase().includes(term) ||
      (l.resource || '').toLowerCase().includes(term) ||
      (l.errorMessage || '').toLowerCase().includes(term) ||
      (l.userAgent || '').toLowerCase().includes(term) ||
      (l.ipAddress || '').toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading Compliance...</div>
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
              <h1 className="text-3xl font-bold text-gray-900">Compliance & Risk</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`px-3 py-2 rounded ${activeTab === 'audit' ? 'bg-gray-900 text-white' : 'border'}`}
                >
                  Audit Logs
                </button>
                <button
                  onClick={() => setActiveTab('kyc')}
                  className={`px-3 py-2 rounded ${activeTab === 'kyc' ? 'bg-gray-900 text-white' : 'border'}`}
                >
                  KYC Queue
                </button>
                <button
                  onClick={() => setActiveTab('limits')}
                  className={`px-3 py-2 rounded ${activeTab === 'limits' ? 'bg-gray-900 text-white' : 'border'}`}
                >
                  Limitations
                </button>
                <button
                  onClick={() => setActiveTab('payouts')}
                  className={`px-3 py-2 rounded ${activeTab === 'payouts' ? 'bg-gray-900 text-white' : 'border'}`}
                >
                  Payouts
                </button>
              </div>
            </div>

            {activeTab === 'audit' && (
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">Audit Logs</h2>
                    <p className="text-sm text-gray-600">
                      Recent platform actions for compliance review (latest 500)
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search action, resource, IP, UA..."
                      className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 w-72"
                    />
                    <button
                      onClick={loadLogs}
                      className="px-4 py-2 rounded-lg border hover:bg-gray-50"
                    >
                      Refresh
                    </button>
                    <button
                      onClick={exportCsv}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                      title="Download CSV export"
                    >
                      Export CSV
                    </button>
                    {isSuper && (
                      <button
                        onClick={purgeLogs}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                        title="Super Admin only"
                      >
                        Purge Logs
                      </button>
                    )}
                  </div>
                </div>

              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-4 py-2 text-sm font-semibold text-gray-700">Timestamp</th>
                      <th className="px-4 py-2 text-sm font-semibold text-gray-700">Action</th>
                      <th className="px-4 py-2 text-sm font-semibold text-gray-700">Resource</th>
                      <th className="px-4 py-2 text-sm font-semibold text-gray-700">User</th>
                      <th className="px-4 py-2 text-sm font-semibold text-gray-700">IP</th>
                      <th className="px-4 py-2 text-sm font-semibold text-gray-700">UA</th>
                      <th className="px-4 py-2 text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                          No audit logs match your search.
                        </td>
                      </tr>
                    )}
                    {filtered.map((log) => (
                      <tr key={log._id} className="border-t">
                        <td className="px-4 py-2 text-sm">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}
                        </td>
                        <td className="px-4 py-2 text-sm capitalize">{log.action?.replace('_', ' ')}</td>
                        <td className="px-4 py-2 text-sm capitalize">{log.resource}</td>
                        <td className="px-4 py-2 text-sm">
                          {log.user ? String(log.user) : 'N/A'}
                        </td>
                        <td className="px-4 py-2 text-sm">{log.ipAddress}</td>
                        <td className="px-4 py-2 text-sm truncate max-w-xs" title={log.userAgent}>
                          {log.userAgent}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {log.success ? 'Success' : 'Failed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
            )}

            {activeTab === 'kyc' && (
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-semibold">KYC Queue</h2>
                  <div className="space-x-2">
                    <button onClick={() => loadKyc()} className="px-3 py-1 rounded border">All</button>
                    <button onClick={() => loadKyc('pending')} className="px-3 py-1 rounded border">Pending</button>
                    <button onClick={() => loadKyc('approved')} className="px-3 py-1 rounded border">Approved</button>
                    <button onClick={() => loadKyc('rejected')} className="px-3 py-1 rounded border">Rejected</button>
                    <button onClick={() => loadKyc('more_info')} className="px-3 py-1 rounded border">More Info</button>
                  </div>
                </div>
                {loadingKyc ? <div>Loading KYC...</div> : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">User</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Level</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Status</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Submitted</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {kycItems.length === 0 && (
                          <tr><td colSpan={5} className="px-4 py-3 text-gray-500 text-sm">No KYC items</td></tr>
                        )}
                        {kycItems.map(k => (
                          <tr key={k._id}>
                            <td className="px-4 py-2 text-sm">{String(k.user).slice(-6)}</td>
                            <td className="px-4 py-2 text-sm">{k.levelRequested}</td>
                            <td className="px-4 py-2 text-sm capitalize">{k.status}</td>
                            <td className="px-4 py-2 text-sm">{new Date(k.createdAt).toLocaleString()}</td>
                            <td className="px-4 py-2 text-sm space-x-2">
                              <button onClick={() => kycAction(k, 'approve')} className="px-2 py-1 rounded bg-green-600 text-white">Approve</button>
                              <button onClick={() => kycAction(k, 'more_info')} className="px-2 py-1 rounded border">More Info</button>
                              <button onClick={() => kycAction(k, 'reject')} className="px-2 py-1 rounded bg-red-600 text-white">Reject</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'limits' && (
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-semibold">Limitations</h2>
                  <div className="space-x-2">
                    <button onClick={() => loadLimitations('active')} className="px-3 py-1 rounded border">Active</button>
                    <button onClick={() => loadLimitations('lifted')} className="px-3 py-1 rounded border">Lifted</button>
                    <button onClick={() => loadLimitations('expired')} className="px-3 py-1 rounded border">Expired</button>
                    <button onClick={openImpose} className="px-3 py-1 rounded bg-gray-900 text-white">Impose</button>
                  </div>
                </div>
                {loadingLimits ? <div>Loading limitations...</div> : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">User</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Type</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Status</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Imposed</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Expires</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {limitations.length === 0 && (
                          <tr><td colSpan={6} className="px-4 py-3 text-gray-500 text-sm">No limitations</td></tr>
                        )}
                        {limitations.map(l => (
                          <tr key={l._id}>
                            <td className="px-4 py-2 text-sm">{String(l.user).slice(-6)}</td>
                            <td className="px-4 py-2 text-sm">{l.type}</td>
                            <td className="px-4 py-2 text-sm capitalize">{l.status}</td>
                            <td className="px-4 py-2 text-sm">{l.imposedAt ? new Date(l.imposedAt).toLocaleString() : '-'}</td>
                            <td className="px-4 py-2 text-sm">{l.expiresAt ? new Date(l.expiresAt).toLocaleString() : '-'}</td>
                            <td className="px-4 py-2 text-sm">
                              {l.status === 'active' ? (
                                <button onClick={() => liftLimitation(l)} className="px-2 py-1 rounded bg-green-600 text-white">Lift</button>
                              ) : (
                                <span className="text-gray-500">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Impose modal */}
                {showImpose && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                      <h3 className="text-lg font-semibold mb-3">Impose Limitation</h3>
                      <form onSubmit={submitImpose} className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">User ID</label>
                          <input
                            type="text"
                            value={imposeForm.userId}
                            onChange={(e) => setImposeForm({ ...imposeForm, userId: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                            placeholder="Mongo ObjectId"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Type</label>
                          <select
                            className="w-full p-2 border rounded-lg"
                            value={imposeForm.type}
                            onChange={(e) => setImposeForm({ ...imposeForm, type: e.target.value })}
                          >
                            <option value="temporary_30">Temporary 30 days</option>
                            <option value="temporary_180">Temporary 180 days (reserve)</option>
                            <option value="permanent">Permanent</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Reason (optional)</label>
                          <textarea
                            className="w-full p-2 border rounded-lg"
                            value={imposeForm.reason}
                            onChange={(e) => setImposeForm({ ...imposeForm, reason: e.target.value })}
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button type="button" onClick={() => setShowImpose(false)} className="px-3 py-2 rounded border">Cancel</button>
                          <button type="submit" className="px-3 py-2 rounded bg-gray-900 text-white">Impose</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'payouts' && (
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-semibold">Payout Requests</h2>
                  <div className="space-x-2">
                    <button onClick={() => loadPayouts()} className="px-3 py-1 rounded border">All</button>
                    <button onClick={() => loadPayouts('pending')} className="px-3 py-1 rounded border">Pending</button>
                    <button onClick={() => loadPayouts('approved')} className="px-3 py-1 rounded border">Approved</button>
                    <button onClick={() => loadPayouts('rejected')} className="px-3 py-1 rounded border">Rejected</button>
                    <button onClick={() => loadPayouts('paid')} className="px-3 py-1 rounded border">Paid</button>
                  </div>
                </div>
                {loadingPayouts ? <div>Loading payouts...</div> : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">User</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Amount</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Currency</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Destination</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Status</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {payouts.length === 0 && (
                          <tr><td colSpan={6} className="px-4 py-3 text-gray-500 text-sm">No payout requests</td></tr>
                        )}
                        {payouts.map(p => (
                          <tr key={p._id}>
                            <td className="px-4 py-2 text-sm">{String(p.user).slice(-6)}</td>
                            <td className="px-4 py-2 text-sm">{Number(p.amount || 0).toLocaleString()}</td>
                            <td className="px-4 py-2 text-sm">{p.currency}</td>
                            <td className="px-4 py-2 text-sm">{p.destination?.bankName} • {p.destination?.accountNumber}</td>
                            <td className="px-4 py-2 text-sm capitalize">{p.status}</td>
                            <td className="px-4 py-2 text-sm space-x-2">
                              <button onClick={() => payoutAction(p, 'approve')} className="px-2 py-1 rounded bg-green-600 text-white">Approve</button>
                              <button onClick={() => payoutAction(p, 'reject')} className="px-2 py-1 rounded bg-red-600 text-white">Reject</button>
                              <button onClick={() => payoutAction(p, 'paid')} className="px-2 py-1 rounded border">Mark Paid</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ConfirmGate for purging logs */}
      <ConfirmGate
        open={confirmState.open}
        title={confirmState.title}
        cautions={confirmState.cautions}
        onCancel={closeConfirm}
        onConfirm={(reason) => confirmState.onConfirm?.(reason)}
        confirmWord="CONFIRM"
        actionLabel="Purge"
      />
    </div>
  );
};

export default AdminCompliance;