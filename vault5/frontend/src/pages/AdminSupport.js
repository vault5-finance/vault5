import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket, CheckCircle, Clock, RefreshCw, Search, AlertTriangle, TrendingUp, TrendingDown, Activity, MessageSquare, User, Calendar, Filter } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import api from '../services/api';

const AdminSupport = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRawJson, setShowRawJson] = useState(false);
  const [lastChecked, setLastChecked] = useState(new Date());

  const load = async () => {
    try {
      const res = await api.get('/api/admin/support/health');
      setHealth(res.data);
      setLastChecked(new Date());
    } catch (e) {
      console.error('Support health error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
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
          <div className="text-white text-lg font-medium">Loading Support Dashboard...</div>
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
            {/* Enhanced Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Support Dashboard</h1>
                    <p className="text-slate-400 text-lg">Track support tickets, system health, and response times in real-time</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search tickets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-white/10 border border-white/20 rounded-xl px-10 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={load}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Refresh
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Metrics Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Ticket className="w-6 h-6 text-orange-400" />
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm font-medium">+12%</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">Open Tickets</h3>
                <p className="text-3xl font-bold text-orange-400 mb-2">24</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-red-400">8 High</span>
                  <span className="text-yellow-400">12 Medium</span>
                  <span className="text-green-400">4 Low</span>
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
                    <TrendingDown className="w-4 h-4 text-red-400 rotate-180" />
                    <span className="text-red-400 text-sm font-medium">-3%</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">Resolved Today</h3>
                <p className="text-3xl font-bold text-green-400 mb-2">18</p>
                <p className="text-slate-400 text-sm">vs 19 yesterday</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm font-medium">+5%</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">Avg Response Time</h3>
                <p className="text-3xl font-bold text-blue-400 mb-2">2.3h</p>
                <div className="flex items-center gap-2">
                  <span className="text-green-400 text-sm">95% SLA</span>
                  <div className="w-16 h-2 bg-white/20 rounded-full">
                    <div className="w-19/20 h-2 bg-green-400 rounded-full"></div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Service Status Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Service Status</h3>
                <div className="flex items-center gap-3">
                  <div className="text-slate-400 text-sm">
                    Last checked: {lastChecked.toLocaleTimeString()}
                  </div>
                  <button
                    onClick={() => setShowRawJson(!showRawJson)}
                    className="text-blue-400 hover:text-blue-300 text-sm underline"
                  >
                    {showRawJson ? 'Hide' : 'Show'} Raw Data
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { name: 'Ticket System', status: 'up', icon: Ticket },
                  { name: 'Password Reset', status: 'up', icon: RefreshCw },
                  { name: 'Notifications', status: 'degraded', icon: Activity },
                  { name: 'User Support', status: 'up', icon: User }
                ].map((service, index) => {
                  const Icon = service.icon;
                  const statusColors = {
                    up: 'green',
                    degraded: 'yellow',
                    down: 'red'
                  };
                  const color = statusColors[service.status];

                  return (
                    <motion.div
                      key={service.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className={`bg-${color}-500/10 border border-${color}-500/20 rounded-xl p-4 hover:bg-${color}-500/15 transition-all duration-200`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Icon className={`w-6 h-6 text-${color}-400`} />
                        <div className={`w-3 h-3 bg-${color}-400 rounded-full ${service.status === 'degraded' ? 'animate-pulse' : ''}`}></div>
                      </div>
                      <h4 className="text-white font-medium text-sm mb-1">{service.name}</h4>
                      <p className={`text-${color}-400 text-xs capitalize font-medium`}>{service.status}</p>
                    </motion.div>
                  );
                })}
              </div>

              {showRawJson && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-slate-800/50 rounded-xl p-4"
                >
                  <pre className="text-xs text-slate-300 overflow-x-auto">
                    {JSON.stringify(health, null, 2)}
                  </pre>
                </motion.div>
              )}
            </motion.div>

            {/* Future Ticket Management Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Ticket Management</h3>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 text-sm">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                  <button className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all duration-200 text-sm">
                    <User className="w-4 h-4" />
                    Assign
                  </button>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h4 className="text-white font-medium mb-2">Ticket Management Coming Soon</h4>
                <p className="text-slate-400 text-sm mb-4">
                  Full ticket management system with real-time updates, conversation threads, and SLA monitoring.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-blue-400 font-medium text-sm mb-1">Ticket ID</div>
                    <div className="text-slate-400 text-xs">Unique identifier</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-green-400 font-medium text-sm mb-1">User</div>
                    <div className="text-slate-400 text-xs">Customer details</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-purple-400 font-medium text-sm mb-1">Priority</div>
                    <div className="text-slate-400 text-xs">High/Med/Low</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-orange-400 font-medium text-sm mb-1">Status</div>
                    <div className="text-slate-400 text-xs">Open/Resolved</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSupport;