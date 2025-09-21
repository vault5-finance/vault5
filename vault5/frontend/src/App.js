import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import './index.css';

import NavBar from './components/NavBar';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const SignupChoice = lazy(() => import('./pages/SignupChoice'));
const SignupEmail = lazy(() => import('./pages/SignupEmail'));
const SignupPhone = lazy(() => import('./pages/SignupPhone'));
const SignupPersonal = lazy(() => import('./pages/SignupPersonal'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Reports = lazy(() => import('./pages/Reports'));
const Lending = lazy(() => import('./pages/Lending'));
const Loans = lazy(() => import('./pages/Loans'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Blog = lazy(() => import('./pages/Blog'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));
const AboutUs = lazy(() => import('./pages/AboutUs'));

const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const Banking = lazy(() => import('./pages/Banking'));
const AdminIndex = lazy(() => import('./pages/AdminIndex'));
const AdminSuper = lazy(() => import('./pages/AdminSuper'));
const AdminFinance = lazy(() => import('./pages/AdminFinance'));
const AdminCompliance = lazy(() => import('./pages/AdminCompliance'));
const AdminSupport = lazy(() => import('./pages/AdminSupport'));
const AdminContent = lazy(() => import('./pages/AdminContent'));
const AdminSystem = lazy(() => import('./pages/AdminSystem'));
const AdminUserAccounts = lazy(() => import('./pages/AdminUserAccounts'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const LegalCenter = lazy(() => import('./pages/LegalCenter'));
const PolicyUpdates = lazy(() => import('./pages/PolicyUpdates'));
const ComplianceCenter = lazy(() => import('./pages/ComplianceCenter'));
const AccountsCenter = lazy(() => import('./pages/AccountsCenter'));

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
  const adminRoles = ['super_admin', 'system_admin', 'finance_admin', 'compliance_admin', 'support_admin', 'content_admin', 'account_admin'];
  if (!adminRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return children;
};

// Public Route Component (redirects authenticated users)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) return children;

  // Redirect admins (any admin role) to admin panel, users to dashboard
  const adminRoles = ['super_admin', 'system_admin', 'finance_admin', 'compliance_admin', 'support_admin', 'content_admin', 'account_admin'];
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
        <Suspense fallback={<div className="p-8">Loading...</div>}>
          <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<PublicRoute><SignupChoice /></PublicRoute>} />
        <Route path="/signup/email" element={<PublicRoute><SignupEmail /></PublicRoute>} />
        <Route path="/signup/phone" element={<PublicRoute><SignupPhone /></PublicRoute>} />
        <Route path="/signup/personal" element={<PublicRoute><SignupPersonal /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Public Marketing Pages */}
        <Route
          path="/personal"
          element={
            <div className="p-8">
              <h1 className="text-3xl font-bold">Personal Banking</h1>
              <p className="mt-4 text-gray-700">
                Vault5 helps individuals practice financial discipline and reach freedom sooner.
              </p>
              <ul className="mt-4 list-disc pl-6 text-gray-700">
                <li>5-vault allocation: Daily, Emergency, Investments, Long-Term, Fun</li>
                <li>Smart budgets, cashflow, and health score</li>
                <li>Lending rules and surplus nudges for better habits</li>
              </ul>
            </div>
          }
        />
        <Route
          path="/business"
          element={
            <div className="p-8">
              <h1 className="text-3xl font-bold">Business Banking (Preview)</h1>
              <p className="mt-4 text-gray-700">
                Controls for small teams and chamas: roles, approvals, expense rules, and reports.
              </p>
              <ul className="mt-4 list-disc pl-6 text-gray-700">
                <li>Expense policies and approval flows</li>
                <li>Vendor payments and reconciliations</li>
                <li>Role-based access for treasurers and members</li>
              </ul>
            </div>
          }
        />
        <Route
          path="/developers"
          element={
            <div className="p-8">
              <h1 className="text-3xl font-bold">Developer API</h1>
              <p className="mt-4 text-gray-700">Build on top of Vault5 with secure APIs and webhooks.</p>
              <ul className="mt-4 list-disc pl-6 text-gray-700">
                <li>OAuth2 + JWT flows</li>
                <li>Transactions, allocations, lending, and analytics endpoints</li>
                <li>Sandbox for rapid prototyping</li>
              </ul>
            </div>
          }
        />
        <Route
          path="/app"
          element={
            <div className="p-8">
              <h1 className="text-3xl font-bold">Mobile App</h1>
              <p className="mt-4 text-gray-700">
                Native apps with offline mode, instant notifications, and biometric login.
              </p>
              <ul className="mt-4 list-disc pl-6 text-gray-700">
                <li>Tap-to-allocate income into your 5 vaults</li>
                <li>Track goals and loans anywhere</li>
                <li>Android/iOS store links coming soon</li>
              </ul>
            </div>
          }
        />
        <Route
          path="/help"
          element={
            <div className="p-8">
              <h1 className="text-3xl font-bold">Help Center</h1>
              <div className="mt-4 space-y-4 text-gray-700">
                <div>
                  <h2 className="text-lg font-semibold">Getting Started</h2>
                  <p>Create an account, verify email/phone, and set your first financial goal.</p>
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Allocations & Goals</h2>
                  <p>Income is auto-split; adjust percentages and targets in Settings.</p>
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Lending & Loans</h2>
                  <p>Apply rules, track repayments, and view ledgers in the Lending/Loans modules.</p>
                </div>
              </div>
            </div>
          }
        />
        <Route
          path="/contact"
          element={
            <div className="p-8">
              <h1 className="text-3xl font-bold">Contact Us</h1>
              <p className="mt-4 text-gray-700">We respond within 24–48 hours on business days.</p>
              <ul className="mt-4 list-disc pl-6 text-gray-700">
                <li>Email: support@vault5.com</li>
                <li>Twitter/X: @vault5</li>
                <li>Address: [Insert Registered Address]</li>
              </ul>
            </div>
          }
        />
        <Route
          path="/fees"
          element={
            <div className="p-8">
              <h1 className="text-3xl font-bold">Fees & Pricing</h1>
              <ul className="mt-4 list-disc pl-6 text-gray-700">
                <li>Transfers: Transparent fees shown before confirmation</li>
                <li>Subscriptions: Free tier + optional premium add-ons</li>
                <li>Loan interest/penalties: Shown upfront per application</li>
              </ul>
              <p className="mt-4 text-gray-700">No hidden fees. You always see costs before you approve.</p>
            </div>
          }
        />
        <Route
          path="/security"
          element={
            <div className="p-8">
              <h1 className="text-3xl font-bold">Security</h1>
              <ul className="mt-4 list-disc pl-6 text-gray-700">
                <li>Encryption in transit and at rest</li>
                <li>2FA/MFA and device trust scoring</li>
                <li>Audit logs and RBAC for admins</li>
                <li>Continuous monitoring and vulnerability scans</li>
              </ul>
            </div>
          }
        />
        <Route path="/legal" element={<Navigate to="/legal/user-agreement" replace />} />
        <Route path="/legal/policy-updates" element={<PolicyUpdates />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/legal/:doc" element={<LegalCenter />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/accounts" element={<ProtectedRoute><AccountsCenter /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/lending" element={<ProtectedRoute><Lending /></ProtectedRoute>} />
        <Route path="/loans" element={<ProtectedRoute><Loans /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/banking" element={<ProtectedRoute><Banking /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/compliance" element={<ProtectedRoute><ComplianceCenter /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminProtectedRoute><AdminIndex /></AdminProtectedRoute>} />
        <Route path="/admin/super" element={<AdminProtectedRoute><AdminSuper /></AdminProtectedRoute>} />
        <Route path="/admin/finance" element={<AdminProtectedRoute><AdminFinance /></AdminProtectedRoute>} />
        <Route path="/admin/compliance" element={<AdminProtectedRoute><AdminCompliance /></AdminProtectedRoute>} />
        <Route path="/admin/support" element={<AdminProtectedRoute><AdminSupport /></AdminProtectedRoute>} />
        <Route path="/admin/accounts/users" element={<AdminProtectedRoute><AdminUserAccounts /></AdminProtectedRoute>} />
        <Route path="/admin/support/users" element={<AdminProtectedRoute><Navigate to="/admin/accounts/users" replace /></AdminProtectedRoute>} />
        <Route path="/admin/content" element={<AdminProtectedRoute><AdminContent /></AdminProtectedRoute>} />
        <Route path="/admin/system" element={<AdminProtectedRoute><AdminSystem /></AdminProtectedRoute>} />
        <Route path="/admin/users" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />

        {/* Placeholder Pages for Future Features */}
        <Route path="/wallet" element={<ProtectedRoute><div className="p-8"><h1 className="text-3xl font-bold">Wallet</h1><p className="mt-4">Recharge, withdraw, and manage your accounts.</p></div></ProtectedRoute>} />
        <Route path="/savings" element={<ProtectedRoute><div className="p-8"><h1 className="text-3xl font-bold">Savings Goals</h1><p className="mt-4">Track your financial goals and restricted vaults.</p></div></ProtectedRoute>} />
        <Route path="/chamas" element={<ProtectedRoute><div className="p-8"><h1 className="text-3xl font-bold">Chamas</h1><p className="mt-4">Join or create pooled savings groups.</p></div></ProtectedRoute>} />
        <Route path="/insurance" element={<ProtectedRoute><div className="p-8"><h1 className="text-3xl font-bold">Insurance</h1><p className="mt-4">Coming soon...</p></div></ProtectedRoute>} />
        <Route path="/send-request" element={<ProtectedRoute><div className="p-8"><h1 className="text-3xl font-bold">Send & Request Money</h1><p className="mt-4">Send money via Email, Phone, or VaultTag.</p></div></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </div>
    </ToastProvider>
  );
}

export default App;