import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';

export const EMITransferModal = ({ isOpen, onClose, account, type }) => {
  const { showSuccess, showError, showInfo } = useToast();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [recipientType, setRecipientType] = useState('phone'); // 'phone' or 'email'
  const [recipientDetails, setRecipientDetails] = useState(null);
  const [showRecipientSearch, setShowRecipientSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [recipientVerified, setRecipientVerified] = useState(false);
  const [password, setPassword] = useState(''); // confirmation for Vault-to-Vault

  // Real recipient verification (replaces mock list)

  if (!isOpen) return null;

  const searchRecipients = async (query) => {
    setSearchLoading(true);
    try {
      // Build payload to enforce single identifier
      const mode = recipientType === 'email' ? 'email' : 'phone';
      const payload = {
        mode,
        recipientEmail: mode === 'email' ? query : undefined,
        recipientPhone: mode === 'phone' ? query : undefined,
      };
      const res = await api.post('/api/transactions/verify-recipient', payload);

      if (res.data && res.data.verified) {
        const r = res.data.recipient || {};
        const normalized = {
          id: r.id || r._id || 0,
          name: r.name || (r.phone ? 'External Recipient' : 'Recipient'),
          phone: r.phone || '',
          email: r.email || '',
          vaultUser: !!res.data.vaultUser,
          avatar: r.avatar || '👤',
          network: res.data.fees?.network || res.data.recipient?.network || null
        };
        setSearchResults([normalized]);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      // If email not found for Vault user path, show explicit not-registered state
      const message = error?.response?.data?.message || '';
      if (recipientType === 'email' && /No Vault5 user/i.test(message)) {
        setSearchResults([{
          id: 0,
          name: 'Not a registered Vault5 user',
          email: query,
          phone: '',
          vaultUser: false,
          avatar: '❌'
        }]);
      } else {
        showError('Failed to verify recipient');
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRecipientSearch = (query) => {
    setRecipient(query);
    if (query.length >= 3) {
      searchRecipients(query);
      setShowRecipientSearch(true);
    } else {
      setShowRecipientSearch(false);
    }
  };

  const selectTransferRecipient = (recipientData) => {
    const data = { ...recipientData };
    setRecipient(recipientType === 'phone' ? data.phone : data.email);
    setRecipientDetails(data);
    setShowRecipientSearch(false);

    if (!data.vaultUser) {
      // Not a Vault user; show explicit info and block P2P path
      setShowVerification(true);
      setRecipientVerified(false);
    } else {
      setShowVerification(false);
      setRecipientVerified(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!amount || parseFloat(amount) <= 0) {
        showError('Please enter a valid amount');
        setLoading(false);
        return;
      }

      if (!recipientDetails) {
        showError('Please select a recipient');
        setLoading(false);
        return;
      }

      if (type === 'Send to Vault User') {
        if (!recipientDetails.vaultUser) {
          showError('Recipient is not a registered Vault5 user');
          setLoading(false);
          return;
        }
        if (!password) {
          showError('Enter your password to confirm');
          setLoading(false);
          return;
        }

        // P2P transfer from specific account
        const response = await api.post('/api/transactions/transfer', {
          recipientEmail: recipientType === 'email' ? recipientDetails.email : undefined,
          recipientPhone: recipientType === 'phone' ? recipientDetails.phone : undefined,
          amount: parseFloat(amount),
          description: `P2P from ${account.type}`,
          source: 'account',
          fromAccountId: account._id,
          password
        });

        showSuccess(`✅ Sent KES ${amount} to ${recipientDetails.name}`);
        onClose();
        return;
      }

      // Other types (placeholders)
      const processingTime = {
        'Internal Transfer': 500,
        'Bank Transfer': 2000,
        'M-Pesa': 1500,
        'Airtel Money': 1500
      };
      await new Promise(resolve => setTimeout(resolve, processingTime[type] || 1000));
      showSuccess(`✅ ${type} of KES ${amount} completed successfully!`);
      onClose();
    } catch (error) {
      const msg = error?.response?.data?.message || 'Transaction failed. Please try again.';
      showError(msg);
    } finally {
      setLoading(false);
    }
  };


  // Kenyan-style recipient verification (Hakikisha) with real API
  const verifyRecipient = async () => {
    if (!recipientDetails) return;

    try {
      showInfo('Verifying recipient details...');

      // Real API call to verify recipient
      const response = await api.post('/api/transactions/verify-recipient', {
        recipientEmail: recipientDetails.email,
        recipientPhone: recipientDetails.phone
      });

      if (response.data.verified && response.data.accountStatus.canReceiveTransfers) {
        setRecipientVerified(true);
        showSuccess('✅ Recipient verified successfully!');
      } else {
        showError(`❌ Could not verify recipient: ${response.data.accountStatus.isBlocked ? 'Account is blocked' : 'Cannot receive transfers'}`);
      }
    } catch (error) {
      console.error('Verification error:', error);
      showError('Verification failed. Please try again.');
    }
  };

  const sendVerificationCode = async () => {
    if (!recipientDetails) return;

    try {
      showInfo('Sending verification code...');

      // Simulate sending verification code
      await new Promise(resolve => setTimeout(resolve, 1500));

      showSuccess('📱 Verification code sent to recipient!');
    } catch (error) {
      showError('Failed to send verification code.');
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

          {/* Recipient Search Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Recipient Search
            </label>
            <div className="space-y-3">
              {/* Search Type Toggle */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRecipientType('phone')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    recipientType === 'phone'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📱 Phone Number
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientType('email')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    recipientType === 'email'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ✉️ Email
                </button>
              </div>

              {/* Search Input */}
              <div className="relative">
                <input
                  type={recipientType === 'phone' ? 'tel' : 'email'}
                  value={recipient}
                  onChange={(e) => handleRecipientSearch(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={recipientType === 'phone' ? 'Enter phone number...' : 'Enter email address...'}
                  required
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showRecipientSearch && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      onClick={() => selectTransferRecipient(result)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-lg">
                        {result.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">{result.name}</h4>
                          {result.vaultUser && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Vault5 User
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {recipientType === 'phone' ? result.phone : result.email}
                          {result.vaultUser && (
                            <span className="ml-2 text-xs text-green-600 font-medium">
                              (Vault5 User)
                            </span>
                          )}
                        </p>
                        {result.vaultUsername && (
                          <p className="text-xs text-blue-600">{result.vaultUsername}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Recipient Details */}
              {recipientDetails && (
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-blue-900 mb-2">Recipient Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-700">{recipientDetails.avatar}</span>
                      <span className="font-medium">{recipientDetails.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-600">Phone:</span>
                      <span>{recipientDetails.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-600">Email:</span>
                      <span>{recipientDetails.email}</span>
                    </div>
                    {recipientDetails.vaultUser && (
                      <div className="flex justify-between">
                        <span className="text-blue-600">Vault5:</span>
                        <span className="text-green-600">{recipientDetails.vaultUsername}</span>
                      </div>
                    )}
                    {!recipientDetails.vaultUser && (
                      <div className="flex justify-between">
                        <span className="text-blue-600">Bank:</span>
                        <span>{recipientDetails.bankName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Kenyan-style Recipient Verification (Hakikisha) */}
              {recipientDetails && !recipientDetails.vaultUser && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                  <div className="font-semibold text-red-800 mb-1">Not a registered Vault5 user</div>
                  <div className="text-sm text-red-700">You can only use this flow to send to Vault users. Use External transfers for telco/bank payouts.</div>
                </div>
              )}
            </div>
          </div>

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
              {recipientDetails && (
                <div className="flex justify-between">
                  <span className="text-gray-600">To:</span>
                  <span className="font-medium">{recipientDetails.name}</span>
                </div>
              )}
              {recipient && !recipientDetails && (
                <div className="flex justify-between">
                  <span className="text-gray-600">To:</span>
                  <span className="font-medium">{recipient}</span>
                </div>
              )}
              {type === 'Bank Transfer' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Fee:</span>
                  <span className="font-medium text-green-600">KES 0.00</span>
                </div>
              )}
              {recipientDetails && recipientDetails.vaultUser && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Recipient:</span>
                  <span className="font-medium text-green-600">Verified Vault5 User</span>
                </div>
              )}
              {recipientDetails && !recipientDetails.vaultUser && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Recipient:</span>
                  <span className="font-medium text-orange-600">External User</span>
                </div>
              )}
            </div>
          </div>

          {/* EMI-style Action Buttons */}
          {/* Password confirmation for Vault-to-Vault */}
          {type === 'Send to Vault User' && recipientDetails?.vaultUser && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm with Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
              <p className="text-xs text-gray-500 mt-1">
                For your security, confirm this transfer with your account password.
              </p>
            </div>
          )}

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
              disabled={loading || !amount || (type === 'Send to Vault User' && (!recipientDetails?.vaultUser || !password))}
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
  const { showSuccess, showError, showInfo } = useToast();
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
