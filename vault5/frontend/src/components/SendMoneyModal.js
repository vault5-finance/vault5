import React, { useState } from 'react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const SendMoneyModal = ({ onClose, onSuccess }) => {
  const { showError, showSuccess } = useToast();
  const [step, setStep] = useState(1); // 1: recipient, 2: amount, 3: confirm
  const [loading, setLoading] = useState(false);
  const [recipient, setRecipient] = useState(null);
  const [formData, setFormData] = useState({
    recipientEmail: '',
    recipientPhone: '',
    amount: '',
    description: ''
  });

  const handleRecipientSearch = async () => {
    if (!formData.recipientEmail && !formData.recipientPhone) {
      showError('Please enter recipient email or phone');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/transactions/verify-recipient', {
        recipientEmail: formData.recipientEmail,
        recipientPhone: formData.recipientPhone
      });

      if (response.data.verified) {
        setRecipient(response.data.recipient);
        setStep(2);
      } else {
        showError('Recipient not found or not eligible for transfers');
      }
    } catch (error) {
      showError('Failed to verify recipient');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/transactions/transfer', {
        recipientEmail: formData.recipientEmail,
        recipientPhone: formData.recipientPhone,
        amount: parseFloat(formData.amount),
        description: formData.description || 'P2P Transfer'
      });

      showSuccess('Transfer completed successfully!');
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
    setFormData({
      recipientEmail: '',
      recipientPhone: '',
      amount: '',
      description: ''
    });
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
            <div className="space-y-4">
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
              <div className="text-center text-gray-500">OR</div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.recipientPhone}
                  onChange={(e) => handleInputChange('recipientPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+254XXXXXXXXX"
                />
              </div>
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
                <div>{recipient.name}</div>
                <div className="text-gray-600">{recipient.email || recipient.phone}</div>
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
                disabled={!formData.amount || parseFloat(formData.amount) <= 0}
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
                <span className="font-medium">{recipient.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">KES {parseFloat(formData.amount).toLocaleString()}</span>
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