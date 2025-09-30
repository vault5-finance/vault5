import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, CheckCircle, AlertTriangle, TrendingUp, Clock, Download, RefreshCw, Settings, UserPlus } from 'lucide-react';
import api from '../services/api';
import AdminSidebar from '../components/AdminSidebar';

const AdminSuper = () => {
  const [overview, setOverview] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastAlert, setLastAlert] = useState({
    message: "Last critical alert: 2h ago – flagged high-risk transaction",
    type: "warning",
    time: "2 hours ago"
  });

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

  // Live clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
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
            {/* System Alerts Bar */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-4 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span className="text-amber-200 font-medium">{lastAlert.message}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{currentTime.toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Super Admin Dashboard</h1>
                    <p className="text-slate-400 text-lg">System-wide monitoring & control</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={loadData}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Refresh Data
                  </button>
                  <button className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all duration-200">
                    <UserPlus className="w-5 h-5" />
                    Create Admin
                  </button>
                  <button className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200">
                    <Settings className="w-5 h-5" />
                    Manage Admins
                  </button>
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
                   whileHover={{ scale: 1.02, y: -2 }}
                   className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
                 >
                   <div className="flex items-center justify-between mb-4">
                     <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                       <Users className="w-6 h-6 text-blue-400" />
                     </div>
                     <div className="flex items-center gap-1">
                       <TrendingUp className="w-4 h-4 text-green-400" />
                       <span className="text-green-400 text-sm font-medium">+12%</span>
                     </div>
                   </div>
                   <h3 className="text-lg font-semibold text-white mb-1">Total Users</h3>
                   <p className="text-3xl font-bold text-blue-400 mb-2">{overview.users.totalUsers.toLocaleString()}</p>
                   <div className="flex items-center gap-4 text-sm">
                     <span className="text-green-400">{overview.users.activeUsers} active</span>
                     <span className="text-slate-400">{overview.users.dormantUsers} dormant</span>
                   </div>
                   {/* Mini sparkline */}
                   <div className="mt-3 h-8 flex items-end gap-1">
                     {[40, 35, 45, 50, 55, 60, 65].map((height, i) => (
                       <div
                         key={i}
                         className="bg-blue-400/30 rounded-sm flex-1"
                         style={{ height: `${height}%` }}
                       />
                     ))}
                   </div>
                 </motion.div>

                 <motion.div
                   whileHover={{ scale: 1.02, y: -2 }}
                   className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300"
                 >
                   <div className="flex items-center justify-between mb-4">
                     <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                       <CheckCircle className="w-6 h-6 text-green-400" />
                     </div>
                     <div className="flex items-center gap-1">
                       <TrendingUp className="w-4 h-4 text-green-400" />
                       <span className="text-green-400 text-sm font-medium">+8%</span>
                     </div>
                   </div>
                   <h3 className="text-lg font-semibold text-white mb-1">KYC Approved</h3>
                   <p className="text-3xl font-bold text-green-400 mb-2">{overview.kyc.kycApproved.toLocaleString()}</p>
                   <div className="flex items-center gap-4 text-sm">
                     <span className="text-orange-400">{overview.kyc.kycPending} pending</span>
                     <span className="text-red-400">{overview.kyc.kycRejected} rejected</span>
                   </div>
                   {/* Mini sparkline */}
                   <div className="mt-3 h-8 flex items-end gap-1">
                     {[30, 35, 40, 45, 50, 55, 58].map((height, i) => (
                       <div
                         key={i}
                         className="bg-green-400/30 rounded-sm flex-1"
                         style={{ height: `${height}%` }}
                       />
                     ))}
                   </div>
                 </motion.div>

                 <motion.div
                   whileHover={{ scale: 1.02, y: -2 }}
                   className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300"
                 >
                   <div className="flex items-center justify-between mb-4">
                     <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                       <AlertTriangle className="w-6 h-6 text-red-400" />
                     </div>
                     <div className="flex items-center gap-1">
                       <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />
                       <span className="text-red-400 text-sm font-medium">-5%</span>
                     </div>
                   </div>
                   <h3 className="text-lg font-semibold text-white mb-1">Risk Alerts</h3>
                   <p className="text-3xl font-bold text-red-400 mb-2">{overview.risk.flaggedTx.toLocaleString()}</p>
                   <p className="text-slate-400 text-sm">Flagged transactions</p>
                   {/* Mini sparkline */}
                   <div className="mt-3 h-8 flex items-end gap-1">
                     {[60, 55, 50, 45, 40, 35, 32].map((height, i) => (
                       <div
                         key={i}
                         className="bg-red-400/30 rounded-sm flex-1"
                         style={{ height: `${height}%` }}
                       />
                     ))}
                   </div>
                 </motion.div>

                 <motion.div
                   whileHover={{ scale: 1.02, y: -2 }}
                   className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
                 >
                   <div className="flex items-center justify-between mb-4">
                     <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                       <TrendingUp className="w-6 h-6 text-purple-400" />
                     </div>
                     <div className="flex items-center gap-1">
                       <TrendingUp className="w-4 h-4 text-green-400" />
                       <span className="text-green-400 text-sm font-medium">+15%</span>
                     </div>
                   </div>
                   <h3 className="text-lg font-semibold text-white mb-1">Today's Activity</h3>
                   <p className="text-3xl font-bold text-purple-400 mb-2">{overview.activity.todaysTransactions.toLocaleString()}</p>
                   <p className="text-slate-400 text-sm">Transactions processed</p>
                   {/* Mini sparkline */}
                   <div className="mt-3 h-8 flex items-end gap-1">
                     {[20, 25, 35, 45, 55, 70, 85].map((height, i) => (
                       <div
                         key={i}
                         className="bg-purple-400/30 rounded-sm flex-1"
                         style={{ height: `${height}%` }}
                       />
                     ))}
                   </div>
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

                {/* Admin Stats with Badges */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-all duration-200">
                    <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium mb-3">
                      <Users className="w-4 h-4" />
                      Total Admins
                    </div>
                    <div className="text-4xl font-bold text-white mb-2">{stats.totalAdmins}</div>
                    <div className="text-slate-400 text-sm">System administrators</div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-all duration-200">
                    <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium mb-3">
                      <CheckCircle className="w-4 h-4" />
                      Active Admins
                    </div>
                    <div className="text-4xl font-bold text-green-400 mb-2">{stats.activeAdmins}</div>
                    <div className="text-slate-400 text-sm">Currently online</div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-all duration-200">
                    <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm font-medium mb-3">
                      <AlertTriangle className="w-4 h-4" />
                      Inactive Admins
                    </div>
                    <div className="text-4xl font-bold text-red-400 mb-2">{stats.inactiveAdmins}</div>
                    <div className="text-slate-400 text-sm">Requires attention</div>
                  </div>
                </div>

                {/* Role Distribution with Enhanced Cards */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Role Distribution</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.breakdown?.map((row, index) => {
                      const roleColors = {
                        super_admin: 'purple',
                        system_admin: 'blue',
                        finance_admin: 'green',
                        compliance_admin: 'amber',
                        support_admin: 'cyan',
                        content_admin: 'pink',
                        account_admin: 'indigo'
                      };
                      const color = roleColors[row._id] || 'gray';

                      return (
                        <motion.div
                          key={row._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className={`bg-${color}-500/10 border border-${color}-500/20 rounded-xl p-4 hover:bg-${color}-500/15 transition-all duration-200`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-white font-medium capitalize text-sm">
                              {String(row._id).replace('_', ' ')}
                            </span>
                            <div className={`inline-flex items-center gap-1 bg-${color}-500/20 text-${color}-300 px-2 py-1 rounded-full text-xs font-medium`}>
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              {row.active} active
                            </div>
                          </div>
                          <div className="text-3xl font-bold text-white mb-1">{row.count}</div>
                          <div className="text-slate-400 text-xs">Total in role</div>

                          {/* Mini progress bar */}
                          <div className="mt-3 bg-white/10 rounded-full h-2">
                            <div
                              className={`bg-${color}-400 h-2 rounded-full transition-all duration-1000`}
                              style={{ width: `${row.active && row.count ? (row.active / row.count) * 100 : 0}%` }}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
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