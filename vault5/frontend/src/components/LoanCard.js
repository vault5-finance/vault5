import React, { useState } from 'react';
import { motion } from 'framer-motion';

const LoanCard = ({
  lending,
  onStatusUpdate,
  onViewDetails,
  variant = 'default',
  showActions = true,
  compact = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusConfig = (status) => {
    const configs = {
      pending: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: '⏳' },
      funded: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: '💰' },
      overdue: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: '🚨' },
      repaid: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: '✅' },
      written_off: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800', icon: '🎁' }
    };
    return configs[status] || configs.pending;
  };

  const statusConfig = getStatusConfig(lending.status);

  const calculateProgress = () => {
    const now = new Date();
    const expected = new Date(lending.expectedReturnDate);
    const created = new Date(lending.createdAt);

    if (lending.status === 'repaid') return 100;
    if (lending.status === 'overdue') return 100;

    const total = expected - created;
    const elapsed = now - created;
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  const progress = calculateProgress();
  const daysOverdue = lending.status === 'overdue' ?
    Math.floor((new Date() - new Date(lending.expectedReturnDate)) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <motion.div
      className={`relative rounded-2xl border-2 ${statusConfig.border} ${statusConfig.bg} p-6 cursor-pointer transition-all duration-300 ${
        isHovered ? 'shadow-2xl transform -translate-y-1' : 'shadow-lg'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onViewDetails}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onViewDetails(lending);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Loan to ${lending.borrowerName} for KES ${lending.amount}. Status: ${lending.status}. Due: ${new Date(lending.expectedReturnDate).toLocaleDateString()}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      {/* Header Zone */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {lending.borrowerName?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{lending.borrowerName}</h3>
            <p className="text-sm text-gray-600">{lending.borrowerContact}</p>
            <div className="flex items-center gap-2 mt-1">
              <TrustScoreBadge score={lending.securityChecks?.trustScore || 0} />
              {lending.securityChecks?.escrowEnabled && <EscrowBadge />}
              <KYCBadge level={lending.securityChecks?.kycLevel || 0} />
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            KES {Number(lending.amount).toLocaleString()}
          </div>
          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
            <span>{statusConfig.icon}</span>
            {lending.status.replace('_', ' ').toUpperCase()}
          </div>
        </div>
      </div>

      {/* Body Zone */}
      <div className="mb-4">
        <TimelineBar
          progress={progress}
          status={lending.status}
          expectedDate={lending.expectedReturnDate}
          createdDate={lending.createdAt}
          daysOverdue={daysOverdue}
        />

        {!compact && (
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Type:</span>
              <span className="ml-2 text-gray-600">{lending.type}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Expected Return:</span>
              <span className="ml-2 text-gray-600">
                {new Date(lending.expectedReturnDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {lending.notes && !compact && (
          <div className="mt-3 p-3 bg-white/50 rounded-lg">
            <p className="text-sm text-gray-700 line-clamp-2">{lending.notes}</p>
          </div>
        )}
      </div>

      {/* Footer Zone */}
      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Created {new Date(lending.createdAt).toLocaleDateString()}
          </div>

          <div className="flex gap-2">
            {lending.status === 'overdue' && (
              <motion.button
                className="px-3 py-1.5 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle reminder
                }}
              >
                📧 Remind
              </motion.button>
            )}

            {lending.status !== 'repaid' && lending.status !== 'written_off' && (
              <motion.button
                className="px-3 py-1.5 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusUpdate(lending._id, 'repaid');
                }}
              >
                ✅ Mark Repaid
              </motion.button>
            )}

            <motion.button
              className="px-3 py-1.5 bg-gray-500 text-white text-xs rounded-lg hover:bg-gray-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(lending);
              }}
            >
              👁️ View Details
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Helper Components
const TrustScoreBadge = ({ score }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getScoreColor(score)}`}>
      <span>🛡️</span>
      {score}/100
    </div>
  );
};

const EscrowBadge = () => (
  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
    <span>🔒</span>
    Escrow
  </div>
);

const KYCBadge = ({ level }) => {
  const levels = ['None', 'Basic', 'Verified', 'Enhanced'];
  const colors = [
    'bg-gray-100 text-gray-800 border-gray-200',
    'bg-yellow-100 text-yellow-800 border-yellow-200',
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-green-100 text-green-800 border-green-200'
  ];

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colors[level] || colors[0]}`}>
      <span>✓</span>
      KYC {levels[level] || 'None'}
    </div>
  );
};

const TimelineBar = ({ progress, status, expectedDate, createdDate, daysOverdue }) => {
  const isOverdue = status === 'overdue';
  const isRepaid = status === 'repaid';

  return (
    <div className="relative">
      <div className="flex justify-between text-xs text-gray-600 mb-2">
        <span>{new Date(createdDate).toLocaleDateString()}</span>
        <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
          {isOverdue ? `${daysOverdue} days overdue` : new Date(expectedDate).toLocaleDateString()}
        </span>
      </div>

      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`absolute top-0 left-0 h-full rounded-full ${
            isRepaid ? 'bg-green-500' :
            isOverdue ? 'bg-red-500' :
            progress > 80 ? 'bg-orange-500' : 'bg-blue-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />

        {/* Timeline markers */}
        <div className="absolute top-0 left-0 w-full h-full flex justify-between">
          <div className="w-1 h-1 bg-white rounded-full transform -translate-y-0.5"></div>
          <div className="w-1 h-1 bg-white rounded-full transform -translate-y-0.5"></div>
        </div>
      </div>

      <div className="flex justify-between text-xs mt-1">
        <span className="text-gray-500">Requested</span>
        <span className={`font-medium ${isOverdue ? 'text-red-600' : isRepaid ? 'text-green-600' : 'text-gray-600'}`}>
          {isRepaid ? 'Repaid' : isOverdue ? 'Overdue' : 'Due'}
        </span>
      </div>
    </div>
  );
};

export default LoanCard;