import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  XMarkIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/solid';

const MIN_REASON = 5;

/**
 * Enhanced ConfirmGate - reusable confirmation modal for critical actions
 * Props:
 * - open: boolean
 * - title: string
 * - cautions: string[] (checkbox list; all must be acknowledged)
 * - onCancel: () => void
 * - onConfirm: (reason: string) => void
 * - confirmWord: default "CONFIRM"
 * - actionLabel: default "Proceed"
 * - severity: 'low' | 'medium' | 'high' | 'critical' (affects styling)
 * - icon: custom icon component
 */
const ConfirmGate = ({
  open,
  title = 'Please Confirm',
  cautions = [],
  onCancel,
  onConfirm,
  confirmWord = 'CONFIRM',
  actionLabel = 'Proceed',
  severity = 'high',
  icon: CustomIcon,
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

  // Severity-based styling
  const severityConfig = {
    low: {
      bg: 'bg-blue-500/20 border-blue-500/30',
      icon: InformationCircleIcon,
      iconColor: 'text-blue-400',
      buttonColor: 'bg-blue-600 hover:bg-blue-500',
    },
    medium: {
      bg: 'bg-amber-500/20 border-amber-500/30',
      icon: ExclamationTriangleIcon,
      iconColor: 'text-amber-400',
      buttonColor: 'bg-amber-600 hover:bg-amber-500',
    },
    high: {
      bg: 'bg-orange-500/20 border-orange-500/30',
      icon: ExclamationTriangleIcon,
      iconColor: 'text-orange-400',
      buttonColor: 'bg-orange-600 hover:bg-orange-500',
    },
    critical: {
      bg: 'bg-red-500/20 border-red-500/30',
      icon: ExclamationTriangleIcon,
      iconColor: 'text-red-400',
      buttonColor: 'bg-red-600 hover:bg-red-500',
    },
  };

  const config = severityConfig[severity] || severityConfig.high;
  const IconComponent = CustomIcon || config.icon;

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={handleCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className={`bg-white/10 backdrop-blur-xl border ${config.bg} rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${config.bg} rounded-xl flex items-center justify-center`}>
                <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">{title}</h2>
                <p className="text-slate-400 mt-1">This action requires confirmation</p>
              </div>
              <button
                onClick={handleCancel}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6 space-y-6">
            {/* Cautions */}
            {cautions?.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5 text-slate-400" />
                  <span className="text-white font-medium">Please acknowledge all points:</span>
                </div>
                <div className="space-y-3">
                  {cautions.map((caution, i) => (
                    <motion.label
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3 cursor-pointer group"
                    >
                      <div className="relative mt-0.5">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 bg-white/5 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                          checked={!!checked[i]}
                          onChange={(e) => setChecked((prev) => ({ ...prev, [i]: e.target.checked }))}
                        />
                        {checked[i] && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <CheckCircleIcon className="w-4 h-4 text-blue-400" />
                          </motion.div>
                        )}
                      </div>
                      <span className="text-slate-300 text-sm leading-relaxed group-hover:text-white transition-colors">
                        {caution}
                      </span>
                    </motion.label>
                  ))}
                </div>
              </div>
            )}

            {/* Confirmation Word */}
            <div className="space-y-3">
              <label className="block text-white font-medium">
                Type <span className="font-mono bg-white/10 px-2 py-1 rounded text-sm">"{confirmWord}"</span> to continue
              </label>
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder={confirmWord}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {typed && typed.trim().toUpperCase() !== String(confirmWord).toUpperCase() && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm flex items-center gap-2"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Text must match exactly
                </motion.p>
              )}
            </div>

            {/* Reason */}
            <div className="space-y-3">
              <label className="block text-white font-medium">
                Reason for this action
                <span className="text-slate-400 text-sm ml-2">
                  (minimum {MIN_REASON} characters)
                </span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly explain why this action is necessary..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">
                  {reason.length}/{MIN_REASON} minimum characters
                </span>
                {reason.trim().length < MIN_REASON && reason.length > 0 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-red-400 text-xs flex items-center gap-1"
                  >
                    <XMarkIcon className="w-3 h-3" />
                    Too short
                  </motion.span>
                )}
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Progress</span>
                <span>{[allChecked, typed.trim().toUpperCase() === String(confirmWord).toUpperCase(), reason.trim().length >= MIN_REASON].filter(Boolean).length}/3</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${([allChecked, typed.trim().toUpperCase() === String(confirmWord).toUpperCase(), reason.trim().length >= MIN_REASON].filter(Boolean).length / 3) * 100}%`
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-white/10 bg-white/5">
            <div className="flex items-center justify-between">
              <button
                onClick={handleCancel}
                className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>

              <motion.button
                onClick={handleConfirm}
                disabled={!canProceed}
                className={`px-6 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                  canProceed
                    ? `${config.buttonColor} text-white shadow-lg hover:shadow-xl`
                    : 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                }`}
                whileHover={canProceed ? { scale: 1.02 } : {}}
                whileTap={canProceed ? { scale: 0.98 } : {}}
              >
                {canProceed ? (
                  <>
                    <CheckCircleIcon className="w-4 h-4" />
                    {actionLabel}
                  </>
                ) : (
                  <>
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    {actionLabel}
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmGate;