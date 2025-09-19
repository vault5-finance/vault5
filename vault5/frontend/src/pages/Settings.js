import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const Settings = () => {
  const [settings, setSettings] = useState({
    linkedAccounts: [],
    notificationThresholds: { shortfall: 1000, goalProgress: 90, loanDueDays: 3 },
    lendingRules: { nonRepayCap: 3, safePercent: 50 }
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    api.get('/api/settings')
    .then(response => {
      setSettings(response.data);
      setLoading(false);
    })
    .catch(error => {
      console.error('Settings load error:', error);
      if (error.response && error.response.status === 401) navigate('/login');
      setLoading(false);
    });
  }, [navigate]);

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleLinkedAccountsChange = (e) => {
    const accounts = e.target.value.split(',').map(acc => acc.trim()).filter(acc => acc);
    // linkedAccounts is a top-level array, set directly
    setSettings(prev => ({
      ...prev,
      linkedAccounts: accounts
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setUpdating(true);
    api.put('/api/settings', settings)
    .then(response => {
      setSettings(response.data.preferences);
      showSuccess('Settings updated successfully');
      setUpdating(false);
    })
    .catch(error => {
      console.error('Update settings error:', error);
      showError(error.response?.data?.message || 'Error updating settings');
      setUpdating(false);
    });
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">Linked Accounts</h2>
          <input 
            type="text" 
            placeholder="Enter linked accounts (comma separated: M-Pesa, Equity, KCB, Airtel, Co-op, DTB)" 
            value={settings.linkedAccounts.join(', ')} 
            onChange={handleLinkedAccountsChange}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Notification Thresholds</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Shortfall Alert (KES)</label>
              <input 
                type="number" 
                value={settings.notificationThresholds.shortfall} 
                onChange={(e) => handleChange('notificationThresholds', 'shortfall', parseFloat(e.target.value) || 0)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Goal Progress Alert (%)</label>
              <input 
                type="number" 
                value={settings.notificationThresholds.goalProgress} 
                onChange={(e) => handleChange('notificationThresholds', 'goalProgress', parseFloat(e.target.value) || 0)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0" max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Loan Due Alert (days)</label>
              <input 
                type="number" 
                value={settings.notificationThresholds.loanDueDays} 
                onChange={(e) => handleChange('notificationThresholds', 'loanDueDays', parseFloat(e.target.value) || 0)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Lending Rules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Non-Repayable Cap (per month)</label>
              <input 
                type="number" 
                value={settings.lendingRules.nonRepayCap} 
                onChange={(e) => handleChange('lendingRules', 'nonRepayCap', parseInt(e.target.value) || 0)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Safe Lending Percent (%)</label>
              <input 
                type="number" 
                value={settings.lendingRules.safePercent} 
                onChange={(e) => handleChange('lendingRules', 'safePercent', parseFloat(e.target.value) || 0)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0" max="100"
              />
            </div>
          </div>
        </section>

        <button 
          type="submit" 
          disabled={updating}
          className={`w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {updating ? 'Updating...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default Settings;