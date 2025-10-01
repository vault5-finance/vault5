import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheckIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  LockClosedIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/solid';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' | 'error'
  const [loading, setLoading] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(0);
  const navigate = useNavigate();

  // Auto-focus email input
  useEffect(() => {
    const input = document.getElementById('email-input');
    if (input) input.focus();
  }, []);

  // Email validation
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(emailRegex.test(email));
  }, [email]);

  // Auto-redirect countdown
  useEffect(() => {
    if (redirectCountdown > 0) {
      const timer = setTimeout(() => setRedirectCountdown(redirectCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (redirectCountdown === 0 && messageType === 'success') {
      navigate('/login');
    }
  }, [redirectCountdown, messageType, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailValid) return;

    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      await api.post('/api/auth/forgot-password', { email });
      setMessage('We\'ve locked a reset link inside your inbox vault. Open it to set your new key!');
      setMessageType('success');
      setRedirectCountdown(10); // 10 second countdown
    } catch (err) {
      setMessage('We couldn\'t send the reset link. Please check your email and try again.');
      setMessageType('error');
    }
    setLoading(false);
  };

  const handleResend = () => {
    handleSubmit({ preventDefault: () => {} });
  };

  const cancelRedirect = () => {
    setRedirectCountdown(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-200 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-purple-200 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full space-y-8"
        >
          {/* Header with Vault5 Branding */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <LockClosedIcon className="w-10 h-10 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-4xl font-bold text-gray-900"
            >
              Reset Your Password Securely
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-2 text-lg text-gray-600"
            >
              Enter your email, and we'll send you instructions to safely reset your password.
            </motion.p>
          </div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 space-y-6"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <label htmlFor="email-input" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email-input"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="your.email@example.com"
                />
                <AnimatePresence>
                  {email && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {emailValid ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading || !emailValid}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white transition-all duration-200 ${
                loading || !emailValid
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Sending Reset Link...
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="mr-2 h-4 w-4" />
                  Send Secure Reset Link
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Message Display */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className={`rounded-xl p-4 border backdrop-blur-sm ${
                  messageType === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {messageType === 'success' ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    ) : (
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium">{message}</p>
                    {messageType === 'success' && (
                      <div className="mt-3">
                        <div className="text-xs text-green-700 mb-2">
                          Didn't get the email? Check your spam folder or{' '}
                          <button
                            onClick={handleResend}
                            className="text-green-600 hover:text-green-500 font-medium underline"
                          >
                            request again
                          </button>
                        </div>

                        {/* Progress Steps */}
                        <div className="flex items-center space-x-4 text-xs text-green-700">
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                              <span className="text-white font-bold">1</span>
                            </div>
                            Check Email
                          </div>
                          <ArrowPathIcon className="w-4 h-4 text-green-400" />
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center mr-2">
                              <span className="text-green-600 font-bold">2</span>
                            </div>
                            Click Link
                          </div>
                          <ArrowPathIcon className="w-4 h-4 text-green-400" />
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center mr-2">
                              <span className="text-green-600 font-bold">3</span>
                            </div>
                            Reset Password
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Auto-redirect countdown */}
          <AnimatePresence>
            {redirectCountdown > 0 && messageType === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center"
              >
                <p className="text-sm text-gray-600">
                  Redirecting you to Login in{' '}
                  <span className="font-semibold text-blue-600">{redirectCountdown}</span>{' '}
                  seconds...{' '}
                  <button
                    onClick={cancelRedirect}
                    className="text-blue-600 hover:text-blue-500 underline"
                  >
                    Cancel
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Back to Login */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Login
            </Link>
          </motion.div>

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
              <ShieldCheckIcon className="w-3 h-3" />
              Your security is our priority. Links expire in 10 minutes.
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;