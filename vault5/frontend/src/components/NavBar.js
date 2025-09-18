import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  const fetchNotifications = async () => {
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
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && notifications.length === 0) {
      fetchNotifications();
    }
  };

  // Check if we're on the landing page
  const isLandingPage = location.pathname === '/';

  // Public navigation for landing page
  if (isLandingPage && !token) {
    return (
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="text-xl font-bold text-blue-600">
              Vault5
            </Link>
            <div className="hidden md:flex space-x-8">
              <Link to="/about" className="text-gray-700 hover:text-blue-600">About</Link>
              <Link to="/blog" className="text-gray-700 hover:text-blue-600">Blog</Link>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
              <Link to="/register" className="text-white px-4 py-2 rounded-lg font-medium" style={{ background: 'var(--gradient-primary)' }}>
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Authenticated navigation with collapsible side drawer
  return (
    <>
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
              Vault5
            </Link>

            {/* Mobile menu button */}
            {token && (
              <div className="md:hidden">
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="text-gray-700 hover:text-blue-600 p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            )}

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {token ? (
                <>
                  {/* Desktop menu items */}
                  <div className="flex space-x-6 mr-4">
                    <Link to="/dashboard" className="nav-link">Dashboard</Link>
                    <Link to="/transactions" className="nav-link">Transactions</Link>
                    <Link to="/banking" className="nav-link">Banking</Link>
                    <Link to="/reports" className="nav-link">Reports</Link>
                    <Link to="/lending" className="nav-link">Lending</Link>
                    <Link to="/loans" className="nav-link">Loans</Link>
                    <Link to="/investments" className="nav-link">Investments</Link>
                    <Link to="/settings" className="nav-link">Settings</Link>
                  </div>
                  <div className="relative dropdown-container">
                    <button
                      onClick={toggleNotifications}
                      className="text-gray-700 hover:text-blue-600 relative p-2"
                      title="Notifications"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11 6 0v-1m-6 0H9" />
                      </svg>
                      {notifications.length > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                          {notifications.length}
                        </span>
                      )}
                    </button>
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 border">
                        <div className="px-4 py-2 border-b">
                          <h3 className="font-semibold">Notifications</h3>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {loadingNotifications ? (
                            <p className="px-4 py-2 text-gray-500">Loading...</p>
                          ) : notifications.length > 0 ? (
                            notifications.map((notif) => (
                              <div key={notif._id} className="px-4 py-2 border-b last:border-b-0 hover:bg-gray-50">
                                <p className={`text-sm ${notif.read ? 'text-gray-600' : 'font-medium'}`}>
                                  {notif.message}
                                </p>
                                <p className="text-xs text-gray-500">{new Date(notif.createdAt).toLocaleString()}</p>
                              </div>
                            ))
                          ) : (
                            <p className="px-4 py-2 text-gray-500">No notifications</p>
                          )}
                        </div>
                        <div className="px-4 py-2 border-t">
                          <button
                            onClick={fetchNotifications}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            See all
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <button onClick={handleLogout} className="text-gray-700 hover:text-blue-600">
                    Logout
                  </button>
                </>
              ) : (
                <div className="space-x-2">
                  <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
                  <Link to="/register" className="text-gray-700 hover:text-blue-600">Register</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

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
                <Link to="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setShowMobileMenu(false)}>Dashboard</Link>
                <Link to="/transactions" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setShowMobileMenu(false)}>Transactions</Link>
                <Link to="/banking" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setShowMobileMenu(false)}>Banking</Link>
                <Link to="/reports" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setShowMobileMenu(false)}>Reports</Link>
                <Link to="/lending" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setShowMobileMenu(false)}>Lending</Link>
                <Link to="/loans" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setShowMobileMenu(false)}>Loans</Link>
                <Link to="/investments" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setShowMobileMenu(false)}>Investments</Link>
                <Link to="/blog" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setShowMobileMenu(false)}>Blog</Link>
                <Link to="/about" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setShowMobileMenu(false)}>About</Link>
                <Link to="/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setShowMobileMenu(false)}>Settings</Link>
                <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setShowMobileMenu(false)}>Profile</Link>
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