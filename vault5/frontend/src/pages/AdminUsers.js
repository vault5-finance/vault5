import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const AdminUsers = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'support_admin',
    department: 'support'
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await api.get('/api/admin');
      setAdmins(response.data.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
      if (error.response?.status === 403) {
        showError('You do not have permission to manage admins');
        navigate('/admin');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/admin', formData);
      showSuccess('Admin created successfully!');
      setShowCreateForm(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'support_admin',
        department: 'support'
      });
      fetchAdmins();
    } catch (error) {
      console.error('Error creating admin:', error);
      showError(error.response?.data?.message || 'Failed to create admin');
    }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/admin/${editingAdmin._id}`, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        isActive: formData.isActive
      });
      showSuccess('Admin updated successfully!');
      setEditingAdmin(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'support_admin',
        department: 'support'
      });
      fetchAdmins();
    } catch (error) {
      console.error('Error updating admin:', error);
      showError(error.response?.data?.message || 'Failed to update admin');
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/api/admin/${adminId}`);
      showSuccess('Admin deleted successfully!');
      fetchAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
      showError(error.response?.data?.message || 'Failed to delete admin');
    }
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.emails?.[0]?.email || '',
      password: '', // Don't populate password for security
      role: admin.role,
      department: admin.department,
      isActive: admin.isActive
    });
  };

  const handleRoleChange = (role) => {
    const departmentMap = {
      system_admin: 'system',
      finance_admin: 'finance',
      compliance_admin: 'compliance',
      support_admin: 'support',
      content_admin: 'content'
    };
    setFormData({
      ...formData,
      role,
      department: departmentMap[role] || 'none'
    });
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      super_admin: 'bg-red-100 text-red-800',
      system_admin: 'bg-blue-100 text-blue-800',
      finance_admin: 'bg-green-100 text-green-800',
      compliance_admin: 'bg-yellow-100 text-yellow-800',
      support_admin: 'bg-purple-100 text-purple-800',
      content_admin: 'bg-indigo-100 text-indigo-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/admin')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create New Admin
            </button>
          </div>
        </div>

        {/* Create/Edit Form Modal */}
        {(showCreateForm || editingAdmin) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6">
                {editingAdmin ? 'Edit Admin' : 'Create New Admin'}
              </h2>
              <form onSubmit={editingAdmin ? handleUpdateAdmin : handleCreateAdmin}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  {!editingAdmin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Password</label>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="system_admin">System Admin</option>
                      <option value="finance_admin">Finance Admin</option>
                      <option value="compliance_admin">Compliance Admin</option>
                      <option value="support_admin">Support Admin</option>
                      <option value="content_admin">Content Admin</option>
                    </select>
                  </div>
                  {editingAdmin && (
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                          className="mr-2"
                        />
                        Active
                      </label>
                    </div>
                  )}
                </div>
                <div className="flex space-x-4 mt-6">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex-1"
                  >
                    {editingAdmin ? 'Update Admin' : 'Create Admin'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingAdmin(null);
                      setFormData({
                        name: '',
                        email: '',
                        password: '',
                        role: 'support_admin',
                        department: 'support'
                      });
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Admins Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                      <div className="text-sm text-gray-500">{admin.emails?.[0]?.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(admin.role)}`}>
                      {admin.role.replace('_', ' ').toUpperCase()}
                    </span>
                    <div className="text-sm text-gray-500 mt-1 capitalize">{admin.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(admin)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    {admin.role !== 'super_admin' && (
                      <button
                        onClick={() => handleDeleteAdmin(admin._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;