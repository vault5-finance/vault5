import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CreditCardIcon,
  ArrowsRightLeftIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';

const NavItem = ({ to, label, icon: Icon, active }) => {
  return (
    <Link
      to={to}
      className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 transform ${
        active
          ? 'text-emi-blue bg-emi-blue/5'
          : 'text-gray-500 hover:text-emi-blue hover:bg-emi-blue/5'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      {active && (
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-emi-blue rounded-full"></div>
      )}
      <Icon className={`h-6 w-6 transition-all duration-200 ${active ? 'stroke-[2.5] text-emi-blue' : 'stroke-2 text-current'}`} />
      <span className="text-[11px] leading-tight mt-0.5 font-medium">{label}</span>
    </Link>
  );
};

const MobileBottomNav = () => {
  const location = useLocation();
  const path = location.pathname;

  const items = [
    { to: '/dashboard', label: 'Dashboard', icon: HomeIcon },
    { to: '/accounts', label: 'Accounts', icon: CreditCardIcon },
    { to: '/transactions', label: 'Txns', icon: ArrowsRightLeftIcon },
    { to: '/reports', label: 'Reports', icon: ChartPieIcon },
  ];

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
      role="navigation"
      aria-label="Primary mobile navigation"
    >
      {/* iOS safe-area support */}
      <div className="px-2 pt-1 pb-[calc(env(safe-area-inset-bottom)+0.25rem)]">
        <div className="grid grid-cols-4 gap-1">
          {items.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              active={path === item.to || (item.to !== '/dashboard' && path.startsWith(item.to))}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNav;