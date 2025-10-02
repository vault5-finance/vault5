import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BatchActionToolbar = ({
  selectedItems = [],
  onBatchAction,
  onClearSelection,
  availableActions = ['remind', 'escalate', 'write_off']
}) => {
  const [processing, setProcessing] = useState(false);

  if (selectedItems.length === 0) return null;

  const handleBatchAction = async (action) => {
    setProcessing(true);
    try {
      await onBatchAction(action, selectedItems);
      onClearSelection();
    } catch (error) {
      console.error('Batch action failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getActionConfig = (action) => {
    const configs = {
      remind: {
        label: 'Send Batch Reminders',
        icon: '📧',
        color: 'bg-blue-500 hover:bg-blue-600',
        description: 'Send friendly reminders to all selected borrowers'
      },
      escalate: {
        label: 'Escalate Overdue',
        icon: '🚨',
        color: 'bg-orange-500 hover:bg-orange-600',
        description: 'Mark as escalated and trigger collection workflow'
      },
      write_off: {
        label: 'Write Off as Gifts',
        icon: '🎁',
        color: 'bg-red-500 hover:bg-red-600',
        description: 'Write off selected loans as goodwill gifts'
      }
    };
    return configs[action];
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 min-w-max">
          <div className="flex items-center gap-4">
            {/* Selection Info */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold text-sm">{selectedItems.length}</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                </div>
                <div className="text-xs text-gray-500">
                  Total: KES {selectedItems.reduce((sum, item) => sum + (item.amount || 0), 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {availableActions.map(action => {
                const config = getActionConfig(action);
                return (
                  <motion.button
                    key={action}
                    onClick={() => handleBatchAction(action)}
                    disabled={processing}
                    className={`px-4 py-2 ${config.color} text-white text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title={config.description}
                  >
                    <span>{config.icon}</span>
                    {config.label}
                  </motion.button>
                );
              })}
            </div>

            {/* Clear Selection */}
            <motion.button
              onClick={onClearSelection}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>

          {/* Processing Indicator */}
          {processing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-gray-200"
            >
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                Processing batch action...
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BatchActionToolbar;