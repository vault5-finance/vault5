import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/wallet', label: 'Wallet', icon: '💰' },
    { path: '/send-request', label: 'Send Money', icon: '📤' },
    { path: '/savings', label: 'Savings Goals', icon: '🎯' },
    { path: '/lending', label: 'Lending', icon: '🤝' },
    { path: '/loans', label: 'Loans', icon: '💳' },
    { path: '/investments', label: 'Investments', icon: '📈' },
    { path: '/chamas', label: 'Chamas', icon: '👥' },
    { path: '/business', label: 'Business', icon: '🏢' },
    { path: '/reports', label: 'Reports', icon: '📋' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div className="bg-white shadow-lg h-full w-64">
      <div className="p-6 border-b">
        <Link to="/dashboard" className="text-2xl font-bold text-blue-600">
          Vault5
        </Link>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="absolute bottom-0 w-64 p-4 border-t">
        <div className="text-xs text-gray-500 text-center">
          © 2024 Vault5. Secure & Trusted.
        </div>
      </div>
    </div>
  );
};

export default Sidebar;