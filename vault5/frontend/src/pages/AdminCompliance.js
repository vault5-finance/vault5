import React, { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import api from '../services/api';

const AdminCompliance = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

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

  const purgeLogs = async () => {
    if (!isSuper) return;
    try {
      await api.delete('/api/admin/overview/audit-logs');
      await loadLogs();
    } catch (e) {
      console.error('Purge logs error:', e);
    }
  };

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              {isSuper && (
                <button
                  onClick={purgeLogs}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  title="Super Admin only"
                >
                  Purge Audit Logs
                </button>
              )}
            </div>

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

            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-2">KYC & Alerts (stubs)</h2>
              <p className="text-gray-600 text-sm">
                KYC queue and AML alerts will be integrated here in the next iteration.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCompliance;