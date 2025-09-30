import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Search, Filter, Download, Users, UserCheck, UserX, Shield, Edit, Trash2, Eye, EyeOff, AlertTriangle, CheckCircle, X, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import ConfirmGate from '../components/ConfirmGate';

const AdminUsers = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, dormant: 0, suspended: 0 });

  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);

  // Modals and forms
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateStatus, setShowUpdateStatus] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [createStep, setCreateStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    dob: '',
    city: '',
    termsAccepted: false
  });

  // Bulk actions
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  // ConfirmGate state
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: '',
    cautions: [],
    onConfirm: null,
  });
  const openConfirm = ({ title, cautions, onConfirm }) => setConfirmState({ open: true, title, cautions, onConfirm });
  const closeConfirm = () => setConfirmState((s) => ({ ...s, open: false }));

  const fetchUsers = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockUsers = [
        {
          _id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          vaultTag: '@johndoe',
          accountStatus: 'active',
          isActive: true,
          createdAt: new Date('2024-01-15'),
          lastLogin: new Date('2024-01-20'),
          avatar: null
        },
        {
          _id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          vaultTag: '@janesmith',
          accountStatus: 'dormant',
          isActive: true,
          createdAt: new Date('2024-01-10'),
          lastLogin: new Date('2024-01-05'),
          avatar: null
        },
        {
          _id: '3',
          name: 'Bob Wilson',
          email: 'bob@example.com',
          vaultTag: '@bobwilson',
          accountStatus: 'suspended',
          isActive: false,
          createdAt: new Date('2024-01-08'),
          lastLogin: new Date('2024-01-12'),
          avatar: null
        }
      ];

      setUsers(mockUsers);
      setStats({
        total: mockUsers.length,
        active: mockUsers.filter(u => u.accountStatus === 'active').length,
        dormant: mockUsers.filter(u => u.accountStatus === 'dormant').length,
        suspended: mockUsers.filter(u => u.accountStatus === 'suspended').length
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      showError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getStatusBadgeColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      dormant: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      suspended: 'bg-red-100 text-red-800 border-red-200',
      banned: 'bg-gray-100 text-gray-800 border-gray-200',
      deleted: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <UserCheck className="w-3 h-3" />;
      case 'dormant': return <UserX className="w-3 h-3" />;
      case 'suspended': return <AlertTriangle className="w-3 h-3" />;
      case 'banned': return <Shield className="w-3 h-3" />;
      default: return <Users className="w-3 h-3" />;
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleStatusUpdate = (user, newStatus) => {
    setSelectedUser(user);
    setShowUpdateStatus(true);
    // In real implementation, this would update the user's status
    showSuccess(`User ${user.name} status updated to ${newStatus}`);
  };

  const handleBulkAction = (action) => {
    if (selectedUsers.length === 0) {
      showError('Please select users first');
      return;
    }
    showSuccess(`${action} applied to ${selectedUsers.length} users`);
    setSelectedUsers([]);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.vaultTag.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || user.accountStatus === statusFilter;
    const matchesActive = activeFilter === null || user.isActive === activeFilter;

    return matchesSearch && matchesStatus && matchesActive;
  });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center"
        >
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-white text-lg font-medium">Loading User Accounts...</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-3">
            {/* AdminSidebar would go here */}
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
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">User Accounts</h1>
                    <p className="text-slate-400 text-lg">Search, filter, and manage Vault5 user accounts securely.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
                  >
                    <UserPlus className="w-5 h-5" />
                    Create User
                  </button>
                </div>
              </div>

              {/* Quick Stats Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">{stats.total}</div>
                  <div className="text-slate-400 text-sm">Total Users</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{stats.active}</div>
                  <div className="text-green-400 text-sm">Active Users</div>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{stats.dormant}</div>
                  <div className="text-yellow-400 text-sm">Dormant Users</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-red-400">{stats.suspended}</div>
                  <div className="text-red-400 text-sm">Suspended/Banned</div>
                </div>
              </div>
            </motion.div>

            {/* Modern Filter Toolbar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or vault tag..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-10 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all" className="bg-slate-800">All Status</option>
                    <option value="active" className="bg-slate-800">Active</option>
                    <option value="dormant" className="bg-slate-800">Dormant</option>
                    <option value="suspended" className="bg-slate-800">Suspended</option>
                    <option value="banned" className="bg-slate-800">Banned</option>
                  </select>

                  <button
                    onClick={() => setActiveFilter(activeFilter === null ? true : activeFilter === true ? false : null)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      activeFilter === null ? 'bg-white/10 text-white' :
                      activeFilter === true ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {activeFilter === null ? <Eye className="w-4 h-4" /> :
                     activeFilter === true ? <Eye className="w-4 h-4" /> :
                     <EyeOff className="w-4 h-4" />}
                    {activeFilter === null ? 'All' : activeFilter ? 'Active Only' : 'Inactive Only'}
                  </button>

                  <button className="flex items-center gap-2 bg-white/10 text-white px-4 py-3 rounded-xl hover:bg-white/15 transition-all duration-200">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              {/* Active Filters */}
              {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {activeFilters.map((filter, index) => (
                    <span key={index} className="flex items-center gap-2 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-sm">
                      {filter}
                      <X className="w-3 h-3 cursor-pointer hover:text-blue-300" />
                    </span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-blue-400 font-medium">
                    {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                  </span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleBulkAction('Activate')}
                      className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      Activate
                    </button>
                    <button
                      onClick={() => handleBulkAction('Suspend')}
                      className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg hover:bg-yellow-500/30 transition-colors"
                    >
                      Suspend
                    </button>
                    <button
                      onClick={() => handleBulkAction('Export')}
                      className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-colors"
                    >
                      Export
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Enhanced User Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Account State</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {paginatedUsers.map((user) => (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers([...selectedUsers, user._id]);
                              } else {
                                setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                              }
                            }}
                            className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                              {getInitials(user.name)}
                            </div>
                            <div>
                              <div className="text-white font-medium">{user.name}</div>
                              <div className="text-slate-400 text-sm">{user.email}</div>
                              <div className="text-blue-400 text-sm font-mono">{user.vaultTag}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(user.accountStatus)}`}>
                            {getStatusIcon(user.accountStatus)}
                            {user.accountStatus.charAt(0).toUpperCase() + user.accountStatus.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-sm">
                          <div>{user.createdAt.toLocaleDateString()}</div>
                          <div className="text-xs opacity-75">{user.createdAt.toLocaleTimeString()}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStatusUpdate(user, 'active')}
                              className="p-2 text-slate-400 hover:text-green-400 transition-colors"
                              title="Update Status"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(user, 'suspended')}
                              className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                              title="More Actions"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={25} className="bg-slate-800">25 per page</option>
                      <option value={50} className="bg-slate-800">50 per page</option>
                      <option value={100} className="bg-slate-800">100 per page</option>
                    </select>
                    <span className="text-slate-400 text-sm">
                      Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length} users
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <input
                      type="number"
                      min={1}
                      max={Math.ceil(filteredUsers.length / pageSize)}
                      value={currentPage}
                      onChange={(e) => setCurrentPage(Number(e.target.value))}
                      className="w-16 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                      onClick={() => setCurrentPage(Math.min(Math.ceil(filteredUsers.length / pageSize), currentPage + 1))}
                      disabled={currentPage === Math.ceil(filteredUsers.length / pageSize)}
                      className="p-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Empty State */}
            {filteredUsers.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-12 text-center"
              >
                <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No users found</h3>
                <p className="text-slate-400 mb-6">Try adjusting your search or filter criteria.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setActiveFilter(null);
                  }}
                  className="bg-blue-500/20 text-blue-400 px-6 py-3 rounded-xl hover:bg-blue-500/30 transition-colors"
                >
                  Clear Filters
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-white">Create New User Account</h2>
              <p className="text-slate-400 mt-1">Step {createStep} of 2</p>
            </div>

            <div className="p-6">
              {createStep === 1 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+254 XXX XXX XXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        required
                        value={formData.dob}
                        onChange={(e) => setFormData({...formData, dob: e.target.value})}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-slate-400 mt-1">DOB helps us verify age compliance</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Create secure password"
                      />
                      <p className="text-xs text-slate-400 mt-1">Strong passwords improve security</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">City</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter city"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.termsAccepted}
                        onChange={(e) => setFormData({...formData, termsAccepted: e.target.checked})}
                        className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-300 text-sm">I accept the Terms of Service and Privacy Policy</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-700 flex justify-between">
              <button
                onClick={() => setCreateStep(Math.max(1, createStep - 1))}
                disabled={createStep === 1}
                className="px-6 py-3 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-3 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                {createStep === 1 ? (
                  <button
                    onClick={() => setCreateStep(2)}
                    disabled={!formData.name || !formData.email || !formData.phone || !formData.dob}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      showSuccess('User account created successfully!');
                      setShowCreateForm(false);
                      setCreateStep(1);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        password: '',
                        dob: '',
                        city: '',
                        termsAccepted: false
                      });
                    }}
                    disabled={!formData.password || !formData.city || !formData.termsAccepted}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Account
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Update Status Modal */}
      {showUpdateStatus && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md"
          >
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <h2 className="text-xl font-bold text-white">Update Account Status</h2>
              </div>
              <p className="text-slate-400 text-sm">This affects the user's ability to access the system</p>
            </div>

            <div className="p-6">
              <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {getInitials(selectedUser.name)}
                  </div>
                  <div>
                    <div className="text-white font-medium">{selectedUser.name}</div>
                    <div className="text-slate-400 text-sm">{selectedUser.email}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleStatusUpdate(selectedUser, 'active')}
                  className="w-full flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-medium">Active</span>
                  </div>
                  <span className="text-slate-400 text-sm">Full access</span>
                </button>

                <button
                  onClick={() => handleStatusUpdate(selectedUser, 'dormant')}
                  className="w-full flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg hover:bg-yellow-500/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <UserX className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 font-medium">Dormant</span>
                  </div>
                  <span className="text-slate-400 text-sm">Limited access</span>
                </button>

                <button
                  onClick={() => handleStatusUpdate(selectedUser, 'suspended')}
                  className="w-full flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 font-medium">Suspended</span>
                  </div>
                  <span className="text-slate-400 text-sm">No access</span>
                </button>

                <button
                  onClick={() => handleStatusUpdate(selectedUser, 'banned')}
                  className="w-full flex items-center justify-between p-4 bg-gray-500/10 border border-gray-500/20 rounded-lg hover:bg-gray-500/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-400 font-medium">Banned</span>
                  </div>
                  <span className="text-slate-400 text-sm">Permanent block</span>
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 flex justify-end">
              <button
                onClick={() => setShowUpdateStatus(false)}
                className="px-6 py-3 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ConfirmGate for critical actions */}
      <ConfirmGate
        open={confirmState.open}
        title={confirmState.title}
        cautions={confirmState.cautions}
        onCancel={closeConfirm}
        onConfirm={(reason) => confirmState.onConfirm?.(reason)}
        confirmWord="CONFIRM"
        actionLabel="Proceed"
      />
    </div>
  );
};

export default AdminUsers;