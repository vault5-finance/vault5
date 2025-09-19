import React from 'react';

const UPDATES = [
  {
    id: '2025-09-01',
    date: '2025-09-01',
    title: 'User Agreement v1.3 and Lending Rules',
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
    summary: 'Improved transparency on audit logging for admin actions and security events.',
    changes: [
      'Centralized audit logging and CSV export explained.',
      'Reason headers required for critical admin actions documented.',
      'Data retention windows clarified.'
    ]
  }
];

const PolicyUpdates = () => {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Policy Updates</h1>
      <p className="text-gray-600 mb-6">
        This page summarizes material changes to our legal terms and user policies. For full text, see the Legal Center.
      </p>

      <div className="bg-white p-5 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-3">Quick Links</h2>
        <ul className="list-disc pl-6 text-sm">
          {UPDATES.map(u => (
            <li key={u.id}>
              <a href={`#${u.id}`} className="text-blue-600 hover:underline">
                {u.date}: {u.title}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {UPDATES.map(u => (
        <section key={u.id} id={u.id} className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold">{u.title}</h3>
            <span className="text-sm text-gray-500">Effective: {new Date(u.date).toLocaleDateString()}</span>
          </div>
          <p className="text-gray-700 mt-3">{u.summary}</p>
          <ul className="list-disc pl-6 text-gray-700 mt-4 space-y-1">
            {u.changes.map((c, idx) => (
              <li key={idx}>{c}</li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="/api/legal/user-agreement.pdf"
              className="px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
            >
              Download User Agreement (PDF)
            </a>
            <a
              href="/legal/user-agreement"
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View Legal Center
            </a>
          </div>
        </section>
      ))}

      <div className="text-sm text-gray-500">
        Last updated: {new Date().toLocaleDateString()}
      </div>
    </div>
  );
};

export default PolicyUpdates;