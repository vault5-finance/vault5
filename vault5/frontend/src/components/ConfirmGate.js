import React, { useMemo, useState } from 'react';

const MIN_REASON = 5;

/**
 * ConfirmGate - reusable confirmation modal for critical actions
 * Props:
 * - open: boolean
 * - title: string
 * - cautions: string[] (checkbox list; all must be acknowledged)
 * - onCancel: () => void
 * - onConfirm: (reason: string) => void
 * - confirmWord: default "CONFIRM"
 * - actionLabel: default "Proceed"
 */
const ConfirmGate = ({
  open,
  title = 'Please Confirm',
  cautions = [],
  onCancel,
  onConfirm,
  confirmWord = 'CONFIRM',
  actionLabel = 'Proceed',
}) => {
  const [checked, setChecked] = useState({});
  const [typed, setTyped] = useState('');
  const [reason, setReason] = useState('');

  const allChecked = useMemo(() => {
    if (!cautions || cautions.length === 0) return true;
    return cautions.every((_, i) => !!checked[i]);
  }, [checked, cautions]);

  const canProceed = allChecked && typed.trim().toUpperCase() === String(confirmWord).toUpperCase() && reason.trim().length >= MIN_REASON;

  const reset = () => {
    setChecked({});
    setTyped('');
    setReason('');
  };

  const handleCancel = () => {
    reset();
    onCancel?.();
  };

  const handleConfirm = () => {
    if (!canProceed) return;
    const r = reason.trim();
    reset();
    onConfirm?.(r);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>

        <div className="px-6 py-4 space-y-4">
          {cautions?.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-800 mb-2">Acknowledge all points:</div>
              <div className="space-y-2">
                {cautions.map((c, i) => (
                  <label key={i} className="flex items-start text-sm">
                    <input
                      type="checkbox"
                      className="mr-2 mt-1"
                      checked={!!checked[i]}
                      onChange={(e) => setChecked((prev) => ({ ...prev, [i]: e.target.checked }))}
                    />
                    <span className="text-gray-700">{c}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-800">
              Type "{confirmWord}" to continue
            </label>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={confirmWord}
              className="mt-1 w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800">
              Reason for this action (min {MIN_REASON} characters)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly explain why this is necessary"
              rows={3}
              className="mt-1 w-full p-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-2">
          <button onClick={handleCancel} className="px-4 py-2 rounded border">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canProceed}
            className={`px-4 py-2 rounded text-white ${canProceed ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'}`}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmGate;