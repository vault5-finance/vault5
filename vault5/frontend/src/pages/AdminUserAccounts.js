import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import ConfirmGate from '../components/ConfirmGate';
import {
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  UserPlusIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  XMarkIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  KeyIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  MapPinIcon,
  SparklesIcon
} from '@heroicons/react/24/solid';
import { UserGroupIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

// Enhanced status configuration with icons and colors
const statusConfig = {
  active: {
    label: 'Active',
    icon: CheckCircleIcon,
    bg: 'bg-green-500/20 border-green-500/30 text-green-400',
    description: 'User can log in and access all features'
  },
  dormant: {
    label: 'Dormant',
    icon: ClockIcon,
    bg: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
    description: 'User flagged as inactive, can still log in',
    pulse: true
  },
  suspended: {
    label: 'Suspended',
    icon: ExclamationTriangleIcon,
    bg: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
    description: 'Temporarily blocked from logging in'
  },
  banned: {
    label: 'Banned',
    icon: XCircleIcon,
    bg: 'bg-red-500/20 border-red-500/30 text-red-400',
    description: 'Permanently blocked from accessing the system',
    pulse: true
  },
  deleted: {
    label: 'Deleted',
    icon: XCircleIcon,
    bg: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
    description: 'Account marked as deleted'
  }
};

const statusOptions = [
  { value: '', label: 'All statuses' },
  ...Object.entries(statusConfig).map(([value, config]) => ({
    value,
    label: config.label,
    icon: config.icon
  }))
];

// Enhanced status badge component
const StatusBadge = ({ status, showDescription = false }) => {
  const config = statusConfig[status] || {
    label: status || 'Unknown',
    icon: ClockIcon,
    bg: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
    description: 'Unknown status'
  };

  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${config.bg} ${
        config.pulse ? 'animate-pulse' : ''
      }`}
    >
      <IconComponent className="w-3 h-3" />
      {config.label}
      {showDescription && (
        <div className="absolute top-full mt-1 left-0 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          {config.description}
        </div>
      )}
    </motion.div>
  );
};

// Utility functions
const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getRelativeTime = (dateString) => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
};

// Filter chip component
const FilterChip = ({ label, onRemove, icon: IconComponent }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.8, opacity: 0 }}
    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm border border-blue-500/30"
  >
    {IconComponent && <IconComponent className="w-3 h-3" />}
    <span>{label}</span>
    <button
      onClick={onRemove}
      className="hover:bg-blue-500/30 rounded-full p-0.5 transition-colors"
    >
      <XMarkIcon className="w-3 h-3" />
    </button>
  </motion.div>
);

const AdminUserAccounts = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const hasShownForbiddenRef = useRef(false);

  // Enhanced state management
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [jumpToPage, setJumpToPage] = useState('');

  // Data
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // UI state
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Create/edit modal - enhanced stepper
  const [showCreate, setShowCreate] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    dob: '',
    phone: '',
    city: '',
    role: 'user', // Add role field
  });

  // Status modal - enhanced
  const [statusModal, setStatusModal] = useState({
    open: false,
    user: null,
    isActive: undefined,
    accountStatus: '',
  });
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Active filters for chips
  const activeFilters = useMemo(() => {
    const filters = [];
    if (q) filters.push({ key: 'search', label: `Search: "${q}"`, icon: MagnifyingGlassIcon });
    if (status) {
      const statusOption = statusOptions.find(opt => opt.value === status);
      filters.push({
        key: 'status',
        label: `Status: ${statusOption?.label || status}`,
        icon: statusOption?.icon || ClockIcon
      });
    }
    if (activeOnly) filters.push({ key: 'active', label: 'Active Only', icon: CheckCircleIcon });
    if (dateFrom || dateTo) {
      filters.push({
        key: 'date',
        label: `Created: ${dateFrom || '...'} to ${dateTo || '...'}`,
        icon: CalendarIcon
      });
    }
    return filters;
  }, [q, status, activeOnly, dateFrom, dateTo]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  // Debounced search
  const debouncedSearch = useCallback(
    useCallback(() => {
      const timeoutId = setTimeout(() => {
        setPage(1);
        fetchUsers();
      }, 300);
      return () => clearTimeout(timeoutId);
    }, []),
    []
  );

  useEffect(() => {
    debouncedSearch();
  }, [q, debouncedSearch]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (status) params.append('status', status);
      if (activeOnly) params.append('active', 'true');
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      params.append('page', String(page));
      params.append('limit', String(limit));

      const res = await api.get(`/api/admin/accounts/users?${params.toString()}`);
      const { items, total: t } = res.data.data || { items: [], total: 0 };
      setUsers(items);
      setTotal(t);
    } catch (e) {
      console.error('Fetch users error', e);
      if (e.response?.status === 403) {
        if (!hasShownForbiddenRef.current) {
          hasShownForbiddenRef.current = true;
          showError('You do not have permission to manage users');
        }
        navigate('/admin');
      } else {
        showError(e.response?.data?.message || 'Failed to fetch users');
      }
    } finally {
      setLoading(false);
    }
  }, [q, status, activeOnly, dateFrom, dateTo, page, limit, showError, navigate]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const resetFilters = () => {
    setQ('');
    setStatus('');
    setActiveOnly(false);
    setDateFrom('');
    setDateTo('');
    setPage(1);
    setSelectedUsers([]);
  };

  const removeFilter = (filterKey) => {
    switch (filterKey) {
      case 'search':
        setQ('');
        break;
      case 'status':
        setStatus('');
        break;
      case 'active':
        setActiveOnly(false);
        break;
      case 'date':
        setDateFrom('');
        setDateTo('');
        break;
    }
    setPage(1);
  };

  const exportToCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (status) params.append('status', status);
      if (activeOnly) params.append('active', 'true');
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      params.append('export', 'csv');

      const res = await api.get(`/api/admin/accounts/users?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showSuccess('CSV export completed');
    } catch (e) {
      showError('Failed to export CSV');
    }
  };

  const handleJumpToPage = () => {
    const pageNum = parseInt(jumpToPage);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setPage(pageNum);
      setJumpToPage('');
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        document.querySelector('input[placeholder*="Search"]')?.focus();
      }
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowCreate(true);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // ConfirmGate controller for critical actions
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: '',
    cautions: [],
    onConfirm: null,
  });
 
  const openConfirm = ({ title, cautions, onConfirm }) => {
    setConfirmState({ open: true, title, cautions, onConfirm });
  };
  const closeConfirm = () => setConfirmState((s) => ({ ...s, open: false }));
 
  // Create a user (requires ConfirmGate)
  const submitCreate = async (e) => {
    e.preventDefault();
    // Basic validation
    if (!createForm.name || !createForm.email || !createForm.password || !createForm.dob || !createForm.phone || !createForm.city) {
      showError('All fields are required');
      return;
    }
    openConfirm({
      title: 'Create new user account',
      cautions: [
        'I understand a real user account will be created and can access the system',
        'I have verified the provided email and phone belong to the intended user',
        'I accept responsibility for this action',
      ],
      onConfirm: async (reason) => {
        setCreating(true);
        try {
          await api.post('/api/admin/accounts/users', { ...createForm }, { headers: { 'x-reason': reason } });
          showSuccess('User created successfully');
          setShowCreate(false);
          setCreateForm({ name: '', email: '', password: '', dob: '', phone: '', city: '' });
          fetchUsers();
        } catch (e) {
          console.error('Create user error', e);
          showError(e.response?.data?.message || 'Failed to create user');
        } finally {
          setCreating(false);
        }
        closeConfirm();
      },
    });
  };

  const openStatusModal = (user) => {
    setStatusModal({
      open: true,
      user,
      isActive: user.isActive,
      accountStatus: user.accountStatus || (user.isActive ? 'active' : ''),
    });
  };

  const submitStatusUpdate = async () => {
    if (!statusModal.user) return;
    openConfirm({
      title: 'Update user account status',
      cautions: [
        'I understand this changes the user’s ability to log in or their account state',
        'I have verified this action complies with policy',
      ],
      onConfirm: async (reason) => {
        setUpdatingStatus(true);
        try {
          const payload = {};
          if (typeof statusModal.isActive === 'boolean') payload.isActive = statusModal.isActive;
          if (statusModal.accountStatus) payload.accountStatus = statusModal.accountStatus;
          await api.patch(`/api/admin/accounts/users/${statusModal.user._id}/status`, payload, { headers: { 'x-reason': reason } });
          showSuccess('User status updated');
          setStatusModal({ open: false, user: null, isActive: undefined, accountStatus: '' });
          fetchUsers();
        } catch (e) {
          console.error('Update status error', e);
          showError(e.response?.data?.message || 'Failed to update user status');
        } finally {
          setUpdatingStatus(false);
        }
        closeConfirm();
      },
    });
  };

  const deleteUser = async (user) => {
    openConfirm({
      title: `Soft-delete user "${user.name}"`,
      cautions: [
        'This action marks the account as deleted and disables login',
        'This action can impact access to services and notifications',
        'I accept responsibility for performing this action',
      ],
      onConfirm: async (reason) => {
        try {
          await api.delete(`/api/admin/accounts/users/${user._id}`, { headers: { 'x-reason': reason } });
          showSuccess('User deleted (soft)');
          fetchUsers();
        } catch (e) {
          console.error('Delete user error', e);
          showError(e.response?.data?.message || 'Failed to delete user');
        } finally {
          closeConfirm();
        }
      },
    });
  };

  // Loading State with Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-1000"></div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-3">
              <AdminSidebar />
            </div>
            <div className="md:col-span-9 space-y-6">
              {/* Skeleton Header */}
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-8 bg-white/10 rounded-xl w-64 animate-pulse"></div>
                  <div className="h-4 bg-white/10 rounded w-96 animate-pulse"></div>
                </div>
                <div className="flex gap-3">
                  <div className="h-10 bg-white/10 rounded-xl w-32 animate-pulse"></div>
                  <div className="h-10 bg-white/10 rounded-xl w-32 animate-pulse"></div>
                </div>
              </div>

              {/* Skeleton Filters */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-10 bg-white/10 rounded-xl animate-pulse"></div>
                  ))}
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-8 bg-white/10 rounded-full w-24 animate-pulse"></div>
                  ))}
                </div>
              </div>

              {/* Skeleton Table */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden">
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/10 rounded-full animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-white/10 rounded w-1/3 animate-pulse"></div>
                        <div className="h-3 bg-white/10 rounded w-1/2 animate-pulse"></div>
                      </div>
                      <div className="w-20 h-6 bg-white/10 rounded-full animate-pulse"></div>
                      <div className="w-16 h-4 bg-white/10 rounded animate-pulse"></div>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 bg-white/10 rounded animate-pulse"></div>
                        <div className="w-8 h-8 bg-white/10 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-1/3 right-10 w-1 h-1 bg-cyan-400 rounded-full animate-pulse delay-1500"></div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-3">
            <AdminSidebar />
          </div>
          <div className="md:col-span-9 space-y-6">
            {/* Enhanced Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <UserGroupIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-white">User Management</h1>
                    <p className="text-slate-400 text-lg">Manage user access, account statuses, and roles</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold border border-blue-500/30">
                    {total.toLocaleString()} total users
                  </div>
                  <div className="text-xs text-slate-500">
                    Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-xs">/</kbd> to search • <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-xs">N</kbd> to create
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <DocumentArrowDownIcon className="w-5 h-5" />
                  Export CSV
                </motion.button>

                <motion.button
                  onClick={() => setShowCreate(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <UserPlusIcon className="w-5 h-5" />
                  Create User
                </motion.button>
              </div>
            </motion.div>

            {/* Advanced Filters Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FunnelIcon className="w-5 h-5 text-slate-400" />
                  <h3 className="text-lg font-semibold text-white">Filters</h3>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <EllipsisHorizontalIcon className="w-5 h-5" />
                </button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={q}
                          onChange={(e) => setQ(e.target.value)}
                          placeholder="Search users..."
                          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="relative">
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value} className="bg-slate-800 text-white">
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <ChevronRightIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90" />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="px-3 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="From"
                        />
                        <input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="px-3 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="To"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={activeOnly}
                            onChange={(e) => setActiveOnly(e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-white/5 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          Active only
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active Filter Chips */}
              {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {activeFilters.map((filter) => (
                    <FilterChip
                      key={filter.key}
                      label={filter.label}
                      icon={filter.icon}
                      onRemove={() => removeFilter(filter.key)}
                    />
                  ))}
                  <button
                    onClick={resetFilters}
                    className="px-3 py-1 text-slate-400 hover:text-white transition-colors text-sm underline"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </motion.div>

            {/* Enhanced User Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden"
            >
              {/* Table Header */}
              <div className="px-6 py-4 border-b border-white/10">
                <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  <div className="col-span-4">User</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Created</div>
                  <div className="col-span-2">Role</div>
                  <div className="col-span-2">Actions</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-white/10">
                {users.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <UserIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No users found</h3>
                    <p className="text-slate-400">Try adjusting your filters or create a new user.</p>
                  </div>
                ) : (
                  users.map((user, index) => (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="px-6 py-4 hover:bg-white/5 transition-colors group"
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* User Info */}
                        <div className="col-span-4 flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {getInitials(user.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-white font-semibold truncate">{user.name}</div>
                            <div className="text-slate-400 text-sm truncate">
                              {(user.emails && user.emails[0]?.email) || user.email || 'No email'}
                            </div>
                            {user.vaultTag && (
                              <div className="text-slate-500 text-xs">@{user.vaultTag}</div>
                            )}
                          </div>
                        </div>

                        {/* Status */}
                        <div className="col-span-2">
                          <StatusBadge
                            status={user.accountStatus || (user.isActive ? 'active' : 'inactive')}
                            showDescription={true}
                          />
                        </div>

                        {/* Created */}
                        <div className="col-span-2 text-slate-400 text-sm">
                          <div>{getRelativeTime(user.createdAt)}</div>
                          <div className="text-xs opacity-60">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Never'}
                          </div>
                        </div>

                        {/* Role */}
                        <div className="col-span-2">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-500/20 text-slate-300 rounded-full text-xs border border-slate-500/30">
                            <ShieldCheckIcon className="w-3 h-3" />
                            {user.role || 'user'}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="col-span-2 flex items-center gap-2">
                          <motion.button
                            onClick={() => {/* View profile */}}
                            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="View profile"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </motion.button>

                          <motion.button
                            onClick={() => openStatusModal(user)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Update status"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </motion.button>

                          <motion.button
                            onClick={() => deleteUser(user)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Delete user"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-white/10 bg-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-slate-400">
                        Page {page} of {totalPages} • {total.toLocaleString()} users
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">Show:</span>
                        <select
                          value={limit}
                          onChange={(e) => {
                            setLimit(Number(e.target.value));
                            setPage(1);
                          }}
                          className="px-2 py-1 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <motion.button
                        disabled={page <= 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="p-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-white/10 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ChevronLeftIcon className="w-4 h-4" />
                      </motion.button>

                      {/* Page Numbers */}
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                          if (pageNum > totalPages) return null;
                          return (
                            <motion.button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                pageNum === page
                                  ? 'bg-blue-600 text-white'
                                  : 'text-slate-400 hover:text-white hover:bg-white/10'
                              }`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {pageNum}
                            </motion.button>
                          );
                        })}
                      </div>

                      <motion.button
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="p-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-white/10 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ChevronRightIcon className="w-4 h-4" />
                      </motion.button>

                      {/* Jump to Page */}
                      <div className="flex items-center gap-2 ml-4">
                        <span className="text-sm text-slate-400">Go to:</span>
                        <input
                          type="number"
                          value={jumpToPage}
                          onChange={(e) => setJumpToPage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleJumpToPage()}
                          placeholder="Page"
                          min={1}
                          max={totalPages}
                          className="w-16 px-2 py-1 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Enhanced Create User Modal - Stepper Form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowCreate(false);
              setCreateStep(1);
              setCreateForm({ name: '', email: '', password: '', dob: '', phone: '', city: '', role: 'user' });
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-8 py-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Create New User</h2>
                    <p className="text-slate-400 mt-1">Add a new user to the system</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreate(false);
                      setCreateStep(1);
                      setCreateForm({ name: '', email: '', password: '', dob: '', phone: '', city: '', role: 'user' });
                    }}
                    className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Stepper Progress */}
                <div className="flex items-center mt-6">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center">
                      <motion.div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                          step <= createStep
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/10 text-slate-400 border border-white/20'
                        }`}
                        animate={{ scale: step === createStep ? 1.1 : 1 }}
                      >
                        {step}
                      </motion.div>
                      {step < 4 && (
                        <div className={`w-12 h-0.5 mx-2 ${
                          step < createStep ? 'bg-blue-600' : 'bg-white/20'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-400">
                  <span>Basic Info</span>
                  <span>Contact</span>
                  <span>Access</span>
                  <span>Confirm</span>
                </div>
              </div>

              {/* Form Content */}
              <div className="px-8 py-6">
                <AnimatePresence mode="wait">
                  {createStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                          <p className="text-slate-400 text-sm">Enter the user's personal details</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-white">Full Name</label>
                          <input
                            type="text"
                            value={createForm.name}
                            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                            placeholder="John Doe"
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-white">Date of Birth</label>
                          <input
                            type="date"
                            value={createForm.dob}
                            onChange={(e) => setCreateForm({ ...createForm, dob: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-white">City</label>
                          <input
                            type="text"
                            value={createForm.city}
                            onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
                            placeholder="Nairobi"
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-white">Role</label>
                          <select
                            value={createForm.role}
                            onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                          >
                            <option value="user" className="bg-slate-800">Regular User</option>
                            <option value="moderator" className="bg-slate-800">Moderator</option>
                            <option value="admin" className="bg-slate-800">Administrator</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {createStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                          <EnvelopeIcon className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Contact Information</h3>
                          <p className="text-slate-400 text-sm">Provide email and phone for verification</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-white">Email Address</label>
                          <input
                            type="email"
                            value={createForm.email}
                            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                            placeholder="john.doe@example.com"
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                          <p className="text-xs text-slate-400">Used for login and notifications</p>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-white">Phone Number</label>
                          <input
                            type="tel"
                            value={createForm.phone}
                            onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                            placeholder="+254 700 000 000"
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                          <p className="text-xs text-slate-400">For SMS verification and security</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {createStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                          <KeyIcon className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Access Credentials</h3>
                          <p className="text-slate-400 text-sm">Set up secure login credentials</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-white">Password</label>
                          <input
                            type="password"
                            value={createForm.password}
                            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                            placeholder="Enter secure password"
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            minLength={8}
                            required
                          />
                          <div className="flex items-center gap-2 text-xs">
                            <div className={`w-2 h-2 rounded-full ${
                              createForm.password.length >= 8 ? 'bg-green-400' : 'bg-red-400'
                            }`} />
                            <span className={createForm.password.length >= 8 ? 'text-green-400' : 'text-red-400'}>
                              At least 8 characters
                            </span>
                          </div>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                          <div className="flex items-start gap-3">
                            <ShieldCheckIcon className="w-5 h-5 text-blue-400 mt-0.5" />
                            <div>
                              <h4 className="text-sm font-medium text-blue-400">Security Note</h4>
                              <p className="text-xs text-slate-300 mt-1">
                                Password must be at least 8 characters long. User will be prompted to change it on first login.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {createStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                          <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Review & Confirm</h3>
                          <p className="text-slate-400 text-sm">Verify all information before creating the user</p>
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-xl p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs text-slate-400 uppercase tracking-wide">Name</span>
                            <p className="text-white font-medium">{createForm.name}</p>
                          </div>
                          <div>
                            <span className="text-xs text-slate-400 uppercase tracking-wide">Email</span>
                            <p className="text-white font-medium">{createForm.email}</p>
                          </div>
                          <div>
                            <span className="text-xs text-slate-400 uppercase tracking-wide">Phone</span>
                            <p className="text-white font-medium">{createForm.phone}</p>
                          </div>
                          <div>
                            <span className="text-xs text-slate-400 uppercase tracking-wide">Role</span>
                            <p className="text-white font-medium capitalize">{createForm.role}</p>
                          </div>
                          <div>
                            <span className="text-xs text-slate-400 uppercase tracking-wide">City</span>
                            <p className="text-white font-medium">{createForm.city}</p>
                          </div>
                          <div>
                            <span className="text-xs text-slate-400 uppercase tracking-wide">Date of Birth</span>
                            <p className="text-white font-medium">{new Date(createForm.dob).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <ExclamationTriangleIcon className="w-5 h-5 text-amber-400 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-amber-400">Important</h4>
                            <p className="text-xs text-slate-300 mt-1">
                              Creating this user will send verification emails and grant system access. This action will be logged.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="px-8 py-6 border-t border-white/10 bg-white/5">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCreateStep(Math.max(1, createStep - 1))}
                    disabled={createStep === 1}
                    className="px-6 py-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Back
                  </button>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowCreate(false);
                        setCreateStep(1);
                        setCreateForm({ name: '', email: '', password: '', dob: '', phone: '', city: '', role: 'user' });
                      }}
                      className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>

                    {createStep < 4 ? (
                      <motion.button
                        onClick={() => setCreateStep(createStep + 1)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Next
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={submitCreate}
                        disabled={creating}
                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium disabled:opacity-50 transition-colors flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {creating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <SparklesIcon className="w-4 h-4" />
                            Create User
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Update Status Modal */}
      <AnimatePresence>
        {statusModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setStatusModal({ open: false, user: null, isActive: undefined, accountStatus: '' })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-8 py-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Update Account Status</h2>
                    <p className="text-slate-400 mt-1">Modify user access and account state</p>
                  </div>
                  <button
                    onClick={() => setStatusModal({ open: false, user: null, isActive: undefined, accountStatus: '' })}
                    className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* User Info */}
                {statusModal.user && (
                  <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {getInitials(statusModal.user.name)}
                      </div>
                      <div>
                        <div className="text-white font-semibold">{statusModal.user.name}</div>
                        <div className="text-slate-400 text-sm">
                          {(statusModal.user.emails && statusModal.user.emails[0]?.email) || statusModal.user.email}
                        </div>
                      </div>
                      <div className="ml-auto">
                        <StatusBadge
                          status={statusModal.user.accountStatus || (statusModal.user.isActive ? 'active' : 'inactive')}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Content */}
              <div className="px-8 py-6">
                <div className="space-y-6">
                  {/* Active Status Toggle */}
                  <div className="space-y-3">
                    <label className="block text-lg font-semibold text-white">Login Access</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="isActive"
                          checked={statusModal.isActive === true}
                          onChange={() => setStatusModal({ ...statusModal, isActive: true })}
                          className="w-4 h-4 text-blue-600 bg-white/5 border-white/20 focus:ring-blue-500 focus:ring-2"
                        />
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="w-5 h-5 text-green-400" />
                          <span className="text-white font-medium">Enable Login</span>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="isActive"
                          checked={statusModal.isActive === false}
                          onChange={() => setStatusModal({ ...statusModal, isActive: false })}
                          className="w-4 h-4 text-blue-600 bg-white/5 border-white/20 focus:ring-blue-500 focus:ring-2"
                        />
                        <div className="flex items-center gap-2">
                          <XCircleIcon className="w-5 h-5 text-red-400" />
                          <span className="text-white font-medium">Disable Login</span>
                        </div>
                      </label>
                    </div>
                    <p className="text-sm text-slate-400">
                      Controls whether the user can log in to the system
                    </p>
                  </div>

                  {/* Account Status */}
                  <div className="space-y-3">
                    <label className="block text-lg font-semibold text-white">Account Status</label>
                    <div className="grid grid-cols-1 gap-3">
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <label key={key} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="accountStatus"
                            value={key}
                            checked={statusModal.accountStatus === key}
                            onChange={(e) => setStatusModal({ ...statusModal, accountStatus: e.target.value })}
                            className="w-4 h-4 text-blue-600 bg-white/5 border-white/20 focus:ring-blue-500 focus:ring-2"
                          />
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`p-2 rounded-lg ${config.bg}`}>
                              <config.icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <div className="text-white font-medium">{config.label}</div>
                              <div className="text-slate-400 text-sm">{config.description}</div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Visual Preview */}
                  <div className="space-y-3">
                    <label className="block text-lg font-semibold text-white">Preview</label>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="text-sm text-slate-400 mb-2">How the status will appear:</div>
                      <StatusBadge
                        status={statusModal.accountStatus || (statusModal.isActive ? 'active' : 'inactive')}
                      />
                    </div>
                  </div>

                  {/* Audit Note */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheckIcon className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-400">Audit Trail</h4>
                        <p className="text-xs text-slate-300 mt-1">
                          This action will be recorded in the audit log with your admin ID and timestamp.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-6 border-t border-white/10 bg-white/5">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setStatusModal({ open: false, user: null, isActive: undefined, accountStatus: '' })}
                    className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>

                  <motion.button
                    onClick={submitStatusUpdate}
                    disabled={updatingStatus}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium disabled:opacity-50 transition-colors flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {updatingStatus ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <ArrowPathIcon className="w-4 h-4" />
                        Update Status
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ConfirmGate for critical actions */}
      <ConfirmGate
        open={confirmState.open}
        title={confirmState.title}
        cautions={confirmState.cautions}
        onCancel={() => closeConfirm()}
        onConfirm={(reason) => confirmState.onConfirm?.(reason)}
        confirmWord="CONFIRM"
        actionLabel="Proceed"
      />
    </div>
  );
};

export default AdminUserAccounts;