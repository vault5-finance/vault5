import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const PROVIDERS = [
  { id: 'mpesa', label: 'M-Pesa (STK Push)' },
  { id: 'airtel', label: 'Airtel Money' },
  { id: 'bank', label: 'Bank Transfer (Manual Confirm)' },
];

export default function AddFundsModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState('form'); // form | confirm | waiting | success | error
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const [form, setForm] = useState({
    amount: '',
    provider: 'mpesa',
    target: 'wallet', // 'wallet' or accountId (string)
    phone: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // PaymentIntent state
  const [intent, setIntent] = useState(null);
  const [statusPoller, setStatusPoller] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const canSubmit = useMemo(() => {
    const amt = Number(form.amount);
    if (!(amt > 0)) return false;
    if (!form.provider) return false;
    if (!form.target) return false;
    if ((form.provider === 'mpesa' || form.provider === 'airtel') && !/^\d{10,13}$/.test(String(form.phone || ''))) {
      return false;
    }
    return true;
  }, [form]);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingAccounts(true);
    api.get('/api/accounts')
      .then(res => setAccounts(res.data || []))
      .catch(() => setAccounts([]))
      .finally(() => setLoadingAccounts(false));
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (statusPoller) clearInterval(statusPoller);
    };
  }, [statusPoller]);

  const closeAll = () => {
    if (statusPoller) clearInterval(statusPoller);
    setStatusPoller(null);
    setIntent(null);
    setErrors({});
    setStatusMessage('');
    setForm({ amount: '', provider: 'mpesa', target: 'wallet', phone: '' });
    setStep('form');
    onClose && onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const amt = Number(form.amount);
    if (!(amt > 0)) newErrors.amount = 'Enter a valid amount';
    if (!form.provider) newErrors.provider = 'Select a provider';
    if (!form.target) newErrors.target = 'Select destination';
    if ((form.provider === 'mpesa' || form.provider === 'airtel') && !/^\d{10,13}$/.test(String(form.phone || ''))) {
      newErrors.phone = 'Enter a valid phone number (MSISDN)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setStep('confirm');
  };

  const handleBackToForm = () => setStep('form');

  const initiateDeposit = async () => {
    setSubmitting(true);
    setErrors({});
    try {
      const payload = {
        provider: form.provider,
        amount: Number(form.amount),
        currency: 'KES',
        targetAccount: form.target === 'wallet' ? 'wallet' : form.target,
        phone: form.phone || undefined,
      };
      const { data } = await api.post('/api/payments/deposits/initiate', payload);
      if (data?.success && data?.data?.id) {
        setIntent(data.data);
        setStep('waiting');
        setStatusMessage('Waiting for provider confirmation...');

        // Start polling status every 3 seconds
        const poller = setInterval(async () => {
          try {
            const st = await api.get(`/api/payments/transactions/${data.data.id}/status`);
            const s = st?.data?.data?.status;
            if (!s) return;
            if (s === 'success') {
              clearInterval(poller);
              setStatusPoller(null);
              setStatusMessage('Deposit successful! Applying allocations...');
              // Brief delay for backend allocation, then finish
              setTimeout(() => {
                setStep('success');
              }, 1000);
            } else if (['failed', 'canceled', 'expired'].includes(s)) {
              clearInterval(poller);
              setStatusPoller(null);
              setErrors({ general: `Payment ${s}.` });
              setStep('error');
            }
          } catch {
            // ignore transient errors
          }
        }, 3000);
        setStatusPoller(poller);
      } else {
        setErrors({ general: data?.message || 'Failed to start deposit' });
        setStep('error');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to start deposit';
      setErrors({ general: msg });
      setStep('error');
    } finally {
      setSubmitting(false);
    }
  };

  const manualConfirm = async () => {
    if (!intent?.id) return;
    try {
      await api.post('/api/payments/deposits/confirm', { id: intent.id });
      setStatusMessage('Confirmation requested. Finalizing...');
      // Poll once after manual confirm
      setTimeout(async () => {
        try {
          const st = await api.get(`/api/payments/transactions/${intent.id}/status`);
          const s = st?.data?.data?.status;
          if (s === 'success') {
            setStep('success');
          } else if (['failed', 'canceled', 'expired'].includes(s)) {
            setErrors({ general: `Payment ${s}.` });
            setStep('error');
          }
        } catch {
          // ignore, user can retry
        }
      }, 1200);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Manual confirmation failed';
      setErrors({ general: msg });
    }
  };

  const onSuccessClose = () => {
    onSuccess && onSuccess(); // refresh dashboard balances
    closeAll();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeAll}></div>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Add Funds</h3>
            <button onClick={closeAll} className="text-gray-400 hover:text-gray-600" aria-label="Close">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {step === 'form' && (
            <form onSubmit={handleSubmitForm} className="space-y-4">
              {errors.general && (
                <div className="mb-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{errors.general}</div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KES)</label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  min="1"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.amount ? 'border-red-500' : ''}`}
                  placeholder="0.00"
                  required
                />
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                <div className="flex flex-col space-y-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="target"
                      value="wallet"
                      checked={form.target === 'wallet'}
                      onChange={handleChange}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Deposit to Wallet</span>
                  </label>
                  <div className="border rounded">
                    <div className="p-2 bg-gray-50 text-xs text-gray-500">Or choose a specific account</div>
                    <div className="max-h-40 overflow-auto">
                      {loadingAccounts && <div className="p-2 text-sm text-gray-500">Loading accounts...</div>}
                      {!loadingAccounts && accounts.map(acc => (
                        <label key={acc._id} className="flex items-center p-2 border-t">
                          <input
                            type="radio"
                            name="target"
                            value={acc._id}
                            checked={form.target === acc._id}
                            onChange={handleChange}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{acc.type} (Bal: KES {Number(acc.balance || 0).toFixed(2)})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                {errors.target && <p className="text-red-500 text-xs mt-1">{errors.target}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <select
                  name="provider"
                  value={form.provider}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.provider ? 'border-red-500' : ''}`}
                >
                  {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
                {errors.provider && <p className="text-red-500 text-xs mt-1">{errors.provider}</p>}
              </div>

              {(form.provider === 'mpesa' || form.provider === 'airtel') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone (MSISDN)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="2547XXXXXXXX"
                    required
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={closeAll} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300">Cancel</button>
                <button type="submit" disabled={!canSubmit} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">Continue</button>
              </div>
            </form>
          )}

          {step === 'confirm' && (
            <div>
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800">Confirm Deposit</h4>
                <p className="text-sm text-gray-600">Review and confirm your details.</p>
              </div>
              <div className="bg-gray-50 rounded p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>Amount</span><span>KES {Number(form.amount).toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Provider</span><span>{PROVIDERS.find(p => p.id === form.provider)?.label}</span></div>
                <div className="flex justify-between">
                  <span>Destination</span>
                  <span>{form.target === 'wallet' ? 'Wallet' : (accounts.find(a => a._id === form.target)?.type || 'Account')}</span>
                </div>
                {(form.provider === 'mpesa' || form.provider === 'airtel') && (
                  <div className="flex justify-between"><span>Phone</span><span>{form.phone}</span></div>
                )}
              </div>
              <div className="flex space-x-3 pt-4">
                <button onClick={handleBackToForm} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300">Back</button>
                <button onClick={initiateDeposit} disabled={submitting} className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50">
                  {submitting ? 'Starting...' : 'Confirm & Start'}
                </button>
              </div>
            </div>
          )}

          {step === 'waiting' && (
            <div className="text-center">
              <div className="mb-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-gray-700 mb-2">{statusMessage || 'Waiting for confirmation...'}</p>
              {(form.provider === 'mpesa' || form.provider === 'airtel') && (
                <>
                  <p className="text-sm text-gray-500 mb-4">If you received a prompt on your phone, enter your M-Pesa/Airtel PIN to approve.</p>
                  <button onClick={manualConfirm} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">I have approved the payment</button>
                </>
              )}
              {form.provider === 'bank' && (
                <>
                  <p className="text-sm text-gray-500 mb-4">Complete the bank transfer, then click confirm below.</p>
                  <button onClick={manualConfirm} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Confirm Deposit</button>
                </>
              )}
              <div className="mt-4">
                <button onClick={closeAll} className="text-sm text-gray-500 underline">Close</button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center">
              <div className="mb-3 text-green-600 text-3xl">✔</div>
              <h4 className="text-lg font-semibold mb-1">Deposit Successful</h4>
              <p className="text-sm text-gray-600">Your funds have been added and allocations are applied.</p>
              <div className="mt-4">
                <button onClick={onSuccessClose} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Done</button>
              </div>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center">
              <div className="mb-3 text-red-600 text-3xl">✖</div>
              <h4 className="text-lg font-semibold mb-1">Deposit Failed</h4>
              <p className="text-sm text-red-700">{errors.general || 'Something went wrong'}</p>
              <div className="mt-4 flex space-x-3">
                <button onClick={handleBackToForm} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300">Try Again</button>
                <button onClick={closeAll} className="flex-1 bg-white border text-gray-700 py-2 rounded hover:bg-gray-50">Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}