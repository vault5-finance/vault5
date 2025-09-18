import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Banking = () => {
  const navigate = useNavigate();
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      // Check if user has Plaid connection
      const response = await api.get('/api/plaid/transactions');
      if (response.data.transactions) {
        setConnected(true);
        setTransactions(response.data.transactions.slice(0, 5)); // Show last 5 transactions
      }
    } catch (error) {
      // Not connected yet
      setConnected(false);
    }
  };

  const connectBankAccount = async () => {
    setLoading(true);
    try {
      // Get link token from backend
      const response = await api.post('/api/plaid/link-token');
      const linkToken = response.data.link_token;

      // Load Plaid Link script dynamically
      const script = document.createElement('script');
      script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
      script.onload = () => {
        const handler = window.Plaid.create({
          token: linkToken,
          onSuccess: async (public_token, metadata) => {
            try {
              // Exchange public token for access token
              await api.post('/api/plaid/exchange-token', { public_token });
              setConnected(true);
              await checkConnectionStatus();
              alert('Bank account connected successfully!');
            } catch (error) {
              alert('Failed to connect bank account');
            }
          },
          onExit: (err, metadata) => {
            if (err) {
              console.error('Plaid Link error:', err);
            }
          },
        });
        handler.open();
      };
      document.head.appendChild(script);
    } catch (error) {
      alert('Failed to initialize bank connection');
    } finally {
      setLoading(false);
    }
  };

  const syncTransactions = async () => {
    setLoading(true);
    try {
      await api.get('/api/plaid/transactions');
      await checkConnectionStatus();
      alert('Transactions synced successfully!');
    } catch (error) {
      alert('Failed to sync transactions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bank Account Integration</h1>
          <p className="mt-2 text-gray-600">
            Connect your bank accounts to automatically import transactions and track your spending.
          </p>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Connection Status</h2>
              <p className={`mt-1 text-sm ${connected ? 'text-green-600' : 'text-gray-600'}`}>
                {connected ? '✅ Bank account connected' : '❌ No bank account connected'}
              </p>
            </div>
            <div>
              {!connected ? (
                <button
                  onClick={connectBankAccount}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Connecting...' : 'Connect Bank Account'}
                </button>
              ) : (
                <button
                  onClick={syncTransactions}
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Syncing...' : 'Sync Transactions'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        {connected && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h2>
            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((transaction, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{transaction.name}</p>
                      <p className="text-sm text-gray-600">{transaction.date}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">{transaction.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No transactions found. Try syncing your account.</p>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits of Bank Integration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-bold">✓</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Automatic Transaction Import</h3>
                <p className="text-sm text-gray-600">No more manual entry - transactions sync automatically.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm font-bold">✓</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Real-time Balance Updates</h3>
                <p className="text-sm text-gray-600">See your account balances update in real-time.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-sm font-bold">✓</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Smart Categorization</h3>
                <p className="text-sm text-gray-600">Transactions are automatically categorized for better insights.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-sm font-bold">✓</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Enhanced Security</h3>
                <p className="text-sm text-gray-600">Bank-level encryption and secure data handling.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banking;