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

  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setTwoFactorCode('');
      setDisburseImmediately(true);
      setDisburseAt('');
      setBusy(false);
    }
  }, [isOpen]);

  if (!isOpen || !loan) return null;

  const handleApprove = async () => {
    if (!password || password.length < 4) {
      showError('Enter your password to approve');
      return;
    }
    setBusy(true);
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
      showError(e?.response?.data?.message || 'Approval failed');
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