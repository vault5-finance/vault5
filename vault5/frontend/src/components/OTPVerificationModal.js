import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const OTPVerificationModal = ({
  isOpen,
  onClose,
  phoneNumber,
  onVerificationSuccess,
  purpose = 'phone_verification'
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const inputRefs = useRef([]);

  // Start countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [isOpen]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

    if (pastedData.length > 0) {
      const newOtp = [...otp];
      pastedData.split('').forEach((digit, index) => {
        if (index < 6) newOtp[index] = digit;
      });
      setOtp(newOtp);

      // Focus next empty input or last input
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();

      // Auto-submit if complete
      if (pastedData.length === 6) {
        handleVerify(pastedData);
      }
    }
  };

  const handleVerify = async (otpValue = otp.join('')) => {
    if (otpValue.length !== 6) {
      toast.error('Please enter a complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/otp/verify', {
        phoneNumber,
        otp: otpValue,
        purpose
      });

      if (response.data.success) {
        toast.success(response.data.message);
        onVerificationSuccess && onVerificationSuccess();
        onClose();
      } else {
        setAttempts(prev => prev + 1);
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setAttempts(prev => prev + 1);
      toast.error(error.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const response = await api.post('/api/otp/resend', {
        phoneNumber,
        purpose
      });

      if (response.data.success) {
        toast.success('OTP resent successfully');
        setCountdown(60); // 60 seconds cooldown
        setAttempts(0);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('OTP resend error:', error);
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const resetModal = () => {
    setOtp(['', '', '', '', '', '']);
    setAttempts(0);
    setCountdown(0);
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Verify Phone Number</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            We've sent a 6-digit verification code to:
          </p>
          <p className="font-semibold text-lg">{phoneNumber}</p>
          <p className="text-sm text-gray-500 mt-1">
            Enter the code below to verify your phone number.
          </p>
        </div>

        {/* OTP Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Verification Code
          </label>
          <div className="flex justify-center space-x-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="1"
                value={digit}
                onChange={e => handleOtpChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                disabled={loading}
              />
            ))}
          </div>
        </div>

        {/* Attempts Counter */}
        {attempts > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              {attempts === 1
                ? "That code didn't work. Please check and try again."
                : `Failed attempts: ${attempts}/3. Please request a new code if needed.`
              }
            </p>
          </div>
        )}

        {/* Resend OTP */}
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Didn't receive the code?
          </p>
          {countdown > 0 ? (
            <p className="text-sm text-blue-600 font-medium">
              Resend available in {countdown} seconds
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium underline disabled:opacity-50"
            >
              {resendLoading ? 'Sending...' : 'Resend Code'}
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={() => handleVerify()}
            disabled={loading || otp.join('').length !== 6}
            className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-blue-800">
            💡 <strong>Troubleshooting:</strong><br />
            • Check if the SMS was delivered to your phone<br />
            • Make sure you're entering the code from {phoneNumber}<br />
            • Codes expire after 10 minutes for security
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationModal;