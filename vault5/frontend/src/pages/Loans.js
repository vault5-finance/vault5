import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import ProgressBar from '../components/ProgressBar';

const Loans = () => {
  const { showError, showSuccess } = useToast();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showRepaymentModal, setShowRepaymentModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [form, setForm] = useState({
    name: '',
    principal: '',
    interestRate: 0,
    repaymentAmount: '',
    frequency: 'monthly',
    nextDueDate: '',
    accountDeduction: '',
    autoDeduct: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    api.get('/api/loans')
    .then(response => {
      setLoans(response.data);
      setLoading(false);
    })
    .catch(error => {
      console.error('Loans data error:', error);
      if (error.response && error.response.status === 401) navigate('/login');
      setLoading(false);
    });
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    api.post('/api/loans', form)
    .then(response => {
      setLoans([response.data, ...loans]);
      setShowForm(false);
      setForm({ name: '', principal: '', interestRate: 0, repaymentAmount: '', frequency: 'monthly', nextDueDate: '', accountDeduction: '', autoDeduct: false });
      showSuccess('Loan created successfully');
    })
    .catch(error => {
      console.error('Create loan error:', error);
      showError(error.response?.data?.message || 'Error creating loan');
    });
  };

  const openRepaymentModal = (loan) => {
    setSelectedLoan(loan);
    setRepaymentAmount(loan.repaymentAmount.toString());
    setShowRepaymentModal(true);
  };

  const makeRepayment = () => {
    if (!selectedLoan || !repaymentAmount || repaymentAmount <= 0) return;

    api.post(`/api/loans/${selectedLoan._id}/repay`, { amount: parseFloat(repaymentAmount) })
    .then(response => {
      setLoans(loans.map(l => l._id === selectedLoan._id ? response.data : l));
      setShowRepaymentModal(false);
      setSelectedLoan(null);
      setRepaymentAmount('');
      showSuccess('Repayment made successfully');
    })
    .catch(error => {
      console.error('Repayment error:', error);
      showError(error.response?.data?.message || 'Error making repayment');
    });
  };

  // Calculate stats
  const stats = React.useMemo(() => {
    const activeLoans = loans.filter(l => l.status === 'active' || l.status === 'pending');
    const totalOutstanding = loans.reduce((sum, loan) => sum + (loan.remainingBalance || 0), 0);
    const nextPayment = loans
      .filter(l => l.status === 'active' || l.status === 'pending')
      .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate))[0];

    return {
      totalActive: activeLoans.length,
      totalOutstanding,
      nextPayment: nextPayment?.nextDueDate
    };
  }, [loans]);

  // Filter and sort loans
  const filteredLoans = React.useMemo(() => {
    let filtered = loans.filter(loan => {
      const matchesSearch = loan.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.nextDueDate) - new Date(b.nextDueDate);
        case 'balance':
          return (b.remainingBalance || 0) - (a.remainingBalance || 0);
        case 'progress':
          return b.progress - a.progress;
        default:
          return 0;
      }
    });

    return filtered;
  }, [loans, searchTerm, statusFilter, sortBy]);

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Loans</h1>
              <p className="text-lg text-gray-600">Track, manage, and repay your loans all in one place.</p>
            </div>
            <motion.button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <PlusIcon className="w-5 h-5" />
              {showForm ? 'Cancel' : 'Add New Loan'}
            </motion.button>
          </div>

          {/* Stats Summary Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CreditCardIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Active Loans</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalActive}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Outstanding Balance</p>
                  <p className="text-2xl font-bold text-gray-900">KES {stats.totalOutstanding.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <ClockIcon className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Next Payment Due</p>
                  <p className="text-lg font-bold text-gray-900">
                    {stats.nextPayment ? new Date(stats.nextPayment).toLocaleDateString() : 'No upcoming payments'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Collapsible Add Loan Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Add New Loan</h2>
                  <p className="text-gray-600 mt-1">Fill in the details to create a new loan</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                  {/* Loan Info Section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <CreditCardIcon className="w-5 h-5" />
                      Loan Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <input
                          type="text"
                          name="name"
                          placeholder="Loan Name (e.g., Bolt Car Loan)"
                          value={form.name}
                          onChange={handleChange}
                          className="w-full p-3 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">KES</span>
                        <input
                          type="number"
                          name="principal"
                          placeholder="Principal Amount"
                          value={form.principal}
                          onChange={handleChange}
                          className="w-full p-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute right-3 top-3 text-gray-500">%</span>
                        <input
                          type="number"
                          name="interestRate"
                          placeholder="Interest Rate"
                          value={form.interestRate}
                          onChange={handleChange}
                          className="w-full p-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Repayment Info Section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <CalendarDaysIcon className="w-5 h-5" />
                      Repayment Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">KES</span>
                        <input
                          type="number"
                          name="repaymentAmount"
                          placeholder="Repayment Amount"
                          value={form.repaymentAmount}
                          onChange={handleChange}
                          className="w-full p-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <select
                        name="frequency"
                        value={form.frequency}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                      <input
                        type="date"
                        name="nextDueDate"
                        value={form.nextDueDate}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      <input
                        type="text"
                        name="accountDeduction"
                        placeholder="Account ID for Deduction (optional)"
                        value={form.accountDeduction}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Options Section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Options</h3>
                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="autoDeduct"
                          checked={form.autoDeduct}
                          onChange={(e) => setForm({ ...form, autoDeduct: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-900">Enable auto-deduction from selected account on due dates</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Create Loan
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter and Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 items-center flex-1">
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search loans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="paid">Paid</option>
                  <option value="defaulted">Defaulted</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="dueDate">Sort by Due Date</option>
                  <option value="balance">Sort by Balance</option>
                  <option value="progress">Sort by Progress</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Showing {filteredLoans.length} of {loans.length} loans
            </div>
          </div>
        </motion.div>

        {/* Loans List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {filteredLoans.length > 0 ? (
            filteredLoans.map((loan, index) => (
              <motion.div
                key={loan._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                whileHover={{ y: -2 }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BanknotesIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{loan.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {loan.status === 'paid' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircleIcon className="w-3 h-3" />
                              Paid
                            </span>
                          )}
                          {loan.status === 'active' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <ClockIcon className="w-3 h-3" />
                              Active
                            </span>
                          )}
                          {loan.status === 'defaulted' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <ExclamationTriangleIcon className="w-3 h-3" />
                              Defaulted
                            </span>
                          )}
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                            {loan.frequency}
                          </span>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      onClick={() => openRepaymentModal(loan)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <BanknotesIcon className="w-4 h-4" />
                      Make Repayment
                    </motion.button>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Payoff Progress</span>
                      <span className="text-sm text-gray-600">{loan.progress?.toFixed(0) || 0}%</span>
                    </div>
                    <ProgressBar
                      progress={loan.progress || 0}
                      color={loan.status === 'paid' ? 'green' : loan.status === 'defaulted' ? 'red' : 'blue'}
                      className="h-3"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Remaining Balance</p>
                      <p className="text-lg font-semibold text-gray-900">KES {(loan.remainingBalance || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Next Due Date</p>
                      <p className="text-lg font-semibold text-gray-900">{new Date(loan.nextDueDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Repayment Amount</p>
                      <p className="text-lg font-semibold text-gray-900">KES {(loan.repaymentAmount || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Auto-Deduct</p>
                      <p className="text-lg font-semibold text-gray-900">{loan.autoDeduct ? 'Enabled' : 'Disabled'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <BanknotesIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No loans found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first loan'
                }
              </p>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  Add Your First Loan
                </button>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Repayment Modal */}
      <AnimatePresence>
        {showRepaymentModal && selectedLoan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowRepaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Make Repayment</h3>
                  <button
                    onClick={() => setShowRepaymentModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Loan: {selectedLoan.name}</p>
                  <p className="text-sm text-gray-600">Default Amount: KES {selectedLoan.repaymentAmount?.toLocaleString()}</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repayment Amount (KES)
                  </label>
                  <input
                    type="number"
                    value={repaymentAmount}
                    onChange={(e) => setRepaymentAmount(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter amount"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRepaymentModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={makeRepayment}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Confirm Payment
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Loans;