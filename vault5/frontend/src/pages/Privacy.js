import React from 'react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vault5 Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">
          Effective Date: [To be set at public launch] • Last Updated: September 2025
        </p>

        <p className="text-gray-700 mb-6">
          At Vault5, we respect your privacy and are committed to protecting your personal information.
          This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our platform,
          which provides financial discipline tools, payment services, investment tracking, lending, and related features.
          Please read this policy carefully to understand our practices.
        </p>

        <section className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">1. Information We Collect</h2>
            <h3 className="text-md font-semibold text-gray-800 mt-3">1.1 Information You Provide</h3>
            <ul className="list-disc pl-6 text-gray-700">
              <li>Identity: full name, date of birth, ID/passport details, national KRA/Tax Number (where applicable).</li>
              <li>Contact: email address(es), phone number(s), country, city, and mailing address.</li>
              <li>KYC: proof of address, ID front/back, selfie verification, compliance questionnaires.</li>
              <li>Security: passwords, 2FA settings, recovery details.</li>
              <li>Support: messages, attachments, and metadata submitted to our support team.</li>
            </ul>

            <h3 className="text-md font-semibold text-gray-800 mt-4">1.2 Automatically Collected</h3>
            <ul className="list-disc pl-6 text-gray-700">
              <li>Device: IP address, device type, operating system, browser type/version.</li>
              <li>Usage: pages visited, clicks, time on page, referrer/UTM data.</li>
              <li>Diagnostics: performance metrics, crash logs, error traces.</li>
              <li>Cookies: session cookies, analytics cookies, and security cookies.</li>
            </ul>

            <h3 className="text-md font-semibold text-gray-800 mt-4">1.3 From Third Parties</h3>
            <ul className="list-disc pl-6 text-gray-700">
              <li>Payment processors, telecoms, bank partners, card schemes.</li>
              <li>Verification vendors and AML/KYC screening providers.</li>
              <li>Fraud and risk intelligence partners.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-gray-700">
              <li>Provide, operate, and maintain Vault5 services and features.</li>
              <li>Process payments, deposits, withdrawals, transfers, and lending workflows.</li>
              <li>Comply with legal and regulatory obligations (KYC, AML/CTF, sanctions screening).</li>
              <li>Detect, investigate, and prevent fraud, abuse, and security incidents.</li>
              <li>Offer insights, budgeting, allocation recommendations, and personalized content.</li>
              <li>Communicate about updates, alerts, changes to policies, or promotions you opt into.</li>
              <li>Analyze usage to improve performance, stability, and user experience.</li>
              <li>Develop new features, products, and partnerships.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">3. How We Share Your Information</h2>
            <p className="text-gray-700">
              We do not sell personal data. We may share your information as follows:
            </p>
            <ul className="list-disc pl-6 text-gray-700">
              <li><strong>Service Providers:</strong> With trusted vendors (e.g., cloud hosting, payments, KYC) under contract.</li>
              <li><strong>Compliance & Legal:</strong> With regulators, law enforcement, courts, or auditors where required by law.</li>
              <li><strong>Business Transfers:</strong> In mergers, acquisitions, or restructuring, subject to the same confidentiality safeguards.</li>
              <li><strong>Aggregated/De-identified:</strong> Analytics or research that does not identify you personally.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">4. Your Rights & Choices</h2>
            <p className="text-gray-700">
              Depending on your jurisdiction, you may have rights to:
            </p>
            <ul className="list-disc pl-6 text-gray-700">
              <li>Access, correct, or update your personal information.</li>
              <li>Request deletion (subject to legal/regulatory retention obligations).</li>
              <li>Object to certain processing or request restriction.</li>
              <li>Withdraw consent where processing is based on consent.</li>
              <li>Opt out of marketing communications.</li>
            </ul>
            <p className="text-gray-700 mt-2">
              To exercise these rights, contact us at <strong>[Insert Support Email]</strong>. We may verify your identity before acting on requests.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">5. Data Retention</h2>
            <p className="text-gray-700">
              We retain personal information only as long as necessary to provide services, comply with laws (including AML/CTF and tax),
              resolve disputes, and enforce agreements. When no longer required, data is securely deleted or anonymized.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">6. Security Measures</h2>
            <ul className="list-disc pl-6 text-gray-700">
              <li>Encryption in transit and at rest for sensitive data.</li>
              <li>Role-based access controls, audit trails, and separation of duties.</li>
              <li>Multi-factor authentication for admin/user access where available.</li>
              <li>Continuous monitoring, vulnerability management, and periodic penetration tests.</li>
            </ul>
            <p className="text-gray-700 mt-2">
              No security system is impenetrable. Users must safeguard their credentials and devices. Vault5 is not liable for
              losses due to credential compromise caused by user negligence (e.g., weak passwords, phishing).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">7. Children’s Privacy</h2>
            <p className="text-gray-700">
              Vault5 is not intended for individuals under 18 years old. We do not knowingly collect data from minors.
              If such information is identified, it will be deleted promptly.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">8. International Data Transfers</h2>
            <p className="text-gray-700">
              Your information may be stored and processed in countries outside your residence. We implement safeguards
              to ensure an adequate level of protection consistent with applicable laws. By using Vault5, you consent to such transfers.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">9. Cookies & Tracking</h2>
            <p className="text-gray-700">
              We use cookies and similar technologies for session management, analytics, and security. You can manage
              cookie preferences in your browser, but certain features may not function properly without them.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">10. Third-Party Links</h2>
            <p className="text-gray-700">
              Vault5 may include links to third-party sites. We are not responsible for their privacy practices. Review
              those policies before providing personal information to third parties.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">11. Policy Updates</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. Significant changes will be communicated via in-app
              notifications or email. Continued use indicates acceptance of the updated policy.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">12. Contact Us</h2>
            <p className="text-gray-700">
              Vault5 — Privacy Office<br />
              Email: privacy@vault5.com<br />
              Address: [Insert Registered/Physical Address]<br />
              Kenya: This policy will be read together with the Kenya Data Protection Act (2019) and applicable
              Regulations. If you are located in Kenya, your data subject rights and complaint mechanisms under
              the Office of the Data Protection Commissioner (ODPC) apply.
            </p>
          </div>

          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded">
            <strong className="text-green-900">Kenya Compliance Note:</strong>{' '}
            Vault5 intends to align with the Kenya Data Protection Act (2019) and ODPC guidance. Prior to public
            launch, we will confirm ODPC registration status (Controller/Processor), publish the designated contact,
            and include lawful bases and data retention schedules specific to Kenya. For an overview, see our Kenya
            compliance summary within the Legal Center.
          </div>
        </section>
      </div>
    </div>
  );
};

export default Privacy;