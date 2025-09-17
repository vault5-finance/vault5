import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Landing = () => {
  const navigate = useNavigate();
  const [counters, setCounters] = useState([0, 0, 0, 0]);
  const targetCounts = [10000, 95, 24, 500];
  
  useEffect(() => {
    const duration = 3000;
    const increment = targetCounts.map(target => target / (duration / 20));
    
    const interval = setInterval(() => {
      setCounters(prev => prev.map((value, i) => {
        const newVal = value + increment[i];
        return newVal >= targetCounts[i] ? targetCounts[i] : newVal;
      }));
    }, 20);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
      {/* Header */}
      <header className="relative z-10 px-4 py-6">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-white">Vault5</div>
          <div className="hidden md:flex space-x-8">
            <Link to="/personal" className="text-white hover:text-blue-200 transition">Personal</Link>
            <Link to="/business" className="text-white hover:text-blue-200 transition">Business</Link>
            <Link to="/developers" className="text-white hover:text-blue-200 transition">Developers</Link>
            <Link to="/help" className="text-white hover:text-blue-200 transition">Help</Link>
            <Link to="/contact" className="text-white hover:text-blue-200 transition">Contact</Link>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="text-white hover:text-blue-200 transition"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition"
            >
              Sign Up
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-4 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            className="text-5xl md:text-7xl font-extrabold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Your way to pay with <span className="text-yellow-300">Vault5</span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Send, receive, and manage money with confidence. Built for Africa, designed for the future.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-50 transition shadow-lg transform hover:scale-105"
              >
                Get Started Free
              </button>
              <button
                onClick={() => navigate('/app')}
                className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition transform hover:scale-105"
              >
                Download App
              </button>
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <div className="max-w-7xl mx-auto mt-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {counters.map((count, index) => (
              <motion.div
                key={index}
                className="p-6 bg-white/10 backdrop-blur-sm rounded-xl"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-3xl md:text-4xl font-bold mb-2">
                  {Math.floor(count)}+
                </div>
                <div className="text-blue-100">
                  {['Users', 'Success Rate', 'Support Hours', 'Features'][index]}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-white mb-4">Fast & Secure</h3>
              <p className="text-blue-100">Lightning-fast transactions with bank-level security and 256-bit encryption.</p>
            </motion.div>
            <motion.div
              className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-white mb-4">Smart Allocation</h3>
              <p className="text-blue-100">Automatic income splitting across 6 vaults for disciplined financial management.</p>
            </motion.div>
            <motion.div
              className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-semibold text-white mb-4">Borderless</h3>
              <p className="text-blue-100">Send money globally with competitive rates and instant transfers.</p>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why choose Vault5?
            </h2>
            <p className="text-xl text-gray-600">
              Experience the future of personal finance management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Allocation</h3>
              <p className="text-gray-600">
                Automatically split your income across 6 accounts: Fun, Charity, Daily, Emergency, Long-Term, and Investments.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Discipline Enforcement</h3>
              <p className="text-gray-600">
                Stay on track with automated debt tracking, surplus monitoring, and compliance indicators.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Investment Tracking</h3>
              <p className="text-gray-600">
                Monitor your investments with real-time growth tracking, maturity dates, and performance analytics.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Send & Receive Money</h3>
              <p className="text-gray-600">
                Pay for goods and services conveniently, from local businesses to individual projects.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Cash Flow Reports</h3>
              <p className="text-gray-600">
                Get detailed insights with weekly, monthly, and yearly cash flow reports and PDF exports.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Bank-Level Security</h3>
              <p className="text-gray-600">
                Your data is encrypted and secure. Benefit from peace of mind with our protection guarantees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join millions who love Vault5
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Spend, send, and manage your transactions with ease and security—all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/app')}
              className="text-white px-8 py-3 rounded-lg font-semibold"
              style={{ background: 'var(--gradient-primary)' }}
            >
              Download the App
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition duration-200"
            >
              Sign up for free online
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-black/20 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-white mb-4">Vault5</div>
              <p className="text-gray-300 mb-4">Financial freedom through discipline and automation.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">📘</a>
                <a href="#" className="text-gray-400 hover:text-white">🐦</a>
                <a href="#" className="text-gray-400 hover:text-white">📷</a>
                <a href="#" className="text-gray-400 hover:text-white">💼</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/personal" className="hover:text-white">Personal</Link></li>
                <li><Link to="/business" className="hover:text-white">Business</Link></li>
                <li><Link to="/developers" className="hover:text-white">Developers</Link></li>
                <li><Link to="/app" className="hover:text-white">Mobile App</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link to="/security" className="hover:text-white">Security</Link></li>
                <li><Link to="/fees" className="hover:text-white">Fees</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white">About</Link></li>
                <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link to="/legal" className="hover:text-white">Legal</Link></li>
                <li><Link to="/contact" className="hover:text-white">Careers</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Vault5. All rights reserved. | <Link to="/legal" className="hover:text-white">Privacy</Link> | <Link to="/legal" className="hover:text-white">Terms</Link> | <Link to="/legal" className="hover:text-white">Accessibility</Link></p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;