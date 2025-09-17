import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoanRequestModal from '../components/LoanRequestModal';

const Lending = () => {
  const [lendings, setLendings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userAccounts, setUserAccounts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    api.get('/api/lending')
    .then(response => {
      setLendings(response.data);
      setLoading(false);
    })
    .catch(error => {
      console.error('Lending data error:', error);
      if (error.response && error.response.status === 401) navigate('/login');
      setLoading(false);
    });

    // Also fetch user accounts for security checks
    api.get('/api/accounts')
    .then(response => {
      setUserAccounts(response.data);
    })
    .catch(error => {
      console.error('Accounts fetch error:', error);
    });
  }, [navigate]);

  const handleLoanRequest = async (loanData) => {
    try {
      const response = await api.post('/api/lending', loanData);
      setLendings([response.data, ...lendings]);
      alert('Lending request created successfully with security verification');
    } catch (error) {
      console.error('Create lending error:', error);
      alert(error.response?.data?.message || 'Error creating lending request');
    }
  };

  const updateStatus = (id, status) => {
    const token = localStorage.getItem('token');
    const actualReturnDate = status === 'repaid' ? new Date().toISOString().split('T')[0] : '';
    api.put(`/api/lending/${id}/status`, { status, actualReturnDate })
    .then(response => {
      setLendings(lendings.map(l => l._id === id ? response.data : l));
      alert('Status updated successfully');
    })
    .catch(error => {
      console.error('Update status error:', error);
      alert(error.response?.data?.message || 'Error updating status');
    });
  };

  if (loading) return <div className="p-8">Loading lendings...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Lending & Borrowing</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-800 mb-2">Security Notice</h3>
        <p className="text-sm text-blue-700">
          All lending requests include automatic security verification including contact validation,
          trust scoring, amount limits, and MFA for high-value transactions.
        </p>
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-8 font-medium"
      >
        New Secure Lending Request
      </button>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Lending History</h2>
        <div className="space-y-4">
          {lendings.map(lending => (
            <div key={lending._id} className={`border p-4 rounded-lg ${lending.status === 'repaid' ? 'border-green-300 bg-green-50' : lending.status === 'overdue' ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium">{lending.borrowerName}</div>
                  <div className="text-sm text-gray-600">{lending.borrowerContact}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">KES {lending.amount.toFixed(2)}</div>
                  <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                    lending.status === 'repaid' ? 'bg-green-100 text-green-800' :
                    lending.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    lending.status === 'written_off' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {lending.status.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                <div>
                  <span className="font-medium">Type:</span> {lending.type}
                </div>
                <div>
                  <span className="font-medium">Expected Return:</span> {new Date(lending.expectedReturnDate).toLocaleDateString()}
                </div>
              </div>

              {lending.notes && (
                <div className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">Notes:</span> {lending.notes}
                </div>
              )}

              {lending.sourceAccounts && lending.sourceAccounts.length > 0 && (
                <div className="text-xs text-gray-600 mb-3">
                  <span className="font-medium">Fund Sources:</span> {lending.sourceAccounts.map(s => `${s.account} (KES ${s.amount.toFixed(2)})`).join(', ')}
                </div>
              )}

              {lending.securityChecks && (
                <div className="text-xs bg-gray-50 p-2 rounded mb-3">
                  <span className="font-medium">Security:</span> Trust Score {lending.securityChecks.trustScore}/100
                  {lending.securityChecks.mfaRequired && ' • MFA Required'}
                  {lending.securityChecks.escrowEnabled && ' • Escrow Protected'}
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  Created: {new Date(lending.createdAt).toLocaleDateString()}
                </div>
                <select
                  onChange={(e) => updateStatus(lending._id, e.target.value)}
                  defaultValue={lending.status}
                  className="p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="repaid">Mark as Repaid</option>
                  <option value="written_off">Write Off as Gift</option>
                  <option value="overdue">Mark as Overdue</option>
                </select>
              </div>
            </div>
          ))}
        </div>
        {lendings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">🤝</div>
            <p>No lending history yet. Create your first secure lending request above.</p>
          </div>
        )}
      </div>

      <LoanRequestModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleLoanRequest}
        userAccounts={userAccounts}
      />
    </div>
  );
};

export default Lending;