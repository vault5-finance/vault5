import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import AdvancedAnalyticsDashboard from '../components/AdvancedAnalyticsDashboard';
import CashFlowProjection from '../components/CashFlowProjection';
import GamificationDashboard from '../components/GamificationDashboard';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Download,
  Filter,
  Search,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Target,
  Award,
  Sparkles,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Users,
  Globe,
  Receipt,
  Tag,
  MoreVertical,
  Eye,
  EyeOff,
  Clock,
  Star,
  Heart,
  Zap,
  Shield,
  Lock,
  FileText,
  Calculator,
  Wallet,
  CreditCard
} from 'lucide-react';

const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [activeSection, setActiveSection] = useState('overview');
  const [showAnalytics, setShowAnalytics] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    api.get(`/api/reports/cashflow?period=${period}`)
    .then(response => {
      setReport(response.data);
      setLoading(false);
    })
    .catch(error => {
      console.error('Report error:', error);
      if (error.response && error.response.status === 401) navigate('/login');
      setLoading(false);
    });
  }, [period, navigate]);

  // Scroll to in-page anchors when hash is present
  React.useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

  const downloadPDF = () => {
    const base = (api.defaults && api.defaults.baseURL) || '';
    const link = document.createElement('a');
    link.href = `${base}/api/reports/export/pdf?reportType=cashflow&period=${period}`;
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadExcel = () => {
    const base = (api.defaults && api.defaults.baseURL) || '';
    const link = document.createElement('a');
    link.href = `${base}/api/reports/export/excel?reportType=cashflow&period=${period}`;
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sections = [
    { id: 'overview', name: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'spending', name: 'Spending', icon: <ArrowDownLeft className="w-4 h-4" /> },
    { id: 'income', name: 'Income', icon: <ArrowUpRight className="w-4 h-4" /> },
    { id: 'cashflow', name: 'Cash Flow', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'insights', name: 'AI Insights', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'gamification', name: 'Achievements', icon: <Award className="w-4 h-4" /> }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
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
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <motion.div
              className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-gray-600">Loading your financial insights...</p>
          </div>
        </div>
      </div>
    );
  }

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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-white/50 rounded-full px-6 py-3 mb-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="w-3 h-3 bg-green-400 rounded-full"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm font-medium text-gray-700">Financial Intelligence</span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Your Vault5 Reports
          </motion.h1>

          <motion.p
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            AI-powered insights and projections to guide your <span className="font-semibold text-blue-600">financial future</span>.
          </motion.p>
        </motion.div>

        {/* Period Selector */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Report Period:</span>
              <div className="flex bg-gray-100 rounded-xl p-1">
                {['weekly', 'monthly', 'yearly'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      period === p
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                {showAnalytics ? 'Hide' : 'Show'} Analytics
              </button>

              <div className="flex gap-2">
                <button
                  onClick={downloadPDF}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
                <button
                  onClick={downloadExcel}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Analytics Section */}
        <AnimatePresence>
          {showAnalytics && (
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AdvancedAnalyticsDashboard />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar Navigation */}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-80 flex-shrink-0">
            <div className="sticky top-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Report Sections</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                      {section.icon}
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">{section.name}</span>
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeSection === 'overview' && (
                  <div className="space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <motion.div
                        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <ArrowUpRight className="w-6 h-6 text-green-600" />
                          <div className="text-xs text-gray-500 font-medium">Total Income</div>
                        </div>
                        <div className="text-3xl font-bold text-green-600">
                          KES {report?.income?.toLocaleString() || '0'}
                        </div>
                        <p className="text-xs text-gray-600 mt-2">This {period}</p>
                      </motion.div>

                      <motion.div
                        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <ArrowDownLeft className="w-6 h-6 text-red-600" />
                          <div className="text-xs text-gray-500 font-medium">Total Expenses</div>
                        </div>
                        <div className="text-3xl font-bold text-red-600">
                          KES {report?.expenses?.toLocaleString() || '0'}
                        </div>
                        <p className="text-xs text-gray-600 mt-2">This {period}</p>
                      </motion.div>

                      <motion.div
                        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <DollarSign className="w-6 h-6 text-blue-600" />
                          <div className="text-xs text-gray-500 font-medium">Net Cash Flow</div>
                        </div>
                        <div className={`text-3xl font-bold ${report?.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          KES {Math.abs(report?.netCashFlow || 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          {report?.netCashFlow >= 0 ? 'Positive' : 'Negative'} balance
                        </p>
                      </motion.div>
                    </div>

                    {/* Cash Flow Report */}
                    {report && (
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">
                          {period.charAt(0).toUpperCase() + period.slice(1)} Cash Flow Report
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Missed Deposits</h4>
                            {report.missedDeposits.length > 0 ? (
                              <div className="space-y-2">
                                {report.missedDeposits.map((dep, index) => (
                                  <div key={index} className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <AlertTriangle className="w-4 h-4 text-red-600" />
                                    <span className="text-red-800">KES {dep.shortfall.toFixed(2)} shortfall</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-green-800">No missed deposits this {period}</span>
                              </div>
                            )}
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Surplus History</h4>
                            {report.surplusHistory.length > 0 ? (
                              <div className="space-y-2">
                                {report.surplusHistory.slice(0, 5).map((sur, index) => (
                                  <div key={index} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <span className="text-blue-800">KES {sur.amount.toFixed(2)}</span>
                                    <span className="text-xs text-blue-600">{new Date(sur.date).toLocaleDateString()}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                <Clock className="w-4 h-4 text-gray-600" />
                                <span className="text-gray-800">No surplus history yet</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeSection === 'spending' && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Spending Analytics</h2>
                    <div className="text-center py-12">
                      <motion.div
                        className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <PieChart className="w-8 h-8 text-blue-600" />
                      </motion.div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Spending Breakdown</h3>
                      <p className="text-gray-600 mb-4">Detailed spending analytics will appear here.</p>
                      <p className="text-sm text-gray-500">Use the period selector above to change the time scope.</p>
                    </div>
                  </div>
                )}

                {activeSection === 'income' && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Income Trends</h2>
                    <div className="text-center py-12">
                      <motion.div
                        className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <TrendingUp className="w-8 h-8 text-green-600" />
                      </motion.div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Income Breakdown</h3>
                      <p className="text-gray-600 mb-4">Income trends and breakdowns will be shown here.</p>
                      <p className="text-sm text-gray-500">Use the period selector above to change the time scope.</p>
                    </div>
                  </div>
                )}

                {activeSection === 'cashflow' && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Cash Flow Projection</h2>
                    <CashFlowProjection />
                  </div>
                )}

                {activeSection === 'insights' && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">AI-Powered Insights</h2>
                    <div className="space-y-4">
                      <motion.div
                        className="p-4 bg-blue-50 border border-blue-200 rounded-xl"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-blue-900">Smart Suggestion</span>
                        </div>
                        <p className="text-blue-800">
                          Based on your spending patterns, consider reducing entertainment expenses by 15% to increase your monthly surplus by KES 3,200.
                        </p>
                      </motion.div>

                      <motion.div
                        className="p-4 bg-green-50 border border-green-200 rounded-xl"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-green-900">Goal Progress</span>
                        </div>
                        <p className="text-green-800">
                          You're 78% towards your emergency fund goal. At this rate, you'll reach it in 3 months.
                        </p>
                      </motion.div>

                      <motion.div
                        className="p-4 bg-purple-50 border border-purple-200 rounded-xl"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-5 h-5 text-purple-600" />
                          <span className="font-semibold text-purple-900">Trend Analysis</span>
                        </div>
                        <p className="text-purple-800">
                          Your income has increased by 12% this quarter, but expenses have grown by 8%. Consider optimizing your budget allocation.
                        </p>
                      </motion.div>
                    </div>
                  </div>
                )}

                {activeSection === 'gamification' && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Achievements</h2>
                    <GamificationDashboard />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;