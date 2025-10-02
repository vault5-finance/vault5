import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Shield,
  Lock,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
  Zap,
  Heart,
  Phone,
  Mail,
  Globe,
  CreditCard,
  DollarSign,
  Target,
  Award,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const SignupChoice = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);

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

  const features = [
    {
      icon: <Shield className="w-4 h-4" />,
      text: "Bank-level security for transfers",
      color: "text-green-600"
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      text: "Smart budgeting tools",
      color: "text-blue-600"
    },
    {
      icon: <Target className="w-4 h-4" />,
      text: "Track investments & savings",
      color: "text-purple-600"
    },
    {
      icon: <Clock className="w-4 h-4" />,
      text: "24/7 customer support",
      color: "text-indigo-600"
    }
  ];

  const trustIndicators = [
    {
      icon: <Shield className="w-4 h-4" />,
      text: "Bank-level encryption"
    },
    {
      icon: <Lock className="w-4 h-4" />,
      text: "Two-factor authentication ready"
    },
    {
      icon: <Users className="w-4 h-4" />,
      text: "Trusted by 20,000+ users"
    }
  ];

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
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-indigo-200/20 rounded-full blur-lg"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <motion.div
          className="max-w-lg w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back Button */}
          <motion.button
            onClick={() => navigate('/')}
            className="absolute top-6 left-6 w-10 h-10 bg-white/60 hover:bg-white/80 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </motion.button>

          {/* Header Section */}
          <div className="text-center mb-8">
            <motion.div
              className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 200 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Secure your money.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Start in seconds.
              </span>
            </motion.h1>

            <motion.p
              className="text-xl text-gray-600 max-w-md mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Vault5 helps you send, save, and grow your money — smarter and safer than ever before.
            </motion.p>
          </div>

          {/* Main CTA */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              onClick={handlePersonalSignup}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setHoveredButton('main')}
              onHoverEnd={() => setHoveredButton(null)}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: hoveredButton === 'main' ? '100%' : '-100%' }}
                transition={{ duration: 0.6 }}
              />
              <span className="relative">
                {loading ? 'Creating account...' : 'Create my account'}
              </span>
            </motion.button>

            <motion.p
              className="text-center text-sm text-gray-500 mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Takes less than 2 minutes • Free forever
            </motion.p>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="grid grid-cols-1 gap-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center p-3 bg-gray-50/80 rounded-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                >
                  <div className={`w-8 h-8 ${feature.color.replace('text-', 'bg-').replace('-600', '-100')} rounded-lg flex items-center justify-center mr-3`}>
                    <span className={feature.color}>
                      {feature.icon}
                    </span>
                  </div>
                  <span className="text-gray-700 font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="flex justify-center gap-6">
              {trustIndicators.map((indicator, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-2 text-sm text-gray-600"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-green-500">
                    {indicator.icon}
                  </span>
                  <span>{indicator.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Divider */}
          <motion.div
            className="relative mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-sm text-gray-500 font-medium">Already have an account?</span>
            </div>
          </motion.div>

          {/* Sign In Button */}
          <motion.button
            onClick={() => navigate('/login')}
            className="w-full border-2 border-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            onHoverStart={() => setHoveredButton('signin')}
            onHoverEnd={() => setHoveredButton(null)}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100"
              initial={{ x: '-100%' }}
              animate={{ x: hoveredButton === 'signin' ? '100%' : '-100%' }}
              transition={{ duration: 0.6 }}
            />
            <span className="relative">Sign in to your account</span>
          </motion.button>

          {/* Footer */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            <p className="text-xs text-gray-500">
              By signing up, you agree to our{' '}
              <a href="/terms" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="/privacy" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                Privacy Policy
              </a>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Vault5 meets bank-grade security standards • Fully GDPR/CCPA compliant
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupChoice;