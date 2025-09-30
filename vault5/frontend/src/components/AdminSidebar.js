import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const roleConfig = {
  super_admin: {
    color: 'indigo',
    items: [
      { to: '/admin/super', label: 'Overview', icon: '🏠' },
      { to: '/admin/users', label: 'Admin Users', icon: '👥' },
      { to: '/admin/accounts/users', label: 'Accounts', icon: '📇' },
      { to: '/admin/system', label: 'System', icon: '🖥️' },
      { to: '/admin/finance', label: 'Finance', icon: '💰' },
      { to: '/admin/compliance', label: 'Compliance', icon: '🛡️' },
      { to: '/admin/support', label: 'Support', icon: '🎧' },
      { to: '/admin/content', label: 'Content', icon: '📰' },
    ],
  },
  account_admin: {
    color: 'cyan',
    items: [
      { to: '/admin/accounts/users', label: 'Accounts', icon: '📇' },
    ],
  },
  system_admin: {
    color: 'purple',
    items: [
      { to: '/admin/system', label: 'System', icon: '🖥️' },
      { to: '/admin/system/logs', label: 'Logs', icon: '📜', disabled: true },
      { to: '/admin/system/integrations', label: 'Integrations', icon: '🔌', disabled: true },
    ],
  },
  finance_admin: {
    color: 'emerald',
    items: [
      { to: '/admin/finance', label: 'Finance', icon: '💰' },
      { to: '/admin/finance/approvals', label: 'Approvals', icon: '✅', disabled: true },
      { to: '/admin/finance/disbursements', label: 'Disbursements', icon: '💳', disabled: true },
    ],
  },
  compliance_admin: {
    color: 'rose',
    items: [
      { to: '/admin/compliance', label: 'Compliance', icon: '🛡️' },
      { to: '/admin/compliance/audit-logs', label: 'Audit Logs', icon: '📊' },
      { to: '/admin/compliance/kyc', label: 'KYC Queue', icon: '🪪', disabled: true },
      { to: '/admin/compliance/alerts', label: 'AML Alerts', icon: '🚨', disabled: true },
    ],
  },
  support_admin: {
    color: 'amber',
    items: [
      { to: '/admin/support', label: 'Support', icon: '🎧' },
      { to: '/admin/support/tickets', label: 'Tickets', icon: '🎫', disabled: true },
    ],
  },
  content_admin: {
    color: 'sky',
    items: [
      { to: '/admin/content', label: 'Content', icon: '📰' },
      { to: '/admin/content/articles', label: 'Articles', icon: '✍️', disabled: true },
      { to: '/admin/content/notifications', label: 'Notifications', icon: '📣', disabled: true },
    ],
  },
};

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user?.role || 'user';

  const config = roleConfig[role] || { color: 'gray', items: [] };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin-login');
  };

  const handlePasswordChange = () => {
    // Navigate to a password change page or open modal
    navigate('/admin/profile/change-password');
  };

  return (
    <aside className="w-full md:w-64 min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 backdrop-blur-sm border-r border-white/10">
      {/* Header with Profile */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 bg-gradient-to-r from-${config.color}-500 to-${config.color}-600 rounded-xl flex items-center justify-center shadow-lg`}>
              <span className="text-white font-bold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div>
              <div className="text-white font-semibold text-sm">{user?.name || 'Admin'}</div>
              <div className="text-slate-400 text-xs capitalize">{role.replace('_', ' ')}</div>
            </div>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-200"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>

            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-50"
              >
                <div className="p-2">
                  <button
                    onClick={handlePasswordChange}
                    className="w-full flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 mr-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L21 21m0-6V9a3 3 0 00-6 0v6m0 0H9a3 3 0 00-3 3v6a3 3 0 003 3h6a3 3 0 003-3v-6a3 3 0 00-3-3z" />
                    </svg>
                    Change Password
                  </button>
                  <button
                    onClick={() => navigate('/admin/profile')}
                    className="w-full flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 mr-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile Settings
                  </button>
                  <hr className="my-2 border-slate-200" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-widest text-slate-400 font-medium mb-4">Navigation</div>
          <ul className="space-y-2">
            {config.items.map((item) => {
              const active = location.pathname === item.to;
              const disabled = item.disabled;
              return (
                <li key={item.to}>
                  {disabled ? (
                    <div className="flex items-center px-3 py-2 rounded-lg text-sm text-slate-500 cursor-not-allowed bg-white/5">
                      <span className="mr-3 text-slate-600">{item.icon}</span>
                      <span>{item.label}</span>
                      <span className="ml-auto text-xs bg-slate-700 text-slate-400 px-2 py-1 rounded">Soon</span>
                    </div>
                  ) : (
                    <Link
                      to={item.to}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200 group
                        ${active
                          ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                        }
                      `}
                    >
                      <span className={`mr-3 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-105'}`}>
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.label}</span>
                      {active && (
                        <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      )}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="border-t border-white/10 pt-6">
          <div className="text-xs uppercase tracking-widest text-slate-400 font-medium mb-4">Quick Actions</div>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
              </svg>
              User Dashboard
            </button>
            <button
              onClick={() => window.open('https://docs.vault5.com', '_blank')}
              className="w-full flex items-center px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Documentation
            </button>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default AdminSidebar;