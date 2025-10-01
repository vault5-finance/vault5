import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Lock,
  Database,
  Eye,
  FileText,
  Download,
  Search,
  ChevronDown,
  ChevronRight,
  User,
  Clock,
  Globe,
  Cookie,
  ExternalLink,
  RefreshCw,
  Mail,
  MapPin,
  Phone,
  ArrowUp,
  Sun,
  Moon,
  Info,
  CheckCircle,
  AlertCircle,
  Users,
  Settings,
  CreditCard,
  Building,
  Scale,
  X,
  Filter,
  Bookmark,
  Star,
  Heart,
  Zap
} from 'lucide-react';

const Privacy = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const sections = [
    {
      id: 'overview',
      title: 'Privacy Overview',
      icon: Shield,
      color: 'from-blue-500 to-blue-600',
      content: (
        <div className="space-y-4">
          <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            At Vault5, we respect your privacy and are committed to protecting your personal information.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our platform,
            which provides financial discipline tools, payment services, investment tracking, lending, and related features.
          </p>
          <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border ${isDarkMode ? 'border-blue-800' : 'border-blue-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-5 h-5 text-blue-600" />
              <span className={`font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>Key Principles</span>
            </div>
            <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                We never sell your personal data
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Your data is encrypted and tokenized
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                You control your privacy settings
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'information-collection',
      title: 'Information We Collect',
      icon: Database,
      color: 'from-green-500 to-green-600',
      subsections: [
        {
          title: 'Information You Provide',
          content: (
            <div className="space-y-3">
              <div className="grid gap-3">
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} border-l-4 border-blue-500`}>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-blue-500" />
                    <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Identity</span>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Full name, date of birth, ID/passport details, national KRA/Tax Number (where applicable).
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} border-l-4 border-green-500`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-green-500" />
                    <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Contact</span>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Email address(es), phone number(s), country, city, and mailing address.
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} border-l-4 border-purple-500`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-purple-500" />
                    <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>KYC</span>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Proof of address, ID front/back, selfie verification, compliance questionnaires.
                  </p>
                </div>
              </div>
            </div>
          )
        },
        {
          title: 'Automatically Collected',
          content: (
            <div className="space-y-3">
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} border-l-4 border-orange-500`}>
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-4 h-4 text-orange-500" />
                  <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Device</span>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  IP address, device type, operating system, browser type/version.
                </p>
              </div>
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} border-l-4 border-red-500`}>
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-red-500" />
                  <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Usage</span>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Pages visited, clicks, time on page, referrer/UTM data.
                </p>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'data-usage',
      title: 'How We Use Your Information',
      icon: Settings,
      color: 'from-purple-500 to-purple-600',
      content: (
        <div className="space-y-4">
          <div className="grid gap-3">
            {[
              'Provide, operate, and maintain Vault5 services and features',
              'Process payments, deposits, withdrawals, transfers, and lending workflows',
              'Comply with legal and regulatory obligations (KYC, AML/CTF, sanctions screening)',
              'Detect, investigate, and prevent fraud, abuse, and security incidents',
              'Offer insights, budgeting, allocation recommendations, and personalized content',
              'Communicate about updates, alerts, changes to policies, or promotions you opt into',
              'Analyze usage to improve performance, stability, and user experience',
              'Develop new features, products, and partnerships'
            ].map((item, index) => (
              <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'data-sharing',
      title: 'How We Share Your Information',
      icon: Users,
      color: 'from-orange-500 to-orange-600',
      content: (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'} border ${isDarkMode ? 'border-red-800' : 'border-red-200'}`}>
            <p className={`font-medium ${isDarkMode ? 'text-red-300' : 'text-red-800'} mb-2`}>We do not sell personal data</p>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Service Providers', desc: 'With trusted vendors (e.g., cloud hosting, payments, KYC) under contract', type: 'required' },
              { title: 'Compliance & Legal', desc: 'With regulators, law enforcement, courts, or auditors where required by law', type: 'required' },
              { title: 'Business Transfers', desc: 'In mergers, acquisitions, or restructuring, subject to the same confidentiality safeguards', type: 'optional' },
              { title: 'Aggregated/De-identified', desc: 'Analytics or research that does not identify you personally', type: 'optional' }
            ].map((item, index) => (
              <div key={index} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{item.title}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.type === 'required'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {item.type === 'required' ? 'Required by Law' : 'Optional'}
                  </span>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'user-rights',
      title: 'Your Rights & Choices',
      icon: Scale,
      color: 'from-indigo-500 to-indigo-600',
      content: (
        <div className="space-y-6">
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Depending on your jurisdiction, you may have rights to:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              'Access, correct, or update your personal information',
              'Request deletion (subject to legal/regulatory retention obligations)',
              'Object to certain processing or request restriction',
              'Withdraw consent where processing is based on consent',
              'Opt out of marketing communications'
            ].map((right, index) => (
              <div key={index} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{right}</span>
                </div>
              </div>
            ))}
          </div>
          <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-indigo-900/20' : 'bg-indigo-50'} border ${isDarkMode ? 'border-indigo-800' : 'border-indigo-200'}`}>
            <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-800'}`}>Exercise Your Rights</h4>
            <div className="flex flex-wrap gap-3">
              <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isDarkMode
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800'
              }`}>
                Request My Data
              </button>
              <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isDarkMode
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800'
              }`}>
                Delete My Account
              </button>
              <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isDarkMode
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800'
              }`}>
                Update My Info
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'data-retention',
      title: 'Data Retention',
      icon: Clock,
      color: 'from-teal-500 to-teal-600',
      content: (
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-teal-900/20' : 'bg-teal-50'} border ${isDarkMode ? 'border-teal-800' : 'border-teal-200'}`}>
          <p className={`${isDarkMode ? 'text-teal-300' : 'text-teal-800'}`}>
            We retain personal information only as long as necessary to provide services, comply with laws (including AML/CTF and tax),
            resolve disputes, and enforce agreements. When no longer required, data is securely deleted or anonymized.
          </p>
        </div>
      )
    },
    {
      id: 'security',
      title: 'Security Measures',
      icon: Lock,
      color: 'from-red-500 to-red-600',
      content: (
        <div className="space-y-4">
          <div className="grid gap-3">
            {[
              'Encryption in transit and at rest for sensitive data',
              'Role-based access controls, audit trails, and separation of duties',
              'Multi-factor authentication for admin/user access where available',
              'Continuous monitoring, vulnerability management, and periodic penetration tests'
            ].map((measure, index) => (
              <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <Shield className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{measure}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'kenya-compliance',
      title: 'Kenya Compliance',
      icon: Building,
      color: 'from-green-500 to-green-600',
      content: (
        <div className={`p-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Building className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-bold text-green-900">Kenya Data Protection Act (2019)</h4>
              <p className="text-sm text-green-700">Office of the Data Protection Commissioner (ODPC)</p>
            </div>
          </div>
          <p className="text-green-800 mb-4">
            Vault5 intends to align with the Kenya Data Protection Act (2019) and ODPC guidance. Prior to public
            launch, we will confirm ODPC registration status (Controller/Processor), publish the designated contact,
            and include lawful bases and data retention schedules specific to Kenya.
          </p>
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700">For an overview, see our Kenya compliance summary within the Legal Center.</span>
          </div>
        </div>
      )
    },
    {
      id: 'contact',
      title: 'Contact Us',
      icon: Mail,
      color: 'from-pink-500 to-pink-600',
      content: (
        <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-pink-900/20' : 'bg-pink-50'} border ${isDarkMode ? 'border-pink-800' : 'border-pink-200'}`}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-pink-600" />
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-pink-300' : 'text-pink-800'}`}>Privacy Office</p>
                  <a href="mailto:privacy@vault5.com" className="text-pink-600 hover:underline">privacy@vault5.com</a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-pink-600" />
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-pink-300' : 'text-pink-800'}`}>Support</p>
                  <a href="tel:+254700000000" className="text-pink-600 hover:underline">+254 700 000 000</a>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-pink-600" />
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-pink-300' : 'text-pink-800'}`}>Address</p>
                  <p className={`text-sm ${isDarkMode ? 'text-pink-200' : 'text-pink-700'}`}>
                    Nairobi, Kenya<br />
                    [Insert Registered Address]
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setScrollProgress(scrollPercent);
      setShowBackToTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const downloadPDF = () => {
    // In a real implementation, this would generate and download a PDF
    alert('PDF download feature coming soon!');
  };

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

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 z-50"
        style={{ scaleX: scrollProgress / 100 }}
        initial={{ scaleX: 0 }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sticky Sidebar Navigation */}
          <div className="lg:col-span-1">
            <motion.div
              className={`sticky top-8 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-xl rounded-2xl border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} p-6`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* Header Controls */}
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Legal Hub
                  </h3>
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`p-2 rounded-lg transition-all ${
                      isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search policy..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm transition-all ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                    } border focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                {/* Download PDF */}
                <button
                  onClick={downloadPDF}
                  className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <motion.button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                        activeSection === section.id
                          ? (isDarkMode ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-blue-50 border border-blue-200')
                          : (isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50')
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`p-1.5 rounded-lg bg-gradient-to-r ${section.color}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className={`text-sm font-medium ${
                        activeSection === section.id
                          ? 'text-blue-600'
                          : (isDarkMode ? 'text-gray-300' : 'text-gray-700')
                      }`}>
                        {section.title}
                      </span>
                    </motion.button>
                  );
                })}
              </nav>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Hero Header */}
            <motion.div
              className={`mb-8 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-xl rounded-3xl border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} p-8`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-6 mb-6">
                <motion.div
                  className="relative p-4 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  <Shield className="w-8 h-8 text-white" />
                  <motion.div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                <div className="flex-1">
                  <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Privacy Policy
                  </h1>
                  <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Your privacy and data protection are our priority
                  </p>
                </div>
              </div>

              {/* Date badges */}
              <div className="flex flex-wrap gap-3">
                <div className={`px-4 py-2 rounded-xl ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'} border ${isDarkMode ? 'border-blue-800' : 'border-blue-200'}`}>
                  <div className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                    Effective Date
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                    [To be set at public launch]
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-xl ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'} border ${isDarkMode ? 'border-green-800' : 'border-green-200'}`}>
                  <div className={`text-sm font-medium ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                    Last Updated
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-green-200' : 'text-green-700'}`}>
                    September 2025
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Content Sections */}
            <div className="space-y-6">
              {sections.map((section, index) => (
                <motion.div
                  key={section.id}
                  id={section.id}
                  className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-xl rounded-2xl border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'} overflow-hidden`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={`w-full p-6 text-left flex items-center justify-between hover:${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50/50'} transition-all`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${section.color}`}>
                        <section.icon className="w-6 h-6 text-white" />
                      </div>
                      <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {section.title}
                      </h2>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedSections[section.id] ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {expandedSections[section.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-6 pb-6"
                      >
                        <div className="pt-4 border-t border-gray-200/50">
                          {section.content}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            onClick={scrollToTop}
            className={`fixed bottom-8 right-8 p-3 rounded-full shadow-2xl ${
              isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
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

export default Privacy;