import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Shield,
  Scale,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Home,
  ArrowUp,
  Clock,
  ExternalLink,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowRight,
  Calendar,
  Mail,
  Phone,
  Globe,
  Star,
  Award,
  Users,
  Building,
  Flag
} from 'lucide-react';

const sections = {
  'user-agreement': {
    title: 'Vault5 User Agreement',
    lastUpdated: 'September 19, 2025',
    category: 'Core Agreement',
    icon: Scale,
    color: 'from-blue-500 to-blue-600',
    anchors: [
      {
        id: 'about',
        title: 'About Your Account',
        content: 'Welcome to Vault5! This agreement governs your use of your Vault5 account and services. By creating an account or using our services, you agree to be bound by these terms.',
        type: 'introduction'
      },
      {
        id: 'opening',
        title: 'Opening a Vault5 Account',
        content: 'We offer personal and business accounts. You must meet applicable eligibility requirements to open and use your account. This includes age requirements, identity verification, and compliance with local regulations.',
        type: 'requirements'
      },
      {
        id: 'closing',
        title: 'Closing Your Account',
        content: 'You may close your account at any time through your account settings or by contacting our support team. Outstanding obligations may remain after closure as allowed by law.',
        type: 'process'
      },
      {
        id: 'payment-methods',
        title: 'Link or Unlink a Payment Method',
        content: 'You may link mobile wallets or bank accounts to your Vault5 account. We may require verification to ensure the payment method is valid and belongs to you.',
        type: 'feature'
      },
      {
        id: 'funds',
        title: 'Receiving Funds, Holding a Balance, or Transferring Funds',
        content: 'All references to "funds" mean sovereign currency (not crypto). Availability and withdrawal may be subject to review and KYC verification requirements.',
        type: 'feature'
      },
      {
        id: 'tax',
        title: 'Taxes and Information Reporting',
        content: 'You are responsible for understanding and meeting your tax obligations. Vault5 may be required to provide certain reports to authorities as required by applicable law.',
        type: 'compliance'
      },
      {
        id: 'statements',
        title: 'Account Statements',
        content: 'You can view statements within Vault5 and request additional records where available. Statements are provided electronically for your convenience.',
        type: 'feature'
      },
      {
        id: 'sending',
        title: 'Sending Money and Buying',
        content: 'When you send money or buy services, you authorize the selected payment method for the transaction according to applicable terms and conditions.',
        type: 'feature'
      },
      {
        id: 'selling',
        title: 'Selling and Accepting Payments',
        content: 'Merchants must comply with our policies and applicable laws, including accurate representations and no surcharging unless explicitly allowed.',
        type: 'merchant'
      },
      {
        id: 'restricted',
        title: 'Restricted Activities, Holds, and Other Actions',
        content: 'Certain activities are prohibited. We may hold funds or limit accounts to manage risk or comply with legal requirements.',
        type: 'restrictions'
      },
      {
        id: 'liability',
        title: 'Liability for Unauthorized Transactions and Other Errors',
        content: 'Review your statements regularly. Report unauthorized transactions and errors in a timely manner to minimize potential liability.',
        type: 'liability'
      },
      {
        id: 'other',
        title: 'Other Legal Terms',
        content: 'This section includes communications, governing law, arbitration clauses, and other legal notices applicable to your use of Vault5 services.',
        type: 'legal'
      },
    ],
  },
  'acceptable-use': {
    title: 'Acceptable Use Policy',
    lastUpdated: 'September 19, 2025',
    category: 'Usage Guidelines',
    icon: Shield,
    color: 'from-green-500 to-green-600',
    anchors: [
      {
        id: 'prohibited',
        title: 'Prohibited Activities',
        content: 'You may not use Vault5 for illegal or abusive purposes, including fraud, money laundering, or rights infringement. This includes any activities that violate local, national, or international laws.',
        type: 'restrictions'
      },
      {
        id: 'security',
        title: 'Security Requirements',
        content: 'Keep your credentials confidential and use strong authentication methods where available. You are responsible for maintaining the security of your account.',
        type: 'security'
      },
      {
        id: 'consequences',
        title: 'Consequences of Violation',
        content: 'We may limit, suspend, or close accounts engaged in violations, and we may report activity to authorities as required by law. Violations may result in permanent account termination.',
        type: 'enforcement'
      },
    ],
  },
  'e-sign': {
    title: 'Electronic Communications Delivery Policy (E-Sign Disclosure and Consent)',
    lastUpdated: 'September 19, 2025',
    category: 'Digital Consent',
    icon: BookOpen,
    color: 'from-purple-500 to-purple-600',
    anchors: [
      {
        id: 'consent',
        title: 'Consent to Electronic Records',
        content: 'By using Vault5, you consent to receive records electronically, including disclosures, notices, and statements. Electronic delivery is considered equivalent to paper delivery.',
        type: 'consent'
      },
      {
        id: 'hardware',
        title: 'Hardware and Software Requirements',
        content: 'You must maintain compatible hardware/software to access and retain electronic communications. This includes a valid email address and internet access.',
        type: 'requirements'
      },
      {
        id: 'withdrawal',
        title: 'Withdrawal of Consent',
        content: 'You may withdraw consent by contacting support, but this may impact availability of services. Some communications may still be delivered electronically for legal compliance.',
        type: 'process'
      },
    ],
  },
};

const LegalCenter = () => {
  const { doc = 'user-agreement' } = useParams();
  const navigate = useNavigate();
  const model = sections[doc] || sections['user-agreement'];

  const [activeSection, setActiveSection] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setShowBackToTop(scrollTop > 300);

      // Update active section based on scroll position
      const sectionElements = model.anchors?.map(anchor => document.getElementById(anchor.id));
      const activeElement = sectionElements?.find(element => {
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });

      if (activeElement) {
        setActiveSection(activeElement.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [model.anchors]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const getSectionIcon = (type) => {
    switch (type) {
      case 'introduction': return <Info className="w-4 h-4" />;
      case 'requirements': return <CheckCircle className="w-4 h-4" />;
      case 'process': return <ArrowRight className="w-4 h-4" />;
      case 'feature': return <Star className="w-4 h-4" />;
      case 'compliance': return <Shield className="w-4 h-4" />;
      case 'merchant': return <Building className="w-4 h-4" />;
      case 'restrictions': return <AlertTriangle className="w-4 h-4" />;
      case 'liability': return <Scale className="w-4 h-4" />;
      case 'legal': return <FileText className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'enforcement': return <AlertTriangle className="w-4 h-4" />;
      case 'consent': return <CheckCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getSectionColor = (type) => {
    switch (type) {
      case 'introduction': return 'text-blue-600 bg-blue-100';
      case 'requirements': return 'text-green-600 bg-green-100';
      case 'process': return 'text-purple-600 bg-purple-100';
      case 'feature': return 'text-orange-600 bg-orange-100';
      case 'compliance': return 'text-indigo-600 bg-indigo-100';
      case 'merchant': return 'text-teal-600 bg-teal-100';
      case 'restrictions': return 'text-red-600 bg-red-100';
      case 'liability': return 'text-yellow-600 bg-yellow-100';
      case 'legal': return 'text-gray-600 bg-gray-100';
      case 'security': return 'text-emerald-600 bg-emerald-100';
      case 'enforcement': return 'text-red-600 bg-red-100';
      case 'consent': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
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
        {/* Breadcrumb Navigation */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" />
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/legal" className="hover:text-blue-600 transition-colors">
              Legal Center
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{model.title}</span>
          </nav>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sticky Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <motion.div
              className="sticky top-8 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {/* Document Selector */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Legal Documents</h3>
                <div className="space-y-2">
                  {Object.entries(sections).map(([key, section]) => {
                    const Icon = section.icon;
                    return (
                      <Link
                        key={key}
                        to={`/legal/${key}`}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                          doc === key
                            ? 'bg-blue-50 border border-blue-200 text-blue-800'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg bg-gradient-to-r ${section.color}`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium">{section.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Table of Contents */}
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">On This Page</h4>
                <nav className="space-y-1">
                  {model.anchors?.map((anchor) => (
                    <motion.button
                      key={anchor.id}
                      onClick={() => scrollToSection(anchor.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                        activeSection === anchor.id
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      whileHover={{ x: 2 }}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getSectionColor(anchor.type)}`}>
                        {getSectionIcon(anchor.type)}
                      </div>
                      <span className="truncate">{anchor.title}</span>
                    </motion.button>
                  ))}
                </nav>
              </div>
            </motion.div>
          </aside>

          {/* Main Document Content */}
          <main className="lg:col-span-3">
            <motion.div
              className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Document Header */}
              <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50/50">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-r ${model.color}`}>
                      <model.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900">{model.title}</h1>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {model.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Last updated {model.lastUpdated}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          <span>Binding Agreement</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PDF Download */}
                  <motion.button
                    onClick={() => window.open(`/api/legal/${doc}.pdf`, '_blank')}
                    className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download className="w-5 h-5" />
                    <span className="font-medium">Download PDF</span>
                  </motion.button>
                </div>

                {/* Document Description */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 leading-relaxed">
                    This document is legally binding and enforceable under applicable laws.
                    Please read carefully before using Vault5 services.
                  </p>
                </div>
              </div>

              {/* Document Content */}
              <div className="p-8">
                <div className="space-y-8">
                  {model.anchors?.map((anchor, index) => (
                    <motion.section
                      key={anchor.id}
                      id={anchor.id}
                      className="scroll-mt-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getSectionColor(anchor.type)}`}>
                          {getSectionIcon(anchor.type)}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{anchor.title}</h2>
                      </div>

                      <div className="pl-11">
                        <p className="text-gray-700 leading-relaxed mb-4">{anchor.content}</p>

                        {/* Expandable detailed content */}
                        <motion.button
                          onClick={() => toggleSection(anchor.id)}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                          whileHover={{ x: 2 }}
                        >
                          <span className="text-sm font-medium">
                            {expandedSections[anchor.id] ? 'Show Less' : 'Read More'}
                          </span>
                          <motion.div
                            animate={{ rotate: expandedSections[anchor.id] ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </motion.div>
                        </motion.button>

                        <AnimatePresence>
                          {expandedSections[anchor.id] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-4 pt-4 border-t border-gray-200"
                            >
                              <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">Detailed Information</h4>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                  This section provides comprehensive details about {anchor.title.toLowerCase()}.
                                  All terms and conditions outlined here are legally binding and must be followed
                                  when using Vault5 services.
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.section>
                  ))}
                </div>

                {/* Legal Disclaimers */}
                <motion.div
                  className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-semibold text-yellow-900">Legal Notice</h3>
                  </div>
                  <p className="text-yellow-800 text-sm leading-relaxed">
                    This document is binding and enforceable under applicable laws. By using Vault5 services,
                    you acknowledge that you have read, understood, and agreed to comply with all terms outlined herein.
                  </p>
                </motion.div>

                {/* Version and Audit Info */}
                <motion.div
                  className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Version 1.0</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        <span>Global Applicability</span>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                      View Version History
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Related Documents */}
            <motion.div
              className="mt-8 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Related Documents</h3>
                <p className="text-gray-600 mt-1">Other legal documents you may need to review</p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(sections)
                    .filter(([key]) => key !== doc)
                    .slice(0, 3)
                    .map(([key, section]) => {
                      const Icon = section.icon;
                      return (
                        <Link
                          key={key}
                          to={`/legal/${key}`}
                          className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${section.color}`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {section.title}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-600">{section.category}</p>
                        </Link>
                      );
                    })}
                </div>
              </div>
            </motion.div>
          </main>
        </div>
      </div>

      {/* Floating Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-3 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-colors"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LegalCenter;