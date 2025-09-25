import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import ProfileDropdown from './ProfileDropdown';
import SidebarItem from './SidebarItem';

const Sidebar = ({ isOpen, isCollapsed, onToggle, onCollapseToggle, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/accounts', label: 'Accounts', icon: '💰' },
    { path: '/wallet', label: 'Wallet', icon: '👛' },
    { path: '/banking', label: 'Banking', icon: '💳' },
    { path: '/transactions', label: 'Transactions', icon: '📈' },
    { path: '/reports', label: 'Reports & Insights', icon: '📋' },
    { path: '/lending', label: 'Lending & Loans', icon: '🤝' },
    { path: '/investments', label: 'Investments', icon: '📈' },
    { path: '/compliance', label: 'Compliance', icon: '🛡️', conditional: true },
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
        className="fixed left-0 top-0 z-50 h-full w-64 bg-white dark:bg-gray-800 shadow-lg md:hidden"
      >
        <div className="flex h-full flex-col">
          <ProfileDropdown onItemClick={onClose} />
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <SidebarItem
                  key={item.path}
                  item={item}
                  isActive={location.pathname === item.path}
                  isCollapsed={false}
                  onClick={onClose}
                />
              ))}
            </ul>
          </nav>
        </div>
      </motion.div>

      {/* Desktop/Tablet Sidebar */}
      <motion.div
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={desktopVariants}
        className="fixed left-0 top-0 z-40 hidden h-full bg-white dark:bg-gray-800 shadow-lg md:flex md:flex-col"
      >
        <ProfileDropdown onItemClick={() => {}} isCollapsed={isCollapsed} />
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.path}
                item={item}
                isActive={location.pathname === item.path}
                isCollapsed={isCollapsed}
              />
            ))}
          </ul>
        </nav>
        {/* Collapse toggle for tablet */}
        <div className="hidden md:flex lg:hidden p-4 border-t">
          <button
            onClick={onCollapseToggle}
            className="w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;