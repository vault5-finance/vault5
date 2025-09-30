import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

// Stripe Elements appearance
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': { color: '#aab7c4' },
    },
    invalid: { color: '#9e2146' },
  },
};

// Add Card Modal Component
function AddCardModal({ onClose, onSuccess, stripePromise }) {
  const stripe = useStripe();
  const elements = useElements();
  const { showError, showSuccess } = useToast();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    // Create SetupIntent on mount
    async function createIntent() {
      try {
        const { data } = await api.post('/api/payment-methods/stripe/setup-intent');
        setClientSecret(data.clientSecret);
      } catch (e) {
        showError('Failed to initialize card setup');
        onClose();
      }
    }
    createIntent();
  }, [showError, onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setLoading(true);
    try {
      const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (error) {
        showError(error.message);
        return;
      }

      // Link the card
      await api.post('/api/payment-methods/cards/link', {
        paymentMethodId: setupIntent.payment_method,
      });

      showSuccess('Card linked successfully');
      onSuccess();
      onClose();
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to link card');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Add New Card</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Details
            </label>
            <div className="border border-gray-300 rounded-md p-3">
              <CardElement options={cardElementOptions} />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!stripe || loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Linking...' : 'Link Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PaymentsCards() {
  const { showError, showSuccess } = useToast();
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState([]);
  const [stripePromise, setStripePromise] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchCards();
    fetchStripeConfig();
  }, []);

  async function fetchCards() {
    try {
      setLoading(true);
      const { data } = await api.get('/api/payment-methods/cards');
      setCards(data || []);
    } catch (e) {
      setCards([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStripeConfig() {
    try {
      const { data } = await api.get('/api/payment-methods/stripe/config');
      const stripe = loadStripe(data.publishableKey);
      setStripePromise(stripe);
    } catch {
      setStripePromise(null);
    }
  }

  function handleAddCard() {
    setShowAddModal(true);
  }

  async function handleSetDefault(cardId) {
    try {
      await api.patch(`/api/payment-methods/cards/${cardId}/default`);
      await fetchCards();
      showSuccess('Default card updated');
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to set default card');
    }
  }

  async function handleRemove(cardId) {
    try {
      await api.delete(`/api/payment-methods/cards/${cardId}`);
      await fetchCards();
      showSuccess('Card removed');
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to remove card');
    }
  }

  return (
    <>
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
                    <li key={c._id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {c.brand} •••• {c.last4}
                        </div>
                        <div className="text-sm text-gray-600">
                          Expires {String(c.expMonth).padStart(2, '0')}/{String(c.expYear).slice(-2)}
                          {c.isDefault && <span className="ml-2 inline-block px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">Default</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!c.isDefault && (
                          <button
                            onClick={() => handleSetDefault(c._id)}
                            className="px-3 py-1.5 text-sm rounded-md border hover:bg-gray-50"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(c._id)}
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

      {/* Add Card Modal */}
      {showAddModal && (
        <Elements stripe={stripePromise || loadStripe('pk_test_placeholder')}>
          <AddCardModal
            onClose={() => setShowAddModal(false)}
            onSuccess={fetchCards}
          />
        </Elements>
      )}
    </>
  );
}