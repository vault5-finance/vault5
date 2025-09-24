import React from 'react';
import { Link } from 'react-router-dom';

const Legal = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Legal Center</h1>
        <p className="text-sm text-gray-500 mb-8">
          Centralized hub for Vault5's legal policies, compliance statements, and user agreements.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/terms" className="block bg-white rounded-lg border p-6 shadow-sm hover:shadow-md transition">
            <h2 className="text-xl font-semibold text-gray-900">Terms of Service</h2>
            <p className="text-gray-600 mt-2">
              The rules for using Vault5. Covers accounts, services, loans, fees, security, and dispute resolution.
            </p>
            <div className="mt-3 text-blue-600 text-sm font-medium">Read Terms →</div>
          </Link>
 
          <Link to="/privacy" className="block bg-white rounded-lg border p-6 shadow-sm hover:shadow-md transition">
            <h2 className="text-xl font-semibold text-gray-900">Privacy Policy</h2>
            <p className="text-gray-600 mt-2">
              How we collect, use, share, and protect your data. Includes KYC/AML obligations and your rights.
            </p>
            <div className="mt-3 text-blue-600 text-sm font-medium">Read Privacy →</div>
          </Link>
 
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Compliance & Risk</h2>
            <ul className="list-disc pl-6 mt-2 text-gray-700">
              <li>Anti-Money Laundering (AML) & Counter-Terrorism Financing (CTF) screening.</li>
              <li>Know Your Customer (KYC) verification for identity and address.</li>
              <li>Risk-based monitoring for transactions, login anomalies, and fraud signals.</li>
              <li>Audit trails and role-based access within Vault5.</li>
            </ul>
            <p className="text-gray-600 mt-3 text-sm">
              Region-specific disclosures (e.g., GDPR/CCPA/KDPA) can be added as we expand coverage.
            </p>
          </div>
 
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Disclaimers</h2>
            <ul className="list-disc pl-6 mt-2 text-gray-700">
              <li>Vault5 is a neo-banking platform and not a traditional bank.</li>
              <li>Some services are provided through third-party partners (payments, KYC, data storage).</li>
              <li>No warranty for uninterrupted or error-free service; users must secure their accounts.</li>
            </ul>
            <p className="text-gray-600 mt-3 text-sm">
              For clarifications, reach us at support@vault5.com
            </p>
          </div>

          {/* Kenya-Specific Readiness */}
          <Link to="/legal/policy-updates" className="block bg-white rounded-lg border p-6 shadow-sm hover:shadow-md transition">
            <h2 className="text-xl font-semibold text-gray-900">Kenya Compliance Overview</h2>
            <p className="text-gray-600 mt-2">
              Summary of Kenya-specific laws and regulator guidance (CBK, ODPC, FRC) for launch readiness.
            </p>
            <div className="mt-3 text-blue-600 text-sm font-medium">Open Overview →</div>
          </Link>

          <Link to="/legal/policy-updates" className="block bg-white rounded-lg border p-6 shadow-sm hover:shadow-md transition">
            <h2 className="text-xl font-semibold text-gray-900">Complaints Handling (Kenya)</h2>
            <p className="text-gray-600 mt-2">
              How to submit, timelines, outcomes, and escalation paths consistent with Kenyan consumer protection.
            </p>
            <div className="mt-3 text-blue-600 text-sm font-medium">See Process →</div>
          </Link>
        </div>

        <div className="mt-10 bg-blue-50 border border-blue-200 rounded p-5">
          <h3 className="text-lg font-semibold text-blue-900">Regulatory Readiness</h3>
          <p className="text-blue-900/80 mt-2">
            Vault5 maintains a modular compliance framework to align with local regulations. Upon market entry,
            we will publish jurisdiction-specific terms, privacy addenda, and disclosures (e.g., data residency,
            lawful bases for processing, and supervisory authorities).
          </p>
        </div>
      </div>
    </div>
  );
};

export default Legal;