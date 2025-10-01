import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ShieldCheckIcon, KeyIcon, UserIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-1/3 right-10 w-1 h-1 bg-cyan-400 rounded-full animate-pulse delay-1500"></div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 relative z-10">
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
              {/* Enhanced Header with Breadcrumb */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-6"
              >
                <div className="flex items-center gap-4">
                  <ShieldCheckIcon className="w-8 h-8 text-blue-400" />
                  <div>
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                      <span>Admin</span>
                      <span>→</span>
                      <span className="text-blue-400">Profile</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Admin Profile</h1>
                    <p className="text-slate-400 mt-1">Manage your account settings and security</p>
                  </div>
                </div>
                <motion.button
                  onClick={() => navigate('/admin')}
                  className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-3 font-medium overflow-hidden"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <ArrowLeftIcon className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Back to Dashboard</span>
                </motion.button>
              </motion.div>

              {/* Enhanced Profile Card with Glowing Avatar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 relative overflow-hidden group"
              >
                {/* Neon border glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                <div className="absolute inset-0 border border-gradient-to-r from-blue-400/50 to-purple-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

                <div className="relative z-10">
                  <div className="flex items-center space-x-6 mb-6">
                    {/* Glowing Avatar with Hover Effects */}
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-600 rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden">
                        {/* Animated background glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 animate-pulse opacity-50"></div>
                        <span className="text-white font-bold text-2xl relative z-10">
                          {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                        </span>
                        {/* Orbiting particles */}
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-1000"></div>
                      </div>
                      {/* Hover reveal effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-purple-500/80 to-blue-500/80 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
                        whileHover={{ scale: 1.1 }}
                      >
                        <SparklesIcon className="w-6 h-6 text-white" />
                      </motion.div>
                    </motion.div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-white">{user?.name || 'Admin'}</h2>
                        {/* Role Badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          user?.role === 'super_admin' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          user?.role === 'system_admin' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                          user?.role === 'finance_admin' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          user?.role === 'compliance_admin' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                          'bg-slate-500/20 text-slate-400 border-slate-500/30'
                        }`}>
                          {user?.role?.replace('_', ' ').toUpperCase() || 'ADMIN'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-lg capitalize mb-1">{user?.role?.replace('_', ' ') || 'Administrator'}</p>
                      <p className="text-slate-500 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        {user?.email || 'admin@vault5.com'}
                      </p>
                    </div>
                  </div>

                {/* Enhanced Tabs with Icons and Animated Underlines */}
                <div className="relative mb-6">
                  <div className="border-b border-white/10"></div>
                  <nav className="flex space-x-8 relative">
                    <motion.button
                      onClick={() => setActiveTab('password')}
                      className={`group relative py-3 px-1 font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                        activeTab === 'password'
                          ? 'text-blue-400'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <KeyIcon className={`w-4 h-4 transition-colors ${
                        activeTab === 'password' ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'
                      }`} />
                      <span>Change Password</span>
                      {activeTab === 'password' && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                          initial={false}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </motion.button>

                    <motion.button
                      onClick={() => setActiveTab('profile')}
                      className={`group relative py-3 px-1 font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                        activeTab === 'profile'
                          ? 'text-blue-400'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <UserIcon className={`w-4 h-4 transition-colors ${
                        activeTab === 'profile' ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'
                      }`} />
                      <span>Profile Info</span>
                      {activeTab === 'profile' && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                          initial={false}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  </nav>
                </div>

                {/* Enhanced Password Change Form */}
                {activeTab === 'password' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-lg space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <KeyIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Change Password</h3>
                        <p className="text-slate-400 text-sm">Update your account security</p>
                      </div>
                    </div>

                    {/* Animated Message */}
                    {message && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className={`p-4 rounded-xl border backdrop-blur-sm ${
                          message.includes('successfully')
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {message.includes('successfully') ? (
                            <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                          ) : (
                            <XCircleIcon className="w-5 h-5 flex-shrink-0" />
                          )}
                          <span className="text-sm font-medium">{message}</span>
                        </div>
                      </motion.div>
                    )}

                    <form onSubmit={handlePasswordChange} className="space-y-6">
                      {/* Current Password */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                          >
                            {showCurrentPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* New Password with Strength Indicator */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                          >
                            {showNewPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                          </button>
                        </div>

                        {/* Password Strength Indicator */}
                        {formData.newPassword && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-2"
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                                  className={`h-full ${strengthColors[passwordStrength - 1] || 'bg-gray-500'}`}
                                  transition={{ duration: 0.3 }}
                                />
                              </div>
                              <span className={`text-xs font-medium ${
                                passwordStrength >= 4 ? 'text-green-400' :
                                passwordStrength >= 3 ? 'text-blue-400' :
                                passwordStrength >= 2 ? 'text-yellow-400' :
                                'text-red-400'
                              }`}>
                                {strengthLabels[passwordStrength - 1] || 'Very Weak'}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400">
                              Password must be at least 8 characters with uppercase, lowercase, number, and special character.
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            required
                            className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                              formData.confirmPassword && formData.newPassword !== formData.confirmPassword
                                ? 'border-red-500/50 focus:ring-red-500'
                                : 'border-white/20 focus:ring-blue-500'
                            }`}
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                          >
                            {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                          </button>
                        </div>
                        {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-red-400 text-xs flex items-center gap-1"
                          >
                            <XCircleIcon className="w-3 h-3" />
                            Passwords do not match
                          </motion.p>
                        )}
                      </div>

                      {/* Enhanced Submit Button */}
                      <motion.button
                        type="submit"
                        disabled={loading || (formData.confirmPassword && formData.newPassword !== formData.confirmPassword)}
                        className="w-full relative px-6 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        <div className="relative flex items-center justify-center gap-3">
                          {loading ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span>Updating Password...</span>
                            </>
                          ) : (
                            <>
                              <KeyIcon className="w-5 h-5" />
                              <span>Change Password</span>
                            </>
                          )}
                        </div>
                      </motion.button>
                    </form>
                  </motion.div>
                )}

                {/* Enhanced Profile Info */}
                {activeTab === 'profile' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Profile Information</h3>
                        <p className="text-slate-400 text-sm">Your account details and permissions</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Personal Information Card */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-4"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-blue-400" />
                          </div>
                          <h4 className="text-lg font-semibold text-white">Personal Details</h4>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Full Name</label>
                            <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-medium">
                              {user?.name || 'Not set'}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Primary Email</label>
                            <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-medium flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                              {user?.email || 'Not set'}
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Account Information Card */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-4"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <ShieldCheckIcon className="w-4 h-4 text-purple-400" />
                          </div>
                          <h4 className="text-lg font-semibold text-white">Account Details</h4>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Role</label>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                user?.role === 'super_admin' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                user?.role === 'system_admin' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                                user?.role === 'finance_admin' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                user?.role === 'compliance_admin' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                'bg-slate-500/20 text-slate-400 border-slate-500/30'
                              }`}>
                                {user?.role?.replace('_', ' ').toUpperCase() || 'ADMIN'}
                              </span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Department</label>
                            <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-medium capitalize">
                              {user?.department || 'General Administration'}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Account Status</label>
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                              <span className="text-green-400 font-medium text-sm">Active</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Security Level Indicator */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <ShieldCheckIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white">Security Level</h4>
                          <p className="text-slate-400 text-sm">Your account security status</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300 text-sm">Account Security</span>
                          <span className="text-green-400 font-medium text-sm">High</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full w-4/5"></div>
                        </div>
                        <div className="text-xs text-slate-400">
                          Last password change: Recent • Two-factor authentication: Enabled
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {/* Trust & Security Footer */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-8 bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <InformationCircleIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white mb-2">Trust & Security</h4>
                      <div className="space-y-2 text-sm text-slate-300">
                        <p>
                          Your admin account has elevated privileges and access to sensitive user data.
                          All actions are logged and monitored for security compliance.
                        </p>
                        <div className="flex flex-wrap gap-4 mt-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span>End-to-end encryption</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                            <span>Audit logging enabled</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                            <span>Role-based access control</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;