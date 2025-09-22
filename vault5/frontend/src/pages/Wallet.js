import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import NavBar from '../components/NavBar';
import Sidebar from '../components/Sidebar';
import WalletOverview from '../components/WalletOverview';
import WalletRecharge from '../components/WalletRecharge';
import WalletHistory from '../components/WalletHistory';
import WalletSettings from '../components/WalletSettings';
import walletService from '../services/walletService';

const Wallet = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      setLoading(true);
      const response = await walletService.getWallet();
      if (response.success) {
        setWallet(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to load wallet');
      console.error('Load wallet error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async (rechargeData) => {
    try {
      const response = await walletService.rechargeWallet(rechargeData);
      if (response.success) {
        toast.success('Wallet recharged successfully!');
        await loadWallet(); // Refresh wallet data
        return response;
      } else {
        toast.error(response.message);
        return response;
      }
    } catch (err) {
      toast.error('Failed to recharge wallet');
      console.error('Recharge error:', err);
      return { success: false, message: 'Failed to recharge wallet' };
    }
  };

  const handleTransfer = async (transferData) => {
    try {
      const response = await walletService.transferToAccount(transferData);
      if (response.success) {
        toast.success('Transfer completed successfully!');
        await loadWallet(); // Refresh wallet data
        return response;
      } else {
        toast.error(response.message);
        return response;
      }
    } catch (err) {
      toast.error('Failed to complete transfer');
      console.error('Transfer error:', err);
      return { success: false, message: 'Failed to complete transfer' };
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <WalletOverview
            wallet={wallet}
            loading={loading}
            onRecharge={handleRecharge}
            onTransfer={handleTransfer}
          />
        );
      case 'recharge':
        return (
          <WalletRecharge
            wallet={wallet}
            onRecharge={handleRecharge}
          />
        );
      case 'history':
        return (
          <WalletHistory
            wallet={wallet}
          />
        );
      case 'settings':
        return (
          <WalletSettings
            wallet={wallet}
            onWalletUpdate={loadWallet}
          />
        );
      default:
        return <WalletOverview wallet={wallet} loading={loading} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-6">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <div className="text-red-600 text-lg font-semibold mb-2">Error</div>
                <div className="text-gray-600 mb-4">{error}</div>
                <button
                  onClick={loadWallet}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Digital Wallet</h1>
            <p className="text-gray-600">Manage your digital wallet and transactions</p>
          </div>

          {/* Wallet Balance Card */}
          {wallet && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Wallet Balance</h2>
                  <p className="text-3xl font-bold text-blue-600">
                    KES {wallet.balance?.toLocaleString() || '0'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Available: KES {wallet.availableBalance?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    wallet.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {wallet.status}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    KYC: {wallet.kycLevel}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  { id: 'overview', name: 'Overview' },
                  { id: 'recharge', name: 'Recharge' },
                  { id: 'history', name: 'History' },
                  { id: 'settings', name: 'Settings' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-md">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;