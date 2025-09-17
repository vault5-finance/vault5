import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const SignupPhone = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', countryCode: '+254' });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [detectedCountry, setDetectedCountry] = useState('');

  useEffect(() => {
    // Auto-detect country from IP (simplified - in real app use a service)
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
      // In a real app, you'd use a service like ipapi.co or maxmind
      // For now, we'll simulate based on common patterns
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      const countryCode = data.country_calling_code || '+254';
      setDetectedCountry(data.country_name || 'Kenya');
      setForm(prev => ({ ...prev, countryCode }));
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
      alert('Please enter a valid phone number');
      return;
    }

    setLoading(true);

    try {
      const fullPhone = form.countryCode + form.phone.replace(/^0+/, '');
      await api.post('/api/auth/send-otp', { phone: fullPhone });
      setStep('otp');
      setResendTimer(60); // 60 seconds cooldown
    } catch (error) {
      console.error('Send OTP error:', error);
      alert(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const fullPhone = form.countryCode + form.phone.replace(/^0+/, '');
      await api.post('/api/auth/verify-otp', { phone: fullPhone, otp });

      // Store phone in signup data
      const signupData = JSON.parse(sessionStorage.getItem('signupData') || '{}');
      signupData.phone = fullPhone;
      sessionStorage.setItem('signupData', JSON.stringify(signupData));

      // Proceed to next step
      navigate(`/signup/${type}/details`);

    } catch (error) {
      console.error('Verify OTP error:', error);
      alert(error.response?.data?.message || 'Invalid OTP. Please try again.');
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
      alert('OTP sent successfully');
    } catch (error) {
      console.error('Resend OTP error:', error);
      alert('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAccountTypeTitle = () => {
    switch (type) {
      case 'personal': return 'Personal Account';
      case 'business': return 'Business Account';
      case 'developer': return 'Developer Account';
      default: return 'Account';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {getAccountTypeTitle()} Setup
            </h1>
            <p className="text-gray-600">
              {step === 'phone'
                ? "We'll send a one-time code to verify your number."
                : "Enter the 6-digit code sent to your phone."
              }
            </p>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="flex">
                  <select
                    name="countryCode"
                    value={form.countryCode}
                    onChange={handleChange}
                    className="px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
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
                    className="flex-1 px-3 py-2 border-t border-r border-b border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="712345678"
                    required
                  />
                </div>
                {detectedCountry && (
                  <p className="text-xs text-gray-500 mt-1">
                    We pre-filled your country code based on your location — change if incorrect.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength="6"
                  required
                />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Enter the 6-digit code sent to {form.countryCode} {form.phone}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendTimer > 0 || loading}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => step === 'phone' ? navigate(`/signup/${type}`) : setStep('phone')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← {step === 'phone' ? 'Back to email' : 'Change phone number'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPhone;