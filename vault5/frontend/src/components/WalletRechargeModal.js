import React, { useState } from 'react';
import { toast } from 'react-toastify';

const WalletRechargeModal = ({ wallet, onClose, onRecharge }) => {
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: {
      type: 'mpesa',
      identifier: ''
    },
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    { value: 'mpesa', label: 'M-Pesa', placeholder: '254XXXXXXXXX' },
    { value: 'card', label: 'Card', placeholder: '**** **** **** 1234' },
    { value: 'bank_transfer', label: 'Bank Transfer', placeholder: 'Account Number' },
    { value: 'paypal', label: 'PayPal', placeholder: 'email@example.com' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!formData.paymentMethod.identifier) {
      toast.error('Please enter payment method details');
      return;
    }

    setLoading(true);
    try {
      await onRecharge(formData);
    } catch (error) {
      console.error('Recharge error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentMethodChange = (type, identifier) => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: {
        type,
        identifier
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recharge Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Amount Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (KES)
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter amount"
              min="1"
              step="0.01"
              required
            />
          </div>

          {/* Payment Method Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              value={formData.paymentMethod.type}
              onChange={(e) => handlePaymentMethodChange(e.target.value, formData.paymentMethod.identifier)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            >
              {paymentMethods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>

            <input
              type={formData.paymentMethod.type === 'mpesa' ? 'tel' : 'text'}
              value={formData.paymentMethod.identifier}
              onChange={(e) => handlePaymentMethodChange(formData.paymentMethod.type, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={paymentMethods.find(m => m.value === formData.paymentMethod.type)?.placeholder}
              required
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter description"
              maxLength="255"
            />
          </div>

          {/* Wallet Limits Info */}
          {wallet && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <div className="text-sm text-blue-800">
                <div>Daily Limit: KES {wallet.limits?.dailyLimit?.toLocaleString()}</div>
                <div>Transaction Limit: KES {wallet.limits?.transactionLimit?.toLocaleString()}</div>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Recharge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WalletRechargeModal;