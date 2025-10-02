import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  User,
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Download,
  Plus,
  HandHeart,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Calendar,
  Target,
  Zap,
  Heart,
  Star,
  Award,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Users,
  FileText,
  Scale,
  Mail,
  Globe,
  AlertCircle,
  BookOpen,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

const Terms = () => {
  const [expandedSections, setExpandedSections] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showPlainLanguage, setShowPlainLanguage] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track scroll progress for progress bar
  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setScrollProgress(scrollPercent);
    };

    window.addEventListener('scroll', updateScrollProgress);
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const sections = [
    {
      id: 'eligibility',
      number: '1',
      title: 'Eligibility',
      icon: <User className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            To use Vault5, you must meet these requirements:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              Be at least 18 years old (or the age of majority in your country)
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              Provide true, accurate, and complete information during registration
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              Have legal capacity to enter into agreements
            </li>
          </ul>
          <p className="text-gray-700">
            We may refuse service, close accounts, or limit access if these requirements aren't met.
          </p>
        </div>
      ),
      summary: "You must be 18+, provide accurate info, and have legal capacity. We can refuse service if you don't qualify."
    },
    {
      id: 'registration',
      number: '2',
      title: 'Account Registration',
      icon: <CreditCard className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            When you create an account, you'll need to provide:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              Full name and contact information
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              Government-issued ID and proof of address
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              Email and phone number for verification
            </li>
          </ul>
          <p className="text-gray-700">
            <strong>Keep your credentials secure</strong> - you're responsible for all activity on your account.
            We may require additional verification through KYC (Know Your Customer) processes.
          </p>
        </div>
      ),
      summary: "Provide accurate personal details and ID. Keep your login secure - you're responsible for all account activity."
    },
    {
      id: 'services',
      number: '3',
      title: 'Services Provided',
      icon: <DollarSign className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Vault5 provides comprehensive financial management tools:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Core Features:</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• Send/receive payments locally and internationally</li>
                <li>• Automated income allocation into 6 vaults</li>
                <li>• Cash flow monitoring and budgeting</li>
                <li>• Investment tracking and portfolio management</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Advanced Features:</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• Loan requests and management</li>
                <li>• Financial reports and analytics</li>
                <li>• Debt tracking and payoff planning</li>
                <li>• Goal setting and progress tracking</li>
              </ul>
            </div>
          </div>
          <p className="text-gray-700">
            We may add, modify, or remove features at any time without prior notice.
          </p>
        </div>
      ),
      summary: "Vault5 offers payment processing, automated savings vaults, investment tracking, loans, and financial analytics. Features may change without notice."
    },
    {
      id: 'responsibilities',
      number: '4',
      title: 'User Responsibilities',
      icon: <Shield className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            You agree to use Vault5 responsibly and legally:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              Use only for lawful purposes - no money laundering, fraud, or illegal activities
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              Keep your information accurate and up-to-date
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              Don't attempt to hack, spam, or misuse the platform
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              Respect transaction limits and compliance requirements
            </li>
          </ul>
        </div>
      ),
      summary: "Use Vault5 only for legal purposes. Keep your info updated and don't try to hack or misuse the platform."
    },
    {
      id: 'fees',
      number: '5',
      title: 'Fees & Pricing',
      icon: <TrendingUp className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Vault5 operates on a transparent fee structure:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              All fees are clearly disclosed before you confirm any transaction
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              We may charge for transactions, subscriptions, or premium services
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              Fees may be deducted directly from your account balance
            </li>
          </ul>
          <p className="text-gray-700">
            <strong>No hidden fees</strong> - you'll always know what you're paying for upfront.
          </p>
        </div>
      ),
      summary: "All fees are shown before you agree. We may charge for transactions or services, deducted from your balance. No surprises."
    },
    {
      id: 'loans',
      number: '6',
      title: 'Loans & Lending',
      icon: <HandHeart className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Our lending services are designed to be fair and transparent:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              Loan eligibility depends on credit assessment and compliance checks
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              All terms, interest rates, and penalties are disclosed before approval
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              Vault5 reserves the right to approve, reject, or modify loan terms
            </li>
          </ul>
        </div>
      ),
      summary: "Loans require credit checks. All terms are shown upfront. We can approve or deny loans at our discretion."
    },
    {
      id: 'security',
      number: '7',
      title: 'Security',
      icon: <Lock className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Your security is our top priority:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              We use bank-grade encryption and security measures
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              Enable two-factor authentication (2FA) for added protection
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              You're responsible for keeping your devices and credentials secure
            </li>
          </ul>
          <p className="text-gray-700">
            <strong>Important:</strong> We're not liable for losses due to compromised accounts from your negligence.
          </p>
        </div>
      ),
      summary: "We use strong security measures. Enable 2FA and keep your devices secure. We're not responsible for losses from your carelessness."
    },
    {
      id: 'compliance',
      number: '8',
      title: 'Compliance & Verification',
      icon: <Scale className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Vault5 is committed to regulatory compliance:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              We comply with AML (Anti-Money Laundering) and CTF (Counter-Terrorist Financing) regulations
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              You authorize us to verify your identity and screen against watchlists
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              We may share information with regulators when required by law
            </li>
          </ul>
        </div>
      ),
      summary: "We follow strict compliance rules. You agree to identity verification and screening. We share info with regulators if legally required."
    },
    {
      id: 'liability',
      number: '9',
      title: 'Limitations of Liability',
      icon: <AlertTriangle className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Important legal protections for both parties:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              Vault5 is a neo-banking platform, not a traditional bank
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              We're not liable for indirect, incidental, or consequential damages
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              Service availability and security are not guaranteed 100% of the time
            </li>
          </ul>
        </div>
      ),
      summary: "Vault5 is not a traditional bank. We're not responsible for indirect damages or guaranteeing perfect service availability."
    },
    {
      id: 'termination',
      number: '10',
      title: 'Termination & Suspension',
      icon: <Clock className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Account management and closure terms:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              We may suspend or terminate accounts for violations, suspicious activity, or false information
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              You can close your account at any time, but outstanding obligations remain
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              Termination doesn't affect rights or obligations that arose before closure
            </li>
          </ul>
        </div>
      ),
      summary: "We can suspend/terminate for violations. You can close your account, but you still owe any outstanding amounts."
    },
    {
      id: 'ip',
      number: '11',
      title: 'Intellectual Property',
      icon: <Star className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Protecting our innovations and brand:
          </p>
          <p className="text-gray-700">
            All Vault5 content, including our name, logos, software, and proprietary technology,
            are protected by intellectual property laws. You may not copy, modify, distribute,
            or create derivative works without our written permission.
          </p>
        </div>
      ),
      summary: "Vault5's brand, software, and content are protected. Don't copy or modify our intellectual property without permission."
    },
    {
      id: 'disputes',
      number: '12',
      title: 'Dispute Resolution',
      icon: <Scale className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            How we handle disagreements:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              First, contact our support team to resolve issues
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              If unresolved, disputes may go to binding arbitration
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              You waive the right to class actions and agree to individual resolution
            </li>
          </ul>
        </div>
      ),
      summary: "Contact support first. Unresolved disputes go to arbitration. No class actions - disputes are handled individually."
    },
    {
      id: 'changes',
      number: '13',
      title: 'Changes to Terms',
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Keeping our terms current:
          </p>
          <p className="text-gray-700">
            We may update these Terms as our services evolve. Significant changes will be
            communicated via email or in-app notifications. Your continued use of Vault5
            after changes indicates acceptance of the new terms.
          </p>
        </div>
      ),
      summary: "We may update these terms. We'll notify you of big changes. Keep using Vault5 means you accept the updates."
    },
    {
      id: 'law',
      number: '14',
      title: 'Governing Law',
      icon: <Globe className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Legal framework for our relationship:
          </p>
          <p className="text-gray-700">
            These Terms are governed by the laws of the Republic of Kenya. Any disputes
            will be resolved according to Kenyan law and procedures. Where arbitration
            is applicable, details will be provided in your specific agreement or policy addendum.
          </p>
        </div>
      ),
      summary: "These terms follow Kenyan law. Disputes are handled under Kenyan legal procedures."
    },
    {
      id: 'contact',
      number: '15',
      title: 'Contact',
      icon: <Mail className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Get in touch with us:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">
              <strong>Email:</strong> support@vault5.com<br />
              <strong>Website:</strong> https://www.vault5.com<br />
              <strong>Legal Inquiries:</strong> legal@vault5.com
            </p>
          </div>
          <p className="text-gray-700">
            For Kenya-specific regulatory information, please refer to our Legal Center,
            which includes compliance with the Data Protection Act (ODPC) and CBK/NPS requirements.
          </p>
        </div>
      ),
      summary: "Contact us at support@vault5.com or through our website. Check our Legal Center for Kenya-specific compliance info."
    }
  ];

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          style={{ width: `${scrollProgress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Hero Header */}
      <div className="relative bg-white/80 backdrop-blur-sm border-b border-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            className="text-center"
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
              <span className="text-sm font-medium text-gray-700">Legal & Compliance</span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Terms of Service
            </motion.h1>

            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Your rights, responsibilities, and how Vault5 keeps your money <span className="font-semibold text-blue-600">safe</span> and <span className="font-semibold text-purple-600">compliant</span>.
            </motion.p>

            {/* Trust indicators */}
            <motion.div
              className="flex items-center justify-center gap-8 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Bank-level Security</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Lock className="w-4 h-4 text-blue-500" />
                <span>Regulated Platform</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-purple-500" />
                <span>Transparent Terms</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar TOC - Desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Table of Contents</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {section.number}
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">{section.title}</span>
                  </a>
                ))}
              </nav>

              {/* Quick Links */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Links</h4>
                <div className="space-y-2">
                  <a href="/privacy" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                    <ExternalLink className="w-3 h-3" />
                    Privacy Policy
                  </a>
                  <a href="/legal" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                    <ExternalLink className="w-3 h-3" />
                    Legal Center
                  </a>
                  <a href="/compliance" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                    <ExternalLink className="w-3 h-3" />
                    Compliance
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Controls */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6 mb-8">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search terms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => setShowPlainLanguage(!showPlainLanguage)}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  {showPlainLanguage ? 'Legal View' : 'Plain Language'}
                </button>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-6">
              {filteredSections.map((section) => (
                <motion.div
                  key={section.id}
                  id={section.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white">
                        {section.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                            {section.number}
                          </span>
                          <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                        </div>
                        <p className="text-sm text-gray-600">{section.summary}</p>
                      </div>
                    </div>
                    {expandedSections[section.id] ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {expandedSections[section.id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-6 border-t border-gray-200"
                    >
                      <div className="pt-6">
                        {showPlainLanguage ? (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 mb-2">Plain Language Summary:</h4>
                            <p className="text-blue-800">{section.summary}</p>
                          </div>
                        ) : (
                          section.content
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Final Summary */}
            <motion.div
              className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="text-center">
                <motion.div
                  className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <CheckCircle className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">In Summary</h3>
                <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                  These Terms explain how Vault5 works, your responsibilities as a user, and how we protect your financial information.
                  By using our platform, you agree to operate responsibly, securely, and in compliance with applicable laws.
                  We're committed to transparency, security, and helping you achieve your financial goals.
                </p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-blue-500" />
                    <span>Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-purple-500" />
                    <span>User-Focused</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-gray-600 mb-4">
                Ready to take control of your financial future?
              </p>
              <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                Create Your Vault5 Account
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;