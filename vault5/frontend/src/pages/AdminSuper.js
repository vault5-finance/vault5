import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center"
        >
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-white text-lg font-medium">Loading Super Admin Dashboard...</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-3">
            <AdminSidebar />
          </div>

          <div className="md:col-span-9 space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div>
                <h1 className="text-3xl font-bold text-white">Super Admin Dashboard</h1>
                <p className="text-slate-400 mt-1">Complete system overview and management</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-1">
                  <div className="text-green-400 text-sm font-medium">System Online</div>
                </div>
                <div className="text-slate-400 text-sm">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </motion.div>

            {/* Overview Cards */}
            {overview && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <div className="text-blue-400 text-sm font-medium">+12%</div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">Total Users</h3>
                  <p className="text-3xl font-bold text-blue-400 mb-2">{overview.users.totalUsers.toLocaleString()}</p>
                  <p className="text-slate-400 text-sm">
                    {overview.users.activeUsers} active • {overview.users.dormantUsers} dormant
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-green-400 text-sm font-medium">+8%</div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">KYC Approved</h3>
                  <p className="text-3xl font-bold text-green-400 mb-2">{overview.kyc.kycApproved.toLocaleString()}</p>
                  <p className="text-slate-400 text-sm">
                    {overview.kyc.kycPending} pending • {overview.kyc.kycRejected} rejected
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="text-red-400 text-sm font-medium">-5%</div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">Risk Alerts</h3>
                  <p className="text-3xl font-bold text-red-400 mb-2">{overview.risk.flaggedTx.toLocaleString()}</p>
                  <p className="text-slate-400 text-sm">Flagged transactions</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="text-purple-400 text-sm font-medium">+15%</div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">Today's Activity</h3>
                  <p className="text-3xl font-bold text-purple-400 mb-2">{overview.activity.todaysTransactions.toLocaleString()}</p>
                  <p className="text-slate-400 text-sm">Transactions processed</p>
                </motion.div>
              </motion.div>
            )}

            {/* Admin Team Stats */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Admin Team Overview</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-slate-400 text-sm">All systems operational</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">{stats.totalAdmins}</div>
                    <div className="text-slate-400 text-sm">Total Admins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-1">{stats.activeAdmins}</div>
                    <div className="text-slate-400 text-sm">Active Admins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-400 mb-1">{stats.inactiveAdmins}</div>
                    <div className="text-slate-400 text-sm">Inactive Admins</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Role Distribution</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.breakdown?.map((row, index) => (
                      <motion.div
                        key={row._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium capitalize">
                            {String(row._id).replace('_', ' ')}
                          </span>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-green-400 text-xs">{row.active} active</span>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-blue-400">{row.count}</div>
                        <div className="text-slate-400 text-xs">Total in role</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200">
                  Generate System Report
                </button>
                <button className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all duration-200">
                  Export User Data
                </button>
                <button className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200">
                  System Maintenance
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSuper;