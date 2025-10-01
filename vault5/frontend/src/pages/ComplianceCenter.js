import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import {
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Sun,
  Moon,
  RefreshCw,
  AlertTriangle,
  FileText,
  Image,
  Download,
  Upload,
  Calendar,
  DollarSign,
  CreditCard,
  Building,
  Target,
  Award,
  Star,
  Zap,
  Lock,
  Globe,
  Users,
  Activity,
  BarChart3,
  Settings,
  Loader2,
  Info,
  ArrowRight,
  Check,
  X,
  Eye,
  EyeOff,
  Sparkles,
  Heart,
  Gift
} from 'lucide-react';

const Section = ({ title, children, right, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    red: 'border-red-200 bg-red-50',
    gray: 'border-gray-200 bg-gray-50'
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 ${colorClasses[color]} p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && <div className="text-2xl">{icon}</div>}
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
};

const Pill = ({ children, color = 'blue' }) => {
  const map = {
    blue: 'bg-blue-100 text-blue-800',
    red: 'bg-red-100 text-red-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    gray: 'bg-gray-100 text-gray-800',
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[color] || map.gray}`}>{children}</span>;
};

const formatKes = (n) => `KES ${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const Countdown = ({ ms }) => {
  const [timeLeft, setTimeLeft] = useState(ms || 0);
  useEffect(() => {
    setTimeLeft(ms || 0);
    if (!ms || ms <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1000)), 1000);
    return () => clearInterval(id);
  }, [ms]);
  const d = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const h = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const m = Math.floor((timeLeft / (1000 * 60)) % 60);
  const s = Math.floor((timeLeft / 1000) % 60);
  if (timeLeft <= 0) return <span className="text-green-700 font-medium">Eligible now</span>;
  return (
    <span className="text-gray-700">{d}d {h}h {m}m {s}s</span>
  );
};

// Enhanced Stat Card Component
const StatCard = ({ title, value, icon: Icon, trend, color, isDarkMode, progress, subtitle }) => (
  <motion.div
    className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
      isDarkMode
        ? 'bg-gray-800/50 border border-gray-700/50 hover:border-gray-600'
        : 'bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300 shadow-lg hover:shadow-xl'
    }`}
    whileHover={{ scale: 1.02, y: -2 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-2 rounded-lg bg-gradient-to-r ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="text-sm font-medium">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        {subtitle && (
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>

    {/* Progress bar for compliance levels */}
    {progress !== undefined && (
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full bg-gradient-to-r ${color}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {progress}% Complete
        </p>
      </div>
    )}
  </motion.div>
);

// Skeleton Card Component
const SkeletonCard = ({ isDarkMode }) => (
  <div className={`animate-pulse rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-300 rounded w-16"></div>
      </div>
    </div>
  </div>
);

