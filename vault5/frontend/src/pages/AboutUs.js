import React from 'react';

const AboutUs = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">About Vault5</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Vision Statement</h2>
        <p className="text-gray-700 leading-relaxed">
          To build a borderless financial ecosystem that unifies personal finance, business banking, and community-driven wealth systems into one platform — Vault5, the future of money.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Mission Statement</h2>
        <p className="text-gray-700 leading-relaxed">
          Our mission is to empower individuals, SMEs, and communities with simple, secure, and innovative financial tools that enhance savings, enable borrowing, streamline transactions, and drive collective wealth creation.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Core Goals</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li><strong>Short-Term (MVP):</strong> Launch a functional digital vault for personal users with savings, notifications, and transaction features.</li>
          <li><strong>Medium-Term:</strong> Expand into Vault for Business, offering SMEs a platform to manage funds, transactions, and reporting.</li>
          <li><strong>Long-Term:</strong> Become a universal financial ecosystem where personal, business, and community financial activities (chamas, P2P lending/borrowing, group saving) live in one ecosystem.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Value Propositions</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li><strong>For Individuals:</strong> A smart vault for saving, borrowing, and managing money with no hidden interest traps.</li>
          <li><strong>For Businesses:</strong> A financial backbone that simplifies transactions and fund management.</li>
          <li><strong>For Communities:</strong> Digital chamas and P2P systems that enforce trust with auto-deductions and thresholds.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Guiding Principles (Values)</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li><strong>Transparency:</strong> Zero hidden fees, everything visible.</li>
          <li><strong>Security:</strong> Protection of user funds and data.</li>
          <li><strong>Community Wealth:</strong> Money as a collective growth tool, not just personal.</li>
          <li><strong>Innovation:</strong> Always upgrading from MVP to neo-bank scale.</li>
          <li><strong>Fairness:</strong> P2P lending rules that protect both borrower and lender.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Brand Promise</h2>
        <p className="text-gray-700 leading-relaxed">
          With Vault5, your money works smarter — for you, your business, and your community.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Strategic Statement</h2>
        <p className="text-gray-700 leading-relaxed">
          By leveraging AI-driven code generation (Kilo), Vault5 evolves faster, ensuring that what starts as a basic financial vault grows into a full neo-bank without the heavy bottlenecks of traditional development.
        </p>
      </section>
    </div>
  );
};

export default AboutUs;