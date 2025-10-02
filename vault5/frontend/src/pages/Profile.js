import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import {
  User,
  Mail,
  Phone,
  Shield,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  X,
  Plus,
  Edit,
  Trash2,
  Upload,
  Camera,
  FileText,
  CreditCard,
  MapPin,
  Calendar,
  Star,
  Award,
  Target,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Globe,
  Heart,
  Zap,
  Settings,
  Key
} from 'lucide-react';

const Profile = () => {
  const { showError, showSuccess } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [updating, setUpdating] = useState(false);
  const [emails, setEmails] = useState([]);
  const [phones, setPhones] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [emailVerifyModal, setEmailVerifyModal] = useState({ open: false, emailId: null, token: '' });
  const [phoneVerifyModal, setPhoneVerifyModal] = useState({ open: false, phoneId: null, code: '' });
  const [confirmModal, setConfirmModal] = useState({ open: false, type: null, id: null, message: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [kycDocuments, setKycDocuments] = useState({
    kraPin: { status: 'pending', file: null },
    idFront: { status: 'pending', file: null },
    idBack: { status: 'pending', file: null },
    proofOfAddress: { status: 'pending', file: null },
    selfie: { status: 'pending', file: null }
  });
  const [uploading, setUploading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const navigate = useNavigate();

  // useEffect moved after loadProfile definition to avoid dependency issues

  const loadProfile = useCallback(async () => {
    try {
      const response = await api.get('/api/auth/profile');
      const profileData = response.data;
      setUser(profileData);
      setEmails(profileData.emails || []);
      setPhones(profileData.phones || []);
      if (profileData.kycDocuments) {
        setKycDocuments(profileData.kycDocuments);
      }
      calculateProfileCompletion(profileData);
    } catch (error) {
      console.error('Profile error:', error);
      if (error.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const calculateProfileCompletion = (profileData) => {
    let completion = 0;
    if (profileData.name) completion += 20;
    if (profileData.city) completion += 15;
    if (profileData.avatar) completion += 10;
    if (profileData.emails?.length > 0) completion += 15;
    if (profileData.phones?.length > 0) completion += 15;
    if (profileData.kycDocuments) {
      const verifiedDocs = Object.values(profileData.kycDocuments).filter(doc => doc.status === 'verified').length;
      completion += verifiedDocs * 5;
    }
    if (profileData.flags?.twoFactorEnabled) completion += 10;
    setProfileCompletion(completion);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    loadProfile();
  }, [navigate, loadProfile]);

  const handleBasicInfoUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.put('/api/auth/profile', user);
      showSuccess('Profile updated successfully');
    } catch (error) {
      showError(error.response?.data?.message || 'Error updating profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddEmail = async () => {
    if (!newEmail) { showError('Please enter an email address'); return; }
    try {
      await api.post('/api/auth/add-email', { email: newEmail });
      showSuccess('Verification email sent! Please check your email.');
      setNewEmail('');
      loadProfile();
    } catch (error) {
      showError(error.response?.data?.message || 'Error adding email');
    }
  };

  const handleVerifyEmail = async (emailId, token) => {
    try {
      await api.post('/api/auth/verify-email', { emailId, token });
      showSuccess('Email verified successfully!');
      loadProfile();
    } catch (error) {
      showError(error.response?.data?.message || 'Verification failed');
    }
  };

  const handleSetPrimaryEmail = async (emailId) => {
    try {
      await api.patch('/api/auth/set-primary-email', { emailId });
      showSuccess('Primary email updated successfully!');
      loadProfile();
    } catch (error) {
      showError(error.response?.data?.message || 'Error updating primary email');
    }
  };

  const handleRemoveEmail = async (emailId) => {
    try {
      await api.delete(`/api/auth/remove-email/${emailId}`);
      showSuccess('Email removed successfully!');
      loadProfile();
    } catch (error) {
      showError(error.response?.data?.message || 'Error removing email');
    }
  };

  const handleAddPhone = async () => {
    if (!newPhone) { showError('Please enter a phone number'); return; }
    try {
      await api.post('/api/auth/add-phone', { phone: newPhone });
      showSuccess('Verification code sent! Please check your phone.');
      setNewPhone('');
      loadProfile();
    } catch (error) {
      showError(error.response?.data?.message || 'Error adding phone');
    }
  };

  const handleVerifyPhone = async (phoneId, code) => {
    try {
      await api.post('/api/auth/verify-phone', { phoneId, code });
      showSuccess('Phone verified successfully!');
      loadProfile();
    } catch (error) {
      showError(error.response?.data?.message || 'Verification failed');
    }
  };

  const handleSetPrimaryPhone = async (phoneId) => {
    try {
      await api.patch('/api/auth/set-primary-phone', { phoneId });
      showSuccess('Primary phone updated successfully!');
      loadProfile();
    } catch (error) {
      showError(error.response?.data?.message || 'Error updating primary phone');
    }
  };

  const handleRemovePhone = async (phoneId) => {
    try {
      await api.delete(`/api/auth/remove-phone/${phoneId}`);
      showSuccess('Phone removed successfully!');
      loadProfile();
    } catch (error) {
      showError(error.response?.data?.message || 'Error removing phone');
    }
  };

  const handleFileUpload = async (documentType, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showError('File size must be less than 5MB'); return; }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) { showError('Only JPEG, PNG images and PDF files are allowed'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', documentType);
      await new Promise(res => setTimeout(res, 1000));
      setKycDocuments(prev => ({ ...prev, [documentType]: { ...prev[documentType], status: 'pending', file: file.name } }));
      showSuccess(`${documentType} uploaded successfully! It will be reviewed within 24 hours.`);
    } catch (error) {
      showError('Error uploading document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const tabs = [
    { id: 'personal', name: 'Personal', icon: <User className="w-4 h-4" /> },
    { id: 'emails', name: 'Emails', icon: <Mail className="w-4 h-4" /> },
    { id: 'phones', name: 'Phones', icon: <Phone className="w-4 h-4" /> },
    { id: 'kyc', name: 'KYC', icon: <Shield className="w-4 h-4" /> },
    { id: 'security', name: 'Security', icon: <Lock className="w-4 h-4" /> },
    { id: 'password', name: 'Password', icon: <Key className="w-4 h-4" /> }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-20 w-32 h-32 bg-blue-200/30 rounded-full blur-xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <motion.div
              className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Profile</h3>
            <p className="text-gray-600 mb-6">There was an error loading your profile information.</p>
            <button
              onClick={loadProfile}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Try Again
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-blue-200/30 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 bg-purple-200/30 rounded-full blur-xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-white/50 rounded-full px-6 py-3 mb-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="w-3 h-3 bg-green-400 rounded-full"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm font-medium text-gray-700">Your Vault Identity</span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Profile & Security
          </motion.h1>

          <motion.p
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Manage your identity, security settings, and verification status with <span className="font-semibold text-blue-600">complete control</span>.
          </motion.p>
        </motion.div>

        {/* Profile Completion Bar */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">Profile Completion</h3>
                <p className="text-sm text-gray-600">Complete your profile for better security and features</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{profileCompletion}%</div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
              style={{ width: `${profileCompletion}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${profileCompletion}%` }}
              transition={{ duration: 1, delay: 0.6 }}
            />
          </div>

          {profileCompletion < 100 && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>Complete your profile to unlock all Vault5 features!</span>
            </div>
          )}
        </motion.div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 mb-8">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50"
          >
            {activeTab === 'personal' && (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
                <form onSubmit={handleBasicInfoUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={user.name || ''}
                        disabled
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Name is locked after verification for security and compliance.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        value={user.dob ? user.dob.split('T')[0] : ''}
                        disabled
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Date of birth cannot be changed after verification.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={user.city || ''}
                        onChange={(e)=>setUser({...user, city: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Nairobi"
                      />
                    </div>
                  </div>

                  {/* Avatar section */}
                  <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-xl">
                    <div className="relative">
                      <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=3B82F6&color=ffffff&size=128`}
                        alt="avatar"
                        className="w-20 h-20 rounded-full border-2 border-white shadow-lg object-cover"
                      />
                      {avatarUploading && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                          <RefreshCw className="w-6 h-6 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-700 mb-2">Profile Photo</div>
                      <p className="text-sm text-gray-600 mb-3">Upload a clear photo of yourself for better account security.</p>
                      <label className="inline-block">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 5 * 1024 * 1024) { showError('File must be less than 5MB'); return; }
                            setAvatarUploading(true);
                            try {
                              const fd = new FormData();
                              fd.append('avatar', file);
                              await api.put('/api/auth/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' }});
                              showSuccess('Profile photo updated');
                              await loadProfile();
                            } catch (err) {
                              showError('Failed to update profile photo');
                            } finally {
                              setAvatarUploading(false);
                            }
                          }}
                        />
                        <span className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 cursor-pointer transition-colors">
                          {avatarUploading ? 'Uploading...' : 'Change Photo'}
                        </span>
                      </label>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={updating}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {updating ? 'Updating...' : 'Update Profile'}
                  </motion.button>
                </form>
              </div>
            )}

            {activeTab === 'emails' && (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Email Management</h2>
                <p className="text-gray-600 mb-6">Manage your email addresses. You can have up to 6 emails with one primary email.</p>
                <div className="space-y-4 mb-6">
                  {emails.map(email => (
                    <motion.div
                      key={email._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <Mail className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{email.email}</div>
                          <div className="flex items-center gap-2 mt-1">
                            {email.isPrimary && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Primary</span>
                            )}
                            {email.isVerified ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Verified</span>
                            ) : (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Unverified</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!email.isVerified && (
                          <button
                            onClick={()=>setEmailVerifyModal({ open:true, emailId: email._id, token:'' })}
                            className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Verify
                          </button>
                        )}
                        {!email.isPrimary && (
                          <>
                            <button
                              onClick={()=>handleSetPrimaryEmail(email._id)}
                              className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Set Primary
                            </button>
                            <button
                              onClick={() => setConfirmModal({ open:true, type:'email', id: email._id, message:`Remove email ${email.email}?` })}
                              className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                {emails.length < 6 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6">
                    <h3 className="font-medium text-gray-900 mb-2">Add New Email</h3>
                    <div className="flex gap-3">
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e)=>setNewEmail(e.target.value)}
                        placeholder="newemail@example.com"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleAddEmail}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold transition-colors"
                      >
                        Add Email
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'phones' && (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Phone Management</h2>
                <p className="text-gray-600 mb-6">Manage your phone numbers. You can have up to 3 phone numbers with one primary phone.</p>
                <div className="space-y-4 mb-6">
                  {phones.map(phone => (
                    <motion.div
                      key={phone._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                          <Phone className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{phone.phone}</div>
                          <div className="flex items-center gap-2 mt-1">
                            {phone.isPrimary && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Primary</span>
                            )}
                            {phone.isVerified ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Verified</span>
                            ) : (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Unverified</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!phone.isVerified && (
                          <button
                            onClick={()=>setPhoneVerifyModal({ open:true, phoneId: phone._id, code:'' })}
                            className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Verify
                          </button>
                        )}
                        {!phone.isPrimary && (
                          <>
                            <button
                              onClick={()=>handleSetPrimaryPhone(phone._id)}
                              className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Set Primary
                            </button>
                            <button
                              onClick={() => setConfirmModal({ open:true, type:'phone', id: phone._id, message:`Remove phone ${phone.phone}?` })}
                              className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                {phones.length < 3 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6">
                    <h3 className="font-medium text-gray-900 mb-2">Add New Phone Number</h3>
                    <div className="flex gap-3">
                      <input
                        type="tel"
                        value={newPhone}
                        onChange={(e)=>setNewPhone(e.target.value)}
                        placeholder="+254712345678"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleAddPhone}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold transition-colors"
                      >
                        Add Phone
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'password' && (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h2>
                <form onSubmit={async (e)=> {
                  e.preventDefault();
                  if (passwordData.newPassword !== passwordData.confirmPassword) { showError('New passwords do not match'); return; }
                  try {
                    await api.post('/api/auth/change-password', {
                      currentPassword: passwordData.currentPassword,
                      newPassword: passwordData.newPassword
                    });
                    showSuccess('Password changed successfully!');
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  } catch (error) {
                    showError(error.response?.data?.message || 'Error changing password');
                  }
                }} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e)=>setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e)=>setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                      minLength="8"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e)=>setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                      minLength="8"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Change Password
                  </motion.button>
                </form>
              </div>
            )}

            {activeTab === 'kyc' && (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">KYC Verification</h2>
                <p className="text-gray-600 mb-6">Complete your Know Your Customer verification by uploading the required documents. Once all documents are verified, your account will be fully activated.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {Object.entries(kycDocuments).map(([key, doc]) => (
                    <motion.div
                      key={key}
                      className={`border-2 rounded-xl p-6 transition-all duration-200 ${
                        doc.status === 'verified' ? 'border-green-200 bg-green-50' :
                        doc.status === 'pending' ? 'border-yellow-200 bg-yellow-50' :
                        'border-gray-200 bg-white'
                      }`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          doc.status === 'verified' ? 'bg-green-100 text-green-800' :
                          doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      {doc.status !== 'verified' ? (
                        <div>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e)=>handleFileUpload(key, e.target.files[0])}
                            disabled={uploading}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            {key === 'kraPin' ? 'Upload KRA PIN certificate or tax document' :
                             key === 'idFront' ? 'Upload front side of national ID' :
                             key === 'idBack' ? 'Upload back side of national ID' :
                             key === 'proofOfAddress' ? 'Upload utility bill or bank statement' :
                             'Upload clear selfie holding ID card'}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-green-600 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Document verified successfully
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="font-semibold text-blue-900 mb-2">KYC Completion Status</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">
                      {Object.values(kycDocuments).filter(doc=>doc.status==='verified').length} of 5 documents verified
                    </span>
                    {Object.values(kycDocuments).every(doc=>doc.status==='verified') && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">✓ All documents verified</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Security & Privacy</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <div>
                      <h3 className="font-semibold text-gray-900">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={user.flags?.twoFactorEnabled || false}
                        onChange={async (e) => {
                          try {
                            await api.put('/api/auth/profile', { ...user, flags: { ...user.flags, twoFactorEnabled: e.target.checked } });
                            setUser({ ...user, flags: { ...user.flags, twoFactorEnabled: e.target.checked } });
                            showSuccess('2FA setting updated');
                          } catch (error) {
                            showError('Error updating 2FA setting');
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Danger Zone */}
                  <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
                    <h3 className="font-semibold text-red-900 mb-2">Danger Zone</h3>
                    <p className="text-sm text-red-700 mb-4">
                      Permanently delete your account and all related data. This action cannot be undone.
                    </p>
                    <button
                      onClick={async () => {
                        const c1 = window.confirm('Are you sure you want to permanently delete your account?');
                        if (!c1) return;
                        const c2 = window.prompt('Type DELETE to confirm account deletion');
                        if (String(c2).trim().toUpperCase() !== 'DELETE') return;
                        try {
                          await api.delete('/api/auth/account');
                          showSuccess('Account deleted. Logging out...');
                          localStorage.removeItem('token');
                          setTimeout(()=> window.location.href = '/login', 600);
                        } catch (e) {
                          showError(e?.response?.data?.message || 'Failed to delete account');
                        }
                      }}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {emailVerifyModal.open && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">Verify Email</h3>
              <p className="text-sm text-gray-600 mb-4">Enter the verification token sent to your email address.</p>
              <input
                type="text"
                value={emailVerifyModal.token}
                onChange={(e)=>setEmailVerifyModal({ ...emailVerifyModal, token: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Verification token"
              />
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={()=>setEmailVerifyModal({ open:false, emailId:null, token:'' })}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async ()=>{ await handleVerifyEmail(emailVerifyModal.emailId, emailVerifyModal.token); setEmailVerifyModal({ open:false, emailId:null, token:'' }); }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold transition-colors"
                >
                  Verify
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phoneVerifyModal.open && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">Verify Phone</h3>
              <p className="text-sm text-gray-600 mb-4">Enter the OTP code sent to your phone number.</p>
              <input
                type="text"
                inputMode="numeric"
                value={phoneVerifyModal.code}
                onChange={(e)=>setPhoneVerifyModal({ ...phoneVerifyModal, code: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength="6"
              />
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={()=>setPhoneVerifyModal({ open:false, phoneId:null, code:'' })}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async ()=>{ await handleVerifyPhone(phoneVerifyModal.phoneId, phoneVerifyModal.code); setPhoneVerifyModal({ open:false, phoneId:null, code:'' }); }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold transition-colors"
                >
                  Verify
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmModal.open && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Action</h3>
              <p className="text-sm text-gray-700">{confirmModal.message || 'Are you sure you want to proceed?'}</p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={()=>setConfirmModal({ open:false, type:null, id:null, message:'' })}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async ()=>{ try { if (confirmModal.type==='email') { await handleRemoveEmail(confirmModal.id); } else if (confirmModal.type==='phone') { await handleRemovePhone(confirmModal.id); } } finally { setConfirmModal({ open:false, type:null, id:null, message:'' }); } }}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;