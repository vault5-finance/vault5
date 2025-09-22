import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import walletService from '../services/walletService';

const WalletSettings = ({ wallet, onWalletUpdate }) => {
  const [settings, setSettings] = useState({
    pin: '',
    confirmPin: ''
  });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('security');

  useEffect(() => {
    if (wallet) {
      setPaymentMethods(wallet.paymentMethods || []);
    }
  }, [wallet]);

  const handlePinSubmit = async (e) => {
    e.preventDefault();

    if (settings.pin !== settings.confirmPin) {
      toast.error('PINs do not match');
      return;
    }

    if (settings.pin.length < 4 || settings.pin.length > 6) {
      toast.error('PIN must be 4-6 digits');
      return;
    }

    setLoading(true);
    try {
      const response = await walletService.setWalletPin({ pin: settings.pin });
      if (response.success) {
        toast.success('PIN set successfully');
        setSettings({ pin: '', confirmPin: '' });
        onWalletUpdate();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to set PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async (methodData) => {
    try {
      const response = await walletService.addPaymentMethod(methodData);
      if (response.success) {
        toast.success('Payment method added successfully');
        onWalletUpdate();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to add payment method');
    }
  };

  const handleRemovePaymentMethod = async (methodId) => {
    if (!window.confirm('Are you sure you want to remove this payment method?')) {
      return;
    }

    try {
      const response = await walletService.removePaymentMethod(methodId);
      if (response.success) {
        toast.success('Payment method removed successfully');
        onWalletUpdate();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to remove payment method');
    }
  };

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>

        {/* PIN Setup */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Wallet PIN</h4>
          <p className="text-sm text-gray-600 mb-4">
            Set a PIN to secure wallet transactions
          </p>

          {wallet?.security?.pinSet ? (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600">PIN is set</span>
            </div>
          ) : (
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New PIN
                </label>
                <input
                  type="password"
                  value={settings.pin}
                  onChange={(e) => setSettings(prev => ({ ...prev, pin: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter 4-6 digit PIN"
                  maxLength="6"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm PIN
                </label>
                <input
                  type="password"
                  value={settings.confirmPin}
                  onChange={(e) => setSettings(prev => ({ ...prev, confirmPin: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm PIN"
                  maxLength="6"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Setting PIN...' : 'Set PIN'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  const renderPaymentMethodsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h3>

        {/* Add Payment Method */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Add Payment Method</h4>
          <AddPaymentMethodForm onSubmit={handleAddPaymentMethod} />
        </div>

        {/* Existing Payment Methods */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-4">Your Payment Methods</h4>

          {paymentMethods.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No payment methods added yet</p>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((method, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      method.isVerified ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                    <div>
                      <div className="font-medium capitalize">{method.type}</div>
                      <div className="text-sm text-gray-600">{method.identifier}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {method.isDefault && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${
                      method.isVerified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {method.isVerified ? 'Verified' : 'Pending'}
                    </span>
                    <button
                      onClick={() => handleRemovePaymentMethod(method._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderLimitsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Wallet Limits</h3>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600">Daily Limit</div>
              <div className="text-2xl font-bold text-gray-900">
                KES {wallet?.limits?.dailyLimit?.toLocaleString() || '0'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Monthly Limit</div>
              <div className="text-2xl font-bold text-gray-900">
                KES {wallet?.limits?.monthlyLimit?.toLocaleString() || '0'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Transaction Limit</div>
              <div className="text-2xl font-bold text-gray-900">
                KES {wallet?.limits?.transactionLimit?.toLocaleString() || '0'}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded">
            <div className="text-sm text-blue-800">
              <div className="font-medium">Current KYC Level: {wallet?.kycLevel}</div>
              <div className="mt-1">
                Upgrade your KYC level to increase your limits and unlock more features.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'security', name: 'Security' },
            { id: 'payment', name: 'Payment Methods' },
            { id: 'limits', name: 'Limits' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'security' && renderSecurityTab()}
      {activeTab === 'payment' && renderPaymentMethodsTab()}
      {activeTab === 'limits' && renderLimitsTab()}
    </div>
  );
};

// Add Payment Method Form Component
const AddPaymentMethodForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    type: 'mpesa',
    identifier: '',
    setAsDefault: false
  });

  const paymentMethods = [
    { value: 'mpesa', label: 'M-Pesa', placeholder: '254XXXXXXXXX' },
    { value: 'card', label: 'Card', placeholder: '**** **** **** 1234' },
    { value: 'bank_transfer', label: 'Bank Transfer', placeholder: 'Account Number' },
    { value: 'paypal', label: 'PayPal', placeholder: 'email@example.com' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      type: 'mpesa',
      identifier: '',
      setAsDefault: false
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Payment Method Type
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {paymentMethods.map((method) => (
            <option key={method.value} value={method.value}>
              {method.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {paymentMethods.find(m => m.value === formData.type)?.label} Details
        </label>
        <input
          type={formData.type === 'mpesa' ? 'tel' : 'text'}
          value={formData.identifier}
          onChange={(e) => setFormData(prev => ({ ...prev, identifier: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={paymentMethods.find(m => m.value === formData.type)?.placeholder}
          required
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="setAsDefault"
          checked={formData.setAsDefault}
          onChange={(e) => setFormData(prev => ({ ...prev, setAsDefault: e.target.checked }))}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="setAsDefault" className="ml-2 text-sm text-gray-700">
          Set as default payment method
        </label>
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
      >
        Add Payment Method
      </button>
    </form>
  );
};

export default WalletSettings;