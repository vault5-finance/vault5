# AccountsCenter Refactor Plan

## 🧩 1. Component Implementation Strategy

### State Management Architecture
```javascript
// src/contexts/AccountsContext.jsx
import React, { createContext, useContext, useReducer } from 'react';

const AccountsContext = createContext();

const initialState = {
  accounts: [],
  insights: null,
  loading: true,
  error: null
};

function accountsReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'SET_ACCOUNTS': return { ...state, accounts: action.payload };
    case 'UPDATE_ACCOUNT': return {
      ...state,
      accounts: state.accounts.map(acc =>
        acc._id === action.payload._id ? action.payload : acc
      )
    };
    case 'SET_INSIGHTS': return { ...state, insights: action.payload };
    case 'SET_ERROR': return { ...state, error: action.payload, loading: false };
    default: return state;
  }
}

export function AccountsProvider({ children }) {
  const [state, dispatch] = useReducer(accountsReducer, initialState);

  const value = {
    state,
    dispatch,
    updateAccount: (account) => dispatch({ type: 'UPDATE_ACCOUNT', payload: account })
  };

  return (
    <AccountsContext.Provider value={value}>
      {children}
    </AccountsContext.Provider>
  );
}
```

### Component Decomposition
**Header Component**: User greeting, total balance display
```javascript
// src/components/AccountsCenter/Header.jsx
export function Header() {
  const { state } = useAccounts();
  const totalBalance = useMemo(() =>
    state.accounts.reduce((sum, acc) => sum + acc.balance, 0),
    [state.accounts]
  );

  return (
    <header className="backdrop-blur-xl bg-white/80 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Good morning, {user.firstName}!
              </h1>
              <p className="text-gray-600">Welcome to your financial command center</p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">KES {totalBalance.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Balance</div>
          </div>
        </div>
      </div>
    </header>
  );
}
```

**AccountOverview Component**: Progress rings and account balances
**AIInsightsPanel Component**: AI recommendations display
**AccountCards Component**: Individual account management
**AnalyticsPanel Component**: Optional analytics view

## ⚙️ 2. Hook Integration

### useAccounts Hook
```javascript
// src/hooks/useAccounts.js
import { useMemo } from 'react';
import { useAccounts as useAccountsContext } from '../contexts/AccountsContext';

export function useAccounts() {
  const { state, dispatch, updateAccount } = useAccountsContext();

  const orderedAccounts = useMemo(() => {
    const order = ['Daily', 'Fun', 'Emergency', 'LongTerm', 'Investment'];
    return state.accounts
      .filter(a => a.type !== 'Charity')
      .sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
  }, [state.accounts]);

  const totalBalance = useMemo(() =>
    orderedAccounts.reduce((sum, acc) => sum + acc.balance, 0),
    [orderedAccounts]
  );

  return {
    accounts: orderedAccounts,
    totalBalance,
    loading: state.loading,
    error: state.error,
    updateAccount
  };
}
```

### useAccountActions Hook
```javascript
// src/hooks/useAccountActions.js
import { useCallback } from 'react';
import { useToast } from './useToast';
import { accountsService } from '../services/accountsService';
import { ACCOUNT_RULES } from '../config/accountRules';

export function useAccountActions() {
  const { showError, showSuccess } = useToast();

  const validateAction = useCallback((account, actionType) => {
    const rules = ACCOUNT_RULES[account.type];
    const actionKey = `can${actionType.replace(/\s+/g, '')}`;

    if (!rules[actionKey]) {
      showError(`${account.type} account cannot perform ${actionType}`);
      return false;
    }
    return true;
  }, [showError]);

  const executeTransfer = useCallback(async (fromAccount, toAccount, amount) => {
    if (!validateAction(fromAccount, 'Send Internal')) return;

    try {
      await accountsService.transfer(fromAccount._id, toAccount._id, amount);
      showSuccess(`KES ${amount} transferred successfully`);
    } catch (error) {
      showError(error.message);
      throw error;
    }
  }, [validateAction, showSuccess, showError]);

  return { validateAction, executeTransfer };
}
```

### useAIInsights Hook
```javascript
// src/hooks/useAIInsights.js
import { useMemo, useCallback } from 'react';
import { useAccounts } from './useAccounts';
import { insightsService } from '../services/insightsService';

export function useAIInsights() {
  const { accounts } = useAccounts();

  const insights = useMemo(() => {
    const dailyAccount = accounts.find(acc => acc.type === 'Daily');
    if (dailyAccount && dailyAccount.balance > 50000) {
      return {
        type: 'savings',
        title: '💰 Surplus Detected',
        message: `Consider transferring KES ${dailyAccount.balance - 20000} to Long-Term savings`,
        action: 'Optimize Allocation'
      };
    }
    return null;
  }, [accounts]);

  const refreshInsights = useCallback(async () => {
    return insightsService.getInsights(accounts);
  }, [accounts]);

  return { insights, refreshInsights };
}
```

### useAnalytics Hook
```javascript
// src/hooks/useAnalytics.js
import { useState, useCallback } from 'react';
import { useQuery } from 'react-query';
import { analyticsService } from '../services/analyticsService';

export function useAnalytics(accountIds = null) {
  const [scrollPosition, setScrollPosition] = useState(0);

  const { data: analytics, isLoading, error } = useQuery(
    ['analytics', accountIds],
    () => analyticsService.getAnalytics(accountIds),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false
    }
  );

  const saveScrollPosition = useCallback(() => {
    setScrollPosition(window.scrollY);
  }, []);

  return {
    analytics,
    isLoading,
    error,
    saveScrollPosition
  };
}
```

## 🔗 3. Service Layer Patterns

### accountsService Implementation
```javascript
// src/services/accountsService.js
class AccountsService {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  async getAll() {
    const cacheKey = 'accounts-all';

    // Cache check
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 30000) {
        return cached.data;
      }
    }

    // Request deduplication
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    const request = this._fetchAccounts()
      .then(data => {
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
        this.pendingRequests.delete(cacheKey);
        return data;
      });

    this.pendingRequests.set(cacheKey, request);
    return request;
  }

  async transfer(fromAccountId, toAccountId, amount) {
    // Optimistic update
    const originalFrom = await this.getById(fromAccountId);
    const originalTo = await this.getById(toAccountId);

    // Update cache optimistically
    this._updateCache(fromAccountId, { ...originalFrom, balance: originalFrom.balance - amount });
    this._updateCache(toAccountId, { ...originalTo, balance: originalTo.balance + amount });

    try {
      const response = await fetch('/api/accounts/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromAccountId, toAccountId, amount })
      });

      if (!response.ok) throw new Error('Transfer failed');
      return response.json();
    } catch (error) {
      // Rollback on error
      this._updateCache(fromAccountId, originalFrom);
      this._updateCache(toAccountId, originalTo);
      throw error;
    }
  }

  // Batch operations
  async batchUpdate(updates) {
    const results = await Promise.allSettled(
      updates.map(update => this._executeUpdate(update))
    );

    const errors = results.filter(r => r.status === 'rejected');
    if (errors.length) {
      throw new Error(`${errors.length} batch operations failed`);
    }

    return results.map(r => r.value);
  }
}
```

### insightsService Implementation
```javascript
// src/services/insightsService.js
class InsightsService {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000;
  }

  async getInsights(accounts) {
    const cacheKey = this._generateKey(accounts);

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTTL) {
        return cached.data;
      }
    }

    const insights = this._analyzeAccounts(accounts);

    this.cache.set(cacheKey, {
      data: insights,
      timestamp: Date.now()
    });

    return insights;
  }

  _analyzeAccounts(accounts) {
    const insights = [];

    // Spending analysis
    const dailyAccount = accounts.find(acc => acc.type === 'Daily');
    if (dailyAccount && dailyAccount.balance > 50000) {
      insights.push({
        id: 'surplus-daily',
        type: 'savings',
        priority: 7,
        title: '💰 Daily Account Surplus',
        message: 'Consider optimizing your allocation',
        actions: [{ type: 'transfer', label: 'Move to Long-Term' }]
      });
    }

    return insights;
  }
}
```

### validationService Implementation
```javascript
// src/services/validationService.js
import * as yup from 'yup';

class ValidationService {
  constructor() {
    this.schemas = new Map();
    this.rateLimiters = new Map();
    this.initializeSchemas();
  }

  initializeSchemas() {
    this.schemas.set('transfer', yup.object().shape({
      amount: yup.number()
        .positive('Amount must be positive')
        .max(1000000, 'Amount cannot exceed KES 1,000,000'),
      fromAccountId: yup.string().required(),
      toAccountId: yup.string().required()
    }));
  }

  async validate(type, data) {
    const schema = this.schemas.get(type);
    if (!schema) throw new Error(`Unknown schema: ${type}`);

    return schema.validate(data, { abortEarly: false });
  }

  // Rate limiting
  async checkRateLimit(userId, action) {
    const key = `${userId}-${action}`;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    const maxAttempts = 5;

    if (!this.rateLimiters.has(key)) {
      this.rateLimiters.set(key, []);
    }

    const attempts = this.rateLimiters.get(key)
      .filter(timestamp => now - timestamp < windowMs);

    if (attempts.length >= maxAttempts) {
      throw new Error('Rate limit exceeded');
    }

    attempts.push(now);
    this.rateLimiters.set(key, attempts);
  }
}
```

## 🧠 4. AI Insights System

### AIInsightsPanel Component
```javascript
// src/components/AccountsCenter/AIInsightsPanel.jsx
import React, { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useAIInsights } from '../../hooks/useAIInsights';

export function AIInsightsPanel() {
  const { insights, refreshInsights } = useAIInsights();

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = insightsService.subscribe((newInsights) => {
      console.log('New insights:', newInsights);
    });

    return unsubscribe;
  }, []);

  if (!insights) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold">AI Insights</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p>Analyzing your financial patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold">AI Insights</h3>
      </div>

      <div className={`p-4 rounded-xl border-l-4 ${
        insights.type === 'alert' ? 'border-red-500 bg-red-50' :
        insights.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
        'border-green-500 bg-green-50'
      }`}>
        <h4 className="font-semibold mb-2">{insights.title}</h4>
        <p className="text-sm text-gray-700 mb-3">{insights.message}</p>
        <button
          onClick={refreshInsights}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg"
        >
          {insights.action}
        </button>
      </div>
    </div>
  );
}
```

## 🎨 5. UI & Theming

### Dynamic Theme System
```javascript
// src/config/accountThemes.js
export const ACCOUNT_THEMES = {
  Daily: {
    color: 'emerald',
    gradient: 'from-emerald-500 to-green-600',
    cssVariables: {
      '--account-primary': 'rgb(16 185 129)',
      '--account-gradient': 'linear-gradient(135deg, rgb(16 185 129), rgb(5 150 105))'
    }
  },
  Fun: {
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    cssVariables: {
      '--account-primary': 'rgb(245 158 11)',
      '--account-gradient': 'linear-gradient(135deg, rgb(245 158 11), rgb(217 119 6))'
    }
  }
};

export class ThemeManager {
  applyTheme(accountType, element) {
    const theme = ACCOUNT_THEMES[accountType];
    Object.entries(theme.cssVariables).forEach(([property, value]) => {
      element.style.setProperty(property, value);
    });
    element.classList.add(`theme-${theme.color}`);
  }

  switchTheme(oldType, newType, element) {
    this.removeTheme(oldType, element);
    this.applyTheme(newType, element);
  }
}
```

### Real-time Theme Switching
```javascript
// src/components/AccountsCenter/AccountCard.jsx
export function AccountCard({ account, children }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const element = cardRef.current;
    themeManager.applyTheme(account.type, element);

    return () => themeManager.removeTheme(account.type, element);
  }, [account.type]);

  return (
    <div ref={cardRef} className="bg-white/80 backdrop-blur-xl rounded-2xl p-6">
      <div
        className="absolute inset-0 bg-gradient-to-br opacity-5"
        style={{ background: 'var(--account-gradient)' }}
      />
      {children}
    </div>
  );
}
```

## 🧰 6. Analytics Panel

### AnalyticsToggle Component
```javascript
// src/components/AccountsCenter/AnalyticsToggle.jsx
const PERIOD_OPTIONS = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' }
];

export function AnalyticsToggle({ selectedPeriod, onPeriodChange }) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      {PERIOD_OPTIONS.map(option => (
        <button
          key={option.value}
          onClick={() => onPeriodChange(option.value)}
          className={`px-3 py-1 text-sm font-medium rounded-md ${
            selectedPeriod === option.value ? 'bg-white text-purple-700' : 'text-gray-600'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
```

### Lazy Loading Implementation
```javascript
// src/components/AccountsCenter/LazyAnalytics.jsx
import { lazy, Suspense } from 'react';

const WalletAnalyticsLazy = lazy(() => import('../WalletAnalytics'));

export function LazyAnalytics({ analytics, period }) {
  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      <WalletAnalyticsLazy analytics={analytics} period={period} />
    </Suspense>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-gray-200 rounded-lg"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}
```

## 🚀 7. Performance Handling

### React Query Configuration
```javascript
// src/config/reactQuery.js
import { QueryClient } from 'react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 3;
      }
    }
  }
});
```

### Memoized Selectors
```javascript
// src/hooks/useMemoizedSelectors.js
import { useMemo } from 'react';
import { createSelector } from 'reselect';

export function useMemoizedSelectors(accounts) {
  const totalBalance = useMemo(() =>
    accounts.reduce((sum, acc) => sum + acc.balance, 0),
    [accounts]
  );

  const getAccountStats = useMemo(() =>
    createSelector(
      (accounts) => accounts,
      (accounts) => ({
        total: accounts.reduce((sum, acc) => sum + acc.balance, 0),
        average: accounts.length ? totalBalance / accounts.length : 0,
        count: accounts.length
      })
    ),
    []
  );

  const accountStats = useMemo(() => getAccountStats(accounts), [accounts]);

  return { totalBalance, accountStats };
}
```

## 🛡️ 8. Security & Validation

### Token Refresh Interceptor
```javascript
// src/services/api.js
class ApiClient {
  async fetch(url, options = {}) {
    const config = await this.request(options);

    try {
      const response = await fetch(url, config);

      if (response.status === 401 && !config._retry) {
        config._retry = true;
        const newToken = await this.refreshToken();
        config.headers.Authorization = `Bearer ${newToken}`;
        return this.fetch(url, config);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async refreshToken() {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: localStorage.getItem('refreshToken') })
    });

    if (!response.ok) throw new Error('Refresh failed');

    const { token } = await response.json();
    localStorage.setItem('token', token);
    return token;
  }
}
```

## 🧩 9. Extensibility Framework

### FeatureRegistry Class
```javascript
// src/core/FeatureRegistry.js
class FeatureRegistry {
  constructor() {
    this.features = new Map();
    this.hooks = new Map();
  }

  register(feature) {
    const { id, component: Component, hooks = [] } = feature;

    this.features.set(id, { ...feature, enabled: true });

    hooks.forEach(hook => {
      if (!this.hooks.has(hook.name)) {
        this.hooks.set(hook.name, new Map());
      }
      this.hooks.get(hook.name).set(id, hook.handler);
    });
  }

  async executeHook(hookName, context) {
    if (!this.hooks.has(hookName)) return [];

    const results = [];
    for (const [handler] of this.hooks.get(hookName)) {
      results.push(await handler(context));
    }
    return results;
  }

  async mountFeature(featureId, container) {
    const feature = this.features.get(featureId);
    if (!feature) throw new Error('Feature not found');

    const element = document.createElement('div');
    container.appendChild(element);

    const { createRoot } = await import('react-dom/client');
    const root = createRoot(element);

    root.render(React.createElement(feature.component));

    return { root, element };
  }
}
```

### PaymentPreferences Extension
```javascript
// src/extensions/PaymentPreferences.jsx
export function PaymentPreferences() {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-6">Payment Preferences</h3>
      {/* Payment method selection UI */}
    </div>
  );
}

export const paymentPreferencesFeature = {
  id: 'payment-preferences',
  name: 'Payment Preferences',
  component: PaymentPreferences,
  hooks: [{
    name: 'onPaymentMethodChange',
    handler: (context) => console.log('Payment method changed:', context)
  }]
};
```

## 🧠 10. Progressive Enhancement & Fallbacks

### Error Boundary
```javascript
// src/components/ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Something went wrong
            </h3>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Fallback Components
```javascript
// Offline fallback
export function OfflineFallback() {
  return (
    <div className="bg-yellow-100 border-b border-yellow-200 p-4">
      <div className="text-center">
        <p className="text-yellow-800">You're offline. Some features may be limited.</p>
      </div>
    </div>
  );
}

// AI fallback
export function AIFallback() {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6">
      <div className="text-center text-gray-500">
        <p>AI insights temporarily unavailable</p>
        <p className="text-sm mt-2">Basic account management still works</p>
      </div>
    </div>
  );
}
```

---

## Implementation Summary

**Total Lines**: ~800 lines of focused, actionable code examples and explanations.

**Key Features**:
- **Modular Architecture**: Context-based state management
- **Performance Optimized**: Caching, memoization, lazy loading
- **Security First**: Token management, validation, rate limiting
- **Extensible Design**: Plugin system for third-party integrations
- **Resilient UX**: Progressive enhancement with graceful fallbacks

**Benefits**: Maintainable, scalable, testable, and user-friendly financial dashboard.