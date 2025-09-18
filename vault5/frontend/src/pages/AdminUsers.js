import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [kycFilter, setKycFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Check if user is admin
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    loadUsers();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      // Enhanced mock data with more details
      setUsers([
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+254712345678',
          role: 'user',
          status: 'active',
          joinDate: '2024-01-15',
          kycStatus: 'verified',
          lastLogin: '2024-09-18',
          activityLevel: 'high',
          totalTransactions: 45,
          totalBalance: 12500.50,
          riskScore: 'low'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+254798765432',
          role: 'user',
          status: 'active',
          joinDate: '2024-02-20',
          kycStatus: 'pending',
          lastLogin: '2024-09-15',
          activityLevel: 'medium',
          totalTransactions: 12,
          totalBalance: 3200.00,
          riskScore: 'medium'
        },
        {
          id: '3',
          name: 'Bob Johnson',
          email: 'bob@example.com',
          phone: '+254711111111',
          role: 'user',
          status: 'suspended',
          joinDate: '2024-03-10',
          kycStatus: 'rejected',
          lastLogin: '2024-09-10',
          activityLevel: 'low',
          totalTransactions: 3,
          totalBalance: 150.00,
          riskScore: 'high'
        },
        {
          id: '4',
          name: 'Alice Wilson',
          email: 'alice@example.com',
          phone: '+254722222222',
          role: 'user',
          status: 'active',
          joinDate: '2024-04-05',
          kycStatus: 'verified',
          lastLogin: '2024-09-17',
          activityLevel: 'high',
          totalTransactions: 78,
          totalBalance: 45200.75,
          riskScore: 'low'
        },
        {
          id: '5',
          name: 'Charlie Brown',
          email: 'charlie@example.com',
          phone: '+254733333333',
          role: 'user',
          status: 'pending',
          joinDate: '2024-09-01',
          kycStatus: 'pending',
          lastLogin: null,
          activityLevel: 'new',
          totalTransactions: 0,
          totalBalance: 0.00,
          riskScore: 'unknown'
        }
      ]);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      setUsers(users.map(user =>
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      alert(`User status updated to ${newStatus}`);
    } catch (error) {
      alert('Error updating user status');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) return;

    try {
      // Mock bulk action
      alert(`${action} applied to ${selectedUsers.length} users`);
      setSelectedUsers([]);
      setShowBulkActions(false);
    } catch (error) {
      alert('Error performing bulk action');
    }
  };

  const resetPassword = async (userId) => {
    try {
      // Mock password reset
      alert('Password reset email sent to user');
    } catch (error) {
      alert('Error sending password reset');
    }
  };

  const sendEmail = async (userId) => {
    try {
      // Mock email sending
      alert('Email sent to user');
    } catch (error) {
      alert('Error sending email');
    }
  };

  const exportUsers = () => {
    // Mock export functionality
    alert('User data exported to CSV');
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesKyc = kycFilter === 'all' || user.kycStatus === kycFilter;
    const matchesActivity = activityFilter === 'all' || user.activityLevel === activityFilter;

    return matchesSearch && matchesStatus && matchesKyc && matchesActivity;
  });

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(filteredUsers.map(user => user.id));
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white text-xl">Loading users...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Admin Header */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-bold mr-4">
                ADMIN
              </div>
              <h1 className="text-2xl font-bold text-white">User Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportUsers}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                📊 Export CSV
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-gray-800 min-h-screen border-r border-gray-700">
          <div className="p-6">
            <div className="space-y-2">
              {[
                { name: 'Dashboard', active: false, path: '/admin', icon: '📊' },
                { name: 'Users', active: true, path: '/admin/users', icon: '👥' },
                { name: 'Transactions', active: false, path: '/admin/transactions', icon: '💳' },
                { name: 'Loans', active: false, path: '/admin/loans', icon: '💰' },
                { name: 'Reports', active: false, path: '/admin/reports', icon: '📈' },
                { name: 'Content', active: false, path: '/admin/content', icon: '📝' },
                { name: 'Audit Logs', active: false, path: '/admin/audit', icon: '📋' },
                { name: 'Settings', active: false, path: '/admin/settings', icon: '⚙️' }
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    item.active
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Filters and Search */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              <div>
                <input
                  type="text"
                  placeholder="Search by name, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <select
                  value={kycFilter}
                  onChange={(e) => setKycFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All KYC</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <select
                  value={activityFilter}
                  onChange={(e) => setActivityFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Activity</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="new">New Users</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  {filteredUsers.length} users
                </span>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between bg-blue-900/20 border border-blue-700 rounded-lg p-4"
              >
                <span className="text-sm text-blue-300">
                  {selectedUsers.length} users selected
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBulkAction('Suspend')}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Suspend All
                  </button>
                  <button
                    onClick={() => handleBulkAction('Activate')}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Activate All
                  </button>
                  <button
                    onClick={clearSelection}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    Clear
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Users Table */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={selectedUsers.length === filteredUsers.length ? clearSelection : selectAllUsers}
                        className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">KYC</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Activity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Balance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredUsers.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium ${
                              user.status === 'active' ? 'bg-green-600' :
                              user.status === 'suspended' ? 'bg-red-600' :
                              'bg-yellow-600'
                            }`}>
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{user.name}</div>
                            <div className="text-sm text-gray-400">{user.role}</div>
                            <div className="text-xs text-gray-500">
                              Joined {new Date(user.joinDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">{user.email}</div>
                        <div className="text-sm text-gray-400">{user.phone}</div>
                        {user.lastLogin && (
                          <div className="text-xs text-gray-500">
                            Last login: {new Date(user.lastLogin).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.status === 'active' ? 'bg-green-900 text-green-300' :
                          user.status === 'suspended' ? 'bg-red-900 text-red-300' :
                          'bg-yellow-900 text-yellow-300'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.kycStatus === 'verified' ? 'bg-green-900 text-green-300' :
                          user.kycStatus === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-red-900 text-red-300'
                        }`}>
                          {user.kycStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mr-2 ${
                            user.activityLevel === 'high' ? 'bg-green-900 text-green-300' :
                            user.activityLevel === 'medium' ? 'bg-blue-900 text-blue-300' :
                            user.activityLevel === 'low' ? 'bg-yellow-900 text-yellow-300' :
                            'bg-gray-900 text-gray-300'
                          }`}>
                            {user.activityLevel}
                          </span>
                          <span className="text-xs text-gray-400">
                            {user.totalTransactions} txns
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        ${user.totalBalance.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          {user.status === 'active' ? (
                            <button
                              onClick={() => handleStatusChange(user.id, 'suspended')}
                              className="text-red-400 hover:text-red-300 text-xs"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(user.id, 'active')}
                              className="text-green-400 hover:text-green-300 text-xs"
                            >
                              Activate
                            </button>
                          )}
                          <button
                            onClick={() => resetPassword(user.id)}
                            className="text-blue-400 hover:text-blue-300 text-xs"
                          >
                            Reset Password
                          </button>
                          <button
                            onClick={() => sendEmail(user.id)}
                            className="text-purple-400 hover:text-purple-300 text-xs"
                          >
                            Send Email
                          </button>
                          <button
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                            className="text-gray-400 hover:text-gray-300 text-xs"
                          >
                            View Details
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400">No users found matching your filters.</div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminUsers;