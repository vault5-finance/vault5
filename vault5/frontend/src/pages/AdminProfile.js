import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AdminSidebar from '../components/AdminSidebar';

const AdminProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('password');
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('New passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      setMessage('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      await api.put('/api/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      setMessage('Password changed successfully!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-3">
            <AdminSidebar />
          </div>

          <div className="md:col-span-9">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white">Admin Profile</h1>
                  <p className="text-slate-400 mt-1">Manage your account settings</p>
                </div>
                <button
                  onClick={() => navigate('/admin')}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 backdrop-blur-sm"
                >
                  Back to Dashboard
                </button>
              </div>

              {/* Profile Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">
                      {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">{user?.name || 'Admin'}</h2>
                    <p className="text-slate-400 capitalize">{user?.role?.replace('_', ' ') || 'Administrator'}</p>
                    <p className="text-slate-500 text-sm">{user?.email || ''}</p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-white/10 mb-6">
                  <nav className="flex space-x-8">
                    <button
                      onClick={() => setActiveTab('password')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'password'
                          ? 'border-blue-500 text-blue-400'
                          : 'border-transparent text-slate-400 hover:text-white'
                      }`}
                    >
                      Change Password
                    </button>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'profile'
                          ? 'border-blue-500 text-blue-400'
                          : 'border-transparent text-slate-400 hover:text-white'
                      }`}
                    >
                      Profile Info
                    </button>
                  </nav>
                </div>

                {/* Password Change Form */}
                {activeTab === 'password' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="max-w-md"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>

                    {message && (
                      <div className={`p-3 rounded-lg mb-4 ${
                        message.includes('successfully')
                          ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                          : 'bg-red-500/20 border border-red-500/30 text-red-400'
                      }`}>
                        {message}
                      </div>
                    )}

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter current password"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter new password"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Confirm new password"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Changing Password...' : 'Change Password'}
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* Profile Info */}
                {activeTab === 'profile' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                          <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                            {user?.name || 'Not set'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                          <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                            {user?.email || 'Not set'}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">Role</label>
                          <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white capitalize">
                            {user?.role?.replace('_', ' ') || 'Not set'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">Department</label>
                          <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white capitalize">
                            {user?.department || 'Not set'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;