import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const SendMoneyModal = ({ onClose, onSuccess }) => {
  const { showError, showSuccess } = useToast();

  // Steps: 1: choose recipient, 2: amount/fees, 3: confirm
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Mode enforces ONE identifier
  const [mode, setMode] = useState('email'); // 'email' | 'phone'
  const [recipient, setRecipient] = useState(null); // response.recipient + flags
  const [international, setInternational] = useState(false);
  // Source of funds and security
  const [source, setSource] = useState('wallet'); // 'wallet' | 'account' (future)
  const [password, setPassword] = useState('');

  const [formData, setFormData] = useState({
    recipientEmail: '',
    recipientPhone: '',
    amount: '',
    description: ''
  });

  // Fees preview
  const [feePreview, setFeePreview] = useState({ fee: 0, total: 0, breakdown: [], transferType: 'vault', network: null });
  const amountNumber = useMemo(() => Number(formData.amount || 0), [formData.amount]);

  useEffect(() => {
    // Reset opposite field when switching mode
    if (mode === 'email') {
      setFormData(prev => ({ ...prev, recipientPhone: '' }));
    } else {
      setFormData(prev => ({ ...prev, recipientEmail: '' }));
    }
    setRecipient(null);
    setStep(1);
  }, [mode]);

  const handleRecipientSearch = async () => {
    // Enforce single identifier by mode
    if (mode === 'email' && !formData.recipientEmail) {
      showError('Enter recipient email');
      return;
    }
    if (mode === 'phone' && !formData.recipientPhone) {
      showError('Enter recipient phone');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        mode,
        recipientEmail: mode === 'email' ? formData.recipientEmail : undefined,
        recipientPhone: mode === 'phone' ? formData.recipientPhone : undefined
      };
      const response = await api.post('/api/transactions/verify-recipient', payload);

      // For email mode: must be vault user or block
      if (mode === 'email' && response.data.vaultUser !== true) {
        showError('No Vault5 user with this email. Recheck and try again.');
        return;
      }
      setRecipient({
        ...response.data.recipient,
        vaultUser: !!response.data.vaultUser,
        canProceed: response.data.canProceed !== false,
        foundBy: response.data.foundBy || mode,
        network: response.data.recipient?.network || (response.data.fees?.network || null)
      });

      if (response.data.canProceed === false) {
        showError(response.data.message || 'Recipient cannot receive transfers at the moment.');
        return;
      }

      setStep(2);
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to verify recipient';
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Compute fees in real-time after amount entry and recipient known
  useEffect(() => {
    const run = async () => {
      if (!recipient || !(amountNumber > 0)) {
        setFeePreview({ fee: 0, total: amountNumber || 0, breakdown: [], transferType: 'vault', network: null });
        return;
      }
      try {
        const transferType = recipient.vaultUser ? 'vault' : 'external';
        const body = {
          amount: amountNumber,
          transferType,
          network: recipient.network || undefined,
          international: Boolean(international)
        };
        const { data } = await api.post('/api/transactions/calculate-fees', body);
        setFeePreview({
          fee: data.fee || 0,
          total: data.total || amountNumber,
          breakdown: data.breakdown || [],
          transferType,
          network: body.network || null
        });
      } catch {
        setFeePreview({ fee: 0, total: amountNumber, breakdown: [], transferType: recipient.vaultUser ? 'vault' : 'external', network: recipient.network || null });
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountNumber, recipient, international]);

  const handleTransfer = async () => {
    if (!(amountNumber > 0)) {
      showError('Enter a valid amount');
      return;
    }
    if (!recipient) {
      showError('Verify a recipient first');
      return;
    }
    // Require password for Vault-to-Vault as an extra security step
    if (recipient.vaultUser && !password) {
      showError('Enter your password to confirm');
      return;
    }
    setLoading(true);
    try {
      // Vault-to-Vault - money goes to recipient's main wallet first
      if (recipient.vaultUser) {
        await api.post('/api/transactions/transfer', {
          recipientEmail: mode === 'email' ? formData.recipientEmail : undefined,
          recipientPhone: mode === 'phone' ? formData.recipientPhone : undefined,
          amount: amountNumber,
          description: formData.description || 'P2P Transfer',
          source, // wallet by default
          password,
          transferToWallet: true // Ensure funds go to main wallet first
        });
        showSuccess('Transfer completed! Funds deposited to recipient\'s main wallet.');
        onSuccess && onSuccess();
        onClose();
        return;
      }

      // External transfer via telco/bank rails
      await api.post('/api/transactions/transfer/external', {
        recipientPhone: formData.recipientPhone,
        amount: amountNumber,
        description: formData.description || 'P2P External',
        international: Boolean(international)
      });
      showSuccess('External transfer initiated successfully!');
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      showError(error.response?.data?.message || 'Transfer failed');
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

  const resetModal = () => {
    setStep(1);
    setRecipient(null);
    setInternational(false);
    setFormData({
      recipientEmail: '',
      recipientPhone: '',
      amount: '',
      description: ''
    });
    setFeePreview({ fee: 0, total: 0, breakdown: [], transferType: 'vault', network: null });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Send Money</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {step === 1 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Find Recipient</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search by</label>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="text-blue-600"
                    checked={mode === 'email'}
                    onChange={() => setMode('email')}
                  />
                  <span className="ml-2 text-sm">Email</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="text-blue-600"
                    checked={mode === 'phone'}
                    onChange={() => setMode('phone')}
                  />
                  <span className="ml-2 text-sm">Phone</span>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              {mode === 'email' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.recipientEmail}
                    onChange={(e) => handleInputChange('recipientEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="recipient@example.com"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.recipientPhone}
                    onChange={(e) => handleInputChange('recipientPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+2547XXXXXXXX"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleRecipientSearch}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Find Recipient'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && recipient && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Transfer Details</h3>

            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <div className="text-sm">
                <div className="font-medium">Recipient</div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{recipient.avatar || '👤'}</span>
                  <div>
                    <div>{recipient.name || (recipient.phone ? 'External Recipient' : 'Recipient')}</div>
                    <div className="text-gray-600">
                      {recipient.email || recipient.phone || ''}
                      {!recipient.vaultUser && recipient.network ? ` • ${recipient.network}` : ''}
                    </div>
                  </div>
                </div>
                {!recipient.vaultUser && (
                  <div className="mt-2">
                    <label className="inline-flex items-center text-xs text-gray-700">
                      <input
                        type="checkbox"
                        checked={international}
                        onChange={(e) => setInternational(e.target.checked)}
                        className="mr-2"
                      />
                      International transfer
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
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
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What's this for?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                <div className="flex items-center gap-4 text-sm">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="text-blue-600"
                      checked={source === 'wallet'}
                      onChange={() => setSource('wallet')}
                    />
                    <span className="ml-2">Vault Wallet (default)</span>
                  </label>
                  <label className="inline-flex items-center opacity-70 cursor-not-allowed" title="Send from Account coming soon">
                    <input
                      type="radio"
                      className="text-blue-600"
                      checked={source === 'account'}
                      onChange={() => setSource('account')}
                      disabled
                    />
                    <span className="ml-2">From Account</span>
                  </label>
                </div>
              </div>

              {/* Fee Preview */}
              {amountNumber > 0 && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded">
                  <div className="flex justify-between text-sm">
                    <span>Transfer Type</span>
                    <span className="font-medium">
                      {feePreview.transferType === 'vault' ? 'Vault → Vault' : (international ? 'External (Intl)' : 'External')}
                      {feePreview.network ? ` • ${feePreview.network}` : ''}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Fees</span>
                    <span className="font-medium">KES {Number(feePreview.fee || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Total</span>
                    <span className="font-semibold">KES {Number(feePreview.total || amountNumber).toFixed(2)}</span>
                  </div>
                  {feePreview.breakdown && feePreview.breakdown.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      {feePreview.breakdown.map((b, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{b.label}</span>
                          <span>KES {Number(b.value || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!(amountNumber > 0)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && recipient && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Confirm Transfer</h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Recipient:</span>
                <span className="font-medium">{recipient.name || recipient.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">KES {amountNumber.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fees:</span>
                <span className="font-medium">KES {Number(feePreview.fee || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold">KES {Number(feePreview.total || amountNumber).toLocaleString()}</span>
              </div>
              {formData.description && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Description:</span>
                  <span className="font-medium">{formData.description}</span>
                </div>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-6">
              <div className="text-sm text-yellow-800">
                <div className="font-medium">⚠️ Transfer Notice</div>
                <div>This action cannot be undone. Please verify the details before proceeding.</div>
              </div>
            </div>

            {/* Password confirmation for Vault-to-Vault */}
            {recipient.vaultUser && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm with Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                />
              </div>
            )}
            <div className="flex space-x-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Back
              </button>
              <button
                onClick={handleTransfer}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Send Money'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SendMoneyModal;