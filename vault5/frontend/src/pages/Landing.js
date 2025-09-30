import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, CheckCircle, Shield, Zap, TrendingUp, Users, Award, Lock } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [counters, setCounters] = useState([0, 0, 0, 0]);
  const targetCounts = useMemo(() => [10000, 98, 50000000, 24], []);

  const testimonials = [
    {
      name: "Sarah Wanjiku",
      role: "Small Business Owner",
      avatar: "SW",
      rating: 5,
      text: "Vault5 transformed how I manage my business finances. The automated allocation system saved me hours every month, and I finally achieved my savings goals."
    },
    {
      name: "David Kiprop",
      role: "Software Engineer",
      avatar: "DK",
      rating: 5,
      text: "The discipline enforcement features are incredible. I've never been more consistent with my savings, and the investment tracking keeps me motivated."
    },
    {
      name: "Grace Achieng",
      role: "Teacher",
      avatar: "GA",
      rating: 5,
      text: "Finally understanding my money flow was life-changing. Vault5 made budgeting simple and helped me pay off debt faster than I thought possible."
    }
  ];

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
  }, [targetCounts]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="emi-section-bg-gradient min-h-screen flex items-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-white/20 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              Now available in Kenya • 10,000+ users
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="emi-text-gradient">Vault5</span>
            <br />
            Financial Freedom
            <span className="block text-3xl md:text-5xl lg:text-6xl mt-2 opacity-90">
              Made Simple
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Take control of your finances with smart allocation, automated discipline, and modern banking features designed for the digital age.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <button
              onClick={() => navigate('/signup')}
              className="emi-btn-primary text-lg px-8 py-4 hover:shadow-2xl hover:shadow-blue-500/25"
            >
              <span className="flex items-center justify-center gap-2">
                Get Started Free
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            <button
              onClick={() => navigate('/app')}
              className="emi-btn-accent text-lg px-8 py-4"
            >
              Download App
            </button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            className="flex flex-wrap justify-center items-center gap-6 md:gap-8 text-slate-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-sm">Bank-grade security</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-400" />
              <span className="text-sm">PCI DSS compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span className="text-sm">Instant transfers</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats/Social Proof Section */}
      <section className="emi-section-bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-slate-600">
              Real results from real users achieving financial freedom
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {counters.map((count, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="emi-stat-number emi-text-gradient mb-2">
                  {index === 2 ? `KES ${Math.floor(count / 1000000)}M+` : Math.floor(count).toLocaleString()}+
                </div>
                <div className="emi-stat-label">
                  {['Active Users', 'Success Rate', 'Processed', 'Support Hours'][index]}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="emi-section-bg-gray py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need for Financial Freedom
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Powerful features designed to help you save, invest, and achieve your financial goals
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              className="emi-card"
              whileHover={{ y: -4 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="emi-feature-icon">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Smart Allocation</h3>
              <p className="text-slate-600 leading-relaxed">
                Automatically split your income across 6 strategic accounts for disciplined financial management.
              </p>
            </motion.div>

            <motion.div
              className="emi-card"
              whileHover={{ y: -4 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="emi-feature-icon">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Discipline Enforcement</h3>
              <p className="text-slate-600 leading-relaxed">
                Stay on track with automated debt tracking, surplus monitoring, and real-time compliance indicators.
              </p>
            </motion.div>

            <motion.div
              className="emi-card"
              whileHover={{ y: -4 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="emi-feature-icon">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Investment Tracking</h3>
              <p className="text-slate-600 leading-relaxed">
                Monitor your investments with real-time growth tracking, maturity dates, and performance analytics.
              </p>
            </motion.div>

            <motion.div
              className="emi-card"
              whileHover={{ y: -4 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="emi-feature-icon">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Instant Transfers</h3>
              <p className="text-slate-600 leading-relaxed">
                Send and receive money instantly with P2P transfers and mobile money integration.
              </p>
            </motion.div>

            <motion.div
              className="emi-card"
              whileHover={{ y: -4 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="emi-feature-icon">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Advanced Analytics</h3>
              <p className="text-slate-600 leading-relaxed">
                Get detailed insights with AI-powered reports, cash flow forecasting, and spending patterns.
              </p>
            </motion.div>

            <motion.div
              className="emi-card"
              whileHover={{ y: -4 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="emi-feature-icon">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Bank-Grade Security</h3>
              <p className="text-slate-600 leading-relaxed">
                Your data is protected with enterprise-level encryption, 2FA, and comprehensive security measures.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="emi-section-bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-slate-600">
              Real stories from people achieving financial freedom
            </p>
          </motion.div>

          <div className="relative">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="emi-testimonial-card max-w-2xl mx-auto"
            >
              <div className="flex items-center justify-center mb-6">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="emi-testimonial-quote">
                "{testimonials[currentTestimonial].text}"
              </blockquote>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-semibold">
                    {testimonials[currentTestimonial].avatar}
                  </span>
                </div>
                <div className="emi-testimonial-author">
                  {testimonials[currentTestimonial].name}
                </div>
                <div className="text-slate-500 text-sm">
                  {testimonials[currentTestimonial].role}
                </div>
              </div>
            </motion.div>

            <div className="flex justify-center mt-8 space-x-4">
              <button
                onClick={prevTestimonial}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentTestimonial ? 'bg-blue-500' : 'bg-slate-300'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={nextTestimonial}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="emi-section-bg-gray py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600">
              Get started in three simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <motion.div
              className="emi-process-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Sign Up & Verify</h3>
              <p className="text-slate-600 leading-relaxed">
                Create your account and verify your identity with our secure process.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              className="emi-process-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Set Up Your Vaults</h3>
              <p className="text-slate-600 leading-relaxed">
                Configure your 6 strategic accounts and set financial goals for each.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              className="emi-process-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Start Managing Money</h3>
              <p className="text-slate-600 leading-relaxed">
                Watch your money grow with automated allocation and smart financial insights.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="emi-cta-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Take Control of Your Finances?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of users who have achieved financial freedom with Vault5
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="emi-btn-primary text-lg px-8 py-4 hover:shadow-2xl hover:shadow-blue-500/25"
              >
                <span className="flex items-center justify-center gap-2">
                  Get Started Free
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
              <button
                onClick={() => navigate('/app')}
                className="emi-btn-accent text-lg px-8 py-4"
              >
                Download App
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modern Features Section */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need for Financial Freedom
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Powerful features designed to help you save, invest, and achieve your financial goals
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300"
              whileHover={{ y: -4 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl -translate-y-4 translate-x-4"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Smart Allocation</h3>
                <p className="text-slate-600 leading-relaxed">
                  Automatically split your income across 6 strategic accounts for disciplined financial management.
                </p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300"
              whileHover={{ y: -4 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl -translate-y-4 translate-x-4"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Discipline Enforcement</h3>
                <p className="text-slate-600 leading-relaxed">
                  Stay on track with automated debt tracking, surplus monitoring, and real-time compliance indicators.
                </p>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300"
              whileHover={{ y: -4 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl -translate-y-4 translate-x-4"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Investment Tracking</h3>
                <p className="text-slate-600 leading-relaxed">
                  Monitor your investments with real-time growth tracking, maturity dates, and performance analytics.
                </p>
              </div>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300"
              whileHover={{ y: -4 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl -translate-y-4 translate-x-4"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Instant Transfers</h3>
                <p className="text-slate-600 leading-relaxed">
                  Send and receive money instantly with P2P transfers and mobile money integration.
                </p>
              </div>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300"
              whileHover={{ y: -4 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl -translate-y-4 translate-x-4"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Advanced Analytics</h3>
                <p className="text-slate-600 leading-relaxed">
                  Get detailed insights with AI-powered reports, cash flow forecasting, and spending patterns.
                </p>
              </div>
            </motion.div>

            {/* Feature 6 */}
            <motion.div
              className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300"
              whileHover={{ y: -4 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl -translate-y-4 translate-x-4"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Bank-Grade Security</h3>
                <p className="text-slate-600 leading-relaxed">
                  Your data is protected with enterprise-level encryption, 2FA, and comprehensive security measures.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="emi-footer">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">V5</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Vault5</h3>
                  <p className="text-slate-400 text-sm">Financial Freedom Platform</p>
                </div>
              </div>
              <p className="text-slate-400 mb-6 max-w-md">
                Empowering Africans with smart financial management, automated discipline, and modern banking features for the digital age.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="emi-social-icon" aria-label="Twitter">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="#" className="emi-social-icon" aria-label="LinkedIn">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="emi-social-icon" aria-label="Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C8.396 0 7.949.014 6.76.064c-1.188.05-2.005.242-2.712.516a5.41 5.41 0 00-1.955 1.276A5.41 5.41 0 00.516 4.047C.242 4.754.05 5.571.064 6.76S.014 8.396 0 12.017s.014 3.257.064 4.446c.05 1.188.242 2.005.516 2.712a5.41 5.41 0 001.276 1.955 5.41 5.41 0 001.955 1.276c.707.274 1.524.466 2.712.516 1.188.05 1.635.064 4.256.064s3.068-.014 4.256-.064c1.188-.05 2.005-.242 2.712-.516a5.41 5.41 0 001.955-1.276 5.41 5.41 0 001.276-1.955c.274-.707.466-1.524.516-2.712.05-1.188.064-1.635.064-4.256s-.014-3.068-.064-4.256c-.05-1.188-.242-2.005-.516-2.712a5.41 5.41 0 00-1.276-1.955A5.41 5.41 0 0018.967.516C18.26.242 17.443.05 16.255.064 15.066.014 14.62 0 12 0zm0 1.802c3.532 0 3.955.014 5.351.064 1.286.058 1.994.274 2.46.456a3.61 3.61 0 011.372.894 3.61 3.61 0 01.894 1.372c.182.466.398 1.174.456 2.46.05 1.396.064 1.819.064 5.351s-.014 3.955-.064 5.351c-.058 1.286-.274 1.994-.456 2.46a3.61 3.61 0 01-.894 1.372 3.61 3.61 0 01-1.372.894c-.466.182-1.174.398-2.46.456-1.396.05-1.819.064-5.351.064s-3.955-.014-5.351-.064c-1.286-.058-1.994-.274-2.46-.456a3.61 3.61 0 01-1.372-.894 3.61 3.61 0 01-.894-1.372c-.182-.466-.398-1.174-.456-2.46C1.816 15.975 1.802 15.552 1.802 12s.014-3.955.064-5.351c.058-1.286.274-1.994.456-2.46a3.61 3.61 0 01.894-1.372A3.61 3.61 0 014.49 1.816c.466-.182 1.174-.398 2.46-.456C8.045 1.816 8.468 1.802 12 1.802zm0 2.534a9.465 9.465 0 100 18.93 9.465 9.465 0 000-18.93zm0 15.597a6.132 6.132 0 110-12.264 6.132 6.132 0 010 12.264zm8.982-15.777a2.24 2.24 0 11-4.48 0 2.24 2.24 0 014.48 0z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link to="/personal" className="emi-nav-link">Personal Banking</Link></li>
                <li><Link to="/business" className="emi-nav-link">Business Banking</Link></li>
                <li><Link to="/developers" className="emi-nav-link">API & Developers</Link></li>
                <li><Link to="/app" className="emi-nav-link">Mobile App</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link to="/help" className="emi-nav-link">Help Center</Link></li>
                <li><Link to="/contact" className="emi-nav-link">Contact Us</Link></li>
                <li><Link to="/security" className="emi-nav-link">Security</Link></li>
                <li><Link to="/fees" className="emi-nav-link">Fees & Pricing</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-400 text-sm">
                &copy; {new Date().getFullYear()} Vault5. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link to="/privacy" className="emi-nav-link text-sm">Privacy Policy</Link>
                <Link to="/terms" className="emi-nav-link text-sm">Terms of Service</Link>
                <Link to="/legal" className="emi-nav-link text-sm">Legal</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;