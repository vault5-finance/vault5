import React, { useState, useEffect } from 'react';
import { X, Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';

const EmailVerificationModal = ({ isOpen, onClose, email, onVerificationSuccess }) => {
  const [status, setStatus] = useState('idle'); // idle, sending, sent, error
  const [countdown, setCountdown] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendVerification = async () => {
    if (countdown > 0) return;

    setStatus('sending');
    setMessage('');

    try {
      const response = await api.post('/email-verification/send', { email });

      if (response.data.success) {
        setStatus('sent');
        setCountdown(60); // 60 second cooldown
        setMessage('Verification email sent! Check your inbox and click the verification link.');
      } else {
        setStatus('error');
        setMessage(response.data.message || 'Failed to send verification email');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to send verification email');
    }
  };

  const handleResendVerification = async () => {
    if (countdown > 0) return;

    setStatus('sending');
    setMessage('');

    try {
      const response = await api.post('/email-verification/resend');

      if (response.data.success) {
        setStatus('sent');
        setCountdown(60); // 60 second cooldown
        setMessage('Verification email resent! Check your inbox and click the verification link.');
      } else {
        setStatus('error');
        setMessage(response.data.message || 'Failed to resend verification email');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to resend verification email');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Mail className="w-6 h-6 text-blue-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'sent':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Verify Your Email</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className={`rounded-lg border-2 p-4 mb-6 ${getStatusColor()}`}>
            <div className="flex items-start space-x-3">
              {getStatusIcon()}
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">
                  {status === 'sent' ? 'Verification Email Sent!' :
                   status === 'error' ? 'Verification Failed' :
                   'Verify Your Email Address'}
                </h3>
                <p className="text-sm text-gray-600">
                  {status === 'sent'
                    ? 'We\'ve sent a verification link to your email address. Click the link to verify your account.'
                    : status === 'error'
                    ? message
                    : `We'll send a verification link to ${email || 'your email address'}. Click the link to verify your account.`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Email Display */}
          {email && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">{email}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {status === 'sent' ? (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Didn't receive the email? Check your spam folder or click below to resend.
                </p>
                <button
                  onClick={handleResendVerification}
                  disabled={countdown > 0}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    countdown > 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${countdown > 0 ? 'animate-spin' : ''}`} />
                  <span>
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Verification Email'}
                  </span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleSendVerification}
                disabled={status === 'sending'}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  status === 'sending'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Mail className={`w-4 h-4 ${status === 'sending' ? 'animate-pulse' : ''}`} />
                <span>
                  {status === 'sending' ? 'Sending...' : 'Send Verification Email'}
                </span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Close
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Check your spam or junk folder</li>
              <li>• Make sure to click the verification link within 24 hours</li>
              <li>• The link will redirect you back to Vault5</li>
              <li>• Contact support if you continue having issues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationModal;