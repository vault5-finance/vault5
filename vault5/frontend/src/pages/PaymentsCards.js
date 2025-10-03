import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Lock,
  CreditCard,
  Plus,
  Star,
  Trash2,
  AlertTriangle,
  Info,
  Zap,
  Eye,
  CheckCircle,
  X,
  Bell,
  Sparkles,
  ArrowRight,
  BadgeCheck,
  Globe,
  Clock,
  Wallet,
  Heart,
  Gift
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

// Enhanced Stripe Elements appearance
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1f2937',
      fontFamily: '"Inter", system-ui, sans-serif',
      '::placeholder': {
        color: '#9ca3af',
        fontWeight: '400'
      },
      backgroundColor: 'transparent',
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444'
    },
    complete: {
      color: '#10b981',
      iconColor: '#10b981'
    }
  },
};

// Enhanced Card Component with Premium Design
function CardItem({ card, onSetDefault, onRemove, isHovered, onHover, onLeave, onAnimationComplete }) {
  const getBrandGradient = (brand) => {
    switch (brand?.toLowerCase()) {
      case 'visa': return 'from-blue-600 via-blue-700 to-blue-800';
      case 'mastercard': return 'from-orange-400 via-red-500 to-red-600';
      case 'amex': return 'from-slate-700 via-slate-800 to-black';
      default: return 'from-gray-600 via-gray-700 to-gray-800';
    }
  };

  const getBrandLogo = (brand) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-5 bg-white rounded-sm flex items-center justify-center">
              <div className="w-6 h-4 bg-blue-600 rounded-sm relative">
                <div className="absolute inset-1 bg-white rounded-sm"></div>
                <div className="absolute top-1 left-1 w-1 h-1 bg-blue-600 rounded-full"></div>
                <div className="absolute top-1 right-1 w-1 h-1 bg-blue-600 rounded-full"></div>
              </div>
            </div>
            <span className="text-white font-bold text-sm tracking-wider">VISA</span>
          </div>
        );
      case 'mastercard':
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-5 bg-white rounded-full flex items-center justify-center relative overflow-hidden">
              <div className="w-3 h-3 bg-red-500 rounded-full absolute left-1"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full absolute right-1"></div>
            </div>
            <span className="text-white font-bold text-sm tracking-wider">MC</span>
          </div>
        );
      case 'amex':
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-5 bg-white rounded flex items-center justify-center">
              <div className="w-6 h-3 bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                AMEX
              </div>
            </div>
            <span className="text-white font-bold text-sm tracking-wider">AMEX</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-5 bg-white/20 rounded flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm tracking-wider">{brand?.toUpperCase() || 'CARD'}</span>
          </div>
        );
    }
  };

  return (
    <motion.div
      className="relative group"
      onHoverStart={onHover}
      onHoverEnd={onLeave}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      layout
    >
      {/* Default Badge with Ribbon Effect */}
      {card.isDefault && (
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: -10 }}
          className="absolute -top-3 -right-3 z-20 w-8 h-8 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <Star className="w-4 h-4 text-white fill-current" />
        </motion.div>
      )}

      {/* Card Design with Enhanced Styling */}
      <div className={`relative w-full h-56 rounded-3xl bg-gradient-to-br ${getBrandGradient(card.brand)} p-6 text-white shadow-2xl overflow-hidden cursor-pointer`}>
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0">
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20"></div>

          {/* Animated background elements */}
          <motion.div
            className="absolute top-6 right-6 w-20 h-20 rounded-full bg-white/10"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-6 left-6 w-16 h-16 rounded-full bg-white/5"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />

          {/* Security chip pattern */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-8 bg-yellow-300/20 rounded border-2 border-white/30"></div>
        </div>

        {/* Card Content */}
        <div className="relative z-10 h-full flex flex-col justify-between">
          {/* Top section with brand logo */}
          <div className="flex justify-between items-start">
            {getBrandLogo(card.brand)}
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            </div>
          </div>

          {/* Center section with card number */}
          <div className="space-y-3">
            <div className="text-2xl font-mono tracking-widest">
              •••• •••• •••• {card.last4}
            </div>

            {/* Security indicators */}
            <div className="flex items-center gap-2 text-xs opacity-80">
              <Shield className="w-3 h-3" />
              <span>Bank-grade encryption</span>
            </div>
          </div>

          {/* Bottom section */}
          <div className="flex justify-between items-end">
            <div>
              <div className="text-xs opacity-80 uppercase tracking-wider mb-1">Valid Thru</div>
              <div className="text-base font-medium">
                {String(card.expMonth).padStart(2, '0')}/{String(card.expYear).slice(-2)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-80 uppercase tracking-wider mb-1">Cardholder</div>
              <div className="text-base font-medium">•••••••</div>
            </div>
          </div>
        </div>

        {/* Contactless indicator */}
        <div className="absolute top-4 right-4 opacity-60">
          <div className="w-6 h-6 border-2 border-white/60 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 border border-white/80 rounded-full"></div>
          </div>
        </div>

        {/* Hover Actions with Enhanced Design */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              className="absolute inset-0 bg-black/70 rounded-3xl flex items-center justify-center gap-3 p-4"
            >
              {!card.isDefault && (
                <motion.button
                  onClick={() => onSetDefault(card._id)}
                  className="bg-white/20 backdrop-blur-md text-white px-4 py-3 rounded-xl hover:bg-white/30 transition-all flex items-center gap-2 border border-white/20"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Star className="w-4 h-4" />
                  <span className="font-medium">Set Default</span>
                </motion.button>
              )}
              <motion.button
                onClick={() => onRemove(card._id)}
                className="bg-red-500/90 backdrop-blur-md text-white px-4 py-3 rounded-xl hover:bg-red-600 transition-all flex items-center gap-2 border border-red-400/30"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(239,68,68,0.8)" }}
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 className="w-4 h-4" />
                <span className="font-medium">Remove</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Premium Add Card Modal Component
function AddCardModal({ onClose, onSuccess, stripePromise }) {
  const stripe = useStripe();
  const elements = useElements();
  const { showError, showSuccess } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [cardBrand, setCardBrand] = useState('');
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '', name: '' });

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

  // Listen for card brand changes
  useEffect(() => {
    if (elements) {
      const cardElement = elements.getElement(CardElement);
      if (cardElement) {
        cardElement.on('change', (event) => {
          setCardBrand(event.brand || '');
        });
      }
    }
  }, [elements]);

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

      setSuccess(true);

      // Show success animation before closing
      setTimeout(() => {
        showSuccess('Card linked successfully! 🎉');
        onSuccess();
        onClose();
      }, 1500);

    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to link card');
    } finally {
      setLoading(false);
    }
  }

  // Success Animation Component
  if (success) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
          >
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-8 h-8 text-green-600" />
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-bold text-gray-900 mb-2"
              >
                Card Added Successfully!
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600"
              >
                Your card has been securely linked to your account
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Enhanced Header */}
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full transform translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full transform -translate-x-12 translate-y-12"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-3">
                <motion.div
                  className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  <Lock className="w-7 h-7 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold">Add New Card</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <BadgeCheck className="w-4 h-4 text-green-300" />
                    <span className="text-sm text-blue-100">Secured by Stripe</span>
                  </div>
                </div>
              </div>
              <p className="text-blue-100 text-sm leading-relaxed">
                Your cards are tokenized and secured with bank-grade encryption.
                Vault5 never stores card numbers — everything is handled by Stripe.
              </p>

              {/* Security badges */}
              <div className="flex items-center gap-3 mt-4">
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Shield className="w-3 h-3 text-green-300" />
                  <span className="text-xs text-blue-100">PCI DSS</span>
                </div>
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Lock className="w-3 h-3 text-green-300" />
                  <span className="text-xs text-blue-100">SSL Encrypted</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Card Brand Detection */}
              {cardBrand && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 rounded-2xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-800">Card Detected:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotateY: [0, 360] }}
                        transition={{ duration: 0.5 }}
                      >
                        {cardBrand === 'visa' && <div className="w-6 h-4 bg-blue-600 rounded-sm"></div>}
                        {cardBrand === 'mastercard' && <div className="w-6 h-4 bg-red-500 rounded-sm"></div>}
                        {cardBrand === 'amex' && <div className="w-6 h-4 bg-slate-800 rounded-sm"></div>}
                      </motion.div>
                      <span className="text-sm font-bold text-green-700 capitalize">{cardBrand}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Enhanced Card Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Card Information
                </label>
                <div className="relative group">
                  <motion.div
                    className="relative border-2 border-gray-200 rounded-2xl p-5 bg-gradient-to-br from-gray-50 to-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all duration-300"
                    whileHover={{ borderColor: "#3b82f6", boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)" }}
                  >
                    <CardElement options={{
                      ...cardElementOptions,
                      style: {
                        ...cardElementOptions.style,
                        base: {
                          ...cardElementOptions.style.base,
                          fontSize: '16px',
                          fontWeight: '500',
                        }
                      }
                    }} />
                  </motion.div>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <CreditCard className="w-5 h-5" />
                  </div>
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xs text-gray-500 mt-3 flex items-center gap-2"
                >
                  <Shield className="w-3 h-3 text-green-500" />
                  Your card details are encrypted end-to-end and processed securely by Stripe
                </motion.p>
              </div>

              {/* Enhanced Actions */}
              <div className="flex gap-4 pt-6">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-4 border-2 border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={!stripe || loading}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-xl"
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Linking Card...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Plus className="w-5 h-5" />
                      <span>Link Card</span>
                    </div>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Skeleton Card Component for Loading State
function SkeletonCard() {
  return (
    <div className="relative">
      <div className="w-full h-56 rounded-3xl bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 p-6 animate-pulse">
        <div className="h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-20 h-6 bg-gray-400/50 rounded"></div>
            <div className="w-6 h-4 bg-gray-400/30 rounded"></div>
          </div>
          <div className="space-y-3">
            <div className="w-48 h-6 bg-gray-400/50 rounded"></div>
            <div className="w-32 h-3 bg-gray-400/30 rounded"></div>
          </div>
          <div className="flex justify-between items-end">
            <div className="w-16 h-4 bg-gray-400/50 rounded"></div>
            <div className="w-20 h-4 bg-gray-400/50 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Empty State Component
function EmptyState({ onAddCard }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16 px-8"
    >
      <motion.div
        className="relative mx-auto mb-8 w-32 h-32"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        {/* Animated wallet illustration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl transform rotate-12"></div>
        <div className="absolute inset-1 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl transform -rotate-6"></div>
        <div className="absolute inset-2 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
          <div className="text-6xl">💳</div>
        </div>

        {/* Floating cards animation */}
        <motion.div
          className="absolute -top-2 -right-2 w-8 h-6 bg-blue-500 rounded transform rotate-45"
          animate={{
            y: [-2, 2, -2],
            rotate: [45, 50, 45]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-1 -left-1 w-6 h-4 bg-purple-500 rounded transform -rotate-12"
          animate={{
            y: [1, -1, 1],
            rotate: [-12, -17, -12]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-gray-900 mb-3"
      >
        No cards linked yet
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed"
      >
        Link your first card to unlock faster payments, automatic top-ups, and premium features.
        Your security is our priority.
      </motion.p>

      <motion.button
        onClick={onAddCard}
        className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all shadow-xl font-semibold text-lg"
        whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)" }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <span className="flex items-center gap-3">
          <Sparkles className="w-5 h-5" />
          Link Your First Card
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </span>
      </motion.button>
    </motion.div>
  );
}

export default function PaymentsCards() {
  const { showError, showSuccess } = useToast();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState([]);
  const [stripePromise, setStripePromise] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(null);
  const [removingCardId, setRemovingCardId] = useState(null);
  const [notifyMe, setNotifyMe] = useState(false);

  useEffect(() => {
    fetchCards();
    fetchStripeConfig();
  }, []);

  async function fetchCards() {
    try {
      setLoading(true);
      const { data } = await api.get('/api/payment-methods/cards');
      // Ensure data is always an array
      setCards(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error fetching cards:', e);
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
      showSuccess('Default card updated successfully! 🎉');
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to set default card');
    }
  }

  async function handleRemove(cardId) {
    try {
      setRemovingCardId(cardId);
      await api.delete(`/api/payment-methods/cards/${cardId}`);
      await fetchCards();
      showSuccess('Card removed successfully');
      setShowRemoveConfirm(null);
      setRemovingCardId(null);
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to remove card');
      setRemovingCardId(null);
    }
  }

  // Enhanced subscriptions data with more details
  const mockSubscriptions = [
    {
      id: 1,
      name: 'Spotify Premium',
      amount: 9.99,
      nextCharge: 'Oct 15, 2025',
      status: 'active',
      icon: '🎵',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 2,
      name: 'Netflix',
      amount: 15.49,
      nextCharge: 'Oct 20, 2025',
      status: 'active',
      icon: '📺',
      color: 'from-red-500 to-red-600'
    },
    {
      id: 3,
      name: 'Vault5 Plus',
      amount: 4.99,
      nextCharge: 'Oct 25, 2025',
      status: 'active',
      icon: '⭐',
      color: 'from-blue-500 to-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-200/20 to-pink-200/20 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex items-center gap-6">
              <motion.div
                className="relative p-4 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl"
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <Shield className="w-10 h-10 text-white" />
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <div>
                <motion.h1
                  className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Payments & Cards
                </motion.h1>
                <motion.p
                  className="text-xl text-gray-600 mt-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Secure fintech-grade payment management
                </motion.p>
              </div>
            </div>

            {/* Trust indicators */}
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-2xl border border-green-200">
                <BadgeCheck className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">PCI DSS Compliant</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-200">
                <Lock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">256-bit SSL</span>
              </div>
            </motion.div>
          </div>

          {/* Enhanced Security Assurance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border border-emerald-200/50 rounded-2xl p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full transform translate-x-16 -translate-y-16"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <motion.div
                  className="p-3 bg-emerald-100 rounded-2xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Lock className="w-6 h-6 text-emerald-600" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-emerald-900 font-semibold text-lg mb-1">
                    Bank-grade security & tokenization
                  </h3>
                  <p className="text-emerald-700 leading-relaxed">
                    Your cards are tokenized and secured with military-grade encryption.
                    Vault5 never stores card numbers — everything is handled by Stripe's certified infrastructure.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  className="group relative p-3 bg-white/80 hover:bg-white rounded-xl border border-gray-200 hover:border-emerald-300 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Info className="w-5 h-5 text-gray-600 group-hover:text-emerald-600 transition-colors" />
                  <motion.div
                    className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                    initial={{ opacity: 0, y: 5 }}
                    whileHover={{ opacity: 1, y: 0 }}
                  >
                    View compliance details
                  </motion.div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Enhanced Linked Cards Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 p-8 border-b border-gray-200/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                      Your Cards
                    </h2>
                    <p className="text-gray-600 mt-2 text-lg">
                      Manage your linked payment methods with confidence
                    </p>
                  </div>
                  <motion.button
                    onClick={handleAddCard}
                    disabled={loading}
                    className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 shadow-xl font-semibold text-lg overflow-hidden"
                    whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                    <span className="relative flex items-center gap-3">
                      <Plus className="w-5 h-5" />
                      Add New Card
                      <Sparkles className="w-4 h-4 opacity-60" />
                    </span>
                  </motion.button>
                </div>
              </div>

              <div className="p-8">
                {loading ? (
                  <div className="grid gap-8 md:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                ) : cards.length === 0 ? (
                  <EmptyState onAddCard={handleAddCard} />
                ) : (
                  <motion.div
                    className="grid gap-8 md:grid-cols-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {cards.map((card, index) => (
                      <motion.div
                        key={card._id}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        layout
                      >
                        <CardItem
                          card={card}
                          isHovered={hoveredCard === card._id}
                          onHover={() => setHoveredCard(card._id)}
                          onLeave={() => setHoveredCard(null)}
                          onSetDefault={handleSetDefault}
                          onRemove={(cardId) => setShowRemoveConfirm(cardId)}
                          onAnimationComplete={() => setRemovingCardId(null)}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Enhanced Subscriptions Preview */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden sticky top-8"
            >
              <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full transform translate-x-12 -translate-y-12"></div>

                <div className="relative z-10">
                  <motion.div
                    className="flex items-center gap-4 mb-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <motion.div
                      className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                    >
                      <Heart className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Subscriptions</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-purple-100 bg-white/20 px-3 py-1 rounded-full">
                          Coming Soon 🚀
                        </span>
                      </div>
                    </div>
                  </motion.div>
                  <p className="text-purple-100 leading-relaxed">
                    View and manage all your subscriptions in one beautiful interface
                  </p>
                </div>
              </div>

              <div className="p-8">
                <div className="space-y-4 mb-8">
                  {mockSubscriptions.map((sub, index) => (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="group relative p-4 bg-gradient-to-r from-gray-50/80 to-white border border-gray-200/50 rounded-2xl hover:shadow-lg transition-all duration-300"
                      whileHover={{ scale: 1.02, borderColor: "rgba(168, 85, 247, 0.3)" }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${sub.color} flex items-center justify-center text-white text-lg`}>
                            {sub.icon}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900">{sub.name}</span>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              Next: {sub.nextCharge}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-green-600">${sub.amount}</span>
                          <div className="text-xs text-gray-500">/month</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.button
                    onClick={() => setNotifyMe(!notifyMe)}
                    className={`w-full p-4 rounded-2xl border-2 transition-all font-medium ${
                      notifyMe
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-600'
                        : 'bg-white/50 text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <Bell className={`w-5 h-5 ${notifyMe ? 'animate-pulse' : ''}`} />
                      <span>{notifyMe ? 'You\'ll be notified! 🎉' : 'Notify Me When Available'}</span>
                    </div>
                  </motion.button>

                  {notifyMe && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-4 text-center"
                    >
                      <Gift className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-purple-800 font-medium">
                        Thanks for your interest! We'll notify you as soon as subscriptions launch.
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Enhanced Remove Confirmation Modal */}
      <AnimatePresence>
        {showRemoveConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden"
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-red-50 rounded-full transform translate-x-10 -translate-y-10"></div>

              <div className="relative z-10 text-center">
                <motion.div
                  className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6 relative"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                >
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                  <motion.div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>

                <motion.h3
                  className="text-2xl font-bold text-gray-900 mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Remove Payment Method
                </motion.h3>
                <motion.p
                  className="text-gray-600 leading-relaxed mb-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Are you sure you want to remove this card? This action cannot be undone and you'll need to re-add it for future payments.
                </motion.p>

                <div className="flex gap-4">
                  <motion.button
                    onClick={() => setShowRemoveConfirm(null)}
                    className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={removingCardId === showRemoveConfirm}
                  >
                    Keep Card
                  </motion.button>
                  <motion.button
                    onClick={() => handleRemove(showRemoveConfirm)}
                    disabled={removingCardId === showRemoveConfirm}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all font-semibold shadow-lg relative overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {removingCardId === showRemoveConfirm ? (
                      <div className="flex items-center justify-center gap-2">
                        <motion.div
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <span>Removing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        <span>Remove Card</span>
                      </div>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Add Card Modal */}
      <AnimatePresence>
        {showAddModal && stripePromise && (
          <Elements stripe={stripePromise}>
            <AddCardModal
              onClose={() => setShowAddModal(false)}
              onSuccess={fetchCards}
              stripePromise={stripePromise}
            />
          </Elements>
        )}
      </AnimatePresence>
    </div>
  );
}