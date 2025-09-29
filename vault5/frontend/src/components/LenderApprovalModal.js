import React, { useState, useEffect } from 'react';
import { p2pLoansAPI, makeIdemKey } from '../services/api';
import { useToast } from '../contexts/ToastContext';

export default function LenderApprovalModal({ isOpen, onClose, loan, onApproved }) {
  const { showError, showSuccess } = useToast();
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [disburseImmediately, setDisburseImmediately] = useState(true);
  const [disburseAt, setDisburseAt] = useState('');
  const [busy, setBusy] = useState(false);
  const [inlineError, setInlineError] = useState('');
  const [capacity, setCapacity] = useState(null);
  const [checkingCapacity, setCheckingCapacity] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setTwoFactorCode('');
      setDisburseImmediately(true);
      setDisburseAt('');
      setBusy(false);
      setInlineError('');
      setCapacity(null);
    }
  }, [isOpen]);

  // Pre-check lending capacity when modal opens
  useEffect(() => {
    if (isOpen && loan) {
      setCheckingCapacity(true);
      p2pLoansAPI.capacityPreview(loan._id)
        .then(resp => setCapacity(resp.data?.data || null))
        .catch(() => setCapacity(null)) // Non-blocking
        .finally(() => setCheckingCapacity(false));
    }
  }, [isOpen, loan]);

  if (!isOpen || !loan) return null;

  const handleApprove = async () => {
    if (!password || password.length < 4) {
      setInlineError('Enter your password to approve');
      return;
    }
    setBusy(true);
    setInlineError('');
    try {
      await p2pLoansAPI.approve(
        loan._id,
        {
          password,
          twoFactorCode: twoFactorCode || undefined,
          disburseImmediately,
          disburseAt: disburseAt ? new Date(disburseAt).toISOString() : null,
        },
        makeIdemKey('p2p-approve-ui')
      );
      showSuccess('Loan approved');
      onApproved && (await onApproved());
      onClose && onClose();
    } catch (e) {
      const resp = e?.response?.data || {};
      const code = resp.code;
      const msg = resp.message || 'Approval failed';
      let display = msg;

      if (code === 'ESCROW_HOLD_FAILED' || code === 'INSUFFICIENT_LENDING_CAPACITY') {
        const required = resp.meta?.required;
        const available = resp.meta?.totalAvailable;
        display =
          `Insufficient lending capacity in allowed accounts (Fun, Charity, Daily). ` +
          (available !== undefined ? `Available: KES ${Number(available).toLocaleString()}. ` : '') +
          (required !== undefined ? `Required: KES ${Number(required).toLocaleString()}. ` : '') +
          `Move funds into Fun/Charity/Daily or reduce the amount.`;
      } else if (e?.response?.status === 401) {
        display = msg.includes('2FA')
          ? '2FA required. Enter the 2FA code sent to your device.'
          : 'Password verification failed. Re-enter your password.';
      }

      setInlineError(display);
      // Only toast unknown/unhandled errors (dedup in ToastContext prevents spam)
      if (!(code === 'ESCROW_HOLD_FAILED' || code === 'INSUFFICIENT_LENDING_CAPACITY' || e?.response?.status === 401)) {
        showError(display);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleClose = () => {
    if (busy) return;
    onClose && onClose();
  };

  const requires2FAHint = Number(loan?.principal || 0) >= Number(process.env.REACT_APP_LOANS_2FA_THRESHOLD || 10000);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="border-b p-4">
          <h2 className="text-xl font-bold">Approve Loan</h2>
          <p className="text-sm text-gray-600 mt-1">
            Principal: <span className="font-semibold">KES {Number(loan.principal || 0).toLocaleString()}</span>
          </p>

          {/* Capacity Preview */}
          {checkingCapacity && (
            <div className="mt-2 text-sm text-blue-600">Checking lending capacity...</div>
          )}
          {capacity && (
            <div className={`mt-2 p-2 rounded text-sm ${capacity.canApprove ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              <div className="font-medium">
                {capacity.canApprove ? '✅' : '❌'} Lending Capacity: KES {Number(capacity.allowedAmount || 0).toLocaleString()} available
              </div>
              <div className="text-xs mt-1">
                Required: KES {Number(capacity.principal || 0).toLocaleString()}
                {capacity.shortfall > 0 && (
                  <> • Shortfall: KES {Number(capacity.shortfall).toLocaleString()}</>
                )}
              </div>
              {capacity.plan && capacity.plan.length > 0 && (
                <div className="text-xs mt-1">
                  From: {capacity.plan.map(p => `${p.accountType} (KES ${Number(p.willUse).toLocaleString()})`).join(', ')}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              disabled={busy}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">2FA Code (if required)</label>
            <input
              type="text"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              className="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={requires2FAHint ? 'Enter 2FA code' : 'Optional unless over threshold'}
              disabled={busy}
              inputMode="numeric"
              maxLength={6}
            />
            {requires2FAHint && (
              <p className="text-xs text-yellow-700 mt-1">2FA required for high-value approvals.</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="disb-now"
              type="checkbox"
              checked={disburseImmediately}
              onChange={(e) => setDisburseImmediately(e.target.checked)}
              className="rounded"
              disabled={busy}
            />
            <label htmlFor="disb-now" className="text-sm">Disburse immediately</label>
          </div>

          {!disburseImmediately && (
            <div>
              <label className="block text-sm font-medium mb-1">Disburse At (optional)</label>
              <input
                type="datetime-local"
                value={disburseAt}
                onChange={(e) => setDisburseAt(e.target.value)}
                className="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={busy}
              />
            </div>
          )}

          {inlineError && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
              {inlineError}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t p-4">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-md border hover:bg-gray-50"
            disabled={busy}
          >
            Cancel
          </button>
          <button
            onClick={handleApprove}
            className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            disabled={busy}
          >
            {busy ? 'Approving...' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  );
}