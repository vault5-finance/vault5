import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';

export const EMITransferModal = ({ isOpen, onClose, account, type }) => {
  const { showSuccess, showError } = useToast();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess(`${type} of KES ${amount} from ${account.type} completed!`);
      onClose();
    } catch (error) {
      showError('Transaction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* EMI-style Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">
                  {type === 'Internal Transfer' && '🔄'}
                  {type === 'Send to Vault User' && '👥'}
                  {type === 'Bank Transfer' && '🏦'}
                  {type === 'M-Pesa' && '📱'}
                  {type === 'Airtel Money' && '💳'}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{type}</h2>
                <p className="text-blue-100 text-sm">From {account.type} Account</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* EMI-style Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Amount (KES)
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                placeholder="0.00"
                required
                min="1"
                step="0.01"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                KES
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Available: KES {Number(account.balance || 0).toLocaleString()}
            </p>
          </div>

          {(type === 'Send to Vault User' || type === 'Bank Transfer') && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {type === 'Send to Vault User' ? 'Vault Username or Phone' : 'Account Number'}
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={type === 'Send to Vault User' ? 'Enter username or phone' : 'Enter account number'}
                required
              />
            </div>
          )}

          {/* EMI-style Transaction Preview */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Transaction Preview</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">From:</span>
                <span className="font-medium">{account.type} Account</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">KES {amount || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{type}</span>
              </div>
              {type === 'Bank Transfer' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Fee:</span>
                  <span className="font-medium text-green-600">KES 0.00</span>
                </div>
              )}
            </div>
          </div>

          {/* EMI-style Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !amount}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                `Send KES ${amount || '0.00'}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const EMIAddMoneyModal = ({ isOpen, onClose, account, type }) => {
  const { showSuccess, showError } = useToast();
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      showSuccess(`KES ${amount} added to ${account.type} via ${type}!`);
      onClose();
    } catch (error) {
      showError('Deposit failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* EMI-style Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">
                  {type === 'M-Pesa' && '📱'}
                  {type === 'Bank Transfer' && '🏦'}
                  {type === 'Card' && '💳'}
                  {type === 'Other Vault User' && '👥'}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Add Money</h2>
                <p className="text-emerald-100 text-sm">To {account.type} Account</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-emerald-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* EMI-style Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Amount (KES)
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg font-semibold"
                placeholder="0.00"
                required
                min="1"
                step="0.01"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                KES
              </div>
            </div>
          </div>

          {type === 'M-Pesa' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                M-Pesa Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="0712345678"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the M-Pesa number to withdraw from
              </p>
            </div>
          )}

          {type === 'Bank Transfer' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                From Bank Account
              </label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent" required>
                <option value="">Select your bank</option>
                <option value="kcb">KCB</option>
                <option value="equity">Equity Bank</option>
                <option value="coop">Co-operative Bank</option>
                <option value="dtb">DTB</option>
                <option value="other">Other Bank</option>
              </select>
            </div>
          )}

          {/* EMI-style Deposit Preview */}
          <div className="bg-emerald-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Deposit Preview</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">To:</span>
                <span className="font-medium">{account.type} Account</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">KES {amount || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Method:</span>
                <span className="font-medium">{type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing:</span>
                <span className="font-medium text-emerald-600">
                  {type === 'M-Pesa' ? 'Instant' : '1-2 business days'}
                </span>
              </div>
            </div>
          </div>

          {/* EMI-style Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !amount}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                `Add KES ${amount || '0.00'}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
