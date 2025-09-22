import React, { useState } from 'react';
import { toast } from 'react-toastify';

const WalletTransferModal = ({ wallet, onClose, onTransfer }) => {
  const [formData, setFormData] = useState({
    amount: '',
    targetAccount: 'Daily',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const accountOptions = [
    { value: 'Daily', label: 'Daily Account (50%)' },
    { value: 'Emergency', label: 'Emergency Fund (10%)' },
    { value: 'Investment', label: 'Investment/Wealth (20%)' },
    { value: 'LongTerm', label: 'Long-Term Goals (10%)' },
    { value: 'Fun', label: 'Fun/Freedom (5%)' },
    { value: 'Charity', label: 'Charity (5%)' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(formData.amount) > wallet.balance) {
      toast.error('Amount exceeds wallet balance');
      return;
    }

    setLoading(true);
    try {
      await onTransfer(formData);
    } catch (error) {
      console.error('Transfer error:', error);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Transfer to Account</h2>
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
          {/* Current Balance Display */}
          <div className="mb-4 p-3 bg-green-50 rounded-md">
            <div className="text-sm text-green-800">
              <div className="font-medium">Current Wallet Balance</div>
              <div className="text-lg">KES {wallet.balance?.toLocaleString() || '0'}</div>
            </div>
          </div>

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
              max={wallet.balance}
              step="0.01"
              required
            />
          </div>

          {/* Target Account Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Account
            </label>
            <select
              value={formData.targetAccount}
              onChange={(e) => handleInputChange('targetAccount', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {accountOptions.map((account) => (
                <option key={account.value} value={account.value}>
                  {account.label}
                </option>
              ))}
            </select>
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

          {/* Transfer Summary */}
          {formData.amount && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <div className="text-sm text-blue-800">
                <div className="font-medium">Transfer Summary</div>
                <div>Amount: KES {parseFloat(formData.amount).toLocaleString()}</div>
                <div>To: {accountOptions.find(a => a.value === formData.targetAccount)?.label}</div>
                <div className="mt-1 text-xs">
                  Remaining Balance: KES {(wallet.balance - parseFloat(formData.amount || 0)).toLocaleString()}
                </div>
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
              className="flex-1 px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              disabled={loading || !formData.amount}
            >
              {loading ? 'Processing...' : 'Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WalletTransferModal;