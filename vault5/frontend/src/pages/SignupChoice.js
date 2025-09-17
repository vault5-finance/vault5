import React from 'react';
import { useNavigate } from 'react-router-dom';

const SignupChoice = () => {
  const navigate = useNavigate();

  const handleChoice = (type) => {
    navigate(`/signup/${type}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join Vault5
          </h1>
          <p className="text-xl text-gray-600">
            Choose your account type to get started
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Personal Account */}
          <div
            onClick={() => handleChoice('personal')}
            className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-blue-200"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">👤</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Personal</h3>
              <p className="text-gray-600 mb-6">
                Send, save, and grow your money with smart allocation and secure lending.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div>✓ Smart income allocation</div>
                <div>✓ Secure lending & borrowing</div>
                <div>✓ Investment tracking</div>
                <div>✓ Mobile money integration</div>
              </div>
            </div>
          </div>

          {/* Business Account */}
          <div
            onClick={() => handleChoice('business')}
            className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-green-200"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🏢</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Business</h3>
              <p className="text-gray-600 mb-6">
                Run payroll, pay suppliers, and manage cashflow for your business.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div>✓ Bulk payments & payroll</div>
                <div>✓ Invoice management</div>
                <div>✓ Business analytics</div>
                <div>✓ Multi-user access</div>
              </div>
            </div>
          </div>

          {/* Developer Account */}
          <div
            onClick={() => handleChoice('developer')}
            className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-purple-200"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Developer</h3>
              <p className="text-gray-600 mb-6">
                Integrate Vault5 Wallet & APIs for your applications.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div>✓ RESTful API access</div>
                <div>✓ Sandbox environment</div>
                <div>✓ Webhook integrations</div>
                <div>✓ Developer documentation</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupChoice;