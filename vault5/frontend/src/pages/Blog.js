import React, { useState } from 'react';

const Blog = () => {
  const articles = [
    {
      title: "Financial Discipline: The Path to True Freedom",
      excerpt: "Discipline is the foundation of wealth. Without it, even high income disappears. With it, even small income grows into freedom.",
      content: "Financial discipline is about making your money obey you, not the other way around. At Vault5, we believe freedom is not about how much you earn, but how consistently you allocate what you earn. Our 6-account system (Goals, Emergency, Needs, Investments, Freedom, Giving) enforces discipline by design.\n\nWhy discipline matters: It keeps lifestyle inflation in check.\n\nHow Vault5 enforces it: Auto-splits income, flags overspending, and locks “untouchable” accounts like Emergency and Goals.\n\nEnd game: Peace of mind knowing your future is funded before you even spend today’s money."
    },
    {
      title: "Understanding Investments: From T-Bills to Global Assets",
      excerpt: "Safe, smart, and scalable investments — no matter your income.",
      content: "Investments don’t start with Wall Street — they start with discipline. Vault5 introduces users to safe instruments like Treasury Bills (T-Bills), Money Market Funds (MMFs), and Bonds before advancing to stocks, real estate, and even pooled investments.\n\nT-Bills: Short-term, government-backed, fixed returns. Perfect for safe growth.\n\nMMFs: Flexible, slightly higher yields, ideal for liquid savings.\n\nVault5’s vision: Soon, users will be able to pool funds together to buy into larger assets (like a 100k bond split across 10 users).\n\nYour first investment should teach you patience, not greed. Vault5 helps you learn both."
    },
    {
      title: "Emergency Funds: Your First Line of Defense",
      excerpt: "Life happens. An emergency fund ensures you don’t fall back into debt when it does.",
      content: "An emergency fund is like financial body armor. Whether it’s a job loss, medical emergency, or unexpected repair, your emergency fund absorbs the hit so you don’t collapse financially.\n\nHow much to save: 3–6 months of expenses.\n\nVault5’s edge: Emergency accounts are auto-funded and locked from casual withdrawals. Only real emergencies unlock them.\n\nPsychological power: With a buffer, you make better decisions under pressure.\n\nFreedom isn’t just about growth, it’s also about protection."
    },
    {
      title: "P2P Lending & Borrowing: Building Trust in a Digital Age",
      excerpt: "Borrowing from friends or family often ruins relationships. Vault5 fixes that.",
      content: "Vault5 introduces peer-to-peer (P2P) lending with auto-security. If you borrow, you can only request up to a certain % of your savings. If you default, the system automatically deducts from your savings — protecting the lender.\n\nNo interest option: Accommodates ethical & Islamic finance.\n\nLender protection: Borrower can’t request more than their savings-based limit.\n\nTransparency: Everything is tracked in-app.\n\nThis feature transforms lending from emotional stress to financial trust."
    },
    {
      title: "Virtual Chamas: Community Wealth Reimagined",
      excerpt: "Traditional savings groups (chamas) go digital with Vault5.",
      content: "Pooling money is one of the oldest ways communities build wealth. Vault5 digitizes it:\n\nContribution tracking: No more disputes, all members see contributions in real-time.\n\nAutomated payouts: Scheduled disbursements without manual handling.\n\nGroup lending: Members can borrow from the pool under system-enforced rules.\n\nVault5 scales a cultural tradition into a global tool."
    },
    {
      title: "Business Vault: The Future of SME Finance",
      excerpt: "Small and medium businesses struggle with discipline, payroll, and suppliers. Vault5 Business changes that.",
      content: "Vault5 Business is designed to help SMEs manage cash flow like corporates:\n\nBulk transactions: Pay staff and suppliers directly from the app.\n\nSmart allocation: Auto-set aside tax, reinvestment, and emergency funds.\n\nAnalytics: See which department or expense drains the most funds.\n\nThis isn’t just accounting software — it’s financial discipline for businesses."
    },
    {
      title: "The Vault Vision: From App to Global Neobank",
      excerpt: "Vault5 isn’t just an app. It’s the new financial ecosystem.",
      content: "Most apps help you record money. Vault5 makes your money move for you. Our long-term vision:\n\nWallets: Recharge once, Vault distributes funds across goals, bills, and debts automatically.\n\nInsurance: Low-cost policies embedded into savings.\n\nInvestments: Group investments into bonds, T-Bills, and global assets.\n\nLoans: Ultra-low or zero interest, based on your savings behavior.\n\nRevenue model: Instead of subscription fees, Vault thrives on ultra-low transaction costs — making financial discipline accessible to all.\n\nVault5 isn’t bound to Kenya. It’s built to serve the world."
    }
  ];

  const [expanded, setExpanded] = useState(Array(articles.length).fill(false));

  const toggleExpanded = (index) => {
    const newExpanded = [...expanded];
    newExpanded[index] = !newExpanded[index];
    setExpanded(newExpanded);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Financial Education Blog – Powered by Vault5</h1>
      <p className="mb-8 text-gray-600">Vault5 is more than just a money app — it’s a movement toward financial freedom. Our blog is designed to educate, empower, and guide you through every stage of your financial journey. From personal savings discipline to business management, peer-to-peer lending, and global investment strategies, we’ve got you covered.</p>
      
      <div className="space-y-8">
        {articles.map((article, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
            <p className="text-gray-600 mb-4 italic">{article.excerpt}</p>
            {!expanded[index] && <p className="mb-4 text-gray-700">{article.content.split('\n\n')[0]}</p>}
            {expanded[index] && <div className="mb-4 text-gray-700 whitespace-pre-line">{article.content}</div>}
            <button
              onClick={() => toggleExpanded(index)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {expanded[index] ? 'Read Less' : 'Read More'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blog;