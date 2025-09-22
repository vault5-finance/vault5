import React, { useState } from 'react';
import { toast } from 'react-toastify';
import WalletRechargeModal from './WalletRechargeModal';
import WalletTransferModal from './WalletTransferModal';

const WalletOverview = ({ wallet, loading, onRecharge, onTransfer }) => {
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const handleRecharge = async (rechargeData) => {
    const result = await onRecharge(rechargeData);
    if (result.success) {
      setShowRechargeModal(false);
    }
  };

  const handleTransfer = async (transferData) => {
    const result = await onTransfer(transferData);
    if (result.success) {
      setShowTransferModal(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-gray-500 mb-4">No wallet found</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => setShowRechargeModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Recharge Wallet</span>
        </button>

        <button
          onClick={() => setShowTransferModal(true)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          <span>Transfer to Account</span>
        </button>
      </div>

      {/* Wallet Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-blue-600 font-medium">Current Balance</div>
          <div className="text-2xl font-bold text-blue-900">
            KES {wallet.balance?.toLocaleString() || '0'}
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-green-600 font-medium">Available Balance</div>
          <div className="text-2xl font-bold text-green-900">
            KES {wallet.availableBalance?.toLocaleString() || '0'}
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm text-purple-600 font-medium">Total Recharged</div>
          <div className="text-2xl font-bold text-purple-900">
            KES {wallet.stats?.totalRecharged?.toLocaleString() || '0'}
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-sm text-orange-600 font-medium">Total Spent</div>
          <div className="text-2xl font-bold text-orange-900">
            KES {wallet.stats?.totalSpent?.toLocaleString() || '0'}
          </div>
        </div>
      </div>

      {/* Wallet Limits */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-3">Wallet Limits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600">Daily Limit</div>
            <div className="text-lg font-semibold">
              KES {wallet.limits?.dailyLimit?.toLocaleString() || '0'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Monthly Limit</div>
            <div className="text-lg font-semibold">
              KES {wallet.limits?.monthlyLimit?.toLocaleString() || '0'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Transaction Limit</div>
            <div className="text-lg font-semibold">
              KES {wallet.limits?.transactionLimit?.toLocaleString() || '0'}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      {wallet.paymentMethods && wallet.paymentMethods.length > 0 && (
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Payment Methods</h3>
          <div className="space-y-2">
            {wallet.paymentMethods.map((method, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    method.isVerified ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  <div>
                    <div className="font-medium capitalize">{method.type}</div>
                    <div className="text-sm text-gray-600">{method.identifier}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {method.isDefault && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      Default
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded ${
                    method.isVerified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {method.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showRechargeModal && (
        <WalletRechargeModal
          wallet={wallet}
          onClose={() => setShowRechargeModal(false)}
          onRecharge={handleRecharge}
        />
      )}

      {showTransferModal && (
        <WalletTransferModal
          wallet={wallet}
          onClose={() => setShowTransferModal(false)}
          onTransfer={handleTransfer}
        />
      )}
    </div>
  );
};

export default WalletOverview;