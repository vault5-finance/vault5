import React, { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import api from '../services/api';

const AdminFinance = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get('/api/admin/finance/health');
      setHealth(res.data);
    } catch (e) {
      console.error('Finance health error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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
            <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>

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

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">Service Status</h2>
              <pre className="text-sm bg-gray-50 p-3 rounded border overflow-x-auto">
                {JSON.stringify(health, null, 2)}
              </pre>
              <p className="text-sm text-gray-600 mt-2">
                Approvals, disbursements, and policy endpoints are stubbed. Will integrate loan and payments modules next.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFinance;