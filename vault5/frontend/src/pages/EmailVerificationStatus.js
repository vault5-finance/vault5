import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Home,
  Mail,
  Shield,
  Sparkles,
  ArrowRight,
  Clock,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Phone,
  MessageCircle,
  ExternalLink,
  Star,
  Heart,
  Zap,
  Target,
  Award,
  Gift
} from 'lucide-react';

const EmailVerificationStatus = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [verificationStep, setVerificationStep] = useState(1);

  useEffect(() => {
    const success = searchParams.get('success');
    const messageParam = searchParams.get('message');

    if (success === 'true') {
      setStatus('success');
      setMessage(messageParam || 'Your email has been verified successfully!');
      setShowConfetti(true);
      setVerificationStep(2); // Mark as completed

      // Hide confetti after animation
      setTimeout(() => setShowConfetti(false), 3000);
    } else {
      setStatus('error');
      setMessage(messageParam || 'Email verification failed. Please try again.');
    }
  }, [searchParams]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-20 h-20 text-green-500" />;
      case 'error':
        return <XCircle className="w-20 h-20 text-red-500" />;
      default:
        return <Shield className="w-20 h-20 text-blue-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50';
      case 'error':
        return 'border-red-300 bg-gradient-to-br from-red-50 to-orange-50';
      default:
        return 'border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50';
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'success':
        return '🎉 Welcome to the Vault5 Network!';
      case 'error':
        return 'Verification Failed';
      default:
        return '🔐 Verifying Your Identity...';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'success':
        return 'Your identity is now secured and your account is fully activated. You\'re ready to experience the future of disciplined finance!';
      case 'error':
        return message;
      default:
        return 'We\'re verifying your email address. This may take a few seconds...';
    }
  };

  const verificationSteps = [
    { step: 1, label: 'Email Sent', status: 'completed', icon: Mail },
    { step: 2, label: 'Email Verified', status: status === 'success' ? 'completed' : 'current', icon: Shield },
    { step: 3, label: 'Account Active', status: status === 'success' ? 'completed' : 'pending', icon: Star }
  ];

  const faqItems = [
    {
      question: "Why do I need to verify my email?",
      answer: "Email verification ensures the security of your account and helps us provide you with important updates about your financial activities."
    },
    {
      question: "What if my verification link expired?",
      answer: "Verification links expire after 24 hours for security reasons. You can request a new verification email from your account settings."
    },
    {
      question: "Can I change my verified email address?",
      answer: "Yes, you can update your email address in your account settings. You'll need to verify the new email address before the change takes effect."
    },
    {
      question: "I'm not receiving verification emails",
      answer: "Check your spam/junk folder first. If you still don't see it, contact our support team and we'll help you complete verification."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full"
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
      </div>

      <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-lg w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Enhanced Logo with Animation */}
          <motion.div
            className="text-center mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="relative mx-auto">
              {/* Pulsing ring animation for success */}
              {status === 'success' && (
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-green-400/30"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}

              <div className="relative w-24 h-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl flex items-center justify-center">
                <Shield className="w-12 h-12 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Enhanced Status Card */}
          <motion.div
            className={`rounded-2xl border-2 p-8 backdrop-blur-sm ${getStatusColor()}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: 1,
              ...(status === 'error' && {
                x: [0, -10, 10, -10, 10, 0]
              })
            }}
            transition={{
              opacity: { duration: 0.5 },
              scale: { duration: 0.5 },
              ...(status === 'error' && {
                x: { duration: 0.5 }
              })
            }}
          >
            {/* Status Icon with Animation */}
            <motion.div
              className="flex justify-center mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
            >
              {getStatusIcon()}
            </motion.div>

            {/* Enhanced Title */}
            <motion.h1
              className="text-3xl font-bold text-gray-900 mb-4 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {getStatusTitle()}
            </motion.h1>

            {/* Enhanced Message */}
            <motion.p
              className="text-gray-600 mb-8 text-center leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              {getStatusMessage()}
            </motion.p>

            {/* Verification Progress for Success */}
            {status === 'success' && (
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 0.9 }}
              >
                <div className="bg-white/50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-800">Verification Progress</h3>
                  </div>

                  <div className="space-y-3">
                    {verificationSteps.map((step, index) => (
                      <motion.div
                        key={step.step}
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.0 + index * 0.1 }}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step.status === 'completed' ? 'bg-green-100 text-green-600' :
                          step.status === 'current' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-400'
                        }`}>
                          <step.icon className="w-4 h-4" />
                        </div>
                        <span className={`text-sm font-medium ${
                          step.status === 'completed' ? 'text-green-700' :
                          step.status === 'current' ? 'text-blue-700' :
                          'text-gray-500'
                        }`}>
                          {step.label}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Enhanced Success Info */}
            {status === 'success' && (
              <motion.div
                className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      🎉 You're All Set!
                    </h3>
                    <ul className="text-sm text-green-700 space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Your account is now fully verified and secure
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        You can access all Vault5 features immediately
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Enhanced security protection is now active
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Start your journey to financial discipline
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Enhanced Error Info */}
            {status === 'error' && (
              <motion.div
                className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">
                      Let's Get You Verified
                    </h3>
                    <ul className="text-sm text-red-700 space-y-2">
                      <li className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-red-500" />
                        Check if the verification link has expired (valid for 24 hours)
                      </li>
                      <li className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-red-500" />
                        Request a new verification email from your account
                      </li>
                      <li className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-red-500" />
                        Make sure you're logged into the correct account
                      </li>
                      <li className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-red-500" />
                        Contact support if the problem persists
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Loading State Enhancement */}
            {status === 'loading' && (
              <motion.div
                className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <motion.div
                    className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="text-blue-800 font-medium">Verifying your email...</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                  />
                </div>
              </motion.div>
            )}

            {/* Enhanced Action Buttons */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/dashboard"
                  className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg transition-all ${
                    status === 'success'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-700'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span>{status === 'success' ? '🚀 Go to Dashboard' : 'Continue to Dashboard'}</span>
                </Link>
              </motion.div>

              {status === 'error' && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to="/settings"
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-blue-200 text-blue-700 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all font-semibold"
                  >
                    <Mail className="w-5 h-5" />
                    <span>📧 Request New Verification</span>
                  </Link>
                </motion.div>
              )}

              <motion.div
                whileHover={{ x: -2 }}
              >
                <Link
                  to="/"
                  className="w-full flex items-center justify-center px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  ← Back to Home
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Enhanced Help Section */}
          <motion.div
            className="mt-12 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <HelpCircle className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Need Help?</h3>
              </div>

              <div className="space-y-4">
                {faqItems.map((faq, index) => (
                  <motion.div
                    key={index}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3 + index * 0.1 }}
                  >
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                      className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                    >
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      <motion.div
                        animate={{ rotate: expandedFAQ === index ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {expandedFAQ === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-6 py-4 bg-white border-t border-gray-200"
                        >
                          <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              {/* Contact Support */}
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Contact Support</span>
                </div>
                <p className="text-blue-800 text-sm mb-3">
                  Still having trouble? Our support team is here to help you complete verification.
                </p>
                <div className="flex gap-3">
                  <a
                    href="mailto:support@vault5.com"
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Mail className="w-4 h-4" />
                    Email Support
                  </a>
                  <a
                    href="tel:+254700000000"
                    className="flex items-center gap-2 px-3 py-2 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                  >
                    <Phone className="w-4 h-4" />
                    Call Support
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Confetti Animation for Success */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight,
                  scale: 0
                }}
                animate={{
                  y: -100,
                  scale: [0, 1, 0],
                  rotate: 360
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 0.5,
                  ease: "easeOut"
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmailVerificationStatus;