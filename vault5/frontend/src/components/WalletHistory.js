import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import api from '../services/api';

const WalletHistory = ({ walletId, limit = 50 }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedTransaction, setExpandedTransaction] = useState(null);

  const itemsPerPage = 10;

  useEffect(() => {
    loadTransactions();
  }, [walletId, currentPage]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: limit.toString(),
        page: currentPage.toString(),
        sortBy,
        sortOrder
      });

      const response = await api.get(`/api/wallet/transactions?${params}`);
      if (response.data && response.data.success) {
        setTransactions(response.data.transactions || []);
      }
    } catch (err) {
      setError('Failed to load transactions');
      console.error('Transactions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = !searchQuery ||
        transaction.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.reference?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = filterType === 'all' || transaction.type === filterType;
      const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [transactions, searchQuery, filterType, filterStatus]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'credit':
        return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      case 'debit':
        return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      default:
        return <DollarSign className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatCurrency = (amount) => `KES ${Math.abs(amount)?.toLocaleString() || '0'}`;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="text-center text-gray-500">
          <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="mb-4">{error}</p>
          <button
            onClick={loadTransactions}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <History className="w-5 h-5" />
              Transaction History
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {filteredTransactions.length} transactions found
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadTransactions}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Export"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="credit">Credits</option>
            <option value="debit">Debits</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Transaction List */}
      <div className="divide-y divide-gray-100">
        <AnimatePresence>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction, index) => (
              <motion.div
                key={transaction._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setExpandedTransaction(
                  expandedTransaction === transaction._id ? null : transaction._id
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {getTypeIcon(transaction.type)}
                    </div>

                    <div>
                      <div className="font-medium text-gray-900">
                        {transaction.description || 'Transaction'}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {formatDate(transaction.createdAt)}
                        {transaction.reference && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {transaction.reference}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`font-semibold ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${getStatusColor(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        {transaction.status}
                      </div>
                    </div>

                    {expandedTransaction === transaction._id ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedTransaction === transaction._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-100"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Transaction ID:</span>
                          <div className="text-gray-600 font-mono text-xs mt-1">
                            {transaction._id}
                          </div>
                        </div>

                        {transaction.paymentMethod && (
                          <div>
                            <span className="font-medium text-gray-700">Payment Method:</span>
                            <div className="text-gray-600 mt-1 capitalize">
                              {transaction.paymentMethod.type} - {transaction.paymentMethod.identifier}
                            </div>
                          </div>
                        )}

                        {transaction.fees && transaction.fees > 0 && (
                          <div>
                            <span className="font-medium text-gray-700">Fees:</span>
                            <div className="text-gray-600 mt-1">
                              {formatCurrency(transaction.fees)}
                            </div>
                          </div>
                        )}

                        {transaction.metadata && (
                          <div>
                            <span className="font-medium text-gray-700">Additional Info:</span>
                            <div className="text-gray-600 mt-1">
                              {JSON.stringify(transaction.metadata, null, 2)}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center text-gray-500"
            >
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No transactions found</p>
              <p className="text-sm">
                {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Your transaction history will appear here'
                }
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {filteredTransactions.length > itemsPerPage && (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredTransactions.length)} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of{' '}
              {filteredTransactions.length} transactions
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <span className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
                {currentPage}
              </span>

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage * itemsPerPage >= filteredTransactions.length}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletHistory;