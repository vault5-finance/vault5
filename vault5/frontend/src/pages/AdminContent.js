import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, FileText, Megaphone, Bell, CheckCircle, AlertTriangle, XCircle, Eye, EyeOff } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import api from '../services/api';

const AdminContent = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showRawJson, setShowRawJson] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/api/admin/content/health');
      setHealth(res.data);
      setLastUpdated(new Date());
    } catch (e) {
      console.error('Content health error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getServiceStatus = (service) => {
    if (!health || !health[service]) return { status: 'unknown', icon: AlertTriangle, color: 'text-gray-500' };

    const isOnline = health[service].status === 'online' || health[service].healthy;
    const isStubbed = health[service].stubbed;

    if (isOnline && !isStubbed) return { status: 'online', icon: CheckCircle, color: 'text-green-500' };
    if (isStubbed) return { status: 'stubbed', icon: AlertTriangle, color: 'text-yellow-500' };
    return { status: 'down', icon: XCircle, color: 'text-red-500' };
  };

  const services = [
    { name: 'Articles API', key: 'articles' },
    { name: 'Campaigns API', key: 'campaigns' },
    { name: 'Notifications API', key: 'notifications' },
    { name: 'Email Service', key: 'email' },
    { name: 'Push Service', key: 'push' },
    { name: 'CMS Integration', key: 'cms' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-3">
              <AdminSidebar />
            </div>
            <div className="md:col-span-9 space-y-6">
              {/* Header Skeleton */}
              <div className="bg-white p-6 rounded-2xl shadow-sm animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>

              {/* Stats Cards Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-sm animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>

              {/* Service Status Skeleton */}
              <div className="bg-white p-6 rounded-2xl shadow-sm animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-3">
            <AdminSidebar />
          </div>
          <div className="md:col-span-9 space-y-6">
            {/* Header */}
            <motion.div
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">Content & Marketing</h1>
                  {lastUpdated && (
                    <p className="text-sm text-gray-500">
                      Last updated: {lastUpdated.toLocaleString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={load}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </motion.div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                className="bg-gradient-to-br from-blue-500 to-sky-600 p-6 rounded-2xl shadow-lg text-white hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <FileText className="w-8 h-8 opacity-80" />
                  <div className="text-3xl font-bold">
                    {health?.articles?.count || 0}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-1">Published Articles</h3>
                <p className="text-blue-100 text-sm">Educational content & blog posts</p>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl shadow-lg text-white hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <Megaphone className="w-8 h-8 opacity-80" />
                  <div className="text-3xl font-bold">
                    {health?.campaigns?.active || 0}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-1">Active Campaigns</h3>
                <p className="text-green-100 text-sm">Marketing campaigns & promotions</p>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-purple-500 to-violet-600 p-6 rounded-2xl shadow-lg text-white hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <Bell className="w-8 h-8 opacity-80" />
                  <div className="text-3xl font-bold">
                    {health?.notifications?.sent || 0}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-1">Push Notifications</h3>
                <p className="text-purple-100 text-sm">User engagement & alerts</p>
              </motion.div>
            </div>

            {/* Service Status */}
            <motion.div
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Service Status</h2>
                <button
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {showRawJson ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showRawJson ? 'Hide' : 'View'} Raw JSON
                </button>
              </div>

              <div className="space-y-4">
                {services.map((service, index) => {
                  const status = getServiceStatus(service.key);
                  const StatusIcon = status.icon;

                  return (
                    <motion.div
                      key={service.key}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-3">
                        <StatusIcon className={`w-5 h-5 ${status.color}`} />
                        <span className="font-medium text-gray-900">{service.name}</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        status.status === 'online' ? 'bg-green-100 text-green-800' :
                        status.status === 'stubbed' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {status.status.toUpperCase()}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {showRawJson && (
                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <pre className="text-sm bg-gray-900 text-green-400 p-4 rounded-lg border overflow-x-auto">
                    {JSON.stringify(health, null, 2)}
                  </pre>
                </motion.div>
              )}

              <p className="text-sm text-gray-600 mt-4">
                Articles and notifications endpoints are stubbed. CMS and messaging integrations will follow.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContent;