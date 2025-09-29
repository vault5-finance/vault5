import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { p2pLoansAPI, makeIdemKey } from '../services/api';
import { useToast } from '../contexts/ToastContext';

export default function P2PLoanRequestWizard({ isOpen, onClose, onSubmitted }) {
  const { showError, showSuccess } = useToast();

  const [step, setStep] = useState(1);
  const [contact, setContact] = useState({ email: '', phone: '' });
  const [eligibility, setEligibility] = useState(null);
  const [checking, setChecking] = useState(false);

  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [autoDeduct, setAutoDeduct] = useState(true);
  const [scheduleType, setScheduleType] = useState('installments'); // 'one-off' | 'installments'
  const [frequency, setFrequency] = useState('weekly'); // daily|weekly|biweekly|monthly
  const [installments, setInstallments] = useState(4);
  const [firstPaymentDate, setFirstPaymentDate] = useState('');

  const canContinueContact = useMemo(() => {
    return (contact.email && /\S+@\S+\.\S+/.test(contact.email)) || (contact.phone && contact.phone.length >= 7);
  }, [contact]);

  const reset = useCallback(() => {
    setStep(1);
    setContact({ email: '', phone: '' });
    setEligibility(null);
    setChecking(false);
    setAmount('');
    setPurpose('');
    setAutoDeduct(true);
    setScheduleType('installments');
    setFrequency('weekly');
    setInstallments(4);
    setFirstPaymentDate('');
  }, []);

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const runEligibilityCheck = async () => {
    if (!canContinueContact) return;
    setChecking(true);
    try {
      const resp = await p2pLoansAPI.eligibilityCheck({ ...contact });
      setEligibility(resp.data?.eligibility || null);
      const suggested = resp.data?.eligibility?.suggestedAmount || 0;
      if (!amount && suggested > 0) {
        setAmount(String(suggested));
      }
    } catch (e) {
      setEligibility(null);
      showError(e?.response?.data?.message || 'Failed to check eligibility');
    } finally {
      setChecking(false);
    }
  };

  const handleNextFromContact = async () => {
    if (!canContinueContact) {
      showError('Enter a valid email or phone for the target contact');
      return;
    }
    await runEligibilityCheck();
    setStep(2);
  };

  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async () => {
    const amt = Number(amount);
    if (!(amt > 0)) {
      showError('Enter a valid amount');
      return;
    }
    if (!purpose || purpose.trim().length < 3) {
      showError('Enter a brief purpose for this loan');
      return;
    }
    const payload = {
      contact: { ...contact },
      amount: amt,
      purpose: purpose.trim(),
      schedule: {
        type: scheduleType,
        frequency,
        installments: scheduleType === 'installments' ? Number(installments || 1) : 1,
        firstPaymentDate: firstPaymentDate || undefined,
        autoDeduct: Boolean(autoDeduct),
      },
    };

    try {
      await p2pLoansAPI.create(payload, makeIdemKey('p2p-create-ui'));
      showSuccess('Loan request created and sent to lender');
      onSubmitted && (await onSubmitted());
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to create loan request');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Request P2P Loan</h2>
              <p className="text-purple-100 text-sm">
                {step === 1 && 'Enter your lender\'s contact (email or phone)'}
                {step === 2 && 'Set amount and repayment schedule'}
                {step === 3 && 'Review and submit your request'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/90 hover:text-white"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Progress */}
          <div className="flex items-center mt-4">
            {[1,2,3].map((n) => (
              <div key={n} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= n ? 'bg-white text-purple-700' : 'bg-white/40 text-white'}`}>
                  {n}
                </div>
                {n < 3 && (
                  <div className={`w-12 h-1 mx-2 ${step > n ? 'bg-white' : 'bg-white/40'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Lender Email</label>
                  <input
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                    className="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="lender@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Lender Phone</label>
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                    className="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="+2547..."
                  />
                </div>
              </div>

              <div className="bg-gray-50 border rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1.5 rounded-md border bg-white hover:bg-gray-50"
                    onClick={runEligibilityCheck}
                    disabled={!canContinueContact || checking}
                  >
                    {checking ? 'Checking...' : 'Check Eligibility'}
                  </button>
                  {eligibility && (
                    <div className="text-sm text-gray-700">
                      Max allowed (pair): <span className="font-semibold">KES {Number(eligibility.maxBorrowableForThisPair || eligibility.maxBorrowable || 0).toLocaleString()}</span>
                      {eligibility.suggestedAmount ? (
                        <> • Suggested: <span className="font-semibold">KES {Number(eligibility.suggestedAmount).toLocaleString()}</span></>
                      ) : null}
                    </div>
                  )}
                </div>
                {eligibility && (
                  <div className="mt-2 text-xs text-gray-600">
                    Protection score: {eligibility.lenderProtectionScore ?? eligibility.protectionScore ?? '-'} • {eligibility.lenderResponseTimeHint || '—'}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={onClose} className="px-4 py-2 rounded-md border hover:bg-gray-50">Cancel</button>
                <button
                  onClick={handleNextFromContact}
                  disabled={!canContinueContact}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Amount (KES)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="100"
                    placeholder="e.g. 5000"
                  />
                  {eligibility && (
                    <p className="text-xs text-gray-600 mt-1">
                      Max allowed (pair): KES {Number(eligibility.maxBorrowableForThisPair || eligibility.maxBorrowable || 0).toLocaleString()}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Purpose</label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Short description"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Schedule Type</label>
                  <select
                    value={scheduleType}
                    onChange={(e) => setScheduleType(e.target.value)}
                    className="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="one-off">One-off</option>
                    <option value="installments">Installments</option>
                  </select>
                </div>
                {scheduleType === 'installments' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Frequency</label>
                      <select
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                        className="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Biweekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Installments</label>
                      <input
                        type="number"
                        value={installments}
                        min={1}
                        onChange={(e) => setInstallments(e.target.value)}
                        className="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    id="auto-deduct"
                    type="checkbox"
                    checked={autoDeduct}
                    onChange={(e) => setAutoDeduct(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="auto-deduct" className="text-sm">Enable auto-deduction when due</label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">First Payment Date (optional)</label>
                  <input
                    type="date"
                    value={firstPaymentDate}
                    onChange={(e) => setFirstPaymentDate(e.target.value)}
                    className="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleBack} className="px-4 py-2 rounded-md border hover:bg-gray-50">Back</button>
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-gray-50 border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Review</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>Contact: {contact.email || contact.phone}</li>
                  <li>Amount: KES {Number(amount || 0).toLocaleString()}</li>
                  <li>Purpose: {purpose || '-'}</li>
                  <li>Schedule: {scheduleType}{scheduleType === 'installments' ? ` • ${frequency} • ${installments}x` : ''}</li>
                  <li>Auto-deduct: {autoDeduct ? 'Yes' : 'No'}</li>
                  <li>First Due: {firstPaymentDate || 'auto-selected'}</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button onClick={handleBack} className="px-4 py-2 rounded-md border hover:bg-gray-50">Back</button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                >
                  Submit Request
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}