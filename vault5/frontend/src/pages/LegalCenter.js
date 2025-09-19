import React from 'react';
import { Link, useParams } from 'react-router-dom';

const sections = {
  'user-agreement': {
    title: 'Vault5 User Agreement',
    lastUpdated: 'Last updated on September 19, 2025',
    anchors: [
      { id: 'about', h: 'About Your Account', t: 'Welcome to Vault5! This agreement governs your use of your Vault5 account and services.' },
      { id: 'opening', h: 'Opening a Vault5 Account', t: 'We offer personal and business accounts. You must meet applicable eligibility requirements to open and use your account.' },
      { id: 'closing', h: 'Closing Your Account', t: 'You may close your account at any time. Outstanding obligations may remain after closure as allowed by law.' },
      { id: 'payment-methods', h: 'Link or Unlink a Payment Method', t: 'You may link mobile wallets or bank accounts. We may require verification to ensure the method is valid and belongs to you.' },
      { id: 'funds', h: 'Receiving Funds, Holding a Balance, or Transferring Funds', t: 'All references to “funds” mean sovereign currency (not crypto). Availability and withdrawal may be subject to review and KYC.' },
      { id: 'tax', h: 'Taxes and Information Reporting', t: 'You are responsible for understanding and meeting your tax obligations. Vault5 may be required to provide certain reports to authorities.' },
      { id: 'statements', h: 'Account Statements', t: 'You can view statements within Vault5 and request additional records where available.' },
      { id: 'sending', h: 'Sending Money and Buying', t: 'When you send money or buy services, you authorize the selected payment method for the transaction according to applicable terms.' },
      { id: 'selling', h: 'Selling and Accepting Payments', t: 'Merchants must comply with our policies and applicable laws, including accurate representations and no surcharging.' },
      { id: 'restricted', h: 'Restricted Activities, Holds, and Other Actions', t: 'Certain activities are prohibited. We may hold funds or limit accounts to manage risk or comply with law.' },
      { id: 'liability', h: 'Liability for Unauthorized Transactions and Other Errors', t: 'Review your statements. Report unauthorized transactions and errors in a timely manner.' },
      { id: 'other', h: 'Other Legal Terms', t: 'This section includes communications, governing law, arbitration clauses, and other legal notices.' },
    ],
  },
  'acceptable-use': {
    title: 'Acceptable Use Policy',
    lastUpdated: 'Last updated on September 19, 2025',
    anchors: [
      { id: 'prohibited', h: 'Prohibited Activities', t: 'You may not use Vault5 for illegal or abusive purposes, including fraud, money laundering, or rights infringement.' },
      { id: 'security', h: 'Security Requirements', t: 'Keep your credentials confidential and use strong authentication methods where available.' },
      { id: 'consequences', h: 'Consequences of Violation', t: 'We may limit, suspend, or close accounts engaged in violations, and we may report activity to authorities as required by law.' },
    ],
  },
  'e-sign': {
    title: 'Electronic Communications Delivery Policy (E-Sign Disclosure and Consent)',
    lastUpdated: 'Last updated on September 19, 2025',
    anchors: [
      { id: 'consent', h: 'Consent to Electronic Records', t: 'By using Vault5, you consent to receive records electronically, including disclosures, notices, and statements.' },
      { id: 'hardware', h: 'Hardware and Software Requirements', t: 'You must maintain compatible hardware/software to access and retain electronic communications.' },
      { id: 'withdrawal', h: 'Withdrawal of Consent', t: 'You may withdraw consent by contacting support, but this may impact availability of services.' },
    ],
  },
};

const LegalCenter = () => {
  const { doc = 'user-agreement' } = useParams();
  const model = sections[doc] || sections['user-agreement'];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <aside className="md:col-span-3">
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">Legal Center</div>
              <nav className="space-y-1">
                <Link to="/legal/user-agreement" className={`block px-3 py-2 rounded ${doc === 'user-agreement' ? 'bg-blue-50 text-blue-800' : 'hover:bg-gray-50'}`}>
                  User Agreement
                </Link>
                <Link to="/legal/acceptable-use" className={`block px-3 py-2 rounded ${doc === 'acceptable-use' ? 'bg-blue-50 text-blue-800' : 'hover:bg-gray-50'}`}>
                  Acceptable Use
                </Link>
                <Link to="/legal/e-sign" className={`block px-3 py-2 rounded ${doc === 'e-sign' ? 'bg-blue-50 text-blue-800' : 'hover:bg-gray-50'}`}>
                  E-Sign Disclosure
                </Link>
                <Link to="/legal/policy-updates" className="block px-3 py-2 rounded hover:bg-gray-50">
                  Policy Updates
                </Link>
              </nav>
            </div>
            <div className="bg-white border rounded-lg p-4 shadow-sm mt-4">
              <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">On this page</div>
              <ul className="space-y-1">
                {(model.anchors || []).map((a) => (
                  <li key={a.id}>
                    <a href={`#${a.id}`} className="block text-sm text-gray-700 hover:text-gray-900">{a.h}</a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
          <main className="md:col-span-9 space-y-4">
            <div className="bg-white border rounded-lg p-6 shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900">{model.title}</h1>
              <div className="text-sm text-gray-500 mt-1">{model.lastUpdated}</div>
              {doc === 'user-agreement' && (
                <div className="mt-3">
                  <a
                    href="/api/legal/user-agreement.pdf"
                    className="inline-flex items-center px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Download PDF
                  </a>
                </div>
              )}
              <div className="mt-6 space-y-6">
                {(model.anchors || []).map((a) => (
                  <section key={a.id} id={a.id}>
                    <h2 className="text-xl font-semibold">{a.h}</h2>
                    <p className="mt-2 text-gray-700">{a.t}</p>
                  </section>
                ))}
              </div>
            </div>
            {doc === 'user-agreement' && (
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-600">
                  Need more legal docs? See{' '}
                  <Link to="/legal/acceptable-use" className="text-blue-600 hover:underline">Acceptable Use</Link>,{' '}
                  <Link to="/legal/e-sign" className="text-blue-600 hover:underline">E-Sign Disclosure</Link>, or{' '}
                  <Link to="/legal/policy-updates" className="text-blue-600 hover:underline">Policy Updates</Link>.
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default LegalCenter;