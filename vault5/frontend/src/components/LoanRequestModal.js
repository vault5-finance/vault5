import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
 
const LoanRequestModal = ({ isOpen, onClose, onSubmit, userAccounts = [] }) => {
  const { showError, showSuccess, showInfo } = useToast();
  const [form, setForm] = useState({
    borrowerName: '',
    borrowerContact: '',
    borrowerEmail: '',
    borrowerVaultTag: '',
    amount: '',
    purpose: '',
    repaymentPeriod: '30',
    collateral: '',
    escrowEnabled: false
  });
  const [securityChecks, setSecurityChecks] = useState({
    isKnownContact: false,
    trustScore: 0,
    amountWithinLimits: true,
    dailyLimitCheck: true,
    mfaRequired: false
  });
  const [mfaCode, setMfaCode] = useState('');
  const [mfaVerified, setMfaVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (form.borrowerEmail || form.borrowerVaultTag) {
      checkSecurityRequirements();
    }
  }, [form.borrowerEmail, form.borrowerVaultTag, form.amount]);

  const checkSecurityRequirements = async () => {
    try {
      const response = await api.post('/api/loans/check-security', {
        borrowerEmail: form.borrowerEmail,
        borrowerVaultTag: form.borrowerVaultTag,
        amount: parseFloat(form.amount) || 0
      });

      setSecurityChecks(response.data);

      // Auto-enable MFA for high-risk transactions
      if (response.data.mfaRequired) {
        setSecurityChecks(prev => ({ ...prev, mfaRequired: true }));
      }
    } catch (error) {
      console.error('Security check failed:', error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMfaSubmit = async () => {
    try {
      const response = await api.post('/api/auth/verify-mfa', { code: mfaCode });
      if (response.data.verified) {
        setMfaVerified(true);
        showSuccess('MFA verified');
      } else {
        showError('Invalid MFA code');
      }
    } catch (error) {
      showError('MFA verification failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Security validations
    if (!securityChecks.amountWithinLimits) {
      showError('Loan amount exceeds your available credit limit');
      return;
    }
 
    if (!securityChecks.dailyLimitCheck) {
      showError('Daily loan request limit exceeded');
      return;
    }
 
    if (securityChecks.mfaRequired && !mfaVerified) {
      showInfo('MFA verification required for this transaction');
      return;
    }
 
    setLoading(true);
    try {
      await onSubmit({ ...form, securityChecks });
      onClose();
      showSuccess('Loan request submitted');
    } catch (error) {
      showError('Loan request failed: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Request Loan</h2>
          <p className="text-gray-600 mt-1">Secure loan request with built-in safety checks</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Borrower Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Borrower Name</label>
              <input
                type="text"
                name="borrowerName"
                value={form.borrowerName}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                name="borrowerContact"
                value={form.borrowerContact}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+254..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <input
                type="email"
                name="borrowerEmail"
                value={form.borrowerEmail}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">VaultTag (optional)</label>
              <input
                type="text"
                name="borrowerVaultTag"
                value={form.borrowerVaultTag}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="@username"
              />
            </div>
          </div>

          {/* Loan Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Loan Amount (KES)</label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Repayment Period (days)</label>
              <select
                name="repaymentPeriod"
                value={form.repaymentPeriod}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="180">180 days</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Purpose</label>
            <textarea
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Describe the purpose of this loan..."
              required
            />
          </div>

          {/* Security Checks Display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Security Assessment</h3>
            <div className="space-y-2 text-sm">
              <div className={`flex items-center ${securityChecks.isKnownContact ? 'text-green-600' : 'text-yellow-600'}`}>
                <span className="mr-2">{securityChecks.isKnownContact ? '✓' : '⚠'}</span>
                {securityChecks.isKnownContact ? 'Known contact' : 'Unknown contact - additional verification required'}
              </div>
              <div className="flex items-center text-blue-600">
                <span className="mr-2">📊</span>
                Trust Score: {securityChecks.trustScore}/100
              </div>
              <div className={`flex items-center ${securityChecks.amountWithinLimits ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{securityChecks.amountWithinLimits ? '✓' : '✗'}</span>
                {securityChecks.amountWithinLimits ? 'Amount within limits' : 'Amount exceeds available credit'}
              </div>
              <div className={`flex items-center ${securityChecks.dailyLimitCheck ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{securityChecks.dailyLimitCheck ? '✓' : '✗'}</span>
                {securityChecks.dailyLimitCheck ? 'Daily limit OK' : 'Daily request limit exceeded'}
              </div>
            </div>
          </div>

          {/* Escrow Option */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="escrow"
              name="escrowEnabled"
              checked={form.escrowEnabled}
              onChange={(e) => setForm({ ...form, escrowEnabled: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="escrow" className="ml-2 text-sm">
              Enable escrow protection (recommended for large amounts)
            </label>
          </div>

          {/* MFA Verification */}
          {securityChecks.mfaRequired && !mfaVerified && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">MFA Verification Required</h3>
              <p className="text-sm text-yellow-700 mb-3">
                This transaction requires additional security verification.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="Enter MFA code"
                  className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <button
                  type="button"
                  onClick={handleMfaSubmit}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  Verify
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (securityChecks.mfaRequired && !mfaVerified)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Request Loan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanRequestModal;