import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  FileText,
  Lock,
  HandCoins,
  Calendar,
  Download,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Home,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';

const UPDATES = [
  {
    id: '2025-09-01',
    date: '2025-09-01',
    title: 'User Agreement v1.3 and Lending Rules',
    type: 'agreement',
    summary: 'We clarified allocation behavior, added Wallet vs Auto-Distribution options, and documented lending guardrails.',
    changes: [
      'Added Wallet vs Auto-Distribution preference on income deposits.',
      'Documented that tagged income bypasses allocation and is logged.',
      'Clarified status colors: red=shortfall, green=on target, blue=surplus.',
      'Outlined Lending module caps and safe source accounts.'
    ]
  },
  {
    id: '2025-08-15',
    date: '2025-08-15',
    title: 'Privacy Policy v1.2',
    type: 'privacy',
    summary: 'Improved transparency on audit logging for admin actions and security events.',
    changes: [
      'Centralized audit logging and CSV export explained.',
      'Reason headers required for critical admin actions documented.',
      'Data retention windows clarified.'
    ]
  }
];

const PolicyUpdates = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'timeline'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedUpdates, setExpandedUpdates] = useState(new Set());

  // Auto-close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth < 1024 && sidebarOpen) {
        const sidebar = document.getElementById('policy-sidebar');
        if (sidebar && !sidebar.contains(event.target)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  const toggleUpdateExpansion = (updateId) => {
    const newExpanded = new Set(expandedUpdates);
    if (newExpanded.has(updateId)) {
      newExpanded.delete(updateId);
    } else {
      newExpanded.add(updateId);
    }
    setExpandedUpdates(newExpanded);
  };

  const getPolicyIcon = (type) => {
    switch (type) {
      case 'privacy': return <Lock className="w-4 h-4" />;
      case 'agreement': return <FileText className="w-4 h-4" />;
      case 'lending': return <HandCoins className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getPolicyColor = (type) => {
    switch (type) {
      case 'privacy': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'agreement': return 'bg-green-100 text-green-800 border-green-200';
      case 'lending': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const scrollToUpdate = (updateId) => {
    const element = document.getElementById(updateId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setSidebarOpen(false); // Close sidebar on mobile after navigation
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <a href="/" className="flex items-center hover:text-gray-700 transition-colors">
              <Home className="w-4 h-4 mr-1" />
              Home
            </a>
            <ChevronRight className="w-4 h-4" />
            <a href="/legal" className="hover:text-gray-700 transition-colors">Legal Center</a>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Policy Updates</span>
          </nav>

          {/* Main Title */}
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Policy Updates</h1>
              <p className="text-lg text-gray-600 mt-1">Legal Changelog & Transparency</p>
            </div>
          </div>

          {/* Reassuring Subtitle */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-900 font-medium">We believe in transparency</p>
                <p className="text-blue-700 text-sm mt-1">
                  Here you'll find summaries of every change to our policies, agreements, and user terms.
                  We maintain detailed records to ensure you always know how we're protecting your rights and data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Floating Sidebar */}
          <motion.aside
            id="policy-sidebar"
            initial={{ x: -300, opacity: 0 }}
            animate={{
              x: window.innerWidth >= 1024 ? 0 : (sidebarOpen ? 0 : -300),
              opacity: window.innerWidth >= 1024 ? 1 : (sidebarOpen ? 1 : 0)
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed lg:static top-0 left-0 h-full lg:h-auto w-80 bg-white border-r border-gray-200 shadow-lg lg:shadow-none z-40 lg:z-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Quick Navigation</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <EyeOff className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {UPDATES.map((update, index) => (
                  <motion.button
                    key={update.id}
                    onClick={() => scrollToUpdate(update.id)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
                    whileHover={{ x: 4 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-md ${getPolicyColor(update.type)}`}>
                        {getPolicyIcon(update.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPolicyColor(update.type)}`}>
                            {update.type.charAt(0).toUpperCase() + update.type.slice(1)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(update.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {update.title}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* View Mode Toggle */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">View Options</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      viewMode === 'list'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    List View
                  </button>
                  <button
                    onClick={() => setViewMode('timeline')}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      viewMode === 'timeline'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Timeline
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed bottom-6 right-6 z-30 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          >
            <Eye className="w-5 h-5" />
          </button>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* View Toggle Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {viewMode === 'timeline' ? 'Update Timeline' : 'Policy Changes'}
                </h2>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                  {UPDATES.length} updates
                </span>
              </div>
            </div>

            {/* Updates Content */}
            <div className={`space-y-6 ${viewMode === 'timeline' ? 'relative' : ''}`}>
              {viewMode === 'timeline' && (
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              )}

              {UPDATES.map((update, index) => (
                <motion.section
                  key={update.id}
                  id={update.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${
                    viewMode === 'timeline' ? 'ml-16 relative' : ''
                  }`}
                >
                  {viewMode === 'timeline' && (
                    <div className="absolute -left-16 top-6 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-sm"></div>
                  )}

                  <div className="p-6">
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getPolicyColor(update.type)}`}>
                          {getPolicyIcon(update.type)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{update.title}</h3>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPolicyColor(update.type)}`}>
                              {update.type.charAt(0).toUpperCase() + update.type.slice(1)} Policy
                            </span>
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              Effective {new Date(update.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-gray-700 italic">{update.summary}</p>
                    </div>

                    {/* Changes List */}
                    <div className="mb-6">
                      <button
                        onClick={() => toggleUpdateExpansion(update.id)}
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors mb-3"
                      >
                        {expandedUpdates.has(update.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        Detailed Changes ({update.changes.length})
                      </button>

                      <AnimatePresence>
                        {expandedUpdates.has(update.id) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2"
                          >
                            {update.changes.map((change, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100"
                              >
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{change}</span>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Action Buttons - Sticky Footer */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                      <motion.a
                        href="/api/legal/user-agreement.pdf"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Download className="w-4 h-4" />
                        Download PDF
                      </motion.a>
                      <motion.a
                        href="/legal/user-agreement"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Legal Center
                      </motion.a>
                    </div>
                  </div>
                </motion.section>
              ))}
            </div>

            {/* Professional Closing State */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-8 border border-gray-200"
            >
              <div className="text-center">
                <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Page last reviewed on {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  For questions about these policy updates or to submit a legal inquiry,
                  our team is here to help ensure you understand how we protect your rights and data.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <motion.a
                    href="mailto:legal@vault5.com"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FileText className="w-5 h-5" />
                    Contact Legal Team
                  </motion.a>
                  <motion.a
                    href="/legal"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ExternalLink className="w-5 h-5" />
                    Browse All Legal Docs
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </main>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && window.innerWidth < 1024 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default PolicyUpdates;