import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Shield,
  Scale,
  AlertTriangle,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  MapPin,
  Flag,
  Clock,
  CheckCircle,
  Info,
  ExternalLink,
  BookOpen,
  Users,
  Building,
  Globe,
  Star,
  Award,
  ArrowRight,
  Calendar,
  Mail,
  Phone,
  HelpCircle
} from 'lucide-react';

const Legal = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const legalCards = [
    {
      id: 'terms',
      title: 'Terms of Service',
      description: 'The rules for using Vault5. Covers accounts, services, loans, fees, security, and dispute resolution.',
      icon: Scale,
      color: 'from-blue-500 to-blue-600',
      link: '/terms',
      badge: 'Binding Agreement',
      lastUpdated: 'September 19, 2025'
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      description: 'How we collect, use, share, and protect your data. Includes KYC/AML obligations and your rights.',
      icon: Shield,
      color: 'from-green-500 to-green-600',
      link: '/privacy',
      badge: 'Data Protection',
      lastUpdated: 'September 19, 2025'
    },
    {
      id: 'acceptable-use',
      title: 'Acceptable Use Policy',
      description: 'Guidelines for appropriate use of Vault5 services and prohibited activities.',
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      link: '/legal/acceptable-use',
      badge: 'Usage Guidelines',
      lastUpdated: 'September 19, 2025'
    },
    {
      id: 'e-sign',
      title: 'E-Sign Disclosure',
      description: 'Electronic signature and communications consent policy.',
      icon: BookOpen,
      color: 'from-orange-500 to-orange-600',
      link: '/legal/e-sign',
      badge: 'Digital Consent',
      lastUpdated: 'September 19, 2025'
    }
  ];

  const complianceFeatures = [
    {
      title: 'Anti-Money Laundering (AML)',
      description: 'Comprehensive screening and monitoring for suspicious activities',
      icon: Shield,
      status: 'active'
    },
    {
      title: 'Counter-Terrorism Financing (CTF)',
      description: 'Advanced detection systems for terrorism financing prevention',
      icon: AlertTriangle,
      status: 'active'
    },
    {
      title: 'Know Your Customer (KYC)',
      description: 'Identity and address verification for all users',
      icon: Users,
      status: 'active'
    },
    {
      title: 'Risk-Based Monitoring',
      description: 'Real-time transaction and behavior analysis',
      icon: Activity,
      status: 'active'
    }
  ];

  const kenyaSection = [
    {
      title: 'Kenya Compliance Overview',
      description: 'Summary of Kenya-specific laws and regulator guidance (CBK, ODPC, FRC) for launch readiness.',
      icon: Building,
      link: '/legal/policy-updates',
      flag: '🇰🇪'
    },
    {
      title: 'Complaints Handling (Kenya)',
      description: 'How to submit, timelines, outcomes, and escalation paths consistent with Kenyan consumer protection.',
      icon: HelpCircle,
      link: '/legal/policy-updates',
      flag: '🇰🇪'
    }
  ];

  const faqItems = [
    {
      question: "What's Vault5's license status?",
      answer: "Vault5 operates under regulatory oversight and maintains all necessary licenses for financial services in our operational jurisdictions."
    },
    {
      question: "How do I submit a dispute?",
      answer: "You can submit disputes through our support portal or by contacting our compliance team directly. We aim to resolve all disputes within 30 days."
    },
    {
      question: "Are my funds protected?",
      answer: "Yes, user funds are held in segregated accounts with regulated financial institutions and protected under applicable financial regulations."
    },
    {
      question: "How do I close my account?",
      answer: "You can request account closure through your account settings or by contacting our support team. Outstanding obligations must be settled first."
    }
  ];

  const disclaimers = [
    'Vault5 is a neo-banking platform and not a traditional bank.',
    'Some services are provided through third-party partners (payments, KYC, data storage).',
    'No warranty for uninterrupted or error-free service; users must secure their accounts.',
    'All services are subject to regulatory compliance and risk assessment.'
  ];

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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="inline-flex items-center gap-3 mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <div className="p-4 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl">
              <Scale className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            Legal Center
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Vault5 is committed to transparency, compliance, and protecting user rights. This Legal Center centralizes our policies, regulatory frameworks, and key disclosures.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            className="max-w-md mx-auto mt-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search policies, terms, compliance..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white/80 backdrop-blur-sm"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Legal Policy Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {legalCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-300"
                whileHover={{ scale: 1.02, y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={card.link} className="block p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${card.color}`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{card.title}</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {card.badge}
                        </span>
                      </div>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        {card.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>Updated {card.lastUpdated}</span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                          <span>Read Document</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Hover effect overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                  whileHover={{ opacity: 1 }}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Compliance & Risk Section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
            <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Compliance & Risk Management</h2>
                  <p className="text-gray-600 mt-1">Our comprehensive approach to regulatory compliance and risk mitigation</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {complianceFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className="flex items-start gap-4 p-4 rounded-lg bg-gray-50/50 border border-gray-200/50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <feature.icon className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          {feature.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Regional Compliance</span>
                </div>
                <p className="text-blue-800 text-sm">
                  Region-specific disclosures (e.g., GDPR/CCPA/KDPA) can be added as we expand coverage.
                  Our modular compliance framework ensures seamless adaptation to local regulations.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Kenya-Specific Section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
            <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-xl">
                  <Flag className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Kenya Regulations</h2>
                  <p className="text-gray-600 mt-1">Compliance with Kenyan financial and data protection laws</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {kenyaSection.map((item, index) => (
                  <motion.div
                    key={item.title}
                    className="group relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link to={item.link} className="block p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">{item.flag}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h4>
                          <p className="text-gray-600 text-sm leading-relaxed mb-3">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-2 text-red-600 font-medium group-hover:translate-x-1 transition-transform">
                            <span>Learn More</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Disclaimers Section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
            <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Important Disclaimers</h2>
                  <p className="text-gray-600 mt-1">Key information about our services and limitations</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {disclaimers.map((disclaimer, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-lg bg-yellow-50/50 border border-yellow-200/50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-800">{disclaimer}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Need Clarification?</span>
                </div>
                <p className="text-blue-800 text-sm">
                  For questions about our legal policies or compliance matters, reach out to our legal team at{' '}
                  <a href="mailto:legal@vault5.com" className="font-medium hover:underline">
                    legal@vault5.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
            <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <HelpCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
                  <p className="text-gray-600 mt-1">Common questions about our legal and compliance framework</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="space-y-4">
                {faqItems.map((faq, index) => (
                  <motion.div
                    key={index}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                      className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                    >
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      <motion.div
                        animate={{ rotate: expandedFAQ === index ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {expandedFAQ === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-6 py-4 bg-white border-t border-gray-200"
                        >
                          <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Regulatory Readiness */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Award className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Regulatory Readiness</h2>
                <p className="text-gray-600 mt-1">Our commitment to global compliance standards</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[
                { label: 'GDPR', status: 'Ready', color: 'green' },
                { label: 'CCPA', status: 'Ready', color: 'green' },
                { label: 'KDPA', status: 'Ready', color: 'green' }
              ].map((regulation, index) => (
                <div key={regulation.label} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-sm font-bold text-${regulation.color}-600 mb-1`}>
                    {regulation.label}
                  </div>
                  <div className={`px-2 py-1 bg-${regulation.color}-100 text-${regulation.color}-800 rounded-full text-xs font-medium inline-block`}>
                    {regulation.status}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-gray-700 leading-relaxed">
              Vault5 maintains a modular compliance framework to align with local regulations. Upon market entry,
              we will publish jurisdiction-specific terms, privacy addenda, and disclosures (e.g., data residency,
              lawful bases for processing, and supervisory authorities).
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Legal;