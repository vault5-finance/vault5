import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import PasswordInput from '../components/PasswordInput';
import { useToast } from '../contexts/ToastContext';
import TwoFactorModal from '../components/TwoFactorModal';
import { getOrCreateDeviceId } from '../utils/device';

const Login = () => {
  const navigate = useNavigate();
  const { showError } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

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
    } catch {
      // no-op
    }
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // include deviceId in body (also added as header by interceptor)
      const payload = { ...form, deviceId };
      const res = await api.post('/api/auth/login', payload);
      const data = res?.data || {};
      console.log('Login response:', data);

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

        // Client-side redirect: admins -> /admin (AdminIndex will route by role), users -> /dashboard
        const adminRoles = ['super_admin', 'system_admin', 'finance_admin', 'compliance_admin', 'support_admin', 'content_admin', 'account_admin'];
        const isAdmin = adminRoles.includes(data.user?.role);
        const safeRedirect = data.redirect || (isAdmin ? '/admin' : '/dashboard');
        console.log('Redirecting to:', safeRedirect, 'User role:', data.user?.role);
        navigate(safeRedirect);
      } else {
        showError('Login failed: Invalid response');
      }
    } catch (err) {
      showError(err?.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTwoFASuccess = (result) => {
    // result: { token, user, redirect }
    try {
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      const redirect = result.redirect || '/dashboard';
      navigate(redirect);
    } finally {
      setTwoFAOpen(false);
      setTempToken('');
      setPrimaryPhone('');
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
            <PasswordInput
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className={`w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {submitting ? 'Signing in...' : 'Login'}
          </button>

          <div className="mt-3 text-center">
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot your password?
            </Link>
          </div>
        </form>
        <p className="mt-4 text-center text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline">Sign Up</Link>
        </p>
      </div>

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