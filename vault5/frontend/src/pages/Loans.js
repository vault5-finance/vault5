import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const Loans = () => {
  const { showError, showSuccess } = useToast();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', principal: '', interestRate: 0, repaymentAmount: '', frequency: 'monthly', nextDueDate: '', accountDeduction: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    api.get('/api/loans')
    .then(response => {
      setLoans(response.data);
      setLoading(false);
    })
    .catch(error => {
      console.error('Loans data error:', error);
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
    api.post('/api/loans', form)
    .then(response => {
      setLoans([response.data, ...loans]);
      setShowForm(false);
      setForm({ name: '', principal: '', interestRate: 0, repaymentAmount: '', frequency: 'monthly', nextDueDate: '', accountDeduction: '' });
      showSuccess('Loan created successfully');
    })
    .catch(error => {
      console.error('Create loan error:', error);
      showError(error.response?.data?.message || 'Error creating loan');
    });
  };

  const makeRepayment = (id) => {
    const token = localStorage.getItem('token');
    const amount = prompt('Enter repayment amount:');
    if (!amount || amount <= 0) return;

    api.post(`/api/loans/${id}/repay`, { amount: parseFloat(amount) })
    .then(response => {
      setLoans(loans.map(l => l._id === id ? response.data : l));
      showSuccess('Repayment made successfully');
    })
    .catch(error => {
      console.error('Repayment error:', error);
      showError(error.response?.data?.message || 'Error making repayment');
    });
  };

  if (loading) return <div className="p-8">Loading loans...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Loans</h1>

      <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mb-8">
        {showForm ? 'Cancel' : 'Add New Loan'}
      </button>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Loan</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" 
              name="name" 
              placeholder="Loan Name (e.g., Bolt Car Loan)" 
              value={form.name} 
              onChange={handleChange}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required 
            />
            <input 
              type="number" 
              name="principal" 
              placeholder="Principal Amount" 
              value={form.principal} 
              onChange={handleChange}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required 
            />
            <input 
              type="number" 
              name="interestRate" 
              placeholder="Interest Rate (%)" 
              value={form.interestRate} 
              onChange={handleChange}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input 
              type="number" 
              name="repaymentAmount" 
              placeholder="Repayment Amount" 
              value={form.repaymentAmount} 
              onChange={handleChange}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required 
            />
            <select 
              name="frequency" 
              value={form.frequency} 
              onChange={handleChange}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <input 
              type="date" 
              name="nextDueDate" 
              value={form.nextDueDate} 
              onChange={handleChange}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required 
            />
            <input 
              type="text" 
              name="accountDeduction" 
              placeholder="Account ID for Deduction (optional)" 
              value={form.accountDeduction} 
              onChange={handleChange}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
            />
            <button type="submit" className="md:col-span-2 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600">
              Create Loan
            </button>
          </form>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">My Loans</h2>
        {loans.length > 0 ? (
          <div className="space-y-4">
            {loans.map(loan => (
              <div key={loan._id} className="border p-4 rounded-lg">
                <div className="font-medium">{loan.name}</div>
                <div>Remaining Balance: KES {loan.remainingBalance.toFixed(2)}</div>
                <div>Progress: {loan.progress.toFixed(0)}%</div>
                <div>Next Due: {new Date(loan.nextDueDate).toLocaleDateString()}</div>
                <div>Status: <span className={`capitalize ${loan.status === 'paid' ? 'text-green-600' : loan.status === 'defaulted' ? 'text-red-600' : 'text-yellow-600'}`}>{loan.status}</span></div>
                <button onClick={() => makeRepayment(loan._id)} className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Make Repayment
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No loans found.</p>
        )}
      </div>
    </div>
  );
};

export default Loans;