import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Smartphone, Building2, DollarSign, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

const WalletRechargeModal = ({ wallet, onClose, onRecharge }) => {
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: {
      type: 'mpesa',
      identifier: ''
    },
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('mpesa');

  const paymentMethods = [
    {
      value: 'mpesa',
      label: 'M-Pesa',
      placeholder: '254XXXXXXXXX',
      icon: Smartphone,
      description: 'Mobile money payment',
      color: 'bg-green-500'
    },
    {
      value: 'card',
      label: 'Credit/Debit Card',
      placeholder: '**** **** **** 1234',
      icon: CreditCard,
      description: 'Visa, Mastercard, etc.',
      color: 'bg-blue-500'
    },
    {
      value: 'bank_transfer',
      label: 'Bank Transfer',
      placeholder: 'Account Number',
      icon: Building2,
      description: 'Direct bank transfer',
      color: 'bg-purple-500'
    },
    {
      value: 'paypal',
      label: 'PayPal',
      placeholder: 'email@example.com',
      icon: DollarSign,
      description: 'PayPal account',
      color: 'bg-orange-500'
    }
  ];

  const quickAmounts = [500, 1000, 2000, 5000];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!formData.paymentMethod.identifier) {
      toast.error('Please enter payment method details');
      return;
    }

    setLoading(true);
    try {
      await onRecharge(formData);
    } catch (error) {
      console.error('Recharge error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentMethodChange = (type) => {
    setSelectedMethod(type);
    setFormData(prev => ({
      ...prev,
      paymentMethod: {
        type,
        identifier: ''
      }
    }));
  };

  const handleQuickAmount = (amount) => {
    setFormData(prev => ({
      ...prev,
      amount: amount.toString()
    }));
  };

  const selectedPaymentMethod = paymentMethods.find(m => m.value === selectedMethod);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Recharge Wallet</h2>
                <p className="text-blue-100 mt-1">Add funds to your Vault5 wallet</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Quick Amount Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Quick Amounts
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {quickAmounts.map((amount) => (
                    <motion.button
                      key={amount}
                      type="button"
                      onClick={() => handleQuickAmount(amount)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.amount === amount.toString()
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-lg font-bold">KES {amount.toLocaleString()}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Custom Amount Input */}
              <div>
                <label htmlFor="amount" className="block text-sm font-semibold text-gray-900 mb-2">
                  Custom Amount (KES)
                </label>
                <input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter custom amount"
                  min="1"
                  step="0.01"
                  required
                />
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <motion.button
                        key={method.value}
                        type="button"
                        onClick={() => handlePaymentMethodChange(method.value)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          selectedMethod === method.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${method.color} text-white`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{method.label}</div>
                            <div className="text-xs text-gray-500">{method.description}</div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method Details */}
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <label htmlFor="payment-identifier" className="block text-sm font-semibold text-gray-900 mb-2">
                  {selectedPaymentMethod?.label} Details
                </label>
                <input
                  id="payment-identifier"
                  type={selectedMethod === 'mpesa' ? 'tel' : selectedMethod === 'paypal' ? 'email' : 'text'}
                  value={formData.paymentMethod.identifier}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    paymentMethod: {
                      ...prev.paymentMethod,
                      identifier: e.target.value
                    }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={selectedPaymentMethod?.placeholder}
                  required
                />
              </motion.div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                  Description (Optional)
                </label>
                <input
                  id="description"
                  type="text"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="What's this payment for?"
                  maxLength="255"
                />
              </div>

              {/* Wallet Limits Info */}
              {wallet && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Wallet Limits</span>
                  </div>
                  <div className="text-sm text-blue-800 space-y-1">
                    <div>Daily Limit: KES {wallet.limits?.dailyLimit?.toLocaleString()}</div>
                    <div>Transaction Limit: KES {wallet.limits?.transactionLimit?.toLocaleString()}</div>
                  </div>
                </motion.div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all font-medium"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Recharge Wallet
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WalletRechargeModal;