import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import SidebarItem from './SidebarItem';
import { useNotifications } from '../contexts/NotificationsContext';

const Sidebar = ({ isOpen, isCollapsed, onToggle, onCollapseToggle, onClose }) => {
  const location = useLocation();
  const { unreadCount } = useNotifications() || { unreadCount: 0 };
  const [reportsOpen, setReportsOpen] = useState(false);
  const [investmentsOpen, setInvestmentsOpen] = useState(false);

  const showCompliance = useMemo(() => {
    try {
      const c = JSON.parse(localStorage.getItem('compliance') || 'null');
      return !!(c && c.limitation && c.limitation.status && c.limitation.status !== 'none');
    } catch {
      return false;
    }
  }, []);

  const menuItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/accounts', label: 'Accounts', icon: '💳' },
    { path: '/wallet', label: 'Wallet', icon: '👛' },
    { path: '/payments-cards', label: 'Payments & Cards', icon: '💳' },
    { path: '/subscriptions', label: 'Subscriptions', icon: '🔄' },
    { path: '/transactions', label: 'My Activity', icon: '🔄' },
    { type: 'group', key: 'investments', label: 'Investments', icon: '📊' },
    { path: '/lending', label: 'Lending', icon: '🤝' },
    { path: '/p2p-loans', label: 'P2P Loans', icon: '🧩' },
    { path: '/notifications', label: 'Notifications', icon: '🔔', badge: unreadCount },
    ...(showCompliance ? [{ path: '/compliance', label: 'Compliance', icon: '🛡️' }] : []),
  ];

  const reportLinks = [
    { path: '/reports#spending', label: 'Spending' },
    { path: '/reports#income', label: 'Income' },
    { path: '/reports#cashflow', label: 'Cashflow' },
  ];

  const investmentLinks = [
    { path: '/investments', label: 'Overview' },
    { path: '/investments#groupsavings', label: 'Group Savings' }, // Chamas
  ];

  const sidebarVariants = {
    open: {
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    closed: {
      x: '-100%',
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    }
  };

  const desktopVariants = {
    expanded: { width: 256 },
    collapsed: { width: 64 }
  };

  return (
    <>
      {/* Mobile Drawer */}
      <motion.div
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        className="fixed left-0 top-0 z-50 h-full w-64 bg-gray-900 text-gray-200 dark:bg-gray-950 shadow-lg lg:hidden overflow-y-auto"
      >
        <div className="flex h-full flex-col">
          <div className="p-4 border-b border-gray-800">
            {/* Profile moved to navbar */}
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                if (item.type === 'group' && item.key === 'reports') {
                  return (
                    <li key="reports-group">
                      <button
                        aria-expanded={reportsOpen}
                        aria-controls="reports-submenu"
                        onClick={() => setReportsOpen(v => !v)}
                        className="w-full flex items-center px-3 py-2 rounded-lg hover:bg-gray-800 transition"
                      >
                        <span className="text-lg mr-3">{item.icon}</span>
                        <span className="flex-1 text-left font-medium">{item.label}</span>
                        <span className={`transition-transform ${reportsOpen ? 'rotate-90' : ''}`}>▶</span>
                      </button>
                      <AnimatePresence initial={false}>
                        {reportsOpen && (
                          <motion.ul
                            id="reports-submenu"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-1 ml-9 space-y-1 overflow-hidden"
                          >
                            {reportLinks.map(sub => (
                              <li key={sub.path}>
                                <Link
                                  to={sub.path}
                                  onClick={onClose}
                                  className={`block px-3 py-1.5 rounded hover:bg-gray-800 ${location.hash && ('/reports' + location.hash) === sub.path ? 'text-teal-400' : ''}`}
                                >
                                  {sub.label}
                                </Link>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                }
                if (item.type === 'group' && item.key === 'investments') {
                  return (
                    <li key="investments-group">
                      <button
                        aria-expanded={investmentsOpen}
                        aria-controls="investments-submenu"
                        onClick={() => setInvestmentsOpen(v => !v)}
                        className="w-full flex items-center px-3 py-2 rounded-lg hover:bg-gray-800 transition"
                      >
                        <span className="text-lg mr-3">{item.icon}</span>
                        <span className="flex-1 text-left font-medium">{item.label}</span>
                        <span className={`transition-transform ${investmentsOpen ? 'rotate-90' : ''}`}>▶</span>
                      </button>
                      <AnimatePresence initial={false}>
                        {investmentsOpen && (
                          <motion.ul
                            id="investments-submenu"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-1 ml-9 space-y-1 overflow-hidden"
                          >
                            {investmentLinks.map(sub => (
                              <li key={sub.path}>
                                <Link
                                  to={sub.path}
                                  onClick={onClose}
                                  className="block px-3 py-1.5 rounded hover:bg-gray-800"
                                >
                                  {sub.label}
                                </Link>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                }
                return (
                  <SidebarItem
                    key={item.path || item.label}
                    item={item}
                    isActive={item.path ? location.pathname === item.path : false}
                    isCollapsed={false}
                    onClick={onClose}
                  />
                );
              })}
            </ul>
          </nav>
        </div>
      </motion.div>

      {/* Desktop/Tablet Sidebar */}
      <motion.div
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={desktopVariants}
        className="fixed left-0 top-0 z-40 hidden h-screen bg-gray-900 text-gray-200 dark:bg-gray-950 shadow-lg lg:flex lg:flex-col overflow-y-auto"
      >
        <div className="p-4 border-b border-gray-800">
          {/* Profile moved to navbar */}
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              if (item.type === 'group' && item.key === 'reports') {
                return (
                  <li key="reports-group-desktop">
                    <button
                      aria-expanded={reportsOpen}
                      aria-controls="reports-submenu-desktop"
                      onClick={() => setReportsOpen(v => !v)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg hover:bg-gray-800 transition ${reportsOpen ? 'bg-gray-800' : ''}`}
                    >
                      <span className="text-lg mr-3">{item.icon}</span>
                      {!isCollapsed && <span className="flex-1 text-left font-medium">{item.label}</span>}
                      {!isCollapsed && <span className={`transition-transform ${reportsOpen ? 'rotate-90' : ''}`}>▶</span>}
                    </button>
                    <AnimatePresence initial={false}>
                      {reportsOpen && (
                        <motion.ul
                          id="reports-submenu-desktop"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className={`mt-1 ${isCollapsed ? 'pl-0' : 'ml-9'} space-y-1 overflow-hidden`}
                        >
                          {reportLinks.map(sub => (
                            <li key={sub.path}>
                              <Link
                                to={sub.path}
                                className="block px-3 py-1.5 rounded hover:bg-gray-800"
                              >
                                {sub.label}
                              </Link>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                );
              }
              if (item.type === 'group' && item.key === 'investments') {
                return (
                  <li key="investments-group-desktop">
                    <button
                      aria-expanded={investmentsOpen}
                      aria-controls="investments-submenu-desktop"
                      onClick={() => setInvestmentsOpen(v => !v)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg hover:bg-gray-800 transition ${investmentsOpen ? 'bg-gray-800' : ''}`}
                    >
                      <span className="text-lg mr-3">{item.icon}</span>
                      {!isCollapsed && <span className="flex-1 text-left font-medium">{item.label}</span>}
                      {!isCollapsed && <span className={`transition-transform ${investmentsOpen ? 'rotate-90' : ''}`}>▶</span>}
                    </button>
                    <AnimatePresence initial={false}>
                      {investmentsOpen && (
                        <motion.ul
                          id="investments-submenu-desktop"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className={`mt-1 ${isCollapsed ? 'pl-0' : 'ml-9'} space-y-1 overflow-hidden`}
                        >
                          {investmentLinks.map(sub => (
                            <li key={sub.path}>
                              <Link
                                to={sub.path}
                                className="block px-3 py-1.5 rounded hover:bg-gray-800"
                              >
                                {sub.label}
                              </Link>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                );
              }
              return (
                <SidebarItem
                  key={item.path || item.label}
                  item={item}
                  isActive={item.path ? location.pathname === item.path : false}
                  isCollapsed={isCollapsed}
                />
              );
            })}
          </ul>
        </nav>
        <div className="p-3 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <button
              onClick={onCollapseToggle}
              className="px-2 py-1 rounded hover:bg-gray-800 text-sm"
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              {isCollapsed ? '➡ Expand' : '⬅ Collapse'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;