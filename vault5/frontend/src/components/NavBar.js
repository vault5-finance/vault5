import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useNotifications } from '../contexts/NotificationsContext';

const NavBar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = useMemo(() => JSON.parse(localStorage.getItem('user') || '{}'), []);
  const adminRoles = useMemo(() => ['super_admin', 'system_admin', 'finance_admin', 'compliance_admin', 'support_admin', 'content_admin'], []);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const notifDropdownRef = useRef(null);
  const notifButtonRef = useRef(null);
  const notifCtx = useNotifications();

// Computed unread count (prefer context if available)
const unreadCount = useMemo(() => {
  if (notifCtx?.unreadCount != null) return notifCtx.unreadCount;
  return notifications.filter(n => !n.read).length;
}, [notifCtx?.unreadCount, notifications]);

  // Compliance banner state
  const [compliance, setCompliance] = useState(null);
  const [loadingCompliance, setLoadingCompliance] = useState(false);

  // Memoized computed values
  const isLandingPage = useMemo(() => location.pathname === '/', [location.pathname]);
  const isAdminArea = useMemo(() => location.pathname.startsWith('/admin'), [location.pathname]);
  const isAuthPage = useMemo(
    () => location.pathname === '/login' || location.pathname.startsWith('/signup'),
    [location.pathname]
  );

  // moved below after function declarations to avoid TDZ

  const fetchNotifications = useCallback(async () => {
    if (notifCtx?.refresh) {
      await notifCtx.refresh();
      return;
    }
    if (!token) return;
    setLoadingNotifications(true);
    try {
      const res = await api.get('/api/notifications');
      setNotifications(res.data.slice(0, 5)); // Show latest 5
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  }, [token, notifCtx]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/login');
  }, [navigate]);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoadingCompliance(true);
      const res = await api.get('/api/compliance/status');
      setCompliance(res.data?.data || null);
    } catch (e) {
      // do not spam UI; banner is optional
      setCompliance(null);
    } finally {
      setLoadingCompliance(false);
    }
  }, []);

  // Initialize after functions are defined to avoid "before initialization" TDZ error
  useEffect(() => {
    if (token) {
      fetchNotifications();
      fetchCompliance();
    }
  }, [token, fetchNotifications, fetchCompliance]);

  // Click outside handler for notifications dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target) &&
        notifButtonRef.current &&
        !notifButtonRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => {
      const newState = !prev;
      if (newState && (notifCtx?.notifications?.length ?? notifications.length) === 0) {
        fetchNotifications();
      }
      return newState;
    });
  }, [notifications.length, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/api/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotif = async (id) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };


  // Public navigation for landing page (PayPal-like, with mobile collapse)
  if (isLandingPage && !token) {
    return (
      <nav className="bg-white shadow-lg z-50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="text-xl font-bold text-blue-600">
              Vault5
            </Link>

            {/* Mobile menu button (always visible on mobile) */}
            <div className="lg:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="text-gray-700 hover:text-blue-600 p-2"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Desktop links */}
            <div className="hidden md:flex space-x-8">
              <Link to="/about" className="text-gray-700 hover:text-blue-600">About</Link>
              <Link to="/blog" className="text-gray-700 hover:text-blue-600">Blog</Link>
              <Link to="/legal" className="text-gray-700 hover:text-blue-600">Legal</Link>
              <Link to="/terms" className="text-gray-700 hover:text-blue-600">Terms</Link>
              <Link to="/privacy" className="text-gray-700 hover:text-blue-600">Privacy</Link>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              {/* Admin link removed from public navbar */}
              <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
              <Link to="/signup" className="text-white px-4 py-2 rounded-lg font-medium" style={{ background: 'var(--gradient-primary)' }}>
                Get Started
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Side Drawer for public routes */}
        {showMobileMenu && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setShowMobileMenu(false)}></div>
            <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300">
              <div className="p-4 border-b">
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="float-right text-gray-500 hover:text-gray-700"
                  aria-label="Close menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 className="text-lg font-semibold">Menu</h2>
              </div>
              <nav className="p-4">
                <div className="space-y-2">
                  <Link to="/about" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setShowMobileMenu(false)}>About</Link>
                  <Link to="/blog" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setShowMobileMenu(false)}>Blog</Link>
                  <Link to="/legal" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setShowMobileMenu(false)}>Legal</Link>
                  <Link to="/terms" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setShowMobileMenu(false)}>Terms</Link>
                  <Link to="/privacy" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setShowMobileMenu(false)}>Privacy</Link>
                  <div className="h-px bg-gray-200 my-2" />
                  <Link to="/login" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setShowMobileMenu(false)}>Login</Link>
                  <Link to="/signup" className="block px-4 py-2 bg-blue-600 text-white text-center rounded-lg font-medium" onClick={() => setShowMobileMenu(false)}>Get Started</Link>
                </div>
              </nav>
            </div>
          </div>
        )}
      </nav>
    );
  }

  // Authenticated navigation with collapsible side drawer
  return (
    <>
      <nav className="bg-white shadow-lg border-b border-gray-100 z-50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="text-xl font-bold emi-gradient-text">
              Vault5
            </Link>

            {/* Mobile menu button (authenticated) */}
            {token && onMenuClick && (
              <div className="lg:hidden">
                <button
                  onClick={onMenuClick}
                  className="text-gray-700 hover:text-blue-600 p-2"
                  aria-label="Toggle menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            )}

            {/* Desktop navigation - simplified since sidebar handles main nav */}
            <div className="hidden md:flex items-center space-x-4">
              {token ? (
                <>
                  {/* Spacer for alignment */}
                  <div className="flex-1" />

                  {/* Notifications bell removed from navbar; accessible via sidebar */}
                  <div className="hidden" ref={notifButtonRef}>
                    <button
                      onClick={toggleNotifications}
                      className="text-gray-700 hover:text-blue-600 relative p-2"
                      title="Notifications"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11 6 0v-1m-6 0H9" />
                      </svg>
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    {showNotifications && (
                      <div ref={notifDropdownRef} className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 border">
                        <div className="px-4 py-2 border-b">
                          <h3 className="font-semibold">Notifications</h3>
                          <p className="text-sm text-gray-500">You have {unreadCount} unread messages.</p>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {loadingNotifications ? (
                            <p className="px-4 py-2 text-gray-500">Loading...</p>
                          ) : (notifCtx?.notifications ?? notifications).length > 0 ? (
                            (notifCtx?.notifications ?? notifications).map((notif) => (
                              <div key={notif._id} className="relative mx-auto flex w-full max-w-full md:pt-[unset] mb-6 px-4">
                                <div className="w-2 h-2 mt-1 me-4 rounded-full bg-blue-500"></div>
                                <div className="flex-1">
                                  <p className="text-zinc-950 dark:text-white font-medium mb-1">
                                    {notif.message}
                                  </p>
                                  <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                                    {new Date(notif.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                <div className="flex space-x-1 ml-2">
                                  {!notif.read && (
                                    <button onClick={() => (notifCtx?.markAsRead ? notifCtx.markAsRead(notif._id) : markAsRead(notif._id))} className="text-xs text-blue-600 hover:underline">Read</button>
                                  )}
                                  <button onClick={() => (notifCtx?.deleteNotification ? notifCtx.deleteNotification(notif._id) : deleteNotif(notif._id))} className="text-xs text-red-600 hover:underline">Delete</button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="px-4 py-2 text-gray-500">No notifications</p>
                          )}
                        </div>
                        <div className="px-4 py-2 border-t">
                          <button
                            onClick={() => (notifCtx?.markAllAsRead ? notifCtx.markAllAsRead() : markAllAsRead())}
                            className="whitespace-nowrap bg-blue-600 text-white hover:bg-blue-700 flex w-full max-w-full items-center justify-center rounded-lg px-4 py-4 text-base font-medium"
                          >
                            Mark all as read
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <button onClick={handleLogout} className="hidden" aria-label="Logout">
                    Logout
                  </button>
                </>
              ) : (
                !isAuthPage ? (
                  <div className="space-x-2">
                    <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
                    <Link to="/signup" className="text-gray-700 hover:text-blue-600">Register</Link>
                  </div>
                ) : (
                  <div />
                )
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Compliance Banner */}
      {token && compliance && !loadingCompliance && (
        <>
          {(() => {
            const st = compliance?.limitation?.status || 'none';
            const payoutEligible = compliance?.payoutEligible;
            if (st === 'none' && !payoutEligible) return null;

            const base = 'text-sm shadow-sm animate-pulse';
            const style =
              st === 'temporary_30' ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-400 text-yellow-800' :
              st === 'temporary_180' ? 'bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-800' :
              st === 'permanent' ? 'bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-600 text-red-900' :
              payoutEligible ? 'bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 text-green-800' :
              'bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 text-blue-800';

            const countdownMs = compliance?.limitation?.countdownMs || 0;
            const reserveReleaseAt = compliance?.limitation?.reserveReleaseAt;
            const daysLeft = countdownMs > 0 ? Math.floor(countdownMs / (1000 * 60 * 60 * 24)) : 0;

            return (
              <div className={`${style} ${base} relative overflow-hidden`}>
                {/* Background pattern for visual interest */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }}></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-3 relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex-1 flex items-start gap-3">
                      {/* Status Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {st === 'temporary_30' && (
                          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        )}
                        {st === 'temporary_180' && (
                          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                        {st === 'permanent' && (
                          <svg className="w-5 h-5 text-red-700" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {payoutEligible && (
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {st !== 'none' ? (
                          <div className="space-y-1">
                            <div className="font-semibold">
                              Account {st === 'temporary_30' ? 'Temporarily' : st === 'temporary_180' ? 'Limited' : 'Permanently'} Limited
                            </div>
                            <div className="text-xs opacity-90 space-y-1">
                              {countdownMs > 0 && (
                                <div className="flex items-center gap-2">
                                  <span>⏱️</span>
                                  <span>{daysLeft} days remaining</span>
                                </div>
                              )}
                              {reserveReleaseAt && (
                                <div className="flex items-center gap-2">
                                  <span>🔒</span>
                                  <span>Reserve releases: {new Date(reserveReleaseAt).toLocaleDateString()}</span>
                                </div>
                              )}
                              {st === 'temporary_180' && (
                                <div className="text-xs mt-1">
                                  Funds are held in reserve for regulatory compliance
                                </div>
                              )}
                            </div>
                          </div>
                        ) : payoutEligible ? (
                          <div className="space-y-1">
                            <div className="font-semibold">🎉 Payout Available!</div>
                            <div className="text-xs opacity-90">
                              Your reserve period has ended. You can now request payout to a verified bank account.
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {payoutEligible && (
                        <button
                          onClick={() => navigate('/compliance')}
                          className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors"
                        >
                          Request Payout
                        </button>
                      )}
                      {st !== 'none' && (
                        <button
                          onClick={() => navigate('/compliance')}
                          className="px-3 py-1.5 bg-white/20 text-current text-xs font-medium rounded-md hover:bg-black/10 transition-colors border border-current/20"
                        >
                          View Details
                        </button>
                      )}
                      <Link
                        to="/compliance"
                        className="text-xs font-medium underline hover:no-underline"
                      >
                        Compliance Center →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* Mobile Side Drawer */}
      {showMobileMenu && token && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setShowMobileMenu(false)}></div>
          <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300">
            <div className="p-4 border-b">
              <button
                onClick={() => setShowMobileMenu(false)}
                className="float-right text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-lg font-semibold">Menu</h2>
            </div>
            <nav className="p-4">
              <div className="space-y-2">
                {isAdminArea ? (
                  <>
                    <Link to="/admin" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setShowMobileMenu(false)}>Admin Dashboard</Link>
                    <Link to="/admin/users" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setShowMobileMenu(false)}>Users</Link>
                  </>
                ) : (
                  <>
                    {/* EMI-style Quick Actions for Mobile */}
                    <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Quick Actions</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Link to="/accounts" className="block px-3 py-2 bg-blue-600 text-white text-center rounded-lg text-sm font-medium" onClick={() => setShowMobileMenu(false)}>💰 Accounts</Link>
                        <Link to="/banking" className="block px-3 py-2 bg-emerald-600 text-white text-center rounded-lg text-sm font-medium" onClick={() => setShowMobileMenu(false)}>💳 Banking</Link>
                        <Link to="/transactions" className="block px-3 py-2 bg-purple-600 text-white text-center rounded-lg text-sm font-medium" onClick={() => setShowMobileMenu(false)}>📊 Transactions</Link>
                        <Link to="/reports" className="block px-3 py-2 bg-indigo-600 text-white text-center rounded-lg text-sm font-medium" onClick={() => setShowMobileMenu(false)}>📈 Reports</Link>
                      </div>
                    </div>

                    <Link to="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setShowMobileMenu(false)}>Dashboard</Link>
                    <Link to="/lending" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setShowMobileMenu(false)}>Lending</Link>
                    <Link to="/loans" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setShowMobileMenu(false)}>Loans</Link>
                    <Link to="/compliance" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setShowMobileMenu(false)}>Compliance</Link>
                    <Link to="/blog" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setShowMobileMenu(false)}>Blog</Link>
                    <Link to="/about" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setShowMobileMenu(false)}>About</Link>
                    <Link to="/legal" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setShowMobileMenu(false)}>Legal</Link>
                    <Link to="/terms" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setShowMobileMenu(false)}>Terms</Link>
                    <Link to="/privacy" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setShowMobileMenu(false)}>Privacy</Link>
                    <Link to="/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setShowMobileMenu(false)}>Settings</Link>
                    <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setShowMobileMenu(false)}>Profile</Link>
                    {adminRoles.includes(user.role) && (
                      <Link to="/admin" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setShowMobileMenu(false)}>Admin</Link>
                    )}
                  </>
                )}
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded">Logout</button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;