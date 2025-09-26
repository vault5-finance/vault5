import React from 'react';
import { Link } from 'react-router-dom';

const SidebarItem = ({ item, isActive, isCollapsed, onClick }) => {
  const badge = typeof item.badge === 'number' ? item.badge : 0;

  return (
    <li>
      <Link
        to={item.path}
        onClick={onClick}
        aria-current={isActive ? 'page' : undefined}
        className={`relative group flex items-center px-3 py-2 rounded-lg transition-colors ${
          isActive
            ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md'
            : 'text-gray-300 hover:bg-gray-800 hover:ring-1 hover:ring-teal-600/30'
        } ${isCollapsed ? 'justify-center' : ''}`}
        title={isCollapsed ? item.label : ''}
      >
        <span className="text-lg transition-transform group-hover:scale-110">{item.icon}</span>
        {!isCollapsed && (
          <span className="ml-3 font-medium">{item.label}</span>
        )}
        {!isCollapsed && badge > 0 && (
          <span className="ml-auto inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {badge}
          </span>
        )}
        {isCollapsed && badge > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full" />
        )}
      </Link>
    </li>
  );
};

export default SidebarItem;