import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const Profile = () => {
  const { showError, showSuccess, showInfo } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [updating, setUpdating] = useState(false);

  // Multi-email/phone states
  const [emails, setEmails] = useState([]);
  const [phones, setPhones] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // KYC states
  const [kycDocuments, setKycDocuments] = useState({
    kraPin: { status: 'pending', file: null },
    idFront: { status: 'pending', file: null },
    idBack: { status: 'pending', file: null },
    proofOfAddress: { status: 'pending', file: null },
    selfie: { status: 'pending', file: null }
  });
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadProfile();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      const response = await api.get('/api/auth/profile');
      const profileData = response.data;
      setUser(profileData);
      setEmails(profileData.emails || []);
      setPhones(profileData.phones || []);

      // Load KYC documents status
      if (profileData.kycDocuments) {
        setKycDocuments(profileData.kycDocuments);
      } else {
        // Sample data for demonstration - in production this would come from the API
        setKycDocuments({
          kraPin: { status: 'verified', file: 'kra_pin_2024.pdf' },
          idFront: { status: 'verified', file: 'id_front.jpg' },
          idBack: { status: 'verified', file: 'id_back.jpg' },
          proofOfAddress: { status: 'pending', file: null },
          selfie: { status: 'rejected', file: 'selfie_old.jpg' }
        });
      }
    } catch (error) {
      console.error('Profile error:', error);
      if (error.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

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
    if (!newEmail) {
      showError('Please enter an email address');
      return;
    }
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
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Are you sure you want to remove this email?')) return;
    try {
      await api.delete(`/api/auth/remove-email/${emailId}`);
      showSuccess('Email removed successfully!');
      loadProfile();
    } catch (error) {
      showError(error.response?.data?.message || 'Error removing email');
    }
  };

  const handleAddPhone = async () => {
    if (!newPhone) {
      showError('Please enter a phone number');
      return;
    }
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
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Are you sure you want to remove this phone number?')) return;
    try {
      await api.delete(`/api/auth/remove-phone/${phoneId}`);
      showSuccess('Phone removed successfully!');
      loadProfile();
    } catch (error) {
      showError(error.response?.data?.message || 'Error removing phone');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('New passwords do not match');
      return;
    }
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
  };

  const handleFileUpload = async (documentType, file) => {
    if (!file) return;
 
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('File size must be less than 5MB');
      return;
    }
 
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      showError('Only JPEG, PNG images and PDF files are allowed');
      return;
    }
 
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', documentType);
 
      // This would be a real API call in production
      // For now, we'll simulate the upload and update status
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate upload delay
 
      setKycDocuments(prev => ({
        ...prev,
        [documentType]: { ...prev[documentType], status: 'pending', file: file.name }
      }));
 
      showSuccess(`${documentType} uploaded successfully! It will be reviewed within 24 hours.`);
    } catch (error) {
      showError('Error uploading document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;
  if (!user) return <div className="p-8 text-center">Error loading profile</div>;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

      {/* Tab Navigation */}
      <div className="mb-8">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {['personal', 'emails', 'phones', 'kyc', 'security', 'password'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md">
        {activeTab === 'personal' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
            <form onSubmit={handleBasicInfoUpdate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={user.name || ''}
                    onChange={(e) => setUser({...user, name: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">VaultTag (Username)</label>
                  <input
                    type="text"
                    value={user.vaultTag || ''}
                    onChange={(e) => setUser({...user, vaultTag: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="@yourname"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={user.dob ? user.dob.split('T')[0] : ''}
                    onChange={(e) => setUser({...user, dob: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={user.city || ''}
                    onChange={(e) => setUser({...user, city: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nairobi"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium mb-1">Profile Picture URL</label>
                <input
                  type="url"
                  value={user.avatar || ''}
                  onChange={(e) => setUser({...user, avatar: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
              <button
                type="submit"
                disabled={updating}
                className={`mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {updating ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'emails' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Email Management</h2>
            <p className="text-gray-600 mb-6">Manage your email addresses. You can have up to 6 emails with one primary email.</p>

            {/* Current Emails */}
            <div className="space-y-4 mb-6">
              {emails.map((email) => (
                <div key={email._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{email.email}</span>
                      {email.isPrimary && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Primary</span>}
                      {email.isVerified ? (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Verified</span>
                      ) : (
                        <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Unverified</span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {!email.isVerified && (
                        <button
                          onClick={() => {
                            const token = prompt('Enter verification token from email:');
                            if (token) handleVerifyEmail(email._id, token);
                          }}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                        >
                          Verify
                        </button>
                      )}
                      {!email.isPrimary && (
                        <>
                          <button
                            onClick={() => handleSetPrimaryEmail(email._id)}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                          >
                            Set Primary
                          </button>
                          <button
                            onClick={() => handleRemoveEmail(email._id)}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Email */}
            {emails.length < 6 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <h3 className="font-medium mb-2">Add New Email</h3>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="newemail@example.com"
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddEmail}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Add Email
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'phones' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Phone Management</h2>
            <p className="text-gray-600 mb-6">Manage your phone numbers. You can have up to 3 phone numbers with one primary phone.</p>

            {/* Current Phones */}
            <div className="space-y-4 mb-6">
              {phones.map((phone) => (
                <div key={phone._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{phone.phone}</span>
                      {phone.isPrimary && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Primary</span>}
                      {phone.isVerified ? (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Verified</span>
                      ) : (
                        <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Unverified</span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {!phone.isVerified && (
                        <button
                          onClick={() => {
                            const code = prompt('Enter verification code from SMS:');
                            if (code) handleVerifyPhone(phone._id, code);
                          }}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                        >
                          Verify
                        </button>
                      )}
                      {!phone.isPrimary && (
                        <>
                          <button
                            onClick={() => handleSetPrimaryPhone(phone._id)}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                          >
                            Set Primary
                          </button>
                          <button
                            onClick={() => handleRemovePhone(phone._id)}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Phone */}
            {phones.length < 3 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <h3 className="font-medium mb-2">Add New Phone Number</h3>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+254712345678"
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddPhone}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Add Phone
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'password' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Change Password</h2>
            <form onSubmit={handlePasswordChange}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    minLength="8"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    minLength="8"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
              >
                Change Password
              </button>
            </form>
          </div>
        )}

        {activeTab === 'kyc' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">KYC Verification</h2>
            <p className="text-gray-600 mb-6">
              Complete your Know Your Customer verification by uploading the required documents.
              Once all documents are verified, your account will be fully activated.
            </p>

            {/* KYC Status Overview */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Verification Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(kycDocuments).map(([key, doc]) => (
                  <div key={key} className="text-center">
                    <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                      doc.status === 'verified' ? 'bg-green-500' :
                      doc.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <div className="text-xs text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Upload Sections */}
            <div className="space-y-6">
              {/* KRA PIN/Tax Document */}
              <div className={`border rounded-lg p-4 ${kycDocuments.kraPin.status === 'verified' ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">KRA PIN/Tax Document</h3>
                  <span className={`px-2 py-1 text-xs rounded ${
                    kycDocuments.kraPin.status === 'verified' ? 'bg-green-100 text-green-800' :
                    kycDocuments.kraPin.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {kycDocuments.kraPin.status}
                  </span>
                </div>
                {kycDocuments.kraPin.status !== 'verified' && (
                  <div>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload('kraPin', e.target.files[0])}
                      disabled={uploading}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload your KRA PIN certificate or tax document (PDF or image)</p>
                  </div>
                )}
                {kycDocuments.kraPin.status === 'verified' && (
                  <p className="text-sm text-green-600">✓ Document verified successfully</p>
                )}
              </div>

              {/* ID Card Front */}
              <div className={`border rounded-lg p-4 ${kycDocuments.idFront.status === 'verified' ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">ID Card - Front</h3>
                  <span className={`px-2 py-1 text-xs rounded ${
                    kycDocuments.idFront.status === 'verified' ? 'bg-green-100 text-green-800' :
                    kycDocuments.idFront.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {kycDocuments.idFront.status}
                  </span>
                </div>
                {kycDocuments.idFront.status !== 'verified' && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('idFront', e.target.files[0])}
                      disabled={uploading}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload the front side of your national ID card</p>
                  </div>
                )}
                {kycDocuments.idFront.status === 'verified' && (
                  <p className="text-sm text-green-600">✓ Document verified successfully</p>
                )}
              </div>

              {/* ID Card Back */}
              <div className={`border rounded-lg p-4 ${kycDocuments.idBack.status === 'verified' ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">ID Card - Back</h3>
                  <span className={`px-2 py-1 text-xs rounded ${
                    kycDocuments.idBack.status === 'verified' ? 'bg-green-100 text-green-800' :
                    kycDocuments.idBack.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {kycDocuments.idBack.status}
                  </span>
                </div>
                {kycDocuments.idBack.status !== 'verified' && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('idBack', e.target.files[0])}
                      disabled={uploading}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload the back side of your national ID card</p>
                  </div>
                )}
                {kycDocuments.idBack.status === 'verified' && (
                  <p className="text-sm text-green-600">✓ Document verified successfully</p>
                )}
              </div>

              {/* Proof of Address */}
              <div className={`border rounded-lg p-4 ${kycDocuments.proofOfAddress.status === 'verified' ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">Proof of Address</h3>
                  <span className={`px-2 py-1 text-xs rounded ${
                    kycDocuments.proofOfAddress.status === 'verified' ? 'bg-green-100 text-green-800' :
                    kycDocuments.proofOfAddress.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {kycDocuments.proofOfAddress.status}
                  </span>
                </div>
                {kycDocuments.proofOfAddress.status !== 'verified' && (
                  <div>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload('proofOfAddress', e.target.files[0])}
                      disabled={uploading}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload utility bill, bank statement, or other proof of address (max 3 months old)</p>
                  </div>
                )}
                {kycDocuments.proofOfAddress.status === 'verified' && (
                  <p className="text-sm text-green-600">✓ Document verified successfully</p>
                )}
              </div>

              {/* Selfie */}
              <div className={`border rounded-lg p-4 ${kycDocuments.selfie.status === 'verified' ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">Selfie</h3>
                  <span className={`px-2 py-1 text-xs rounded ${
                    kycDocuments.selfie.status === 'verified' ? 'bg-green-100 text-green-800' :
                    kycDocuments.selfie.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {kycDocuments.selfie.status}
                  </span>
                </div>
                {kycDocuments.selfie.status !== 'verified' && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('selfie', e.target.files[0])}
                      disabled={uploading}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload a clear selfie holding your ID card</p>
                  </div>
                )}
                {kycDocuments.selfie.status === 'verified' && (
                  <p className="text-sm text-green-600">✓ Document verified successfully</p>
                )}
              </div>
            </div>

            {/* Overall Status */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">KYC Completion Status</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">
                  {Object.values(kycDocuments).filter(doc => doc.status === 'verified').length} of 5 documents verified
                </span>
                {Object.values(kycDocuments).every(doc => doc.status === 'verified') && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    ✓ All documents verified
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={user.flags?.twoFactorEnabled || false}
                    onChange={async (e) => {
                      try {
                        await api.put('/api/auth/profile', {
                          ...user,
                          flags: { ...user.flags, twoFactorEnabled: e.target.checked }
                        });
                        setUser({...user, flags: { ...user.flags, twoFactorEnabled: e.target.checked }});
                      } catch (error) {
                        showError('Error updating 2FA setting');
                      }
                    }}
                    className="rounded"
                  />
                  <span className="ml-2 text-sm">Enable</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;