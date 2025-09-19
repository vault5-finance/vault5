import React, { useEffect, useState } from 'react';
import api from '../services/api';
import AdminSidebar from '../components/AdminSidebar';

const AdminSuper = () => {
  const [overview, setOverview] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [ovr, st] = await Promise.all([
        api.get('/api/admin/overview'),
        api.get('/api/admin/stats')
      ]);
      setOverview(ovr.data.data);
      setStats(st.data.data);
    } catch (e) {
      console.error('Super admin dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
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
              <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
            </div>

            {overview && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-900">Users</h3>
                  <p className="text-3xl font-bold text-blue-600">{overview.users.totalUsers}</p>
                  <p className="text-sm text-gray-600">
                    Active {overview.users.activeUsers} • Dormant {overview.users.dormantUsers}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-900">KYC</h3>
                  <p className="text-3xl font-bold text-green-600">{overview.kyc.kycApproved}</p>
                  <p className="text-sm text-gray-600">
                    Pending {overview.kyc.kycPending} • Rejected {overview.kyc.kycRejected}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-900">Risk</h3>
                  <p className="text-3xl font-bold text-red-600">{overview.risk.flaggedTx}</p>
                  <p className="text-sm text-gray-600">Flagged Transactions</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-900">Activity Today</h3>
                  <p className="text-3xl font-bold text-purple-600">{overview.activity.todaysTransactions}</p>
                  <p className="text-sm text-gray-600">Transactions</p>
                </div>
              </div>
            )}

            {stats && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Admin Team</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Total Admins</div>
                    <div className="text-2xl font-bold">{stats.totalAdmins}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Active Admins</div>
                    <div className="text-2xl font-bold text-green-600">{stats.activeAdmins}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Inactive Admins</div>
                    <div className="text-2xl font-bold text-red-600">{stats.inactiveAdmins}</div>
                  </div>
                </div>
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Breakdown</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {stats.breakdown?.map((row) => (
                      <div key={row._id} className="border rounded p-3 text-sm flex items-center justify-between">
                        <span className="capitalize">{String(row._id).replace('_', ' ')}</span>
                        <span className="text-gray-700">{row.count} total • {row.active} active</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSuper;