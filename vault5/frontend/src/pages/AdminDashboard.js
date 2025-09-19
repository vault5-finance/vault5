import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [overview, setOverview] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin-login');
      return;
    }
 
    // Use persisted user object (includes role) instead of JWT payload
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const adminRoles = ['super_admin', 'system_admin', 'finance_admin', 'compliance_admin', 'support_admin', 'content_admin'];
      if (!storedUser?.role || !adminRoles.includes(storedUser.role)) {
        // Not an admin; redirect to standard dashboard and keep loading to prevent flicker
        navigate('/dashboard');
        return;
      }
      setUser(storedUser);
 
      // Fetch admin stats if super admin
      const run = async () => {
        try {
          if (storedUser.role === 'super_admin') {
            await Promise.all([fetchAdminStats(), fetchSystemOverview(), fetchAdmins()]);
          }
        } finally {
          setLoading(false);
        }
      };
      run();
    } catch (error) {
      console.error('Error loading admin user:', error);
      navigate('/admin-login');
      return;
    }
  }, [navigate]);

  const fetchAdminStats = async () => {
    try {
      const response = await api.get('/api/admin/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };
  const fetchSystemOverview = async () => {
    try {
      const response = await api.get('/api/admin/overview');
      setOverview(response.data.data);
    } catch (error) {
      console.error('Error fetching system overview:', error);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await api.get('/api/admin');
      setAdmins(response.data.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const handleCreateAdmin = () => {
    navigate('/admin/create');
  };

  const handleManageAdmins = () => {
    navigate('/admin/manage');
  };

  const getDashboardByRole = () => {
    switch (user?.role) {
      case 'super_admin':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <div className="space-x-4">
                <button
                  onClick={handleCreateAdmin}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create Admin
                </button>
                <button
                  onClick={handleManageAdmins}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Manage Admins
                </button>
              </div>
            </div>

            {/* System Overview Cards */}
            {overview && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-900">Users</h3>
                  <p className="text-3xl font-bold text-blue-600">{overview.users.totalUsers}</p>
                  <p className="text-sm text-gray-600">Active {overview.users.activeUsers} • Dormant {overview.users.dormantUsers}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-900">KYC</h3>
                  <p className="text-3xl font-bold text-green-600">{overview.kyc.kycApproved}</p>
                  <p className="text-sm text-gray-600">Pending {overview.kyc.kycPending} • Rejected {overview.kyc.kycRejected}</p>
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
 
            {/* Admin Stats (breakdown) */}
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
              </div>
            )}
 
            {/* Recent Admins */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Recent Admins</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Role</th>
                      <th className="px-4 py-2 text-left">Department</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.slice(0, 5).map((admin) => (
                      <tr key={admin._id} className="border-t">
                        <td className="px-4 py-2">{admin.name}</td>
                        <td className="px-4 py-2">{admin.emails?.[0]?.email || 'N/A'}</td>
                        <td className="px-4 py-2 capitalize">{admin.role.replace('_', ' ')}</td>
                        <td className="px-4 py-2 capitalize">{admin.department}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {admin.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-2">{new Date(admin.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'finance_admin':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Finance Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
                <p className="text-3xl font-bold text-orange-600">12</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900">Today's Transactions</h3>
                <p className="text-3xl font-bold text-blue-600">156</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900">Flagged Items</h3>
                <p className="text-3xl font-bold text-red-600">3</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Recent Loan Applications</h3>
              <p className="text-gray-600">Loan management interface would go here</p>
            </div>
          </div>
        );

      case 'compliance_admin':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Compliance & Risk Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900">Flagged Transactions</h3>
                <p className="text-3xl font-bold text-red-600">8</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900">Pending KYC</h3>
                <p className="text-3xl font-bold text-orange-600">15</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900">AML Alerts</h3>
                <p className="text-3xl font-bold text-yellow-600">2</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Compliance Monitoring</h3>
              <p className="text-gray-600">Fraud detection and compliance monitoring interface would go here</p>
            </div>
          </div>
        );

      case 'support_admin':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Customer Support Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900">Open Tickets</h3>
                <p className="text-3xl font-bold text-orange-600">23</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900">Resolved Today</h3>
                <p className="text-3xl font-bold text-green-600">18</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900">Avg Response Time</h3>
                <p className="text-3xl font-bold text-blue-600">2.3h</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Recent Support Tickets</h3>
              <p className="text-gray-600">Customer support ticket management interface would go here</p>
            </div>
          </div>
        );

      case 'content_admin':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Content & Marketing Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900">Published Articles</h3>
                <p className="text-3xl font-bold text-blue-600">45</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900">Active Campaigns</h3>
                <p className="text-3xl font-bold text-green-600">7</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900">Push Notifications</h3>
                <p className="text-3xl font-bold text-purple-600">12</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Content Management</h3>
              <p className="text-gray-600">Blog posts, FAQs, and marketing content management interface would go here</p>
            </div>
          </div>
        );

      case 'system_admin':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">System Administration Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900">Server Uptime</h3>
                <p className="text-3xl font-bold text-green-600">99.9%</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900">Active Users</h3>
                <p className="text-3xl font-bold text-blue-600">1,247</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900">API Calls</h3>
                <p className="text-3xl font-bold text-purple-600">45.2K</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">System Monitoring</h3>
              <p className="text-gray-600">Server monitoring, logs, and infrastructure management interface would go here</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this dashboard.</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {getDashboardByRole()}
      </div>
    </div>
  );
};

export default AdminDashboard;