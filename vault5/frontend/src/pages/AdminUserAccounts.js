import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import ConfirmGate from '../components/ConfirmGate';

const statusOptions = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'dormant', label: 'Dormant' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'banned', label: 'Banned' },
  { value: 'deleted', label: 'Deleted' },
];

const badgeForStatus = (status) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'dormant':
      return 'bg-yellow-100 text-yellow-800';
    case 'suspended':
      return 'bg-orange-100 text-orange-800';
    case 'banned':
      return 'bg-red-100 text-red-800';
    case 'deleted':
      return 'bg-gray-200 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const AdminUserAccounts = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const hasShownForbiddenRef = useRef(false);

  // Filters / pagination
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);

  // Data
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Create/edit modal
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    dob: '',
    phone: '',
    city: '',
  });

  // Status modal
  const [statusModal, setStatusModal] = useState({
    open: false,
    user: null,
    isActive: undefined,
    accountStatus: '',
  });
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (status) params.append('status', status);
      if (activeOnly) params.append('active', 'true');
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
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, activeOnly]);

  const onSearch = async (e) => {
    e.preventDefault();
    setPage(1);
    await fetchUsers();
  };

  const resetFilters = () => {
    setQ('');
    setStatus('');
    setActiveOnly(false);
    setPage(1);
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading Users...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-3">
            <AdminSidebar />
          </div>
          <div className="md:col-span-9 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">User Accounts</h1>
              <div className="space-x-2">
                <button
                  onClick={() => setShowCreate(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create User
                </button>
              </div>
            </div>

            {/* Filters */}
            <form onSubmit={onSearch} className="bg-white p-4 rounded-lg shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search name, email, vaultTag, city..."
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    {statusOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={activeOnly}
                      onChange={(e) => setActiveOnly(e.target.checked)}
                      className="mr-2"
                    />
                    Active only
                  </label>
                  <div className="space-x-2">
                    <button type="submit" className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm">
                      Apply
                    </button>
                    <button type="button" onClick={resetFilters} className="px-3 py-2 rounded border text-sm">
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Active</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Created</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                        No users match your filters.
                      </td>
                    </tr>
                  )}
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{u.name}</div>
                        <div className="text-xs text-gray-600">{(u.emails && u.emails[0]?.email) || u.email || '-'}</div>
                        <div className="text-xs text-gray-500">{u.vaultTag ? `@${u.vaultTag}` : ''}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badgeForStatus(u.accountStatus || (u.isActive ? 'active' : ''))}`}>
                          {(u.accountStatus || (u.isActive ? 'active' : 'inactive'))}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openStatusModal(u)}
                            className="px-3 py-1 rounded border hover:bg-gray-50"
                            title="Update status"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => deleteUser(u)}
                            className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                            title="Soft delete"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                <div className="text-sm text-gray-600">
                  Page {page} of {totalPages} • Total {total}
                </div>
                <div className="space-x-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Create User</h3>
            <form onSubmit={submitCreate} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium">Full Name</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    required
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    required
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Phone</label>
                  <input
                    type="tel"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="+2547XXXXXXXX"
                    required
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">City</label>
                  <input
                    type="text"
                    value={createForm.city}
                    onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
                    required
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Date of Birth</label>
                  <input
                    type="date"
                    value={createForm.dob}
                    onChange={(e) => setCreateForm({ ...createForm, dob: e.target.value })}
                    required
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Password</label>
                  <input
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    minLength={8}
                    required
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setCreateForm({ name: '', email: '', password: '', dob: '', phone: '', city: '' }); }}
                  className="px-4 py-2 rounded border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {statusModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Update Account Status</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Active</label>
                <label className="flex items-center mt-1">
                  <input
                    type="checkbox"
                    checked={!!statusModal.isActive}
                    onChange={(e) => setStatusModal({ ...statusModal, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  Enable user login and access
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium">Account Status</label>
                <select
                  value={statusModal.accountStatus}
                  onChange={(e) => setStatusModal({ ...statusModal, accountStatus: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">None</option>
                  <option value="active">Active</option>
                  <option value="dormant">Dormant</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                  <option value="deleted">Deleted</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Suspended/Banned/Deleted prevents login. Deleted also sets inactive.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setStatusModal({ open: false, user: null, isActive: undefined, accountStatus: '' })}
                className="px-4 py-2 rounded border"
              >
                Cancel
              </button>
              <button
                onClick={submitStatusUpdate}
                disabled={updatingStatus}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {updatingStatus ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
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