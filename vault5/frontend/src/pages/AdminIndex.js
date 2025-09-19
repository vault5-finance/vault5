import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminIndex = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user?.role;

  const map = {
    super_admin: '/admin/super',
    system_admin: '/admin/system',
    finance_admin: '/admin/finance',
    compliance_admin: '/admin/compliance',
    support_admin: '/admin/support',
    content_admin: '/admin/content',
  };

  const target = map[role] || '/dashboard';
  return <Navigate to={target} replace />;
};

export default AdminIndex;