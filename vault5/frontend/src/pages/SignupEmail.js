import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import PasswordInput from '../components/PasswordInput';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  Key,
  Users,
  Clock
} from 'lucide-react';

const SignupEmail = () => {
  const navigate = useNavigate();
  const { showError, showSuccess, showInfo } = useToast();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showExistingModal, setShowExistingModal] = useState(false);
  const [existingAccount, setExistingAccount] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    // Check password strength
    const strength = calculatePasswordStrength(form.password);
    setPasswordStrength(strength);
  }, [form.password]);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const getStrengthColor = () => {
    if (passwordStrength < 40) return 'bg-red-500';
    if (passwordStrength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength < 40) return 'Weak';
    if (passwordStrength < 70) return 'Fair';
    return 'Strong';
  };

  const getPasswordHints = () => {
    const hints = [];
    if (form.password.length < 8) hints.push('Use at least 8 characters');
    if (!/[A-Z]/.test(form.password)) hints.push('Add uppercase letters');
    if (!/[a-z]/.test(form.password)) hints.push('Add lowercase letters');
    if (!/[0-9]/.test(form.password)) hints.push('Include numbers');
    if (!/[^A-Za-z0-9]/.test(form.password)) hints.push('Add special characters');
    return hints;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    if (passwordStrength < 40) {
      showError('Password is too weak. Please use a stronger password.');
      return;
    }

    setLoading(true);

    try {
      // Check if email already exists
      const checkResponse = await api.post('/api/auth/check-email', { email: form.email });

      if (checkResponse.data.exists) {
        setExistingAccount({ email: form.email, method: checkResponse.data.method });
        setShowExistingModal(true);
        setLoading(false);
        return;
      }

      // Email is available, create temporary user (step 1)
      const step1Response = await api.post('/api/auth/register/step1', {
        email: form.email,
        password: form.password
      });

      // Store signup data with userId
      sessionStorage.setItem('signupData', JSON.stringify({
        userId: step1Response.data.userId,
        email: form.email,
        password: form.password
      }));

      navigate('/signup/phone');

    } catch (error) {
      console.error('Signup check error:', error);
      showError(error.response?.data?.message || 'Error checking email availability');
    } finally {
      setLoading(false);
    }
  };

  const handleExistingAccountChoice = (action) => {
    if (action === 'login') {
      navigate('/login');
    } else if (action === 'forgot') {
      navigate('/forgot-password');
    } else if (action === 'different') {
      setShowExistingModal(false);
      setForm({ ...form, email: '' });
    }
  };

  const getAccountTypeTitle = () => {
    return 'Vault5 Account';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-blue-200/30 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 bg-purple-200/30 rounded-full blur-xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <motion.div
          className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Progress Indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-sm">2</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-sm">3</span>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Key className="w-8 h-8 text-white" />
            </motion.div>

            <motion.h1
              className="text-3xl font-bold text-gray-900 mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Let's secure your Vault5 account
            </motion.h1>

            <motion.p
              className="text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Enter your email and create a strong password. You're just a few steps away from financial freedom.
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                    focusedField === 'email' ? 'border-blue-500 shadow-lg' : 'border-gray-300'
                  }`}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <PasswordInput
                name="password"
                value={form.password}
                onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="Create a strong password"
                required
              />

              {/* Password Strength Indicator */}
              {form.password && (
                <motion.div
                  className="mt-3"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between text-xs text-gray-600 mb-2">
                    <span>Password strength</span>
                    <span className={`font-medium ${
                      passwordStrength < 40 ? 'text-red-600' :
                      passwordStrength < 70 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {getStrengthText()}
                    </span>
                  </div>

                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full transition-all duration-500 ${getStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                    <motion.div
                      className="absolute top-0 left-0 w-2 h-2 bg-white rounded-full shadow-sm"
                      animate={{
                        x: `${passwordStrength}%`,
                        scale: passwordStrength > 0 ? 1 : 0
                      }}
                      transition={{ duration: 0.5 }}
                      style={{ transform: 'translateX(-50%)' }}
                    />
                  </div>

                  {/* Dynamic Hints */}
                  <div className="mt-2 space-y-1">
                    {getPasswordHints().map((hint, index) => (
                      <motion.div
                        key={index}
                        className="text-xs text-gray-500 flex items-center gap-1"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                      >
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        {hint}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Confirm Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <PasswordInput
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                onFocus={() => setFocusedField('confirm')}
                onBlur={() => setFocusedField(null)}
                placeholder="Confirm your password"
                required
              />

              {/* Match Indicator */}
              {form.confirmPassword && (
                <motion.div
                  className="mt-2 flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {form.password === form.confirmPassword ? (
                    <motion.div
                      className="flex items-center gap-1 text-green-600 text-xs"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <CheckCircle className="w-3 h-3" />
                      Passwords match
                    </motion.div>
                  ) : (
                    <motion.div
                      className="flex items-center gap-1 text-red-600 text-xs"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      Passwords don't match yet
                    </motion.div>
                  )}
                </motion.div>
              )}
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              className="flex justify-center gap-4 text-xs text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Encrypted end-to-end</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Never shared</span>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.button
              type="submit"
              disabled={loading || passwordStrength < 40 || form.password !== form.confirmPassword}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
              <span className="relative">
                {loading ? 'Checking...' : 'Continue →'}
              </span>
            </motion.button>
          </form>

          {/* Sign In Link */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Sign in
              </button>
            </p>
          </motion.div>

          {/* Back Button */}
          <motion.div
            className="mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            <button
              onClick={() => navigate('/signup')}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to signup options
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Existing Account Modal */}
      <AnimatePresence>
        {showExistingModal && existingAccount && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <div className="text-center mb-6">
                <motion.div
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Users className="w-8 h-8 text-green-600" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome back!</h3>
                <p className="text-gray-600">
                  Good news! You already have a Vault5 account with <strong>{existingAccount.email}</strong>
                </p>
              </div>

              <div className="space-y-3">
                <motion.button
                  onClick={() => handleExistingAccountChoice('login')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign in to existing account
                </motion.button>

                <motion.button
                  onClick={() => handleExistingAccountChoice('forgot')}
                  className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Forgot password?
                </motion.button>

                <motion.button
                  onClick={() => handleExistingAccountChoice('different')}
                  className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Use a different email
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SignupEmail;