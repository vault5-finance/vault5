import React, { useState, useEffect } from 'react';
import walletService from '../services/walletService';

const WalletHistory = ({ wallet }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0,
    totalRecords: 0
  });
  const [filters, setFilters] = useState({
    type: '',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    loadTransactionHistory();
  }, [filters]);

  const loadTransactionHistory = async () => {
    try {
      setLoading(true);
      const response = await walletService.getWalletHistory(filters);

      if (response.success) {
        setTransactions(response.data.transactions);
        setPagination(response.data.pagination);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to load transaction history');
      console.error('Load history error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'wallet_recharge':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
      case 'wallet_transfer':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        );
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'wallet_recharge':
        return 'text-green-600';
      case 'wallet_transfer':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">Error</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={loadTransactionHistory}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transaction Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="recharge">Recharges</option>
            <option value="transfer">Transfers</option>
          </select>
        </div>
      </div>

      {/* Transaction List */}
      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">No transactions found</div>
          <div className="text-sm text-gray-400">
            {filters.type ? 'Try changing the filters' : 'Start by recharging your wallet'}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getTransactionIcon(transaction.type)}
                  <div>
                    <div className="font-medium text-gray-900">
                      {transaction.description || `${transaction.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(transaction.createdAt)}
                    </div>
                    {transaction.metadata?.paymentMethod && (
                      <div className="text-xs text-gray-400">
                        via {transaction.metadata.paymentMethod.type}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-semibold ${getTransactionColor(transaction.type)}`}>
                    {transaction.type === 'wallet_recharge' ? '+' : '-'}
                    KES {transaction.amount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
                    {transaction.account}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.total > 1 && (
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.current - 1)}
              disabled={pagination.current === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {Array.from({ length: Math.min(5, pagination.total) }, (_, i) => {
              const page = Math.max(1, pagination.current - 2) + i;
              if (page > pagination.total) return null;

              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 text-sm border rounded-md ${
                    page === pagination.current
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(pagination.current + 1)}
              disabled={pagination.current === pagination.total}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Pagination Info */}
      <div className="mt-4 text-center text-sm text-gray-500">
        Showing {transactions.length} of {pagination.totalRecords} transactions
      </div>
    </div>
  );
};

export default WalletHistory;