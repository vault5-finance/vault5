import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';

const EnhancedContactLendingModal = ({
  isOpen,
  onClose,
  onSubmit,
  userAccounts = []
}) => {
  const { showError, showSuccess } = useToast();
  const [step, setStep] = useState(1);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    term: '30', // days
    notes: '',
    escrowEnabled: true,
    mfaRequired: false,
    kycLevel: 1
  });

  // Contact discovery
  useEffect(() => {
    if (isOpen && step === 1) {
      loadContacts();
    }
  }, [isOpen, step]);

  const loadContacts = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would access device contacts
      // For demo, we'll show some mock contacts
      const mockContacts = [
        { id: 1, name: 'John Doe', phone: '+254712345678', isVault5User: true, trustScore: 85 },
        { id: 2, name: 'Jane Smith', phone: '+254798765432', isVault5User: false },
        { id: 3, name: 'Bob Johnson', phone: '+254711111111', isVault5User: true, trustScore: 72 },
        { id: 4, name: 'Alice Brown', phone: '+254722222222', isVault5User: true, trustScore: 91 }
      ];
      setContacts(mockContacts);
    } catch (error) {
      showError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const verifyContact = async (contact) => {
    if (!contact.isVault5User) {
      // Send invitation
      setVerifying(true);
      try {
        await api.post('/api/auth/send-invitation', { phone: contact.phone, name: contact.name });
        showSuccess(`Invitation sent to ${contact.name}`);
      } catch (error) {
        showError('Failed to send invitation');
      } finally {
        setVerifying(false);
      }
      return;
    }

    setSelectedContact(contact);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!selectedContact || !formData.amount) return;

    const loanData = {
      borrowerName: selectedContact.name,
      borrowerContact: selectedContact.phone,
      amount: parseFloat(formData.amount),
      expectedReturnDate: new Date(Date.now() + parseInt(formData.term) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: formData.notes,
      type: 'contact_loan',
      securityChecks: {
        trustScore: selectedContact.trustScore || 0,
        escrowEnabled: formData.escrowEnabled,
        mfaRequired: formData.mfaRequired,
        kycLevel: formData.kycLevel
      },
      sourceAccounts: userAccounts.slice(0, 1).map(acc => ({
        account: acc.type,
        amount: parseFloat(formData.amount)
      }))
    };

    try {
      await onSubmit(loanData);
      onClose();
      resetModal();
    } catch (error) {
      // Error handled by parent
    }
  };

  const resetModal = () => {
    setStep(1);
    setSelectedContact(null);
    setFormData({
      amount: '',
      term: '30',
      notes: '',
      escrowEnabled: true,
      mfaRequired: false,
      kycLevel: 1
    });
  };

  const calculateFees = () => {
    const amount = parseFloat(formData.amount) || 0;
    const escrowFee = formData.escrowEnabled ? amount * 0.02 : 0; // 2% escrow fee
    return { escrowFee, total: amount + escrowFee };
  };

  const fees = calculateFees();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">🤝 Request Loan from Contact</h2>
                <p className="text-purple-100 mt-1">
                  {step === 1 ? 'Select a contact to request a loan from' : 'Configure loan terms and security'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center mt-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= 1 ? 'bg-white text-purple-600' : 'bg-purple-400 text-white'
              }`}>
                1
              </div>
              <div className={`flex-1 h-1 mx-2 ${
                step >= 2 ? 'bg-white' : 'bg-purple-400'
              }`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= 2 ? 'bg-white text-purple-600' : 'bg-purple-400 text-white'
              }`}>
                2
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-96">
            {step === 1 && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📱</span>
                    <div>
                      <h3 className="font-semibold text-blue-900">Contact Access</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        We'll automatically verify which of your contacts are Vault5 users and show their trust scores.
                      </p>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading contacts...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contacts.map((contact) => (
                      <motion.div
                        key={contact.id}
                        className={`border rounded-xl p-4 cursor-pointer transition-all ${
                          contact.isVault5User
                            ? 'border-green-200 bg-green-50 hover:bg-green-100'
                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => verifyContact(contact)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                              {contact.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{contact.name}</div>
                              <div className="text-sm text-gray-600">{contact.phone}</div>
                            </div>
                          </div>

                          <div className="text-right">
                            {contact.isVault5User ? (
                              <div className="flex items-center gap-2">
                                <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                  ✓ Vault5 User
                                </div>
                                {contact.trustScore && (
                                  <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                    🛡️ {contact.trustScore}/100
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                                Invite to Vault5
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 2 && selectedContact && (
              <div className="space-y-6">
                {/* Selected Contact Summary */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {selectedContact.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{selectedContact.name}</div>
                      <div className="text-sm text-gray-600">{selectedContact.phone}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">✓ Verified</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          🛡️ Trust Score: {selectedContact.trustScore}/100
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Loan Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loan Amount (KES)
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="5000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Term (Days)
                    </label>
                    <select
                      value={formData.term}
                      onChange={(e) => setFormData({...formData, term: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="7">7 days</option>
                      <option value="14">14 days</option>
                      <option value="30">30 days</option>
                      <option value="60">60 days</option>
                      <option value="90">90 days</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    placeholder="Purpose of the loan..."
                  />
                </div>

                {/* Security Options */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Security & Verification</h4>

                  <div className="space-y-2">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.escrowEnabled}
                        onChange={(e) => setFormData({...formData, escrowEnabled: e.target.checked})}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <div>
                        <div className="font-medium text-gray-900">Enable Escrow Protection</div>
                        <div className="text-sm text-gray-600">Funds held securely until repayment (2% fee)</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.mfaRequired}
                        onChange={(e) => setFormData({...formData, mfaRequired: e.target.checked})}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <div>
                        <div className="font-medium text-gray-900">Require MFA on Repayment</div>
                        <div className="text-sm text-gray-600">Extra security for loan repayment</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Fee Summary */}
                {formData.amount && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Fee Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Loan Amount:</span>
                        <span>KES {parseFloat(formData.amount).toLocaleString()}</span>
                      </div>
                      {formData.escrowEnabled && (
                        <div className="flex justify-between">
                          <span>Escrow Fee (2%):</span>
                          <span>KES {fees.escrowFee.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="border-t pt-1 flex justify-between font-medium">
                        <span>Total:</span>
                        <span>KES {fees.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 flex justify-between">
            <button
              onClick={() => step === 2 ? setStep(1) : onClose()}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              {step === 2 ? '← Back' : 'Cancel'}
            </button>

            {step === 2 && (
              <motion.button
                onClick={handleSubmit}
                disabled={!formData.amount}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Send Loan Request
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EnhancedContactLendingModal;