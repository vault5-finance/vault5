import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import './index.css';

import NavBar from './components/NavBar';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import SignupChoice from './pages/SignupChoice';
import SignupEmail from './pages/SignupEmail';
import SignupPhone from './pages/SignupPhone';
import SignupPersonal from './pages/SignupPersonal';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Lending from './pages/Lending';
import Loans from './pages/Loans';
import Investments from './pages/Investments';
import Transactions from './pages/Transactions';
import Blog from './pages/Blog';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import AboutUs from './pages/AboutUs';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminLogin from './pages/AdminLogin';
import Banking from './pages/Banking';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

// Admin Protected Route Component
const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) return <Navigate to="/admin-login" replace />;

  // Check if user has any admin role
  const adminRoles = ['super_admin', 'system_admin', 'finance_admin', 'compliance_admin', 'support_admin', 'content_admin'];
  if (!adminRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return children;
};

// Public Route Component (redirects authenticated users)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) return children;

  // Redirect admins (any admin role) to admin panel, users to dashboard
  const adminRoles = ['super_admin', 'system_admin', 'finance_admin', 'compliance_admin', 'support_admin', 'content_admin'];
  if (adminRoles.includes(user.role)) {
    return <Navigate to="/admin" replace />;
  }
 
  return <Navigate to="/dashboard" replace />;
};

function App() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-100">
        {!isLandingPage && <NavBar />}
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupChoice /></PublicRoute>} />
        <Route path="/signup/email" element={<PublicRoute><SignupEmail /></PublicRoute>} />
        <Route path="/signup/phone" element={<PublicRoute><SignupPhone /></PublicRoute>} />
        <Route path="/signup/personal" element={<PublicRoute><SignupPersonal /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Public Marketing Pages */}
        <Route path="/personal" element={<div className="p-8"><h1 className="text-3xl font-bold">Personal Banking</h1><p className="mt-4">Coming soon...</p></div>} />
        <Route path="/business" element={<div className="p-8"><h1 className="text-3xl font-bold">Business Banking</h1><p className="mt-4">Coming soon...</p></div>} />
        <Route path="/developers" element={<div className="p-8"><h1 className="text-3xl font-bold">Developer API</h1><p className="mt-4">Coming soon...</p></div>} />
        <Route path="/app" element={<div className="p-8"><h1 className="text-3xl font-bold">Mobile App</h1><p className="mt-4">Coming soon...</p></div>} />
        <Route path="/help" element={<div className="p-8"><h1 className="text-3xl font-bold">Help Center</h1><p className="mt-4">Coming soon...</p></div>} />
        <Route path="/contact" element={<div className="p-8"><h1 className="text-3xl font-bold">Contact Us</h1><p className="mt-4">Coming soon...</p></div>} />
        <Route path="/fees" element={<div className="p-8"><h1 className="text-3xl font-bold">Fees & Pricing</h1><p className="mt-4">Coming soon...</p></div>} />
        <Route path="/security" element={<div className="p-8"><h1 className="text-3xl font-bold">Security</h1><p className="mt-4">Coming soon...</p></div>} />
        <Route path="/legal" element={<div className="p-8"><h1 className="text-3xl font-bold">Legal & Privacy</h1><p className="mt-4">Coming soon...</p></div>} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/lending" element={<ProtectedRoute><Lending /></ProtectedRoute>} />
        <Route path="/loans" element={<ProtectedRoute><Loans /></ProtectedRoute>} />
        <Route path="/investments" element={<ProtectedRoute><Investments /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/banking" element={<ProtectedRoute><Banking /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
        <Route path="/admin/users" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />

        {/* Placeholder Pages for Future Features */}
        <Route path="/wallet" element={<ProtectedRoute><div className="p-8"><h1 className="text-3xl font-bold">Wallet</h1><p className="mt-4">Recharge, withdraw, and manage your accounts.</p></div></ProtectedRoute>} />
        <Route path="/savings" element={<ProtectedRoute><div className="p-8"><h1 className="text-3xl font-bold">Savings Goals</h1><p className="mt-4">Track your financial goals and restricted vaults.</p></div></ProtectedRoute>} />
        <Route path="/chamas" element={<ProtectedRoute><div className="p-8"><h1 className="text-3xl font-bold">Chamas</h1><p className="mt-4">Join or create pooled savings groups.</p></div></ProtectedRoute>} />
        <Route path="/insurance" element={<ProtectedRoute><div className="p-8"><h1 className="text-3xl font-bold">Insurance</h1><p className="mt-4">Coming soon...</p></div></ProtectedRoute>} />
        <Route path="/send-request" element={<ProtectedRoute><div className="p-8"><h1 className="text-3xl font-bold">Send & Request Money</h1><p className="mt-4">Send money via Email, Phone, or VaultTag.</p></div></ProtectedRoute>} />
        </Routes>
      </div>
    </ToastProvider>
  );
}

export default App;