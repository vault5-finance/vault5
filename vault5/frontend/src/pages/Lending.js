import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

// New Components
import LoanCard from '../components/LoanCard';
import BatchActionToolbar from '../components/BatchActionToolbar';
import LendingAnalyticsSidebar from '../components/LendingAnalyticsSidebar';
import EnhancedContactLendingModal from '../components/EnhancedContactLendingModal';

const Lending = () => {
  const { showError, showSuccess } = useToast();
  const [lendings, setLendings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userAccounts, setUserAccounts] = useState([]);
  const navigate = useNavigate();

  // New state for enhanced features
  const [analytics, setAnalytics] = useState(null);
  const [overdueSummary, setOverdueSummary] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [processingReminders, setProcessingReminders] = useState(false);
  const [showLoanDetail, setShowLoanDetail] = useState(null);
  const [trustScoreFilter, setTrustScoreFilter] = useState(0);
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });

  // Enhanced filtering
  const filteredLendings = useMemo(() => {
    let filtered = lendings;

    // Status filter
    if (filterStatus === 'all') {
      // No filter
    } else if (filterStatus === 'written_off') {
      filtered = filtered.filter(l => l.status === 'written_off');
    } else if (filterStatus === 'overdue') {
      filtered = filtered.filter(l => l.status === 'overdue');
    } else {
      filtered = filtered.filter(l => l.status === filterStatus);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(l =>
        l.borrowerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.borrowerContact?.includes(searchQuery) ||
        l.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Trust score filter
    if (trustScoreFilter > 0) {
      filtered = filtered.filter(l => (l.securityChecks?.trustScore || 0) >= trustScoreFilter);
    }

    // Amount range filter
    if (amountRange.min) {
      filtered = filtered.filter(l => l.amount >= parseFloat(amountRange.min));
    }
    if (amountRange.max) {
      filtered = filtered.filter(l => l.amount <= parseFloat(amountRange.max));
    }

    return filtered;
  }, [lendings, filterStatus, searchQuery, trustScoreFilter, amountRange]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load lendings
      const lendingsResponse = await api.get('/api/lending');
      setLendings(lendingsResponse.data);

      // Load user accounts
      const accountsResponse = await api.get('/api/accounts');
      setUserAccounts(accountsResponse.data);

      // Load analytics
      const analyticsResponse = await api.get('/api/lending/analytics', { params: { period: 'month' } });
      setAnalytics(analyticsResponse.data);

      // Load overdue summary
      const overdueResponse = await api.get('/api/scheduler/overdue-summary');
      setOverdueSummary(overdueResponse.data.summary);

    } catch (error) {
      console.error('Data loading error:', error);
      if (error.response && error.response.status === 401) navigate('/login');
      showError('Failed to load lending data');
    } finally {
      setLoading(false);
    }
  };

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

  const updateStatus = async (id, status) => {
    try {
      const actualReturnDate = status === 'repaid' ? new Date().toISOString().split('T')[0] : '';
      const response = await api.put(`/api/lending/${id}/status`, { status, actualReturnDate });
      setLendings(lendings.map(l => l._id === id ? response.data : l));
      showSuccess('Status updated successfully');
    } catch (error) {
      console.error('Update status error:', error);
      showError(error.response?.data?.message || 'Error updating status');
    }
  };

  const processOverdueReminders = async () => {
    setProcessingReminders(true);
    try {
      const response = await api.post('/api/scheduler/process-user-overdue');
      showSuccess(`Processed ${response.data.results.processed} overdue reminders`);
      await loadData(); // Refresh all data
    } catch (error) {
      console.error('Process reminders error:', error);
      showError(error.response?.data?.message || 'Error processing reminders');
    } finally {
      setProcessingReminders(false);
    }
  };

  const handleBatchAction = async (action, items) => {
    try {
      if (action === 'remind') {
        // Send batch reminders
        await api.post('/api/scheduler/batch-reminders', { lendingIds: items.map(i => i._id) });
        showSuccess(`Sent reminders to ${items.length} borrowers`);
      } else if (action === 'escalate') {
        // Escalate overdue items
        await api.post('/api/lending/batch-escalate', { lendingIds: items.map(i => i._id) });
        showSuccess(`Escalated ${items.length} overdue items`);
      } else if (action === 'write_off') {
        // Write off as gifts
        await api.post('/api/lending/batch-write-off', { lendingIds: items.map(i => i._id) });
        showSuccess(`Written off ${items.length} items as gifts`);
      }
      await loadData(); // Refresh data
    } catch (error) {
      showError(`Batch ${action} failed: ${error.response?.data?.message || 'Unknown error'}`);
    }
  };

  const toggleItemSelection = (item) => {
    setSelectedItems(prev =>
      prev.find(i => i._id === item._id)
        ? prev.filter(i => i._id !== item._id)
        : [...prev, item]
    );
  };

  const clearSelection = () => setSelectedItems([]);

  const viewLoanDetail = (lending) => {
    setShowLoanDetail(lending);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            {/* Hero Header Skeleton */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded-2xl"></div>
                ))}
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-48 bg-white rounded-2xl shadow-lg"></div>
                ))}
              </div>
              <div className="space-y-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-64 bg-white rounded-2xl shadow-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Hero Header */}
        <header
          role="banner"
          aria-labelledby="lending-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 id="lending-title" className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Lending & Borrowing
              </h1>
              <p className="text-gray-600 text-lg">
                Manage loans with clarity, security, and social trust.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 mt-4 lg:mt-0">
              <motion.button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:from-purple-700 hover:to-blue-700 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🤝 Request from Contact
              </motion.button>

              <motion.button
                onClick={processOverdueReminders}
                disabled={processingReminders}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl hover:from-orange-700 hover:to-red-700 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {processingReminders ? '⏳ Processing...' : '🚨 Process Overdue'}
              </motion.button>
            </div>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Monthly Lent', value: `KES ${(analytics?.totalAmountLent || 0).toLocaleString()}`, icon: '💰' },
              { label: 'Outstanding', value: `KES ${(analytics?.totalOutstanding || 0).toLocaleString()}`, icon: '📊' },
              { label: 'Repayment Rate', value: `${analytics?.repaymentRate || 0}%`, icon: '✅' },
              { label: 'Active Loans', value: analytics?.activeLoans || 0, icon: '📋' }
            ].map((kpi, index) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{kpi.icon}</div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
                    <div className="text-sm text-gray-600">{kpi.label}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          </motion.div>
        </header>

        {/* Main Content Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Primary Content */}
          <section className="lg:col-span-2 space-y-6" aria-labelledby="portfolio-heading">
            {/* Filters and Search */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
                <h2 id="portfolio-heading" className="text-xl font-semibold text-gray-900">Loan Portfolio</h2>

                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <label htmlFor="loan-search" className="sr-only">Search loans by borrower, contact, or notes</label>
                  <input
                    id="loan-search"
                    type="text"
                    placeholder="Search borrowers, contacts, or notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    aria-describedby="search-help"
                  />
                  <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <div id="search-help" className="sr-only">Search across borrower names, contact information, and loan notes</div>
                </div>
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Loan filters">
                {/* Status Filters */}
                <fieldset className="flex gap-2">
                  <legend className="sr-only">Filter loans by status</legend>
                  {[
                    { key: 'all', label: 'All', count: filteredLendings.length },
                    { key: 'pending', label: 'Pending', count: lendings.filter(l => l.status === 'pending').length },
                    { key: 'overdue', label: 'Overdue', count: lendings.filter(l => l.status === 'overdue').length },
                    { key: 'repaid', label: 'Repaid', count: lendings.filter(l => l.status === 'repaid').length }
                  ].map(chip => (
                    <button
                      key={chip.key}
                      onClick={() => setFilterStatus(chip.key)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        filterStatus === chip.key
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      aria-pressed={filterStatus === chip.key}
                      aria-label={`${chip.label} loans (${chip.count} items)`}
                    >
                      {chip.label} ({chip.count})
                    </button>
                  ))}
                </fieldset>

                {/* Advanced Filters */}
                <div className="flex items-center gap-3 ml-4" role="group" aria-label="Advanced filters">
                  <label htmlFor="trust-score-filter" className="sr-only">Filter by trust score</label>
                  <select
                    id="trust-score-filter"
                    value={trustScoreFilter}
                    onChange={(e) => setTrustScoreFilter(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                    aria-describedby="trust-score-help"
                  >
                    <option value={0}>All Trust Scores</option>
                    <option value={80}>High Trust (80+)</option>
                    <option value={60}>Medium Trust (60+)</option>
                  </select>
                  <div id="trust-score-help" className="sr-only">Filter loans by borrower trust score</div>

                  <fieldset className="flex items-center gap-2">
                    <legend className="sr-only">Filter by loan amount range</legend>
                    <label htmlFor="min-amount" className="sr-only">Minimum loan amount</label>
                    <input
                      id="min-amount"
                      type="number"
                      placeholder="Min amount"
                      value={amountRange.min}
                      onChange={(e) => setAmountRange({...amountRange, min: e.target.value})}
                      className="w-24 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                      aria-describedby="amount-range-help"
                    />
                    <span className="text-gray-500" aria-hidden="true">-</span>
                    <label htmlFor="max-amount" className="sr-only">Maximum loan amount</label>
                    <input
                      id="max-amount"
                      type="number"
                      placeholder="Max amount"
                      value={amountRange.max}
                      onChange={(e) => setAmountRange({...amountRange, max: e.target.value})}
                      className="w-24 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                      aria-describedby="amount-range-help"
                    />
                    <div id="amount-range-help" className="sr-only">Filter loans by amount range in Kenyan Shillings</div>
                  </fieldset>
                </div>
              </div>
            </div>

            {/* Loans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence>
                {filteredLendings.map((lending) => (
                  <motion.div
                    key={lending._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative"
                  >
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={selectedItems.some(i => i._id === lending._id)}
                        onChange={() => toggleItemSelection(lending)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                    </div>

                    <LoanCard
                      lending={lending}
                      onStatusUpdate={updateStatus}
                      onViewDetails={viewLoanDetail}
                      showActions={true}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Empty State */}
            {filteredLendings.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100"
              >
                <div className="text-6xl mb-4">📱</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {lendings.length === 0 ? 'No lending history yet' : 'No loans match your filters'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {lendings.length === 0
                    ? 'Start by requesting a loan from someone in your contacts!'
                    : 'Try adjusting your search or filter criteria.'
                  }
                </p>
                {lendings.length === 0 && (
                  <motion.button
                    onClick={() => setShowModal(true)}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:from-purple-700 hover:to-blue-700 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🤝 Request from Contact
                  </motion.button>
                )}
              </motion.div>
            )}
          </section>

          {/* Sidebar */}
          <aside className="lg:col-span-1" aria-label="Lending analytics and insights">
            <LendingAnalyticsSidebar
              analytics={analytics}
              overdueSummary={overdueSummary}
            />
          </aside>
        </main>

        {/* Batch Action Toolbar */}
        <BatchActionToolbar
          selectedItems={selectedItems}
          onBatchAction={handleBatchAction}
          onClearSelection={clearSelection}
        />

        {/* Enhanced Contact Lending Modal */}
        <EnhancedContactLendingModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleLoanRequest}
          userAccounts={userAccounts}
        />

        {/* Loan Detail Drawer - TODO: Implement */}
        <AnimatePresence>
          {showLoanDetail && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowLoanDetail(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Loan Details</h2>
                  <p className="text-gray-600">Detailed loan view coming soon...</p>
                  <button
                    onClick={() => setShowLoanDetail(null)}
                    className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Lending;