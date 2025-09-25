import React from 'react';
import { Link } from 'react-router-dom';

const SidebarItem = ({ item, isActive, isCollapsed, onClick }) => {
  return (
    <li>
      <Link
        to={item.path}
        onClick={onClick}
        className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        } ${isCollapsed ? 'justify-center' : ''}`}
        title={isCollapsed ? item.label : ''}
      >
        <span className="text-lg">{item.icon}</span>
        {!isCollapsed && (
          <span className="ml-3 font-medium">{item.label}</span>
        )}
      </Link>
    </li>
  );
};

export default SidebarItem;