// Compliance Journey Progress Component
const ComplianceJourney = ({ currentLevel, isDarkMode }) => {
  const steps = [
    { level: 'Tier0', label: 'Basic', icon: User, color: 'from-gray-500 to-gray-600' },
    { level: 'Tier1', label: 'Verified', icon: Shield, color: 'from-blue-500 to-blue-600' },
    { level: 'Tier2', label: 'Enhanced', icon: Star, color: 'from-purple-500 to-purple-600' },
    { level: 'Eligible', label: 'Payout Ready', icon: CheckCircle, color: 'from-green-500 to-green-600' }
  ];

  const currentIndex = steps.findIndex(step => step.level === currentLevel);

  return (
    <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-gray-800/30' : 'bg-gradient-to-r from-blue-50 to-purple-50'} border ${isDarkMode ? 'border-gray-700' : 'border-blue-200'}`}>
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-blue-600" />
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Compliance Journey
        </h3>
      </div>

      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.level} className="flex flex-col items-center">
              <motion.div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${step.color} border-transparent text-white`
                    : `${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`
                } ${isCurrent ? 'ring-4 ring-blue-200' : ''}`}
                whileHover={{ scale: 1.05 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Icon className="w-6 h-6" />
              </motion.div>

              {index < steps.length - 1 && (
                <motion.div
                  className={`w-16 h-1 mt-4 rounded-full ${
                    isActive ? 'bg-blue-400' : 'bg-gray-300'
                  }`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                />
              )}

              <div className="mt-2 text-center">
                <p className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                  {step.label}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {step.level}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ComplianceCenter = () => {
  const { showError, showSuccess, showInfo } = useToast();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [kycList, setKycList] = useState([]);
  const [submittingKyc, setSubmittingKyc] = useState(false);
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Enhanced form state
  const [kycForm, setKycForm] = useState({
    levelRequested: 'Tier1',
    documents: [
      { type: 'nat_id', url: '', file: null, preview: null },
      { type: 'selfie', url: '', file: null, preview: null },
      { type: 'proof_of_address', url: '', file: null, preview: null }
    ],
  });

  const [payoutForm, setPayoutForm] = useState({
    amount: '',
    currency: 'KES',
    destination: {
      bankName: '',
      accountName: '',
      accountNumber: '',
      bankCode: '',
    }
  });

  // Validation state
  const [validationErrors, setValidationErrors] = useState({});
  const [showValidation, setShowValidation] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [st, kl] = await Promise.all([
        api.get('/api/compliance/status'),
        api.get('/api/compliance/kyc'),
      ]);
      setStatus(st.data?.data || null);
      setKycList(kl.data?.data || []);

      // Show subtle refresh notification
      if (!loading) {
        showInfo('Compliance status updated');
      }
    } catch (e) {
      console.error('Compliance load error', e);
      showError(e.response?.data?.message || 'Failed to load compliance status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // File upload handler
  const handleFileUpload = (index, file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setKycForm(prev => {
          const docs = [...prev.documents];
          docs[index] = {
            ...docs[index],
            file,
            preview: e.target.result,
            url: '' // Clear URL when file is uploaded
          };
          return { ...prev, documents: docs };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(index, files[0]);
    }
  };

  // Bank logo detection
  const getBankLogo = (bankName) => {
    const bankLogos = {
      'kcb': '🏦',
      'equity': '🏛️',
      'dtb': '🏢',
      'coop': '🏪',
      'standard': '🏗️',
      'national': '🏛️'
    };

    const normalizedName = bankName?.toLowerCase();
    return bankLogos[normalizedName] || '🏦';
  };

  // Form validation
  const validateKycForm = () => {
    const errors = {};

    if (!kycForm.levelRequested) {
      errors.levelRequested = 'Please select a KYC level';
    }

    kycForm.documents.forEach((doc, index) => {
      if (!doc.url && !doc.file) {
        errors[`document_${index}`] = 'Please provide either a URL or upload a file';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePayoutForm = () => {
    const errors = {};

    if (!payoutForm.amount || Number(payoutForm.amount) <= 0) {
      errors.amount = 'Please enter a valid amount';
    }

    if (!payoutForm.destination.bankName) {
      errors.bankName = 'Bank name is required';
    }

    if (!payoutForm.destination.accountName) {
      errors.accountName = 'Account name is required';
    }

    if (!payoutForm.destination.accountNumber) {
      errors.accountNumber = 'Account number is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onKycDocChange = (idx, field, value) => {
    setKycForm((prev) => {
      const docs = [...prev.documents];
      docs[idx] = { ...docs[idx], [field]: value };
      return { ...prev, documents: docs };
    });
  };

  const addKycDoc = () => {
    setKycForm((prev) => ({ ...prev, documents: [...prev.documents, { type: 'other', url: '' }] }));
  };

  const submitKyc = async (e) => {
    e.preventDefault();
    if (!kycForm.documents.length || kycForm.documents.some(d => !d.url || !d.type)) {
      showError('Please add at least one document with a valid URL and type.');
      return;
    }
    setSubmittingKyc(true);
    try {
      await api.post('/api/compliance/kyc', kycForm);
      showSuccess('KYC submitted for review');
      setKycForm({
        levelRequested: 'Tier1',
        documents: [{ type: 'nat_id', url: '' }, { type: 'selfie', url: '' }],
      });
      await load();
    } catch (e) {
      console.error('Submit KYC error', e);
      showError(e.response?.data?.message || 'Failed to submit KYC');
    } finally {
      setSubmittingKyc(false);
    }
  };

  const submitPayout = async (e) => {
    e.preventDefault();
    if (!(Number(payoutForm.amount) > 0)) {
      showError('Enter a valid amount');
      return;
    }
    if (!payoutForm.destination.bankName || !payoutForm.destination.accountName || !payoutForm.destination.accountNumber) {
      showError('Enter complete bank destination details');
      return;
    }
    if (!status?.payoutEligible) {
      showInfo('Not eligible for payout yet. Please check the countdown and bank verification.');
      return;
    }
    setSubmittingPayout(true);
    try {
      await api.post('/api/compliance/payouts', payoutForm);
      showSuccess('Payout request submitted for review');
      setPayoutForm({
        amount: '',
        currency: 'KES',
        destination: { bankName: '', accountName: '', accountNumber: '', bankCode: '' }
      });
      await load();
    } catch (e) {
      console.error('Submit payout error', e);
      showError(e.response?.data?.message || 'Failed to request payout');
    } finally {
      setSubmittingPayout(false);
    }
  };

  const limitationPill = useMemo(() => {
    const st = status?.limitation?.status || 'none';
    if (st === 'none') return <Pill color="green">No Limitation</Pill>;
    if (st === 'temporary_30') return <Pill color="yellow">Temporarily Limited (30d)</Pill>;
    if (st === 'temporary_180') return <Pill color="red">Limited (180d Reserve)</Pill>;
    if (st === 'permanent') return <Pill color="red">Permanently Limited</Pill>;
    return <Pill color="gray">{st}</Pill>;
  }, [status]);

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header skeleton */}
          <div className={`mb-8 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-xl rounded-2xl border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} p-6`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-300 rounded-2xl animate-pulse"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-300 rounded w-48 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded w-64 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Stats cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <SkeletonCard key={i} isDarkMode={isDarkMode} />
            ))}
          </div>

          {/* Content skeleton */}
          <div className={`space-y-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-xl rounded-2xl border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} p-6`}>
            <div className="h-6 bg-gray-300 rounded w-32 animate-pulse mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-300 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50'
    }`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <motion.div
          className={`mb-8 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-xl rounded-3xl border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} p-8`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-6">
              <motion.div
                className="relative p-4 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl"
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <Shield className="w-10 h-10 text-white" />
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <div>
                <motion.h1
                  className={`text-5xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Compliance Center
                </motion.h1>
                <motion.p
                  className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Manage your account limitations, KYC verification, and payout requests
                </motion.p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Theme toggle */}
              <motion.button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-3 rounded-xl transition-all ${
                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.button>

              {/* Refresh button */}
              <motion.button
                onClick={load}
                className={`p-3 rounded-xl transition-all ${
                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Compliance Journey Progress */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ComplianceJourney currentLevel={status?.kycLevel || 'Tier0'} isDarkMode={isDarkMode} />
        </motion.div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="KYC Level"
            value={status?.kycLevel || 'Tier0'}
            icon={Shield}
            color="from-blue-500 to-blue-600"
            isDarkMode={isDarkMode}
            progress={status?.kycLevel === 'Tier2' ? 100 : status?.kycLevel === 'Tier1' ? 50 : 0}
            subtitle="Verification status"
          />
          <StatCard
            title="Active Reserves"
            value={status?.reserves?.count || 0}
            icon={Clock}
            color="from-yellow-500 to-orange-500"
            isDarkMode={isDarkMode}
            subtitle="Funds on hold"
          />
          <StatCard
            title="Reserved Amount"
            value={formatKes(status?.reserves?.totalAmount || 0)}
            icon={DollarSign}
            trend={-5}
            color="from-green-500 to-green-600"
            isDarkMode={isDarkMode}
            subtitle="Total held funds"
          />
          <StatCard
            title="Payout Status"
            value={status?.payoutEligible ? 'Eligible' : 'Pending'}
            icon={status?.payoutEligible ? CheckCircle : Clock}
            color={status?.payoutEligible ? "from-green-500 to-green-600" : "from-yellow-500 to-orange-500"}
            isDarkMode={isDarkMode}
            subtitle={status?.payoutEligible ? "Ready for payout" : "Complete verification"}
          />
        </div>

        {/* Enhanced Account Limitation Status */}
        <motion.div
          className={`mb-8 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-xl rounded-2xl border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} overflow-hidden`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} bg-gradient-to-r ${status?.limitation?.status === 'none' ? 'from-green-50 to-emerald-50' : 'from-red-50 to-orange-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${status?.limitation?.status === 'none' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {status?.limitation?.status === 'none' ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div>
                  <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Account Limitation Status
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    {limitationPill}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {status?.limitation?.status !== 'none' && status?.limitation?.status !== 'permanent' && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Limitation Countdown
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{
                      duration: status?.limitation?.countdownMs ? status.limitation.countdownMs / 1000 : 0,
                      ease: "linear"
                    }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {status?.limitation?.countdownMs ? <Countdown ms={status.limitation.countdownMs} /> : 'N/A'}
                  </span>
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Release: {status?.limitation?.reserveReleaseAt
                      ? new Date(status.limitation.reserveReleaseAt).toLocaleDateString()
                      : '—'}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Reason
                  </span>
                </div>
                <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {status?.limitation?.reason || 'No limitations active'}
                </p>
              </div>

              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-green-500" />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Duration
                  </span>
                </div>
                <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {status?.limitation?.status === 'temporary_30' ? '30 days' :
                   status?.limitation?.status === 'temporary_180' ? '180 days' :
                   status?.limitation?.status === 'permanent' ? 'Permanent' : 'None'}
                </p>
              </div>

              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-500" />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Next Steps
                  </span>
                </div>
                <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {status?.limitation?.status === 'none'
                    ? 'Complete KYC verification to unlock features'
                    : 'Wait for limitation period to expire'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Reserves Section */}
        <motion.div
          className={`mb-8 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-xl rounded-2xl border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} overflow-hidden`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Active Reserves
                </h2>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Funds currently held for compliance and security
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Active Holds
                  </span>
                </div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {status?.reserves?.count || 0}
                </p>
              </div>

              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Total Reserved
                  </span>
                </div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatKes(status?.reserves?.totalAmount || 0)}
                </p>
              </div>

              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className={`w-4 h-4 ${status?.payoutEligible ? 'text-green-500' : 'text-yellow-500'}`} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Payout Eligibility
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {status?.payoutEligible ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Eligible
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className={`min-w-full ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                <thead className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'}`}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>
                      Amount
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>
                      Currency
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>
                      Release Date
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className={`${isDarkMode ? 'bg-gray-900/20' : 'bg-white/50'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {(status?.reserves?.items || []).map((reserve, index) => (
                    <motion.tr
                      key={reserve.id}
                      className={`${isDarkMode ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50'} transition-colors`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <td className="px-4 py-3 font-medium">
                        {formatKes(reserve.amount)}
                      </td>
                      <td className="px-4 py-3">
                        {reserve.currency}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {reserve.releaseAt ? new Date(reserve.releaseAt).toLocaleDateString() : '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          reserve.status === 'active'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {reserve.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                  {(status?.reserves?.items || []).length === 0 && (
                    <tr>
                      <td colSpan={4} className={`px-4 py-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div className="flex flex-col items-center gap-2">
                          <CheckCircle className="w-8 h-8 text-green-400" />
                          <span>No active reserves</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Enhanced KYC and Payout Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced KYC Submission */}
          <motion.div
            className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-xl rounded-2xl border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} overflow-hidden`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Submit KYC Verification
                  </h2>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Upload your documents for identity verification
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={submitKyc} className="space-y-6">
                {/* KYC Level Selection */}
                <div>
                  <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Verification Level
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { level: 'Tier1', label: 'Basic Verification', desc: 'ID + Selfie', color: 'blue' },
                      { level: 'Tier2', label: 'Full Verification', desc: 'ID + Address + Enhanced', color: 'purple' }
                    ].map((tier) => (
                      <motion.button
                        key={tier.level}
                        type="button"
                        onClick={() => setKycForm(prev => ({ ...prev, levelRequested: tier.level }))}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          kycForm.levelRequested === tier.level
                            ? `border-${tier.color}-500 bg-${tier.color}-50`
                            : `${isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'}`
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className={`font-medium ${kycForm.levelRequested === tier.level ? `text-${tier.color}-700` : (isDarkMode ? 'text-gray-300' : 'text-gray-700')}`}>
                          {tier.label}
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {tier.desc}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Document Upload */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      Required Documents
                    </label>
                    <motion.button
                      type="button"
                      onClick={addKycDoc}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isDarkMode
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Upload className="w-4 h-4 inline mr-2" />
                      Add Document
                    </motion.button>
                  </div>

                  <div className="space-y-4">
                    {kycForm.documents.map((doc, idx) => (
                      <motion.div
                        key={idx}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        } ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, idx)}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <select
                            className={`flex-1 p-3 rounded-lg border transition-all ${
                              isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-200 text-gray-900'
                            } focus:ring-2 focus:ring-blue-500`}
                            value={doc.type}
                            onChange={(e) => onKycDocChange(idx, 'type', e.target.value)}
                          >
                            <option value="nat_id">National ID</option>
                            <option value="passport">Passport</option>
                            <option value="utility_bill">Utility Bill</option>
                            <option value="bank_statement">Bank Statement</option>
                            <option value="selfie">Selfie</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        {/* File Upload Area */}
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileUpload(idx, e.target.files[0])}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className={`p-4 rounded-lg border-2 border-dashed transition-all text-center ${
                            dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                          } ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                            {doc.preview ? (
                              <div className="flex items-center justify-center gap-3">
                                <Image className="w-8 h-8 text-green-500" />
                                <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                                  File uploaded successfully
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <Upload className="w-6 h-6 text-gray-400" />
                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Drag & drop or click to upload
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* URL Input Alternative */}
                        <div className="mt-3">
                          <input
                            type="url"
                            placeholder="Or paste document URL..."
                            value={doc.url}
                            onChange={(e) => onKycDocChange(idx, 'url', e.target.value)}
                            className={`w-full p-3 rounded-lg border transition-all ${
                              isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                            } focus:ring-2 focus:ring-blue-500`}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Estimated Approval Time */}
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border ${isDarkMode ? 'border-blue-800' : 'border-blue-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                      Estimated Approval Time
                    </span>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                    Typically reviewed within 24–48 hours during business days
                  </p>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={submittingKyc}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                  whileHover={{ scale: submittingKyc ? 1 : 1.02 }}
                  whileTap={{ scale: submittingKyc ? 1 : 0.98 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />

                  {submittingKyc ? (
                    <div className="flex items-center justify-center gap-3 relative z-10">
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Submitting KYC...</span>
                    </div>
                  ) : (
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Upload className="w-5 h-5" />
                      Submit for Verification
                    </span>
                  )}
                </motion.button>
              </form>

              {/* KYC Request History */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  KYC Request History
                </h3>
                <div className="space-y-3">
                  {kycList.length === 0 ? (
                    <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No KYC requests submitted yet</p>
                    </div>
                  ) : (
                    kycList.map((kyc, index) => (
                      <motion.div
                        key={kyc._id}
                        className={`p-4 rounded-lg border transition-all ${
                          isDarkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-gray-50 border-gray-200'
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              kyc.status === 'approved' ? 'bg-green-100' :
                              kyc.status === 'rejected' ? 'bg-red-100' :
                              kyc.status === 'pending' ? 'bg-yellow-100' : 'bg-blue-100'
                            }`}>
                              {kyc.status === 'approved' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                               kyc.status === 'rejected' ? <XCircle className="w-4 h-4 text-red-600" /> :
                               kyc.status === 'pending' ? <Clock className="w-4 h-4 text-yellow-600" /> :
                               <FileText className="w-4 h-4 text-blue-600" />}
                            </div>
                            <div>
                              <div className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                Level {kyc.levelRequested}
                              </div>
                              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {new Date(kyc.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            kyc.status === 'approved' ? 'bg-green-100 text-green-800' :
                            kyc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            kyc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {kyc.status}
                          </span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Payout Request */}
          <motion.div
            className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-xl rounded-2xl border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} overflow-hidden`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} bg-gradient-to-r ${status?.payoutEligible ? 'from-green-50 to-emerald-50' : 'from-gray-50 to-gray-100'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${status?.payoutEligible ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <CreditCard className={`w-6 h-6 ${status?.payoutEligible ? 'text-green-600' : 'text-gray-600'}`} />
                </div>
                <div>
                  <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Request Payout
                  </h2>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {status?.payoutEligible ? 'Eligible for payout requests' : 'Complete verification to unlock payouts'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {!status?.payoutEligible ? (
                /* Locked State */
                <motion.div
                  className={`p-8 rounded-2xl border-2 border-dashed ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} text-center`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    Payouts Locked
                  </h3>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    Complete Tier 2 KYC verification and wait for reserve release period
                  </p>
                  {status?.limitation?.countdownMs && (
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                        <Countdown ms={status.limitation.countdownMs} />
                      </span>
                    </div>
                  )}
                </motion.div>
              ) : (
                /* Payout Form */
                <form onSubmit={submitPayout} className="space-y-6">
                  {/* Amount Input */}
                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      Payout Amount
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={payoutForm.amount}
                        onChange={(e) => setPayoutForm((p) => ({ ...p, amount: e.target.value }))}
                        className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                        } focus:border-green-500 focus:ring-4 focus:ring-green-100`}
                        placeholder="0.00"
                      />
                    </div>
                    {payoutForm.amount && (
                      <motion.div
                        className={`mt-2 p-3 rounded-lg ${isDarkMode ? 'bg-green-900/20' : 'bg-green-50'} border ${isDarkMode ? 'border-green-800' : 'border-green-200'}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                      >
                        <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                          You'll receive: <span className="font-bold">KES {(Number(payoutForm.amount) * 0.98).toLocaleString()}</span> after fees
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Bank Details */}
                  <div className="space-y-4">
                    <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Bank Details
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Bank Name
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={payoutForm.destination.bankName}
                            onChange={(e) => setPayoutForm((p) => ({ ...p, destination: { ...p.destination, bankName: e.target.value } }))}
                            className={`w-full pl-10 pr-12 py-3 rounded-xl border transition-all ${
                              isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                            } focus:ring-2 focus:ring-green-500`}
                            placeholder="Equity, KCB, DTB..."
                          />
                          {payoutForm.destination.bankName && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lg">
                              {getBankLogo(payoutForm.destination.bankName)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Account Name
                        </label>
                        <input
                          type="text"
                          value={payoutForm.destination.accountName}
                          onChange={(e) => setPayoutForm((p) => ({ ...p, destination: { ...p.destination, accountName: e.target.value } }))}
                          className={`w-full p-3 rounded-xl border transition-all ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                          } focus:ring-2 focus:ring-green-500`}
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Account Number
                        </label>
                        <input
                          type="text"
                          value={payoutForm.destination.accountNumber}
                          onChange={(e) => setPayoutForm((p) => ({ ...p, destination: { ...p.destination, accountNumber: e.target.value } }))}
                          className={`w-full p-3 rounded-xl border transition-all ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                          } focus:ring-2 focus:ring-green-500`}
                          placeholder="0123456789"
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Bank Code (Optional)
                        </label>
                        <input
                          type="text"
                          value={payoutForm.destination.bankCode}
                          onChange={(e) => setPayoutForm((p) => ({ ...p, destination: { ...p.destination, bankCode: e.target.value } }))}
                          className={`w-full p-3 rounded-xl border transition-all ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                          } focus:ring-2 focus:ring-green-500`}
                          placeholder="SWIFT/Branch Code"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Payout Button */}
                  <motion.button
                    type="submit"
                    disabled={submittingPayout}
                    className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                    whileHover={{ scale: submittingPayout ? 1 : 1.02 }}
                    whileTap={{ scale: submittingPayout ? 1 : 0.98 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />

                    {submittingPayout ? (
                      <div className="flex items-center justify-center gap-3 relative z-10">
                        <motion.div
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <span>Processing Payout...</span>
                      </div>
                    ) : (
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Submit Payout Request
                      </span>
                    )}
                  </motion.button>

                  {/* Payout Info */}
                  <motion.div
                    className={`p-4 rounded-xl ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border ${isDarkMode ? 'border-blue-800' : 'border-blue-200'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-blue-600" />
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                        Payout Information
                      </span>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                      Payouts are processed within 1-3 business days after approval. All payouts are subject to final compliance review.
                    </p>
                  </motion.div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceCenter;