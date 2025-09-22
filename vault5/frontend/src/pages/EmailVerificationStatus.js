import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, Home, Mail } from 'lucide-react';

const EmailVerificationStatus = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const success = searchParams.get('success');
    const messageParam = searchParams.get('message');

    if (success === 'true') {
      setStatus('success');
      setMessage(messageParam || 'Your email has been verified successfully!');
    } else {
      setStatus('error');
      setMessage(messageParam || 'Email verification failed. Please try again.');
    }
  }, [searchParams]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return <AlertCircle className="w-16 h-16 text-yellow-500 animate-pulse" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-yellow-200 bg-yellow-50';
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'success':
        return 'Email Verified Successfully!';
      case 'error':
        return 'Verification Failed';
      default:
        return 'Verifying...';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Logo/Icon */}
          <div className="mx-auto h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center mb-8">
            <span className="text-2xl font-bold text-white">V5</span>
          </div>

          {/* Status Card */}
          <div className={`rounded-lg border-2 p-8 ${getStatusColor()}`}>
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {getStatusTitle()}
            </h1>

            <p className="text-gray-600 mb-6">
              {message}
            </p>

            {/* Additional Info for Success */}
            {status === 'success' && (
              <div className="bg-green-100 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="text-left">
                    <h3 className="text-sm font-medium text-green-800 mb-1">
                      What's Next?
                    </h3>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Your account is now fully verified</li>
                      <li>• You can access all Vault5 features</li>
                      <li>• Enhanced security is now active</li>
                      <li>• Start building your financial freedom</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Info for Error */}
            {status === 'error' && (
              <div className="bg-red-100 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="text-left">
                    <h3 className="text-sm font-medium text-red-800 mb-1">
                      Possible Solutions:
                    </h3>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Check if the verification link has expired (24 hours)</li>
                      <li>• Request a new verification email</li>
                      <li>• Make sure you're logged into the correct account</li>
                      <li>• Contact support if the problem persists</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                to="/dashboard"
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Home className="w-4 h-4" />
                <span>Go to Dashboard</span>
              </Link>

              {status === 'error' && (
                <Link
                  to="/settings"
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  <Mail className="w-4 h-4" />
                  <span>Request New Verification</span>
                </Link>
              )}

              <Link
                to="/"
                className="w-full flex items-center justify-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600">
              If you're having trouble with email verification, please contact our support team or check our help documentation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationStatus;