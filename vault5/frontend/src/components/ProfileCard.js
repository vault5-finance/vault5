import React from 'react';

const ProfileCard = ({ user, onEdit }) => {
  const getTrustScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getKycStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Profile Overview</h2>
        <button
          onClick={onEdit}
          className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
        >
          Edit Profile
        </button>
      </div>

      <div className="flex items-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <span className="text-2xl text-blue-600">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </span>
          )}
        </div>
        <div>
          <h3 className="text-lg font-medium">{user.name || 'User'}</h3>
          <p className="text-gray-600">{user.email}</p>
          {user.vaultTag && (
            <p className="text-blue-600 font-medium">{user.vaultTag}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Status */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Account Status</h4>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">KYC Status</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getKycStatusColor(user.kycStatus || 'unverified')}`}>
              {(user.kycStatus || 'unverified').toUpperCase()}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Trust Score</span>
            <span className={`font-medium ${getTrustScoreColor(user.trustScore || 0)}`}>
              {user.trustScore || 0}/100
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Member Since</span>
            <span className="text-sm text-gray-900">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Contact Information</h4>

          {user.phone && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Phone</span>
              <span className="text-sm text-gray-900">{user.phone}</span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Email</span>
            <span className="text-sm text-gray-900">{user.email}</span>
          </div>

          {user.city && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Location</span>
              <span className="text-sm text-gray-900">{user.city}</span>
            </div>
          )}
        </div>
      </div>

      {/* Security Indicators */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="font-medium text-gray-900 mb-3">Security Status</h4>
        <div className="flex flex-wrap gap-2">
          {user.twoFactorEnabled && (
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              2FA Enabled
            </span>
          )}
          {user.emailVerified && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Email Verified
            </span>
          )}
          {user.phoneVerified && (
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              Phone Verified
            </span>
          )}
          {user.kycStatus === 'verified' && (
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              KYC Verified
            </span>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            View Transactions
          </button>
          <button className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
            Download Statement
          </button>
          <button className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
            Security Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;