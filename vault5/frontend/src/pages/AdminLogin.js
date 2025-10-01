import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Key,
  Terminal,
  Sparkles,
  Zap,
  Clock,
  Globe,
  Server,
  Database,
  Activity,
  ChevronRight,
  RefreshCw,
  User,
  Fingerprint,
  Smartphone,
  Monitor,
  MapPin,
  Calendar,
  Loader2,
  X
} from 'lucide-react';
import api from '../services/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockWarning, setCapsLockWarning] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    // Check if already logged in as admin
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Check if user has any admin role
    const adminRoles = ['super_admin', 'system_admin', 'finance_admin', 'compliance_admin', 'support_admin', 'content_admin'];
    if (token && adminRoles.includes(user.role)) {
      navigate('/admin');
    }
  }, [navigate]);

  // Enhanced keyboard shortcuts and security features
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Caps Lock detection
      if (e.getModifierState && e.getModifierState('CapsLock')) {
        setCapsLockWarning(true);
      } else {
        setCapsLockWarning(false);
      }

      // Terminal easter egg
      if (e.ctrlKey && e.key === '`') {
        setShowTerminal(!showTerminal);
      }

      // Escape to user login
      if (e.key === 'Escape') {
        navigate('/login');
      }

      // Enter to submit
      if (e.key === 'Enter' && !loading) {
        document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, loading, showTerminal]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/login', formData);
      const { token, user, redirect } = response.data;

      // Verify this is an admin user
      const adminRoles = ['super_admin', 'system_admin', 'finance_admin', 'compliance_admin', 'support_admin', 'content_admin'];
      if (!adminRoles.includes(user.role)) {
        setError('Access denied. Admin credentials required.');
        return;
      }

      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Set success state for animation
      setLoginSuccess(true);

      // Brief delay to show success animation
      setTimeout(() => {
        navigate(redirect || '/admin');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        {/* Primary floating orbs */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-32 right-20 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-cyan-500/20 rounded-full blur-xl animate-pulse delay-500"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-indigo-500/20 rounded-full blur-xl animate-pulse delay-1500"></div>

        {/* Circuit board pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '60px 60px'
          }} />
        </div>
      </div>

      {/* Enhanced Floating Elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-60"
        />
        <motion.div
          animate={{
            x: [0, -25, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-60"
        />
        <motion.div
          animate={{
            x: [0, 20, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 bg-cyan-400 rounded-full opacity-60"
        />
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Enhanced Vault5 Logo with Animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-8"
          >
            <motion.div
              className="relative mx-auto mb-6"
              whileHover={{ scale: 1.05, rotateY: 5 }}
              transition={{ duration: 0.3 }}
            >
              {/* Pulsing security ring */}
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-blue-400/30"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-2xl shadow-2xl shadow-blue-500/25 flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <motion.h1
              className="text-4xl font-bold text-white mb-2 tracking-wider"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              VAULT5
            </motion.h1>

            <motion.div
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div
                className="w-2 h-2 bg-green-400 rounded-full"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-white text-sm font-medium">ADMIN PORTAL</span>
            </motion.div>
          </motion.div>

          {/* Enhanced Security Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 text-green-400 text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>Verified Admin Access</span>
            </div>
          </motion.div>

          {/* Enhanced Glassmorphism Login Card */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            onSubmit={handleSubmit}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl transition-all duration-300 relative overflow-hidden"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Card reflection effect */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Administrator Access</h2>
              <p className="text-slate-300 text-sm">Enter your credentials to access the admin panel</p>
            </div>

            <div className="space-y-6">
              {/* Enhanced Email Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
              >
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Admin Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200"
                    placeholder="admin@vault5.com"
                    style={{
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    }}
                  />
                </div>
              </motion.div>

              {/* Enhanced Password Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
              >
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-12 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200"
                    placeholder="Enter admin password"
                    style={{
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Caps Lock Warning */}
                {capsLockWarning && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
                  >
                    <p className="text-yellow-400 text-xs flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Caps Lock is enabled
                    </p>
                  </motion.div>
                )}
              </motion.div>

              {/* Enhanced Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: [0, -10, 10, -10, 10, 0]
                  }}
                  transition={{
                    opacity: { duration: 0.3 },
                    scale: { duration: 0.3 },
                    x: { duration: 0.5, delay: 0.2 }
                  }}
                  className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: 2 }}
                    >
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    </motion.div>
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                </motion.div>
              )}

              {/* Success Animation */}
              {loginSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-green-500/10 backdrop-blur-xl rounded-3xl flex items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="text-center"
                  >
                    <motion.div
                      className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1 }}
                    >
                      <CheckCircle className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-white mb-2">Access Granted</h3>
                    <p className="text-green-300">Redirecting to admin panel...</p>
                  </motion.div>
                </motion.div>
              )}

              {/* Session Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.4 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <MapPin className="w-3 h-3" />
                  <span>Secure connection • IP: 192.168.1.1</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mt-1">
                  <Monitor className="w-3 h-3" />
                  <span>Session timeout: 5 minutes</span>
                </div>
              </motion.div>

              {/* Enhanced Login Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.4 }}
                whileHover={{
                  scale: loading ? 1 : 1.02,
                  boxShadow: loading ? '0 10px 25px -5px rgba(59, 130, 246, 0.4)' : '0 0 30px rgba(59, 130, 246, 0.5)'
                }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-500 hover:via-purple-500 hover:to-cyan-500 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)',
                  boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />

                {loading ? (
                  <div className="flex items-center justify-center gap-3 relative z-10">
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3 relative z-10">
                    <Shield className="w-5 h-5" />
                    <span>Access Admin Panel</span>
                  </div>
                )}
              </motion.button>
            </div>
          </motion.form>

          {/* Enhanced Navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.4 }}
            className="text-center mt-8 space-y-4"
          >
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to User Login</span>
            </Link>

            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Forgot Password?
              </Link>
            </div>
          </motion.div>

          {/* Enhanced Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.4 }}
            className="text-center mt-12 space-y-3"
          >
            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>256-bit SSL</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                <span>PCI DSS</span>
              </div>
              <div className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                <span>Global Compliance</span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              🔒 Authorized Administrators Only | Vault5 © 2025
            </p>

            {/* Background Story */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
            >
              <p className="text-xs text-slate-600 italic">
                "Vault5: Powered by Discipline, Protected by Security"
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Terminal Easter Egg */}
      <AnimatePresence>
        {showTerminal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-green-400 font-mono">admin@vault5:~$</h3>
                <button
                  onClick={() => setShowTerminal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-green-400 font-mono text-sm space-y-1">
                <div>{'>'} Access granted to admin terminal</div>
                <div>{'>'} Loading system diagnostics...</div>
                <div>{'>'} ███████████████████ 100%</div>
                <div>{'>'} Welcome, Administrator</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLogin;