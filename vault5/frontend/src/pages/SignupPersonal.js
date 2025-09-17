import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const SignupPersonal = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: 'Kenya',
    address: '',
    city: '',
    postalCode: '',
    country: 'Kenya',
    vaultTag: '',
    acceptTerms: false,
    acceptPrivacy: false
  });
  const [loading, setLoading] = useState(false);
  const [vaultTagAvailable, setVaultTagAvailable] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Check vault tag availability
    if (name === 'vaultTag' && value.length >= 3) {
      checkVaultTagAvailability(value);
    }
  };

  const checkVaultTagAvailability = async (tag) => {
    try {
      const response = await api.post('/api/auth/check-vault-tag', { vaultTag: tag });
      setVaultTagAvailable(response.data.available);
    } catch (error) {
      setVaultTagAvailable(false);
    }
  };

  const generateVaultTag = () => {
    const firstName = form.firstName.toLowerCase().replace(/[^a-z]/g, '');
    const lastName = form.lastName.toLowerCase().replace(/[^a-z]/g, '');
    const randomNum = Math.floor(Math.random() * 999) + 1;
    const suggested = `${firstName}${lastName}${randomNum}`;
    setForm(prev => ({ ...prev, vaultTag: suggested }));
    checkVaultTagAvailability(suggested);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Age validation
    const birthDate = new Date(form.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 18) {
      alert('You must be at least 18 years old to create an account.');
      return;
    }

    if (!form.acceptTerms || !form.acceptPrivacy) {
      alert('Please accept the Terms of Service and Privacy Policy.');
      return;
    }

    if (form.vaultTag && !vaultTagAvailable) {
      alert('Please choose a different VaultTag or leave it blank for auto-generation.');
      return;
    }

    setLoading(true);

    try {
      // Get signup data from session
      const signupData = JSON.parse(sessionStorage.getItem('signupData') || '{}');

      // Combine all data
      const userData = {
        ...signupData,
        ...form,
        role: 'personal',
        name: `${form.firstName} ${form.lastName}`.trim()
      };

      // Create account
      const response = await api.post('/api/auth/register', userData);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        sessionStorage.removeItem('signupData'); // Clean up
        navigate('/dashboard');
      }

    } catch (error) {
      console.error('Registration error:', error);
      alert(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Complete Your Personal Account
            </h1>
            <p className="text-gray-600">
              Just a few more details to get you started with Vault5
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nationality
                </label>
                <select
                  name="nationality"
                  value={form.nationality}
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

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="00100"
                />
              </div>
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

            {/* VaultTag */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                VaultTag (Optional)
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    name="vaultTag"
                    value={form.vaultTag}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="yourname123"
                    minLength="3"
                    maxLength="20"
                  />
                  <span className="absolute left-3 top-2.5 text-gray-400">@</span>
                </div>
                <button
                  type="button"
                  onClick={generateVaultTag}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Generate
                </button>
              </div>
              {form.vaultTag && (
                <p className={`text-xs mt-1 ${vaultTagAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {vaultTagAvailable ? '✓ VaultTag available' : '✗ VaultTag not available'}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Your unique identifier for easy payments and transfers
              </p>
            </div>

            {/* Terms and Privacy */}
            <div className="space-y-3">
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
                </label>
              </div>
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="privacy"
                  name="acceptPrivacy"
                  checked={form.acceptPrivacy}
                  onChange={handleChange}
                  className="mt-1 mr-3"
                  required
                />
                <label htmlFor="privacy" className="text-sm text-gray-700">
                  I agree to the{' '}
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
              {loading ? 'Creating Account...' : 'Create Personal Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/signup/personal/phone')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to phone verification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPersonal;