import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
 
const SignupPersonal = () => {
  const navigate = useNavigate();
  const { showError, showSuccess, showInfo } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    address: '',
    city: '',
    country: 'Kenya',
    acceptTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Get userId from session storage (set in previous step)
    const signupData = JSON.parse(sessionStorage.getItem('signupData') || '{}');
    if (signupData.userId) {
      setUserId(signupData.userId);
    } else {
      // If no userId, redirect back to start
      showInfo('Please verify your phone to continue.');
      navigate('/signup/phone');
    }
  }, [navigate, showInfo]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
  
    if (!form.firstName || !form.lastName) {
      showError('Please enter your full name.');
      return;
    }
  
    if (!form.dateOfBirth) {
      showError('Please select your date of birth.');
      return;
    }
  
    // Age validation (18+)
    const birthDate = new Date(form.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      showError('You must be at least 18 years old to create an account.');
      return;
    }
  
    // Ensure phone verified from previous step
    const signupData = JSON.parse(sessionStorage.getItem('signupData') || '{}');
    if (!signupData?.userId || !signupData?.phone) {
      showInfo('Please verify your phone to continue.');
      navigate('/signup/phone');
      return;
    }
  
    setLoading(true);
  
    try {
      // Call step 2 endpoint (personal details)
      const response = await api.patch(`/api/auth/register/${userId}/step2`, {
        firstName: form.firstName,
        middleName: '', // Optional
        lastName: form.lastName,
        dob: form.dateOfBirth,
        phone: signupData.phone,
        city: form.city
      });
  
      if (response.data.userId) {
        // Update to the real persisted userId for subsequent steps
        setUserId(response.data.userId);
        const sd = JSON.parse(sessionStorage.getItem('signupData') || '{}');
        sd.userId = response.data.userId;
        sessionStorage.setItem('signupData', JSON.stringify(sd));

        setCurrentStep(2);
        showSuccess('Personal details saved');
      }
  
    } catch (error) {
      console.error('Step 1 error:', error);
      showError(error.response?.data?.message || 'Failed to save personal details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
  
    if (!form.address || !form.city) {
      showError('Please enter your address and city.');
      return;
    }
  
    if (!form.acceptTerms) {
      showError('Please accept the Terms of Service.');
      return;
    }
  
    setLoading(true);
  
    try {
      // Call step 3 endpoint (address and terms)
      const response = await api.patch(`/api/auth/register/${userId}/step3`, {
        address: form.address,
        termsAccepted: form.acceptTerms
      });
  
      if (response.data.userId) {
        setCurrentStep(3);
        showSuccess('Address saved');
      }
  
    } catch (error) {
      console.error('Step 2 error:', error);
      showError(error.response?.data?.message || 'Failed to save address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = async (e) => {
    e.preventDefault();
  
    setLoading(true);
  
    try {
      // Call step 4 endpoint (complete registration)
      const response = await api.patch(`/api/auth/register/${userId}/step4`, {
        kycSkipped: true // Skip KYC for now
      });
  
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        sessionStorage.removeItem('signupData'); // Clean up
        showSuccess('Registration completed');
        navigate('/dashboard');
      }
  
    } catch (error) {
      console.error('Step 3 error:', error);
      showError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {step}
          </div>
          {step < 3 && (
            <div className={`w-12 h-1 mx-2 ${
              step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <form onSubmit={handleStep1Submit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Personal Information</h2>
        <p className="text-gray-600">Tell us about yourself</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Doe"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth *
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={form.dateOfBirth}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">You must be at least 18 years old</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City *
          </label>
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nairobi"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
      >
        {loading ? 'Saving...' : 'Continue'}
      </button>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleStep2Submit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Address & Terms</h2>
        <p className="text-gray-600">Complete your account setup</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Street Address *
          </label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="123 Main Street"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <select
              name="country"
              value={form.country}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Kenya">Kenya</option>
              <option value="Tanzania">Tanzania</option>
              <option value="Uganda">Uganda</option>
              <option value="Rwanda">Rwanda</option>
              <option value="South Africa">South Africa</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            id="terms"
            name="acceptTerms"
            checked={form.acceptTerms}
            onChange={handleChange}
            className="mt-1 mr-3"
            required
          />
          <label htmlFor="terms" className="text-sm text-gray-700">
            I agree to the{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-800 underline">
              Terms of Service
            </a>
            {' '}and{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
              Privacy Policy
            </a>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );

  const renderStep3 = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created Successfully!</h2>
        <p className="text-gray-600">Welcome to Vault5. Your financial journey starts now.</p>
      </div>
      <button
        onClick={handleStep3Submit}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
      >
        {loading ? 'Setting up...' : 'Continue to Dashboard'}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Complete Your Account
            </h1>
            <p className="text-gray-600">
              Step {currentStep} of 3
            </p>
          </div>

          {renderStepIndicator()}

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {currentStep < 3 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/signup/phone')}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back to phone verification
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupPersonal;