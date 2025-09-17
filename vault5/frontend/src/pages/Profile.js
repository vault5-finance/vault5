import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Profile = () => {
  const [user, setUser] = useState({
    name: '',
    avatar: '',
    email: '',
    phone: '',
    vaultTag: '',
    dob: '',
    city: ''
  });
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [kycDocuments, setKycDocuments] = useState({
    idDocument: null,
    proofOfAddress: null
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    emailNotifications: true,
    smsNotifications: false
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    api.get('/api/auth/profile')
    .then(response => {
      const profileData = response.data;
      setUser({
        name: profileData.name || '',
        avatar: profileData.avatar || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        vaultTag: profileData.vaultTag || '',
        dob: profileData.dob || '',
        city: profileData.city || ''
      });
      setLinkedAccounts(profileData.linkedAccounts || []);
      setSecuritySettings(profileData.preferences?.securitySettings || {
        twoFactorEnabled: false,
        emailNotifications: true,
        smsNotifications: false
      });
      setLoading(false);
    })
    .catch(error => {
      console.error('Profile error:', error);
      if (error.response && error.response.status === 401) navigate('/login');
      setLoading(false);
    });
  }, [navigate]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setUpdating(true);

    const profileData = {
      ...user,
      linkedAccounts,
      preferences: {
        securitySettings
      }
    };

    api.put('/api/auth/profile', profileData)
    .then(response => {
      const profileData = response.data;
      setUser({
        name: profileData.name || '',
        avatar: profileData.avatar || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        vaultTag: profileData.vaultTag || '',
        dob: profileData.dob || '',
        city: profileData.city || ''
      });
      alert('Profile updated successfully');
      setUpdating(false);
    })
    .catch(error => {
      console.error('Update profile error:', error);
      alert(error.response?.data?.message || 'Error updating profile');
      setUpdating(false);
    });
  };

  const handleSecurityChange = (field, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLinkedAccountChange = (index, field, value) => {
    const updatedAccounts = [...linkedAccounts];
    updatedAccounts[index] = { ...updatedAccounts[index], [field]: value };
    setLinkedAccounts(updatedAccounts);
  };

  const addLinkedAccount = () => {
    setLinkedAccounts([...linkedAccounts, { type: '', accountNumber: '', bankName: '' }]);
  };

  const removeLinkedAccount = (index) => {
    setLinkedAccounts(linkedAccounts.filter((_, i) => i !== index));
  };

  if (loading) return <div className="p-8">Loading profile...</div>;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

      {/* Tab Navigation */}
      <div className="mb-8">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {['personal', 'accounts', 'security', 'kyc'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md">
        {activeTab === 'personal' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={user.name}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={user.email}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={user.phone}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+254..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">VaultTag (Username)</label>
                  <input
                    type="text"
                    name="vaultTag"
                    value={user.vaultTag}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="@yourname"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={user.dob}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={user.city}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nairobi"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium mb-1">Profile Picture URL</label>
                <input
                  type="url"
                  name="avatar"
                  value={user.avatar}
                  onChange={handleChange}
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

        {activeTab === 'accounts' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Linked Accounts</h2>
            <p className="text-gray-600 mb-6">Connect your bank accounts, mobile money, and cards for seamless transactions.</p>

            {linkedAccounts.map((account, index) => (
              <div key={index} className="border rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Account Type</label>
                    <select
                      value={account.type}
                      onChange={(e) => handleLinkedAccountChange(index, 'type', e.target.value)}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Type</option>
                      <option value="mpesa">M-Pesa</option>
                      <option value="bank">Bank Account</option>
                      <option value="card">Debit/Credit Card</option>
                      <option value="paypal">PayPal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Account Number</label>
                    <input
                      type="text"
                      value={account.accountNumber}
                      onChange={(e) => handleLinkedAccountChange(index, 'accountNumber', e.target.value)}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Account/Card number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Bank/Provider</label>
                    <input
                      type="text"
                      value={account.bankName}
                      onChange={(e) => handleLinkedAccountChange(index, 'bankName', e.target.value)}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Bank name or provider"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeLinkedAccount(index)}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm"
                >
                  Remove Account
                </button>
              </div>
            ))}

            <button
              onClick={addLinkedAccount}
              className="w-full border-2 border-dashed border-gray-300 text-gray-600 py-4 rounded-lg hover:border-blue-500 hover:text-blue-600 transition"
            >
              + Add Linked Account
            </button>

            <button
              onClick={handleSubmit}
              disabled={updating}
              className={`mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {updating ? 'Updating...' : 'Save Linked Accounts'}
            </button>
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
                    checked={securitySettings.twoFactorEnabled}
                    onChange={(e) => handleSecurityChange('twoFactorEnabled', e.target.checked)}
                    className="rounded"
                  />
                  <span className="ml-2 text-sm">Enable</span>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-gray-600">Receive transaction alerts via email</p>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={securitySettings.emailNotifications}
                    onChange={(e) => handleSecurityChange('emailNotifications', e.target.checked)}
                    className="rounded"
                  />
                  <span className="ml-2 text-sm">Enable</span>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">SMS Notifications</h3>
                  <p className="text-sm text-gray-600">Receive transaction alerts via SMS</p>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={securitySettings.smsNotifications}
                    onChange={(e) => handleSecurityChange('smsNotifications', e.target.checked)}
                    className="rounded"
                  />
                  <span className="ml-2 text-sm">Enable</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={updating}
              className={`mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {updating ? 'Updating...' : 'Save Security Settings'}
            </button>
          </div>
        )}

        {activeTab === 'kyc' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">KYC Verification</h2>
            <p className="text-gray-600 mb-6">Complete your identity verification to unlock all features.</p>

            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="text-4xl mb-4">📄</div>
                <h3 className="font-medium mb-2">Government ID</h3>
                <p className="text-sm text-gray-600 mb-4">Upload a clear photo of your ID card or passport</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setKycDocuments(prev => ({ ...prev, idDocument: e.target.files[0] }))}
                  className="hidden"
                  id="id-upload"
                />
                <label
                  htmlFor="id-upload"
                  className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600"
                >
                  Upload ID Document
                </label>
                {kycDocuments.idDocument && (
                  <p className="mt-2 text-sm text-green-600">✓ {kycDocuments.idDocument.name}</p>
                )}
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="text-4xl mb-4">🏠</div>
                <h3 className="font-medium mb-2">Proof of Address</h3>
                <p className="text-sm text-gray-600 mb-4">Upload a utility bill or bank statement (less than 3 months old)</p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setKycDocuments(prev => ({ ...prev, proofOfAddress: e.target.files[0] }))}
                  className="hidden"
                  id="address-upload"
                />
                <label
                  htmlFor="address-upload"
                  className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600"
                >
                  Upload Proof of Address
                </label>
                {kycDocuments.proofOfAddress && (
                  <p className="mt-2 text-sm text-green-600">✓ {kycDocuments.proofOfAddress.name}</p>
                )}
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> KYC documents will be reviewed within 24-48 hours. You'll receive a notification once verification is complete.
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={updating}
              className={`mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {updating ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;