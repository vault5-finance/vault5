import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Investments = () => {
  const { showError, showSuccess, showInfo } = useToast();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [form, setForm] = useState({ name: '', type: 'Custom', amount: '', expectedReturn: 0, maturityDate: '', accountSource: '' });
  const navigate = useNavigate();
  const location = useLocation();

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

  // Scroll to in-page anchors when hash is present
  React.useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

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
      showSuccess('Investment created successfully');
    })
    .catch(error => {
      console.error('Create investment error:', error);
      showError(error.response?.data?.message || 'Error creating investment');
    });
  };

  const updateInvestment = (id) => {
    const currentValue = prompt('Enter current value:');
    if (!currentValue || currentValue <= 0) return;

    const token = localStorage.getItem('token');
    api.put(`/api/investments/${id}`, { currentValue: parseFloat(currentValue) })
    .then(response => {
      setInvestments(investments.map(i => i._id === id ? response.data : i));
      showSuccess('Investment updated');
    })
    .catch(error => {
      console.error('Update investment error:', error);
      showError(error.response?.data?.message || 'Error updating investment');
    });
  };

  const deleteInvestment = (id) => {
    if (!window.confirm('Are you sure you want to delete this investment?')) return;

    const token = localStorage.getItem('token');
    api.delete(`/api/investments/${id}`)
    .then(() => {
      setInvestments(investments.filter(i => i._id !== id));
      showSuccess('Investment deleted');
    })
    .catch(error => {
      console.error('Delete investment error:', error);
      showError(error.response?.data?.message || 'Error deleting investment');
    });
  };

  const viewInvestmentDetails = (investment) => {
    setSelectedInvestment(investment);
    // Mock transaction history - in real app, fetch from API
    setTransactionHistory([
      { date: '2025-01-01', type: 'Initial Investment', amount: investment.amount, value: investment.amount },
      { date: '2025-02-01', type: 'Growth', amount: 100, value: investment.amount + 100 },
      { date: '2025-03-01', type: 'Growth', amount: 150, value: investment.amount + 250 },
    ]);
  };

  const closeDetails = () => {
    setSelectedInvestment(null);
    setTransactionHistory([]);
  };

  if (loading) return <div className="p-8">Loading investments...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Investments</h1>
      <section id="groupsavings" className="mt-4 mb-8 p-4 rounded-lg border border-teal-600/30 bg-teal-50">
        <h2 className="text-xl font-semibold mb-2">Group Savings (Chamas)</h2>
        <p className="text-gray-700">
          Create or join pooled savings groups under Investments. Track contributions,
          returns, and payouts with transparency for members.
        </p>
      </section>

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
                  <button onClick={() => viewInvestmentDetails(investment)} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm">
                    View Details
                  </button>
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

      {/* Investment Details Modal */}
      {selectedInvestment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{selectedInvestment.name} Details</h2>
                <button onClick={closeDetails} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Investment Overview</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium">{selectedInvestment.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Initial Amount:</span>
                      <span className="font-medium">KES {selectedInvestment.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Value:</span>
                      <span className="font-medium">KES {selectedInvestment.currentValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Growth:</span>
                      <span className="font-medium text-green-600">KES {selectedInvestment.growth.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Return Rate:</span>
                      <span className="font-medium">{selectedInvestment.returnRate.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Days to Maturity:</span>
                      <span className="font-medium">{selectedInvestment.daysToMaturity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={`font-medium capitalize ${selectedInvestment.status === 'matured' ? 'text-green-600' : 'text-blue-600'}`}>
                        {selectedInvestment.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Growth Chart</h3>
                  <div className="h-64">
                    <Line
                      data={{
                        labels: transactionHistory.map(t => t.date),
                        datasets: [{
                          label: 'Investment Value',
                          data: transactionHistory.map(t => t.value),
                          borderColor: 'rgb(34, 197, 94)',
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          tension: 0.1
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return 'KES ' + value;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Type</th>
                        <th className="px-4 py-2 text-left">Amount</th>
                        <th className="px-4 py-2 text-left">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactionHistory.map((transaction, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-2">{transaction.date}</td>
                          <td className="px-4 py-2">{transaction.type}</td>
                          <td className="px-4 py-2">KES {transaction.amount.toFixed(2)}</td>
                          <td className="px-4 py-2">KES {transaction.value.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Investments;