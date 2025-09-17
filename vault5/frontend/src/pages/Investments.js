import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Custom', amount: '', expectedReturn: 0, maturityDate: '', accountSource: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    api.get('/api/investments')
    .then(response => {
      setInvestments(response.data);
      setLoading(false);
    })
    .catch(error => {
      console.error('Investments data error:', error);
      if (error.response && error.response.status === 401) navigate('/login');
      setLoading(false);
    });
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    api.post('/api/investments', form)
    .then(response => {
      setInvestments([response.data, ...investments]);
      setShowForm(false);
      setForm({ name: '', type: 'Custom', amount: '', expectedReturn: 0, maturityDate: '', accountSource: '' });
      alert('Investment created successfully');
    })
    .catch(error => {
      console.error('Create investment error:', error);
      alert(error.response?.data?.message || 'Error creating investment');
    });
  };

  const updateInvestment = (id) => {
    const currentValue = prompt('Enter current value:');
    if (!currentValue || currentValue <= 0) return;

    const token = localStorage.getItem('token');
    api.put(`/api/investments/${id}`, { currentValue: parseFloat(currentValue) })
    .then(response => {
      setInvestments(investments.map(i => i._id === id ? response.data : i));
      alert('Investment updated');
    })
    .catch(error => {
      console.error('Update investment error:', error);
      alert(error.response?.data?.message || 'Error updating investment');
    });
  };

  const deleteInvestment = (id) => {
    if (!window.confirm('Are you sure you want to delete this investment?')) return;

    const token = localStorage.getItem('token');
    api.delete(`/api/investments/${id}`)
    .then(() => {
      setInvestments(investments.filter(i => i._id !== id));
      alert('Investment deleted');
    })
    .catch(error => {
      console.error('Delete investment error:', error);
      alert(error.response?.data?.message || 'Error deleting investment');
    });
  };

  if (loading) return <div className="p-8">Loading investments...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Investments</h1>

      <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mb-8">
        {showForm ? 'Cancel' : 'Add New Investment'}
      </button>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Investment</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" 
              name="name" 
              placeholder="Investment Name" 
              value={form.name} 
              onChange={handleChange}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required 
            />
            <select 
              name="type" 
              value={form.type} 
              onChange={handleChange}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="T-Bill">T-Bill</option>
              <option value="MMF">MMF</option>
              <option value="Stock">Stock</option>
              <option value="Rental">Rental</option>
              <option value="Custom">Custom</option>
            </select>
            <input 
              type="number" 
              name="amount" 
              placeholder="Amount" 
              value={form.amount} 
              onChange={handleChange}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required 
            />
            <input 
              type="number" 
              name="expectedReturn" 
              placeholder="Expected Return (%)" 
              value={form.expectedReturn} 
              onChange={handleChange}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input 
              type="date" 
              name="maturityDate" 
              value={form.maturityDate} 
              onChange={handleChange}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input 
              type="text" 
              name="accountSource" 
              placeholder="Source Account ID (optional)" 
              value={form.accountSource} 
              onChange={handleChange}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
            />
            <button type="submit" className="md:col-span-2 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600">
              Create Investment
            </button>
          </form>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">My Investments</h2>
        {investments.length > 0 ? (
          <div className="space-y-4">
            {investments.map(investment => (
              <div key={investment._id} className="border p-4 rounded-lg">
                <div className="font-medium">{investment.name}</div>
                <div>Type: {investment.type}</div>
                <div>Initial Amount: KES {investment.amount.toFixed(2)}</div>
                <div>Current Value: KES {investment.currentValue.toFixed(2)}</div>
                <div>Growth: KES {investment.growth.toFixed(2)} ({investment.returnRate.toFixed(2)}%)</div>
                <div>Days to Maturity: {investment.daysToMaturity}</div>
                <div>Status: <span className={`capitalize ${investment.status === 'matured' ? 'text-green-600' : investment.status === 'sold' ? 'text-gray-600' : 'text-blue-600'}`}>{investment.status}</span></div>
                <div className="mt-2 space-x-2">
                  <button onClick={() => updateInvestment(investment._id)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
                    Update Value
                  </button>
                  <button onClick={() => deleteInvestment(investment._id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No investments found. Add your first investment above.</p>
        )}
      </div>
    </div>
  );
};

export default Investments;