import React, { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import api from '../services/api';

const AdminContent = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get('/api/admin/content/health');
      setHealth(res.data);
    } catch (e) {
      console.error('Content health error:', e);
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
        <div className="text-xl">Loading Content...</div>
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
            <h1 className="text-3xl font-bold text-gray-900">Content & Marketing</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900">Published Articles</h3>
                <p className="text-3xl font-bold text-blue-600">—</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900">Active Campaigns</h3>
                <p className="text-3xl font-bold text-green-600">—</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900">Push Notifications</h3>
                <p className="text-3xl font-bold text-purple-600">—</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">Service Status</h2>
              <pre className="text-sm bg-gray-50 p-3 rounded border overflow-x-auto">
                {JSON.stringify(health, null, 2)}
              </pre>
              <p className="text-sm text-gray-600 mt-2">
                Articles and notifications endpoints are stubbed. CMS and messaging integrations will follow.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContent;