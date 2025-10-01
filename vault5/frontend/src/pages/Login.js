import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import PasswordInput from '../components/PasswordInput';
import { useToast } from '../contexts/ToastContext';
import TwoFactorModal from '../components/TwoFactorModal';
import { getOrCreateDeviceId } from '../utils/device';
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  Star,
  Zap,
  Apple,
  Chrome,
  Github
} from 'lucide-react';

// Enhanced Login Component with Premium Split-Screen Design
const Login = () => {
  const navigate = useNavigate();
  const { showError } = useToast();
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [submitting, setSubmitting] = useState(false);
  const [shakeForm, setShakeForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 2FA state
  const [twoFAOpen, setTwoFAOpen] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    try {
      const id = getOrCreateDeviceId();
      setDeviceId(id);
      // Prefill email if redirected from verification link
      const params = new URLSearchParams(window.location.search);
      const emailPrefill = params.get('email');
      if (emailPrefill) {
        setForm(prev => ({ ...prev, email: emailPrefill }));
      }

      // Auto-focus email field
      const emailInput = document.getElementById('email-input');
      if (emailInput && !emailPrefill) {
        setTimeout(() => emailInput.focus(), 100);
      }
    } catch {
      // no-op
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // include deviceId in body (also added as header by interceptor)
      const payload = { ...form, deviceId };
      const res = await api.post('/api/auth/login', payload);
      const data = res?.data || {};

      // 2FA flow: show modal if required
      if (data.twoFactorRequired && data.tempToken) {
        setTempToken(data.tempToken);
        setPrimaryPhone(data.primaryPhone || '');
        setTwoFAOpen(true);
        return; // stop here; modal will complete login
      }

      // Normal flow: token present
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Handle remember me
        if (form.rememberMe) {
          localStorage.setItem('rememberedEmail', form.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        // Client-side redirect: admins -> /admin (AdminIndex will route by role), users -> /dashboard
        const adminRoles = ['super_admin', 'system_admin', 'finance_admin', 'compliance_admin', 'support_admin', 'content_admin', 'account_admin'];
        const isAdmin = adminRoles.includes(data.user?.role);
        const safeRedirect = data.redirect || (isAdmin ? '/admin' : '/dashboard');
        navigate(safeRedirect);
      } else {
        showError('Login failed: Invalid response');
        setShakeForm(true);
        setTimeout(() => setShakeForm(false), 500);
      }
    } catch (err) {
      showError(err?.response?.data?.message || 'Login failed');
      setShakeForm(true);
      setTimeout(() => setShakeForm(false), 500);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTwoFASuccess = (result) => {
    try {
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      if (form.rememberMe) {
        localStorage.setItem('rememberedEmail', form.email);
      }

      const redirect = result.redirect || '/dashboard';
      navigate(redirect);
    } finally {
      setTwoFAOpen(false);
      setTempToken('');
      setPrimaryPhone('');
    }
  };

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setForm(prev => ({ ...prev, email: rememberedEmail, rememberMe: true }));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex relative overflow-hidden">
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

      {/* Left Panel - Branding & Illustration */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 xl:w-2/5 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-12 flex-col justify-center relative overflow-hidden"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-white/20 rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 border-2 border-white/20 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-white/20 rounded-full"></div>
        </div>

        <div className="relative z-10 text-white">
          {/* Vault5 Logo/Branding */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <Shield className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold">Vault5</h1>
                <p className="text-blue-100 text-sm">Secure Financial Hub</p>
              </div>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-5xl font-bold mb-4 leading-tight">
              Welcome to the
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Future of Finance
              </span>
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              Manage your money with confidence. Secure, smart, and designed for the modern world.
            </p>
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {[
              { icon: Shield, text: 'Bank-grade security & encryption' },
              { icon: Zap, text: 'Lightning-fast transactions' },
              { icon: Star, text: 'AI-powered financial insights' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-blue-100">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span className="text-white font-medium">Trusted by thousands</span>
            </div>
            <p className="text-blue-100 text-sm">
              Your financial data is protected with military-grade encryption and PCI DSS compliance.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Panel - Login Form */}
      <motion.div
        className="flex-1 flex items-center justify-center p-8 lg:p-12"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.div
          className={`w-full max-w-md ${shakeForm ? 'animate-pulse' : ''}`}
          animate={shakeForm ? {
            x: [0, -10, 10, -10, 10, 0],
            transition: { duration: 0.5 }
          } : {}}
        >
          {/* Back Button */}
          <motion.button
            onClick={() => navigate('/')}
            className="mb-8 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-all group"
            whileHover={{ x: -2 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Back to Vault5</span>
          </motion.button>

          {/* Login Card */}
          <motion.div
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-8"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
          >
            {/* Header */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
              </div>
              <p className="text-gray-600">
                Sign in to manage your finances securely with Vault5
              </p>
            </motion.div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="email-input"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-500"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-500"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>

              {/* Remember Me & Forgot Password */}
              <motion.div
                className="flex items-center justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={form.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </motion.div>

              {/* Login Button */}
              <motion.button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                whileHover={{ scale: submitting ? 1 : 1.02 }}
                whileTap={{ scale: submitting ? 1 : 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />

                {submitting ? (
                  <div className="flex items-center justify-center gap-3 relative z-10">
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>Signing you in...</span>
                  </div>
                ) : (
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Sign In Securely
                  </span>
                )}
              </motion.button>

              {/* Divider */}
              <motion.div
                className="relative my-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or continue with</span>
                </div>
              </motion.div>

              {/* SSO Placeholder */}
              <motion.div
                className="grid grid-cols-3 gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
              >
                {[
                  { icon: Chrome, name: 'Google', color: 'hover:bg-red-50 hover:border-red-200' },
                  { icon: Apple, name: 'Apple', color: 'hover:bg-gray-50 hover:border-gray-200' },
                  { icon: Github, name: 'GitHub', color: 'hover:bg-gray-50 hover:border-gray-200' }
                ].map((provider, index) => (
                  <button
                    key={index}
                    className={`p-3 border-2 border-gray-200 rounded-xl transition-all ${provider.color} opacity-50 cursor-not-allowed`}
                    disabled
                  >
                    <provider.icon className="w-5 h-5 mx-auto text-gray-400" />
                  </button>
                ))}
              </motion.div>
            </form>

            {/* Sign Up Link */}
            <motion.div
              className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-2xl border border-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <p className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Create one here →
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* 2FA Modal */}
      <TwoFactorModal
        isOpen={twoFAOpen}
        onClose={() => setTwoFAOpen(false)}
        tempToken={tempToken}
        deviceId={deviceId}
        primaryPhone={primaryPhone}
        onSuccess={handleTwoFASuccess}
      />
    </div>
  );
};

export default Login;