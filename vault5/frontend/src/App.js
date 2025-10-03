import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import initializePerformanceMonitoring from './utils/performance';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

import MainLayout from './components/MainLayout';
import PublicLayout from './components/PublicLayout';
import { NotificationsProvider } from './contexts/NotificationsContext';

 // Initialize performance monitoring
 const { trackRouteChange } = initializePerformanceMonitoring();

// Robust lazy loader to auto-recover from stale chunk errors during HMR/refresh
const lazyWithRetry = (importer) => React.lazy(() =>
  importer().catch((err) => {
    const message = err?.message || String(err);
    const needsRefresh = /ChunkLoadError|Loading chunk .* failed/i.test(message);
    if (needsRefresh && typeof window !== 'undefined' && !window.__chunk_error_reload__) {
      window.__chunk_error_reload__ = true;
      window.location.reload();
    }
    throw err;
  })
);

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const SignupChoice = lazy(() => import('./pages/SignupChoice'));
const SignupEmail = lazyWithRetry(() => import('./pages/SignupEmail'));
const SignupPhone = lazy(() => import('./pages/SignupPhone'));
const SignupPersonal = lazy(() => import('./pages/SignupPersonal'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const EmailVerificationStatus = lazy(() => import('./pages/EmailVerificationStatus'));

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Reports = lazy(() => import('./pages/Reports'));
const Lending = lazy(() => import('./pages/Lending'));
const Loans = lazy(() => import('./pages/Loans'));
const P2PLoans = lazy(() => import('./pages/P2PLoans'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Blog = lazy(() => import('./pages/Blog'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));
const AboutUs = lazy(() => import('./pages/AboutUs'));

const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const PaymentsCards = lazy(() => import('./pages/PaymentsCards'));
const Investments = lazy(() => import('./pages/Investments'));
const AdminIndex = lazy(() => import('./pages/AdminIndex'));
const AdminSuper = lazy(() => import('./pages/AdminSuper'));
const AdminFinance = lazy(() => import('./pages/AdminFinance'));
const AdminCompliance = lazy(() => import('./pages/AdminCompliance'));
const AdminSupport = lazy(() => import('./pages/AdminSupport'));
const AdminContent = lazy(() => import('./pages/AdminContent'));
const AdminSystem = lazy(() => import('./pages/AdminSystem'));
const AdminUserAccounts = lazy(() => import('./pages/AdminUserAccounts'));
const AdminProfile = lazy(() => import('./pages/AdminProfile'));
const Subscriptions = lazy(() => import('./pages/Subscriptions'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const LegalCenter = lazy(() => import('./pages/LegalCenter'));
const PolicyUpdates = lazy(() => import('./pages/PolicyUpdates'));
const ComplianceCenter = lazy(() => import('./pages/ComplianceCenter'));
const AccountsCenter = lazy(() => import('./pages/AccountsCenter'));
const ENABLE_ADMIN_PORTAL = process.env.REACT_APP_ENABLE_ADMIN_PORTAL === 'true';

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

  // Track route changes for performance monitoring
  React.useEffect(() => {
    trackRouteChange(location.pathname);
  }, [location.pathname]);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <NotificationsProvider>
          <Suspense fallback={<LoadingSpinner message="Loading Vault5..." fullScreen={true} />}>
            <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicRoute><PublicLayout><Landing /></PublicLayout></PublicRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<PublicRoute><SignupChoice /></PublicRoute>} />
        <Route path="/signup/email" element={<PublicRoute><SignupEmail /></PublicRoute>} />
        <Route path="/signup/phone" element={<PublicRoute><SignupPhone /></PublicRoute>} />
        <Route path="/signup/personal" element={<PublicRoute><SignupPersonal /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        <Route path="/email-verified" element={<EmailVerificationStatus />} />
        <Route path="/verify-email/:token" element={<EmailVerificationStatus />} />
        {ENABLE_ADMIN_PORTAL && <Route path="/admin-login" element={<AdminLogin />} />}

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
                <li>Transaction & Service Fees: Transparent and shown before confirmation</li>
                <li>Penalties, Fines & Interests: Applied where applicable and disclosed upfront</li>
                <li>Lawful Data Use: Insights/revenue only where permitted by law and policy</li>
                <li>Investments: Company investments and returns reinvested into user value</li>
                <li>Partnerships & Referrals: Strategic collaborations that benefit users</li>
              </ul>
              <p className="mt-4 text-gray-700">No subscriptions. No hidden fees. All costs are disclosed before approval.</p>
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
        <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/accounts" element={<ProtectedRoute><MainLayout><AccountsCenter /></MainLayout></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><MainLayout><Reports /></MainLayout></ProtectedRoute>} />
        <Route path="/lending" element={<ProtectedRoute><MainLayout><Lending /></MainLayout></ProtectedRoute>} />
        <Route path="/loans" element={<ProtectedRoute><MainLayout><Loans /></MainLayout></ProtectedRoute>} />
        <Route path="/p2p-loans" element={<ProtectedRoute><MainLayout><P2PLoans /></MainLayout></ProtectedRoute>} />
        <Route path="/investments" element={<ProtectedRoute><MainLayout><Investments /></MainLayout></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><MainLayout><Transactions /></MainLayout></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><MainLayout><Notifications /></MainLayout></ProtectedRoute>} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/payments-cards" element={<ProtectedRoute><MainLayout><PaymentsCards /></MainLayout></ProtectedRoute>} />
        <Route path="/subscriptions" element={<ProtectedRoute><MainLayout><Subscriptions /></MainLayout></ProtectedRoute>} />
        {/* Backwards compatibility: redirect old Banking route */}
        <Route path="/banking" element={<Navigate to="/payments-cards" replace />} />
        <Route path="/settings" element={<ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
        <Route path="/compliance" element={<ProtectedRoute><MainLayout><ComplianceCenter /></MainLayout></ProtectedRoute>} />
        <Route path="/admin" element={<AdminProtectedRoute><MainLayout><AdminIndex /></MainLayout></AdminProtectedRoute>} />
        <Route path="/admin/super" element={<AdminProtectedRoute><AdminSuper /></AdminProtectedRoute>} />
        <Route path="/admin/finance" element={<AdminProtectedRoute><AdminFinance /></AdminProtectedRoute>} />
        <Route path="/admin/compliance" element={<AdminProtectedRoute><AdminCompliance /></AdminProtectedRoute>} />
        <Route path="/admin/support" element={<AdminProtectedRoute><AdminSupport /></AdminProtectedRoute>} />
        <Route path="/admin/accounts/users" element={<AdminProtectedRoute><AdminUserAccounts /></AdminProtectedRoute>} />
        <Route path="/admin/support/users" element={<AdminProtectedRoute><Navigate to="/admin/accounts/users" replace /></AdminProtectedRoute>} />
        <Route path="/admin/content" element={<AdminProtectedRoute><AdminContent /></AdminProtectedRoute>} />
        <Route path="/admin/system" element={<AdminProtectedRoute><AdminSystem /></AdminProtectedRoute>} />
        <Route path="/admin/users" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />
        <Route path="/admin/profile" element={<AdminProtectedRoute><AdminProfile /></AdminProtectedRoute>} />
        <Route path="/admin/profile/change-password" element={<AdminProtectedRoute><AdminProfile /></AdminProtectedRoute>} />

        {/* Placeholder Pages for Future Features */}
        <Route path="/wallet" element={<ProtectedRoute><div className="p-8"><h1 className="text-3xl font-bold">Wallet</h1><p className="mt-4">Recharge, withdraw, and manage your accounts.</p></div></ProtectedRoute>} />
        <Route path="/savings" element={<ProtectedRoute><div className="p-8"><h1 className="text-3xl font-bold">Savings Goals</h1><p className="mt-4">Track your financial goals and restricted vaults.</p></div></ProtectedRoute>} />
        <Route path="/chamas" element={<ProtectedRoute><div className="p-8"><h1 className="text-3xl font-bold">Chamas</h1><p className="mt-4">Join or create pooled savings groups.</p></div></ProtectedRoute>} />
        <Route path="/insurance" element={<ProtectedRoute><div className="p-8"><h1 className="text-3xl font-bold">Insurance</h1><p className="mt-4">Coming soon...</p></div></ProtectedRoute>} />
        <Route path="/send-request" element={<ProtectedRoute><div className="p-8"><h1 className="text-3xl font-bold">Send & Request Money</h1><p className="mt-4">Send money via Email, Phone, or VaultTag.</p></div></ProtectedRoute>} />
          </Routes>
        </Suspense>
    </NotificationsProvider>
  </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;