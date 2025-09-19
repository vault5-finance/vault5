import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const roleConfig = {
  super_admin: {
    color: 'indigo',
    items: [
      { to: '/admin/super', label: 'Overview', icon: '🏠' },
      { to: '/admin/users', label: 'Admin Users', icon: '👥' },
      { to: '/admin/system', label: 'System', icon: '🖥️' },
      { to: '/admin/finance', label: 'Finance', icon: '💰' },
      { to: '/admin/compliance', label: 'Compliance', icon: '🛡️' },
      { to: '/admin/support', label: 'Support', icon: '🎧' },
      { to: '/admin/content', label: 'Content', icon: '📰' },
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
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user?.role || 'user';

  const config = roleConfig[role] || { color: 'gray', items: [] };

  return (
    <aside className="w-full md:w-64 bg-white border-r">
      <div className={`px-4 py-4 border-b bg-${config.color}-50`}>
        <div className="text-xs uppercase tracking-widest text-gray-500">Vault5 Admin</div>
        <div className="mt-1 font-semibold capitalize">{role.replace('_', ' ')}</div>
      </div>
      <nav className="p-2">
        <ul className="space-y-1">
          {config.items.map((item) => {
            const active = location.pathname === item.to;
            const disabled = item.disabled;
            return (
              <li key={item.to}>
                {disabled ? (
                  <div
                    className={`flex items-center px-3 py-2 rounded-md text-sm text-gray-400 cursor-not-allowed`}
                    title="Coming soon"
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </div>
                ) : (
                  <Link
                    to={item.to}
                    className={`flex items-center px-3 py-2 rounded-md text-sm transition
                      ${active ? `bg-${config.color}-100 text-${config.color}-800` : 'text-gray-700 hover:bg-gray-100'}
                    `}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;