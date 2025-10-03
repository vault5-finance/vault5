# Vault5 Component Library

## Overview

This document catalogs all React components in the Vault5 frontend application, organized by category and functionality. Each component includes usage examples, props documentation, and implementation notes.

## Table of Contents

- [Core Components](#core-components)
- [Form Components](#form-components)
- [Data Display Components](#data-display-components)
- [Feedback Components](#feedback-components)
- [Navigation Components](#navigation-components)
- [Layout Components](#layout-components)
- [Modal Components](#modal-components)
- [Specialized Components](#specialized-components)

## Core Components

### Button Components

#### Primary Button
```jsx
import React from 'react';

const PrimaryButton = ({ children, onClick, disabled, loading }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
  >
    {loading ? 'Loading...' : children}
  </button>
);

export default PrimaryButton;
```

**Props:**
- `children`: Button content
- `onClick`: Click handler function
- `disabled`: Boolean to disable button
- `loading`: Boolean to show loading state

**Usage:**
```jsx
<PrimaryButton onClick={handleSubmit} loading={isSubmitting}>
  Submit Form
</PrimaryButton>
```

#### Secondary Button
```jsx
const SecondaryButton = ({ children, onClick, variant = 'secondary' }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg border ${
      variant === 'outline'
        ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
    }`}
  >
    {children}
  </button>
);
```

### Form Components

#### Password Input with Toggle
```jsx
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput = ({ value, onChange, placeholder }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md pr-10"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2"
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
};
```

**Props:**
- `value`: Input value
- `onChange`: Change handler
- `placeholder`: Placeholder text

#### OTP Verification Modal
```jsx
import React, { useState, useEffect } from 'react';

const OTPVerificationModal = ({ isOpen, onClose, onVerify, phoneNumber }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      await onVerify(otp);
      onClose();
    } catch (error) {
      console.error('OTP verification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Verify Phone Number</h2>
        <p className="text-gray-600 mb-4">
          Enter the 6-digit code sent to {phoneNumber}
        </p>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="000000"
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
          maxLength={6}
        />
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleVerify}
            disabled={loading || otp.length !== 6}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </div>
    </div>
  );
};
```

### Data Display Components

#### Wallet Overview Card
```jsx
import React from 'react';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

const WalletOverview = ({ balance, change, changePercent }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Wallet className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold">Wallet Balance</h3>
      </div>
      <div className={`flex items-center gap-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        <span className="text-sm font-medium">
          {changePercent >= 0 ? '+' : ''}{changePercent}%
        </span>
      </div>
    </div>
    <div className="text-3xl font-bold text-gray-900">
      KES {balance?.toLocaleString() || '0'}
    </div>
  </div>
);
```

**Props:**
- `balance`: Current wallet balance
- `change`: Balance change amount
- `changePercent`: Percentage change

#### Transaction History Table
```jsx
import React from 'react';
import { ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';

const TransactionHistory = ({ transactions }) => {
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'credit':
        return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      case 'debit':
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case 'transfer':
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      default:
        return <RefreshCw className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions?.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getTransactionIcon(transaction.type)}
                    <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                      {transaction.type}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <span className={transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                    {transaction.type === 'credit' ? '+' : '-'}KES {transaction.amount?.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
              </tr>
            )) || (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

### Feedback Components

#### Toast Notification
```jsx
import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [onClose, duration]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${getToastStyles()} border rounded-lg p-4 shadow-lg`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={onClose}
            className="inline-flex text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
```

**Props:**
- `message`: Toast message text
- `type`: Toast type ('success', 'error', 'warning', 'info')
- `onClose`: Function to close the toast
- `duration`: Auto-close duration in milliseconds (0 to disable)

#### Loading Spinner
```jsx
import React from 'react';

const Spinner = ({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    white: 'text-white'
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};
```

### Navigation Components

#### Sidebar Navigation
```jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  Users,
  Settings,
  LogOut
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/transactions', icon: CreditCard, label: 'Transactions' },
    { path: '/accounts', icon: Users, label: 'Accounts' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } transition-transform duration-300 ease-in-out`}>
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-bold text-gray-900">Vault5</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </nav>
    </div>
  );
};
```

#### Mobile Bottom Navigation
```jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, CreditCard, Users, Settings } from 'lucide-react';

const MobileBottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/transactions', icon: CreditCard, label: 'Transactions' },
    { path: '/lending', icon: Users, label: 'Lending' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
```

### Modal Components

#### Send Money Modal
```jsx
import React, { useState } from 'react';
import { X, Search, User } from 'lucide-react';

const SendMoneyModal = ({ isOpen, onClose, onSend }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!recipient || !amount) return;

    setLoading(true);
    try {
      await onSend({ recipient, amount: parseFloat(amount) });
      onClose();
      setRecipient('');
      setAmount('');
    } catch (error) {
      console.error('Send money failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Send Money</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Enter phone number or email"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (KES)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={loading || !recipient || !amount}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Money'}
          </button>
        </div>
      </div>
    </div>
  );
};
```

### Specialized Components

#### Advanced Analytics Dashboard
```jsx
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, Calendar, Download } from 'lucide-react';

const AdvancedAnalyticsDashboard = ({ userId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/analytics/advanced?range=${timeRange}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    // Implementation for data export
    console.log('Exporting analytics data...');
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-300 rounded w-1/4"></div>
        <div className="h-64 bg-gray-300 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
          <p className="text-gray-600">AI-powered insights into your financial patterns</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Cash Flow Forecast */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Cash Flow Forecast</h3>
        <div className="h-64">
          <Line
            data={{
              labels: analytics?.forecast.labels || [],
              datasets: [{
                label: 'Predicted Balance',
                data: analytics?.forecast.values || [],
                borderColor: '#3b82f6',
                backgroundColor: '#3b82f640',
                fill: true
              }]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false }
              }
            }}
          />
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Spending Patterns</h4>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            {analytics?.insights.spendingGrowth || 0}%
          </p>
          <p className="text-sm text-gray-600">Growth in spending</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Savings Rate</h4>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {analytics?.insights.savingsRate || 0}%
          </p>
          <p className="text-sm text-gray-600">Of income saved</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Risk Score</h4>
            <TrendingDown className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            {analytics?.insights.riskScore || 0}/100
          </p>
          <p className="text-sm text-gray-600">Financial risk level</p>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">AI Recommendations</h3>
        <div className="space-y-3">
          {analytics?.recommendations?.map((rec, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">{rec.title}</p>
                <p className="text-sm text-gray-600">{rec.description}</p>
                <p className="text-xs text-blue-600 mt-1">Potential savings: KES {rec.savings}</p>
              </div>
            </div>
          )) || (
            <p className="text-gray-500">No recommendations available</p>
          )}
        </div>
      </div>
    </div>
  );
};
```

#### Loan Card Component
```jsx
import React from 'react';
import { Calendar, DollarSign, User, Clock } from 'lucide-react';

const LoanCard = ({ loan, onViewDetails, onMakePayment }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getDaysRemaining = () => {
    const dueDate = new Date(loan.dueDate);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{loan.borrowerName}</h3>
            <p className="text-sm text-gray-600">Loan #{loan.id}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
          {loan.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-sm text-gray-600">Amount</p>
            <p className="font-semibold">KES {loan.amount?.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-sm text-gray-600">Due Date</p>
            <p className="font-semibold">{new Date(loan.dueDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {getDaysRemaining() > 0
              ? `${getDaysRemaining()} days remaining`
              : `${Math.abs(getDaysRemaining())} days overdue`
            }
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(loan)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            View Details
          </button>
          {loan.status === 'active' && (
            <button
              onClick={() => onMakePayment(loan)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Make Payment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
```

## Component Categories Summary

### Core Components (4)
- PrimaryButton, SecondaryButton, PasswordInput, OTPVerificationModal

### Data Display (3)
- WalletOverview, TransactionHistory, AdvancedAnalyticsDashboard

### Feedback (2)
- Toast, Spinner

### Navigation (2)
- Sidebar, MobileBottomNav

### Modal (1)
- SendMoneyModal

### Specialized (1)
- LoanCard

## Usage Guidelines

### Import Patterns
```jsx
// Individual component imports
import PrimaryButton from '../components/PrimaryButton';
import Toast from '../components/Toast';

// Group imports for related components
import { WalletOverview, TransactionHistory } from '../components';
```

### Props Validation
All components should validate props using PropTypes:
```jsx
import PropTypes from 'prop-types';

PrimaryButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  loading: PropTypes.bool
};
```

### Styling Conventions
- Use Tailwind CSS classes for styling
- Follow BEM methodology for custom classes
- Use CSS custom properties for theming
- Maintain consistent spacing using Tailwind's space scale

### Accessibility
- All interactive elements should have proper ARIA labels
- Keyboard navigation should be supported
- Color contrast should meet WCAG 2.1 AA standards
- Screen reader compatibility is required

### Performance
- Use React.memo for expensive components
- Implement proper key props for list rendering
- Lazy load heavy components when possible
- Optimize re-renders with useCallback and useMemo

---

*Component Library v2.0 - Comprehensive React component catalog for Vault5*