import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

export default function Subscriptions() {
  const { showError, showSuccess } = useToast();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    merchantName: '',
    merchantUrl: '',
    amount: '',
    interval: 'monthly',
    paymentSource: 'wallet',
    paymentMethodId: '',
    description: ''
  });
  const [cards, setCards] = useState([]);

  useEffect(() => {
    fetchSubscriptions();
    fetchCards();
  }, []);

  async function fetchSubscriptions() {
    try {
      setLoading(true);
      const { data } = await api.get('/api/subscriptions');
      setSubscriptions(data || []);
    } catch (e) {
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCards() {
    try {
      const { data } = await api.get('/api/payment-methods/cards');
      setCards(data || []);
    } catch (e) {
      setCards([]);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.post('/api/subscriptions', formData);
      showSuccess('Subscription created');
      setShowCreateModal(false);
      setFormData({
        merchantName: '',
        merchantUrl: '',
        amount: '',
        interval: 'monthly',
        paymentSource: 'wallet',
        paymentMethodId: '',
        description: ''
      });
      fetchSubscriptions();
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to create subscription');
    }
  }

  async function handleCancel(id) {
    if (!confirm('Cancel this subscription?')) return;
    try {
      await api.patch(`/api/subscriptions/${id}/cancel`);
      showSuccess('Subscription canceled');
      fetchSubscriptions();
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to cancel subscription');
    }
  }

  async function handleResume(id) {
    try {
      await api.patch(`/api/subscriptions/${id}/resume`);
      showSuccess('Subscription resumed');
      fetchSubscriptions();
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to resume subscription');
    }
  }

  async function handleChargeNow(id) {
    try {
      const { data } = await api.post(`/api/subscriptions/${id}/charge-now`);
      showSuccess(data.message);
      fetchSubscriptions();
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to charge subscription');
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
            <p className="mt-2 text-gray-600">
              Manage recurring payments and subscriptions using your wallet or linked cards.
            </p>
          </div>

          {/* Create Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Add Subscription
            </button>
          </div>

          {/* Subscriptions List */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-600">Loading...</div>
            ) : subscriptions.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                No subscriptions yet. Click "Add Subscription" to create one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Merchant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Interval
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Next Billing
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subscriptions.map((sub) => (
                      <tr key={sub._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{sub.merchantName}</div>
                          {sub.merchantUrl && (
                            <div className="text-sm text-gray-500">
                              <a href={sub.merchantUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {sub.merchantUrl}
                              </a>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sub.currency} {sub.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {sub.interval}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            sub.status === 'active' ? 'bg-green-100 text-green-800' :
                            sub.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                            sub.status === 'canceled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {sub.status === 'active' && (
                            <>
                              <button
                                onClick={() => handleChargeNow(sub._id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Charge Now
                              </button>
                              <button
                                onClick={() => handleCancel(sub._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {sub.status === 'paused' && (
                            <button
                              onClick={() => handleResume(sub._id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Resume
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Subscription Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Subscription</h3>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Merchant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.merchantName}
                    onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Merchant URL
                  </label>
                  <input
                    type="url"
                    value={formData.merchantUrl}
                    onChange={(e) => setFormData({ ...formData, merchantUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (KES) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Billing Interval *
                  </label>
                  <select
                    value={formData.interval}
                    onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Source *
                  </label>
                  <select
                    value={formData.paymentSource}
                    onChange={(e) => setFormData({ ...formData, paymentSource: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="wallet">Wallet</option>
                    <option value="card">Card</option>
                  </select>
                </div>
                {formData.paymentSource === 'card' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Card *
                    </label>
                    <select
                      required={formData.paymentSource === 'card'}
                      value={formData.paymentMethodId}
                      onChange={(e) => setFormData({ ...formData, paymentMethodId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose a card</option>
                      {cards.map((card) => (
                        <option key={card._id} value={card._id}>
                          {card.brand} •••• {card.last4}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}