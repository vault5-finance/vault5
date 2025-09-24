import React, { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

export default function TwoFactorModal({
  isOpen,
  onClose,
  tempToken,
  deviceId,
  primaryPhone = '',
  onSuccess
}) {
  const { showError, showSuccess } = useToast();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (isOpen && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [isOpen]);

  const reset = () => {
    setOtp(['', '', '', '', '', '']);
    setRememberDevice(true);
  };

  const handleClose = () => {
    reset();
    onClose && onClose();
  };

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // only digits, 0-1 length
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
    if (next.every(d => d !== '') && next.join('').length === 6) {
      handleVerify(next.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!data) return;
    const next = data.padEnd(6, ' ').split('').slice(0, 6);
    setOtp(next);
    const targetIndex = Math.min(data.length, 5);
    inputsRef.current[targetIndex]?.focus();
    if (data.length === 6) {
      handleVerify(data);
    }
  };

  const handleVerify = async (code = otp.join('')) => {
    if (!tempToken) {
      showError('Session expired. Please login again.');
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      showError('Enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/verify-2fa', {
        otp: code,
        rememberDevice: Boolean(rememberDevice),
        deviceId,
        tempToken
      });
      // Expect: { token, user, redirect, message }
      if (data?.token && data?.user) {
        showSuccess(data?.message || 'Verification successful');
        onSuccess && onSuccess(data);
        handleClose();
      } else {
        showError('Verification failed: invalid server response');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to verify code';
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-md mx-4 rounded-lg p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Two-Factor Verification</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 text-sm text-gray-700">
          <p>For your security, enter the 6-digit code we sent to:</p>
          <p className="font-semibold mt-1">{primaryPhone || 'your primary phone'}</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
          <div className="flex justify-center space-x-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => (inputsRef.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                disabled={loading}
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="inline-flex items-center text-sm text-gray-700">
            <input
              type="checkbox"
              className="mr-2"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              disabled={loading}
            />
            Remember this device
          </label>
          <p className="text-xs text-gray-500 mt-1">
            This device will be trusted. You may not be asked for a code next time unless we detect unusual activity.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={() => handleVerify()}
            className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={loading || otp.join('').length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-800">
          <p>
            Tip: In this development build, any 6-digit code is accepted. In production, only the code sent to your device will work.
          </p>
        </div>
      </div>
    </div>
  );
}