import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import ContactBasedLendingModal from '../components/ContactBasedLendingModal';

const Lending = () => {
  const { showError, showSuccess } = useToast();
  const [lendings, setLendings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userAccounts, setUserAccounts] = useState([]);
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [overdueSummary, setOverdueSummary] = useState(null);
  const [processingReminders, setProcessingReminders] = useState(false);

  const filteredLendings = useMemo(() => {
    if (filterStatus === 'all') return lendings;
    if (filterStatus === 'written_off') {
      return lendings.filter(l => l.status === 'written_off');
    }
    return lendings.filter(l => l.status === filterStatus);
  }, [lendings, filterStatus]);

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

  // Monthly analytics summary for top bar
  useEffect(() => {
    api.get('/api/lending/analytics', { params: { period: 'month' } })
      .then(resp => setAnalytics(resp.data))
      .catch(() => {});
  }, [navigate]);

  // Fetch overdue summary
  useEffect(() => {
    api.get('/api/scheduler/overdue-summary')
      .then(resp => setOverdueSummary(resp.data.summary))
      .catch(() => {});
  }, [navigate]);

  const handleLoanRequest = async (loanData) => {
    try {
      const response = await api.post('/api/lending', loanData);
      setLendings([response.data, ...lendings]);
      showSuccess('Lending request created successfully with security verification');
    } catch (error) {
      console.error('Create lending error:', error);
      showError(error.response?.data?.message || 'Error creating lending request');
    }
  };

  const updateStatus = (id, status) => {
    const token = localStorage.getItem('token');
    const actualReturnDate = status === 'repaid' ? new Date().toISOString().split('T')[0] : '';
    api.put(`/api/lending/${id}/status`, { status, actualReturnDate })
    .then(response => {
      setLendings(lendings.map(l => l._id === id ? response.data : l));
      showSuccess('Status updated successfully');
    })
    .catch(error => {
      console.error('Update status error:', error);
      showError(error.response?.data?.message || 'Error updating status');
    });
  };

  const processOverdueReminders = async () => {
    setProcessingReminders(true);
    try {
      const response = await api.post('/api/scheduler/process-user-overdue');
      showSuccess(`Processed ${response.data.results.processed} overdue reminders`);
      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Process reminders error:', error);
      showError(error.response?.data?.message || 'Error processing reminders');
    } finally {
      setProcessingReminders(false);
    }
  };

  if (loading) return <div className="p-8">Loading lendings...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Lending & Borrowing</h1>

      {/* Summary bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <div className="rounded-lg border bg-white p-4">
          <div className="text-xs text-gray-500">Total Lendings</div>
          <div className="text-xl font-semibold">{analytics?.totalLendings ?? 0}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-xs text-gray-500">Amount Lent (This Period)</div>
          <div className="text-xl font-semibold">KES {Number(analytics?.totalAmountLent ?? 0).toLocaleString()}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-xs text-gray-500">Repaid</div>
          <div className="text-xl font-semibold">{analytics?.repaidCount ?? 0}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-xs text-gray-500">Repayment Rate</div>
          <div className="text-xl font-semibold">{analytics?.repaymentRate ?? 0}%</div>
        </div>
      </div>

      {/* Overdue Summary Alert */}
      {overdueSummary && overdueSummary.totalCount > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
            <span>🚨</span> Overdue Reminders
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{overdueSummary.totalCount}</div>
              <div className="text-sm text-red-700">Overdue Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">KES {overdueSummary.totalAmount.toLocaleString()}</div>
              <div className="text-sm text-red-700">Total Amount</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {Math.round(overdueSummary.lendings.reduce((sum, l) => sum + l.daysOverdue, 0) / overdueSummary.totalCount)} days
              </div>
              <div className="text-sm text-red-700">Avg Days Overdue</div>
            </div>
          </div>
          <div className="text-sm text-red-700">
            <strong>Recent overdue items:</strong>
            <ul className="mt-2 space-y-1">
              {overdueSummary.lendings.slice(0, 3).map((lending, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>{lending.borrowerName} - KES {lending.amount.toLocaleString()}</span>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                    {lending.daysOverdue} days overdue
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
          <span>🤝</span> Contact-Based Lending
        </h3>
        <p className="text-sm text-purple-700 mb-3">
          Request loans directly from your contacts! Simply select someone from your phone contacts,
          and we'll automatically verify if they're a Vault5 user and fill in their details.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-purple-600">
          <div className="flex items-center gap-2">
            <span>📱</span> Select from contacts
          </div>
          <div className="flex items-center gap-2">
            <span>✅</span> Auto-verify Vault5 users
          </div>
          <div className="flex items-center gap-2">
            <span>🔒</span> Built-in security checks
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
        >
          🤝 Request Loan from Contact
        </button>
        <button
          onClick={processOverdueReminders}
          disabled={processingReminders}
          className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processingReminders ? '⏳ Processing...' : '🚨 Check Overdue Reminders'}
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Lending History</h2>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'overdue', label: 'Overdue' },
            { key: 'repaid', label: 'Repaid' },
            { key: 'written_off', label: 'Written Off' }
          ].map(chip => (
            <button
              key={chip.key}
              onClick={() => setFilterStatus(chip.key)}
              className={`px-3 py-1.5 rounded-full border transition ${
                filterStatus === chip.key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredLendings.map(lending => (
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
                  {lending.status === 'overdue' && (
                    <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                      {(() => {
                        const daysOverdue = Math.floor((new Date() - new Date(lending.expectedReturnDate)) / (1000 * 60 * 60 * 24));
                        return `${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue`;
                      })()}
                    </span>
                  )}
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

              {lending.status === 'overdue' && (
                <div className="text-xs bg-red-50 p-2 rounded mb-3 border border-red-200">
                  <div className="flex items-center gap-2">
                    <span className="text-red-600">📧</span>
                    <span className="font-medium text-red-800">Reminder Sent:</span>
                    <span className="text-red-700">
                      {(() => {
                        const daysOverdue = Math.floor((new Date() - new Date(lending.expectedReturnDate)) / (1000 * 60 * 60 * 24));
                        return `Overdue reminder sent ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} ago`;
                      })()}
                    </span>
                  </div>
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
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No lending history yet</h3>
            <p className="mb-4">Start by requesting a loan from someone in your contacts!</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              🤝 Request from Contact
            </button>
          </div>
        )}
      </div>

      <ContactBasedLendingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleLoanRequest}
        userAccounts={userAccounts}
      />
    </div>
  );
};

export default Lending;