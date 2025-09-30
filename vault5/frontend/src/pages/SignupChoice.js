import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const SignupChoice = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handlePersonalSignup = async () => {
    setLoading(true);
    try {
      // Start with email collection for personal accounts
      navigate('/signup/email');
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 relative">
        {/* Back to Home Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 flex items-center text-gray-600 hover:text-gray-800 transition-colors z-10"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Vault5
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💰</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create your Vault5 account
          </h1>
          <p className="text-gray-600">
            Join millions managing their finances smarter
          </p>
        </div>

        {/* Main CTA Button */}
        <button
          onClick={handlePersonalSignup}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          {loading ? 'Creating account...' : 'Get started'}
        </button>

        {/* Features */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center text-sm text-gray-600">
            <span className="text-green-500 mr-3">✓</span>
            Send and receive money securely
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="text-green-500 mr-3">✓</span>
            Smart budget allocation
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="text-green-500 mr-3">✓</span>
            Track investments and savings
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="text-green-500 mr-3">✓</span>
            24/7 customer support
          </div>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Already have an account?</span>
          </div>
        </div>

        {/* Sign In Link */}
        <button
          onClick={() => navigate('/login')}
          className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Sign in
        </button>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By signing up, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupChoice;