import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const AdminKyc = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useToast();

  const [kycQueue, setKycQueue] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchKycData();
  }, [navigate]);

  const fetchKycData = async () => {
    try {
      const [queueRes, statsRes] = await Promise.all([
        api.get('/api/kyc/queue?limit=50'),
        api.get('/api/kyc/stats')
      ]);

      setKycQueue(queueRes.data.users || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Fetch KYC data error:', error);
      showError('Failed to load KYC data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const response = await api.get(`/api/kyc/${userId}`);
      setSelectedUser(response.data);
      setShowUserDetails(true);
    } catch (error) {
      console.error('View user error:', error);
      showError('Failed to load user details');
    }
  };

  const handleApproveKyc = async (userId, kycLevel = 'Tier1') => {
    setActionLoading(true);
    try {
      await api.post(`/api/kyc/${userId}/approve`, { kycLevel });
      showSuccess('KYC approved successfully');
      fetchKycData(); // Refresh data
      setShowUserDetails(false);
    } catch (error) {
      console.error('Approve KYC error:', error);
      showError('Failed to approve KYC');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectKyc = async (userId, reason, limitationPeriod = 'temporary_30') => {
    setActionLoading(true);
    try {
      await api.post(`/api/kyc/${userId}/reject`, { reason, limitationPeriod });
      showSuccess('KYC rejected successfully');
      fetchKycData(); // Refresh data
      setShowUserDetails(false);
    } catch (error) {
      console.error('Reject KYC error:', error);
      showError('Failed to reject KYC');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getKycLevelColor = (level) => {
    switch (level) {
      case 'Tier2': return 'text-purple-600 bg-purple-100';
      case 'Tier1': return 'text-blue-600 bg-blue-100';
      case 'Tier0': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">KYC Management</h1>
              <p className="text-gray-600 mt-2">Review and manage user KYC verifications</p>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to Admin
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalUsers || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending KYC</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.pendingUsers || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Approved</h3>
            <p className="text-3xl font-bold text-green-600">{stats.approved || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Rejected</h3>
            <p className="text-3xl font-bold text-red-600">{stats.rejected || 0}</p>
          </div>
        </div>

        {/* KYC Queue */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">KYC Queue</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KYC Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {kycQueue.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {user.name?.charAt(0) || 'U'}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">ID: {user._id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.emails?.[0]?.email || 'No email'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.phones?.[0]?.phone || 'No phone'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.kycStatus)}`}>
                        {user.kycStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getKycLevelColor(user.kycLevel)}`}>
                        {user.kycLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewUser(user._id)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {kycQueue.length === 0 && (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-500">
                <p className="text-lg mb-2">No users in KYC queue</p>
                <p className="text-sm">All users have completed KYC verification</p>
              </div>
            </div>
          )}
        </div>

        {/* User Details Modal */}
        {showUserDetails && selectedUser && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowUserDetails(false)}></div>
              </div>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">KYC Review - {selectedUser.user.name}</h3>
                    <button
                      onClick={() => setShowUserDetails(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* User Information */}
                    <div>
                      <h4 className="text-md font-semibold mb-3">User Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{selectedUser.user.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Primary Email:</span>
                          <span className="font-medium">{selectedUser.user.emails?.[0]?.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Primary Phone:</span>
                          <span className="font-medium">{selectedUser.user.phones?.[0]?.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Account Status:</span>
                          <span className="font-medium">{selectedUser.user.accountStatus}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Joined:</span>
                          <span className="font-medium">{new Date(selectedUser.user.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Account Information */}
                    <div>
                      <h4 className="text-md font-semibold mb-3">Account Information</h4>
                      <div className="space-y-2">
                        {selectedUser.user.accounts?.map((account, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-gray-600">{account.type}:</span>
                            <span className="font-medium">KES {account.balance?.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => handleRejectKyc(selectedUser.user._id, 'KYC verification failed')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        {actionLoading ? 'Processing...' : 'Reject KYC'}
                      </button>
                      <button
                        onClick={() => handleApproveKyc(selectedUser.user._id, 'Tier1')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {actionLoading ? 'Processing...' : 'Approve Tier 1'}
                      </button>
                      <button
                        onClick={() => handleApproveKyc(selectedUser.user._id, 'Tier2')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                      >
                        {actionLoading ? 'Processing...' : 'Approve Tier 2'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminKyc;