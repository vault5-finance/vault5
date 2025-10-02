import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import {
  User,
  MapPin,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  Calendar,
  Home,
  FileText,
  Shield,
  Lock,
  Users,
  Clock,
  Star,
  Award,
  ChevronRight,
  ChevronLeft,
  Target,
  Zap,
  Heart,
  Phone,
  Mail,
  Globe,
  CreditCard,
  DollarSign
} from 'lucide-react';

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
  const [completedSteps, setCompletedSteps] = useState([]);

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

        setCompletedSteps(prev => [...prev, 1]);
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
        setCompletedSteps(prev => [...prev, 2]);
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
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
            step <= currentStep ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' :
            completedSteps.includes(step) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {completedSteps.includes(step) ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              step
            )}
          </div>
          {step < 3 && (
            <div className={`w-16 h-1 mx-2 transition-all duration-300 ${
              step < currentStep ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <motion.form
      onSubmit={handleStep1Submit}
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-6">
        <motion.div
          className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <User className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Let's get to know you 👋</h2>
        <p className="text-gray-600">This helps us set up a secure account in your name.</p>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            required
          />
          <p className="text-xs text-gray-500 mt-1">🎂 Great, you're old enough to start your Vault5 journey.</p>
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
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            placeholder="Nairobi"
            required
          />
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading ? 'Saving...' : 'Continue →'}
      </motion.button>
    </motion.form>
  );

  const renderStep2 = () => (
    <motion.form
      onSubmit={handleStep2Submit}
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-6">
        <motion.div
          className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <MapPin className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Almost there! Just confirm a few details</h2>
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
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="Kenya">🇰🇪 Kenya</option>
              <option value="Tanzania">🇹🇿 Tanzania</option>
              <option value="Uganda">🇺🇬 Uganda</option>
              <option value="Rwanda">🇷🇼 Rwanda</option>
              <option value="South Africa">🇿🇦 South Africa</option>
              <option value="United States">🇺🇸 United States</option>
              <option value="United Kingdom">🇬🇧 United Kingdom</option>
              <option value="Other">🌍 Other</option>
            </select>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              name="acceptTerms"
              checked={form.acceptTerms}
              onChange={handleChange}
              className="mt-1 mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              required
            />
            <label htmlFor="terms" className="text-sm text-gray-700">
              I agree to the{' '}
              <a href="/terms" className="text-blue-600 hover:text-blue-800 underline font-medium">
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline font-medium">
                Privacy Policy
              </a>
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">We'll keep your info secure.</p>
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </motion.button>
    </motion.form>
  );

  const renderStep3 = () => (
    <motion.div
      className="text-center space-y-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <CheckCircle className="w-10 h-10 text-white" />
      </motion.div>

      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome aboard 🚀</h2>
        <p className="text-xl text-gray-600">Your Vault5 account is ready!</p>
      </div>

      <motion.button
        onClick={handleStep3Submit}
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading ? 'Setting up...' : 'Go to Dashboard'}
      </motion.button>
    </motion.div>
  );

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
          <div className="text-center mb-8">
            <motion.h1
              className="text-3xl font-bold text-gray-900 mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Complete Your Account
            </motion.h1>
            <motion.p
              className="text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Step {currentStep} of 3
            </motion.p>
          </div>

          {renderStepIndicator()}

          <AnimatePresence mode="wait">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </AnimatePresence>

          {currentStep < 3 && (
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <button
                onClick={() => navigate('/signup/phone')}
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to phone verification
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPersonal;