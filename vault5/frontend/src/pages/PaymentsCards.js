import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

export default function PaymentsCards() {
  const { showError, showSuccess } = useToast();
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState([]);
  const [supported, setSupported] = useState({ stripe: false, publishableKey: null });

  useEffect(() => {
    // Preload linked cards list (placeholder: will be wired to /api/payment-methods/cards)
    fetchCards();
    // Discover Stripe config (placeholder: will use /api/payment-methods/stripe/config)
    fetchStripeConfig();
  }, []);

  async function fetchCards() {
    try {
      setLoading(true);
      // Placeholder until backend endpoints exist
      // const { data } = await api.get('/api/payment-methods/cards');
      // setCards(data?.cards || []);
      setCards([]); // none linked yet
    } catch (e) {
      // non-blocking
      setCards([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStripeConfig() {
    try {
      // const { data } = await api.get('/api/payment-methods/stripe/config');
      // setSupported({ stripe: true, publishableKey: data.publishableKey });
      setSupported({ stripe: false, publishableKey: null }); // placeholder
    } catch {
      setSupported({ stripe: false, publishableKey: null });
    }
  }

  async function handleAddCard() {
    // Phase 1 UI placeholder. Next step will open Stripe Elements modal with SetupIntent.
    showSuccess('Card linking flow coming up next (Stripe Elements + SetupIntent).');
  }

  async function handleSetDefault(cardId) {
    try {
      // await api.patch(`/api/payment-methods/cards/${cardId}/default`);
      await fetchCards();
      showSuccess('Default card updated');
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to set default card');
    }
  }

  async function handleRemove(cardId) {
    try {
      // await api.delete(`/api/payment-methods/cards/${cardId}`);
      await fetchCards();
      showSuccess('Card removed');
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to remove card');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payments & Cards</h1>
          <p className="mt-2 text-gray-600">
            Link your debit/credit cards and manage payment sources used for recharges and subscriptions.
          </p>
        </div>

        {/* Linked Cards */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Linked Cards</h2>
              <p className="mt-1 text-sm text-gray-600">Securely tokenized; we never store card numbers.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddCard}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                + Add Card
              </button>
            </div>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="p-4 text-gray-600">Loading...</div>
            ) : cards.length === 0 ? (
              <div className="p-4 text-gray-600">
                No cards linked yet. Click "Add Card" to link your Visa/Mastercard via Stripe.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {cards.map((c) => (
                  <li key={c.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {c.brand || 'Card'} •••• {c.last4}
                      </div>
                      <div className="text-sm text-gray-600">
                        Expires {String(c.expMonth).padStart(2, '0')}/{String(c.expYear).slice(-2)}
                        {c.default && <span className="ml-2 inline-block px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">Default</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!c.default && (
                        <button
                          onClick={() => handleSetDefault(c.id)}
                          className="px-3 py-1.5 text-sm rounded-md border hover:bg-gray-50"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleRemove(c.id)}
                        className="px-3 py-1.5 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Coming soon: Bank Links and Subscription Overview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Subscriptions (Preview)</h2>
          <p className="text-sm text-gray-600">
            Soon you'll be able to view and manage subscriptions charged via Vault5 Pay and cards linked here.
          </p>
        </div>
      </div>
    </div>
  );
}