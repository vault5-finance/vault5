import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import AdvancedAnalyticsDashboard from '../components/AdvancedAnalyticsDashboard';
import CashFlowProjection from '../components/CashFlowProjection';
import GamificationDashboard from '../components/GamificationDashboard';

const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    api.get(`/api/reports/cashflow?period=${period}`)
    .then(response => {
      setReport(response.data);
      setLoading(false);
    })
    .catch(error => {
      console.error('Report error:', error);
      if (error.response && error.response.status === 401) navigate('/login');
      setLoading(false);
    });
  }, [period, navigate]);

  // Scroll to in-page anchors when hash is present
  React.useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

  const downloadPDF = () => {
    const base = (api.defaults && api.defaults.baseURL) || '';
    const link = document.createElement('a');
    link.href = `${base}/api/reports/export/pdf?reportType=cashflow&period=${period}`;
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadExcel = () => {
    const base = (api.defaults && api.defaults.baseURL) || '';
    const link = document.createElement('a');
    link.href = `${base}/api/reports/export/excel?reportType=cashflow&period=${period}`;
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-8">Loading reports...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">
          Advanced <span style={{ color: 'var(--emi-blue)' }}>Reports</span>
        </h1>
        <p className="text-gray-600">
          Comprehensive financial analytics and AI-powered insights
        </p>
      </motion.div>

      {/* Advanced Analytics Section */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <AdvancedAnalyticsDashboard />
      </motion.div>

      {/* Traditional Reports Section */}
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="mb-6">
          <label className="mr-4 text-sm font-medium">Report Period:</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emi-blue"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

      {/* Anchored sections for sidebar deep-links */}
      <section id="spending" className="mt-8">
        <h2 className="text-2xl font-semibold mb-3">Spending</h2>
        <p className="text-gray-600">Spending analytics will appear here. Use the period selector above to change scope.</p>
      </section>

      <section id="income" className="mt-10">
        <h2 className="text-2xl font-semibold mb-3">Income</h2>
        <p className="text-gray-600">Income trends and breakdowns will be shown here.</p>
      </section>

      {report && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">{report.period.charAt(0).toUpperCase() + report.period.slice(1)} Cash Flow Report</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">KES {report.income.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Income</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">KES {report.expenses.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Expenses</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">KES {report.netCashFlow.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Net Cash Flow</p>
            </div>
          </div>

          <h3 className="font-semibold mb-2">Missed Deposits</h3>
          {report.missedDeposits.length > 0 ? (
            <ul className="list-disc ml-6 mb-4">
              {report.missedDeposits.map((dep, index) => (
                <li key={index} className="text-red-600">KES {dep.shortfall.toFixed(2)}</li>
              ))}
            </ul>
          ) : (
            <p className="text-green-600 mb-4">No missed deposits.</p>
          )}

          <h3 className="font-semibold mb-2">Surplus History</h3>
          {report.surplusHistory.length > 0 ? (
            <ul className="list-disc ml-6 mb-4">
              {report.surplusHistory.slice(0, 5).map((sur, index) => (
                <li key={index}>KES {sur.amount.toFixed(2)} on {new Date(sur.date).toLocaleDateString()}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 mb-4">No surplus history.</p>
          )}

          <div className="flex space-x-4">
            <button
              onClick={downloadPDF}
              className="px-4 py-2 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-md"
              style={{ background: 'var(--gradient-danger)' }}
            >
              Download PDF
            </button>
            <button
              onClick={downloadExcel}
              className="px-4 py-2 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-md"
              style={{ background: 'var(--gradient-success)' }}
            >
              Download Excel
            </button>
          </div>
        </div>
      )}

      <section id="cashflow" className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Cashflow</h2>
        <CashFlowProjection />
      </section>

      <GamificationDashboard />
      </motion.div>
    </div>
  );
};

export default Reports;