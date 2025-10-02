import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import {
  Phone,
  Shield,
  Lock,
  ArrowLeft,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  MapPin,
  Globe,
  MessageSquare,
  Key
} from 'lucide-react';

const SignupPhone = () => {
  const navigate = useNavigate();
  const { showError, showSuccess, showInfo } = useToast();
  const [form, setForm] = useState({ phone: '', countryCode: '+254' });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [detectedCountry, setDetectedCountry] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    // Auto-detect country from IP
    detectCountry();
  }, []);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const detectCountry = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      const countryCode = data.country_calling_code || '+254';
      setDetectedCountry(data.country_name || 'Kenya');
      setForm(prev => ({ ...prev, countryCode }));
      showInfo(`📍 Detected ${data.country_name || 'Kenya'} as your region. Change if incorrect.`);
    } catch (error) {
      // Fallback to Kenya
      setForm(prev => ({ ...prev, countryCode: '+254' }));
      setDetectedCountry('Kenya');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!form.phone || form.phone.length < 9) {
      showError('Please enter a valid phone number');
      return;
    }

    // Ensure registration step 1 is complete
    const signupData = JSON.parse(sessionStorage.getItem('signupData') || '{}');
    if (!signupData.userId) {
      showInfo('Start with your email to create a session');
      navigate('/signup/email');
      return;
    }

    setLoading(true);

    try {
      const fullPhone = form.countryCode + form.phone.replace(/^0+/, '');
      await api.post('/api/auth/send-otp', { phone: fullPhone });
      setStep('otp');
      setResendTimer(60); // 60 seconds cooldown
      showSuccess('Verification code sent');
    } catch (error) {
      console.error('Send OTP error:', error);
      showError(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      showError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const fullPhone = form.countryCode + form.phone.replace(/^0+/, '');

      // Get signup data and userId
      const signupData = JSON.parse(sessionStorage.getItem('signupData') || '{}');
      const userId = signupData.userId;

      if (!userId) {
        showInfo('Session expired. Please start registration again.');
        navigate('/signup/email');
        return;
      }

      // Verify OTP only (do not commit step 2 here)
      await api.post('/api/auth/verify-otp', { phone: fullPhone, otp });

      // Update signup data with verified phone
      signupData.phone = fullPhone;
      sessionStorage.setItem('signupData', JSON.stringify(signupData));

      showSuccess('Phone verified successfully');
      // Proceed to next step
      navigate('/signup/personal');

    } catch (error) {
      console.error('Verify OTP error:', error);
      showError(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setLoading(true);

    try {
      const fullPhone = form.countryCode + form.phone.replace(/^0+/, '');
      await api.post('/api/auth/send-otp', { phone: fullPhone });
      setResendTimer(60);
      showSuccess('OTP sent successfully');
    } catch (error) {
      console.error('Resend OTP error:', error);
      showError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
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
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div className="w-8 h-0.5 bg-blue-500"></div>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">2</span>
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
              <Phone className="w-8 h-8 text-white" />
            </motion.div>

            <motion.h1
              className="text-3xl font-bold text-gray-900 mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Verify your phone number
            </motion.h1>

            <motion.p
              className="text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {step === 'phone'
                ? "We'll send a secure code to verify your number."
                : "Enter the 6-digit code sent to your phone."
              }
            </motion.p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'phone' ? (
              <motion.form
                key="phone"
                onSubmit={handleSendOTP}
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="flex">
                    <select
                      name="countryCode"
                      value={form.countryCode}
                      onChange={handleChange}
                      className="px-4 py-3 border border-gray-300 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
                    >
                      <option value="+254">🇰🇪 +254</option>
                      <option value="+255">🇹🇿 +255</option>
                      <option value="+256">🇺🇬 +256</option>
                      <option value="+250">🇷🇼 +250</option>
                      <option value="+27">🇿🇦 +27</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+1">🇺🇸 +1</option>
                    </select>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      className={`flex-1 px-4 py-3 border-t border-r border-b rounded-r-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        focusedField === 'phone' ? 'border-blue-500 shadow-lg' : 'border-gray-300'
                      }`}
                      placeholder="712345678"
                      required
                    />
                  </div>
                  {detectedCountry && (
                    <motion.p
                      className="text-xs text-gray-500 mt-2 flex items-center gap-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <MapPin className="w-3 h-3" />
                      We pre-filled your country code based on your location — change if incorrect.
                    </motion.p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Sending...' : 'Send Secure Code'}
                </motion.button>
              </motion.form>
            ) : (
              <motion.form
                key="otp"
                onSubmit={handleVerifyOTP}
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onFocus={() => setFocusedField('otp')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-center text-2xl tracking-widest ${
                      focusedField === 'otp' ? 'border-blue-500 shadow-lg' : 'border-gray-300'
                    }`}
                    placeholder="000000"
                    maxLength="6"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    We sent a code to your phone ending in {form.phone.slice(-3)}
                  </p>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </motion.button>

                <div className="text-center">
                  <motion.button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendTimer > 0 || loading}
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {resendTimer > 0 ? (
                      <>
                        <Clock className="w-4 h-4" />
                        Resend code in {resendTimer}s
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Resend code
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Trust Indicators */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex justify-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Secure SMS</span>
              </div>
              <div className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>One-time use</span>
              </div>
            </div>
          </motion.div>

          {/* Back Button */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <button
              onClick={() => step === 'phone' ? navigate('/signup/email') : setStep('phone')}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              {step === 'phone' ? 'Back to email' : 'Change phone number'}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPhone;