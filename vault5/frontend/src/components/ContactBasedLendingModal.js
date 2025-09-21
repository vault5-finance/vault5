import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const ContactBasedLendingModal = ({ isOpen, onClose, onSubmit, userAccounts = [] }) => {
  const { showError, showSuccess, showInfo } = useToast();
  const [step, setStep] = useState(1); // 1: Select Contact, 2: Loan Details, 3: Confirmation
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
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

  // Mock contacts data - in real app, this would come from device contacts API
  useEffect(() => {
    if (isOpen) {
      loadContacts();
    }
  }, [isOpen]);

  const loadContacts = async () => {
    setLoading(true);
    try {
      // Simulate loading contacts from device
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock contacts data
      const mockContacts = [
        {
          id: 1,
          name: 'John Doe',
          phone: '+254712345678',
          email: 'john.doe@email.com',
          vaultUser: true,
          vaultUsername: '@johndoe',
          avatar: '👨‍💼',
          trustScore: 85
        },
        {
          id: 2,
          name: 'Sarah Wilson',
          phone: '+254723456789',
          email: 'sarah.wilson@email.com',
          vaultUser: true,
          vaultUsername: '@sarahw',
          avatar: '👩‍💻',
          trustScore: 92
        },
        {
          id: 3,
          name: 'Mike Johnson',
          phone: '+254734567890',
          email: 'mike.j@email.com',
          vaultUser: false,
          avatar: '👨‍🔬',
          trustScore: 0
        },
        {
          id: 4,
          name: 'Emma Brown',
          phone: '+254745678901',
          email: 'emma.brown@email.com',
          vaultUser: true,
          vaultUsername: '@emmab',
          avatar: '👩‍🎨',
          trustScore: 78
        },
        {
          id: 5,
          name: 'David Kimani',
          phone: '+254756789012',
          email: 'david.kimani@email.com',
          vaultUser: true,
          vaultUsername: '@dkimani',
          avatar: '👨‍🏫',
          trustScore: 88
        }
      ];

      setContacts(mockContacts);
    } catch (error) {
      showError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm)
  );

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    setStep(2);

    // Auto-fill form with contact details
    setForm(prev => ({
      ...prev,
      borrowerName: contact.name,
      borrowerContact: contact.phone,
      borrowerEmail: contact.email,
      borrowerVaultTag: contact.vaultUsername
    }));

    // Check security for this contact
    checkSecurityRequirements(contact);
  };

  const checkSecurityRequirements = async (contact) => {
    try {
      const response = await api.post('/api/loans/check-security', {
        borrowerEmail: contact.email,
        borrowerVaultTag: contact.vaultUsername,
        amount: parseFloat(form.amount) || 0,
        isVaultUser: contact.vaultUser
      });

      setSecurityChecks(response.data);
    } catch (error) {
      console.error('Security check failed:', error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'amount' && selectedContact) {
      checkSecurityRequirements(selectedContact);
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

    setLoading(true);
    try {
      await onSubmit({
        ...form,
        borrowerName: selectedContact.name,
        borrowerContact: selectedContact.phone,
        borrowerEmail: selectedContact.email,
        borrowerVaultTag: selectedContact.vaultUsername,
        securityChecks
      });

      onClose();
      showSuccess('Loan request submitted successfully!');
    } catch (error) {
      showError('Loan request failed: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setSelectedContact(null);
    setSearchTerm('');
    setForm({
      amount: '',
      purpose: '',
      repaymentPeriod: '30',
      collateral: '',
      escrowEnabled: false
    });
    setSecurityChecks({
      isKnownContact: false,
      trustScore: 0,
      amountWithinLimits: true,
      dailyLimitCheck: true,
      mfaRequired: false
    });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* EMI-style Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🤝</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {step === 1 && 'Select Contact'}
                  {step === 2 && 'Loan Details'}
                  {step === 3 && 'Confirm Request'}
                </h2>
                <p className="text-purple-100 text-sm">
                  {step === 1 && 'Choose someone from your contacts to lend to'}
                  {step === 2 && 'Enter loan details and terms'}
                  {step === 3 && 'Review and submit your loan request'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-purple-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center mt-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= stepNum
                    ? 'bg-white text-purple-600'
                    : 'bg-white bg-opacity-30 text-white'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step > stepNum ? 'bg-white' : 'bg-white bg-opacity-30'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Contact Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search Contacts
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Search by name or phone number..."
                />
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading contacts...</p>
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📱</div>
                    <p>No contacts found</p>
                  </div>
                ) : (
                  filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      onClick={() => handleContactSelect(contact)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-colors"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center text-xl">
                        {contact.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                          {contact.vaultUser && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Vault5 User
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{contact.phone}</p>
                        {contact.vaultUsername && (
                          <p className="text-xs text-purple-600">{contact.vaultUsername}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Trust Score</div>
                        <div className="text-sm font-semibold text-gray-700">
                          {contact.trustScore}/100
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Step 2: Loan Details */}
          {step === 2 && selectedContact && (
            <form onSubmit={() => setStep(3)} className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">Borrower Details</h3>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedContact.avatar}</span>
                  <div>
                    <p className="font-medium">{selectedContact.name}</p>
                    <p className="text-sm text-gray-600">{selectedContact.phone}</p>
                    {selectedContact.vaultUsername && (
                      <p className="text-xs text-purple-600">{selectedContact.vaultUsername}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Loan Amount (KES)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Repayment Period
                  </label>
                  <select
                    name="repaymentPeriod"
                    value={form.repaymentPeriod}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                    <option value="90">90 days</option>
                    <option value="180">180 days</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Purpose
                </label>
                <textarea
                  name="purpose"
                  value={form.purpose}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="3"
                  placeholder="Describe the purpose of this loan..."
                  required
                />
              </div>

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

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700"
                >
                  Continue
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && selectedContact && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-3">Loan Request Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Borrower:</span>
                    <span className="font-medium">{selectedContact.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">KES {form.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Period:</span>
                    <span className="font-medium">{form.repaymentPeriod} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Purpose:</span>
                    <span className="font-medium">{form.purpose}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl">
                <h3 className="font-semibold text-blue-900 mb-2">Security Assessment</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center text-blue-700">
                    <span className="mr-2">✓</span>
                    {selectedContact.vaultUser ? 'Verified Vault5 User' : 'Non-Vault5 User'}
                  </div>
                  <div className="flex items-center text-blue-700">
                    <span className="mr-2">📊</span>
                    Trust Score: {selectedContact.trustScore}/100
                  </div>
                  {form.escrowEnabled && (
                    <div className="flex items-center text-blue-700">
                      <span className="mr-2">🔒</span>
                      Escrow Protection Enabled
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Loan Request'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactBasedLendingModal;