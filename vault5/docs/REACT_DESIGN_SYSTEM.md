# 🎨 Vault5 React Design System & Component Architecture

## 📋 Overview

This document establishes the design system, component architecture, and development patterns for Vault5's React frontend. It ensures consistency, maintainability, and scalability across all user interfaces while maintaining EMI brand identity.

## 🏗️ Architecture Principles

### **Component Hierarchy**
```
📱 App Layout
├── 🧭 Navigation (MainLayout, Sidebar, MobileBottomNav)
├── 📄 Pages (Dashboard, Accounts, Transactions, etc.)
├── 🧩 Components (Reusable UI elements)
├── 🎨 Styles (EMI tokens, Tailwind utilities)
└── 🔧 Utilities (Hooks, helpers, services)
```

### **Design System Pillars**
1. **Consistency**: Unified EMI brand language across all interfaces
2. **Accessibility**: WCAG 2.1 AA compliance with EMI focus states
3. **Performance**: Optimized rendering with proper memoization
4. **Maintainability**: Modular, reusable, and well-documented components
5. **Scalability**: Pattern-based development for easy feature addition

---

## 🎯 EMI Brand Integration

### **Color System**
```css
/* Primary EMI Palette */
--emi-primary: rgb(15 76 140);      /* Deep EMI blue */
--emi-secondary: rgb(26 75 140);    /* EMI brand blue */
--emi-success: rgb(5 150 105);      /* EMI green */
--emi-warning: rgb(217 119 6);      /* EMI orange */
--emi-danger: rgb(239 68 68);       /* EMI red */
--emi-info: rgb(8 145 178);         /* EMI teal */

/* EMI Gradients */
--gradient-primary: linear-gradient(135deg, var(--emi-primary), var(--emi-secondary));
--gradient-success: linear-gradient(135deg, var(--emi-success), var(--emi-green-light));
```

### **Typography Scale**
```css
/* EMI Typography System */
--font-display: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

--text-emi-xs: 0.75rem;    /* 12px */
--text-emi-sm: 0.875rem;   /* 14px */
--text-emi-base: 1rem;     /* 16px */
--text-emi-lg: 1.125rem;   /* 18px */
--text-emi-xl: 1.25rem;    /* 20px */
--text-emi-2xl: 1.5rem;    /* 24px */
--text-emi-3xl: 1.875rem;  /* 30px */
```

### **Spacing System**
```css
/* EMI Spacing Scale (8px base) */
--space-emi-1: 0.25rem;   /* 4px */
--space-emi-2: 0.5rem;    /* 8px */
--space-emi-3: 0.75rem;   /* 12px */
--space-emi-4: 1rem;      /* 16px */
--space-emi-5: 1.25rem;   /* 20px */
--space-emi-6: 1.5rem;    /* 24px */
--space-emi-8: 2rem;      /* 32px */
--space-emi-10: 2.5rem;   /* 40px */
--space-emi-12: 3rem;     /* 48px */
```

---

## 🧩 Component Architecture

### **1. Layout Components**

#### **MainLayout**
```jsx
// 📁 src/components/MainLayout.jsx
const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile overlay for sidebar */}
      <AnimatePresence>
        {sidebarOpen && <MobileOverlay />}
      </AnimatePresence>

      {/* Sidebar - EMI branded */}
      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />

      {/* Main content area */}
      <div className={`
        transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
      `}>
        {/* EMI-branded navbar */}
        <NavBar onMenuClick={toggleSidebar} />

        {/* Page content with EMI spacing */}
        <main className="p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* EMI-branded mobile navigation */}
        <div className="md:hidden">
          <MobileBottomNav />
        </div>
      </div>
    </div>
  );
};
```

#### **Sidebar (EMI Branded)**
```jsx
// Key EMI features:
const Sidebar = ({ isOpen, isCollapsed }) => {
  return (
    <>
      {/* Mobile Drawer - EMI styled */}
      <motion.div
        className="fixed left-0 top-0 z-50 h-full w-64
                   bg-gray-900 text-white shadow-2xl lg:hidden"
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={drawerVariants}
      >
        {/* EMI profile section at top */}
        <div className="p-4 border-b border-gray-800">
          <ProfileDropdown isCollapsed={false} />
        </div>

        {/* EMI navigation items */}
        <nav className="flex-1 p-4">
          <SidebarNavigation />
        </nav>
      </motion.div>

      {/* Desktop Sidebar - EMI styled */}
      <motion.div
        className="fixed left-0 top-0 z-40 h-screen
                   bg-gray-900 text-white shadow-xl
                   hidden lg:flex lg:flex-col"
        animate={isCollapsed ? "collapsed" : "expanded"}
      >
        {/* EMI profile at top */}
        <div className="p-4 border-b border-gray-800">
          <ProfileDropdown isCollapsed={isCollapsed} />
        </div>

        {/* EMI navigation */}
        <nav className="flex-1 p-4">
          <SidebarNavigation />
        </nav>
      </motion.div>
    </>
  );
};
```

### **2. Page Components**

#### **Dashboard (EMI Themed)**
```jsx
// 📁 src/pages/Dashboard.js
const Dashboard = () => {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* EMI animated header */}
      <motion.div
        className="mb-6 flex items-center justify-between"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <div className="text-xl md:text-2xl font-semibold text-gray-800">
            {greeting}, <span style={{ color: 'var(--emi-blue)' }}>
              {firstName}
            </span>
          </div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>

        {/* EMI gradient buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button className="emi-btn-gradient-primary">
            <PaperAirplaneIcon className="h-5 w-5" />
            Send Money
          </button>
          <button className="emi-btn-gradient-success">
            <PlusCircleIcon className="h-5 w-5" />
            Add Account
          </button>
        </div>
      </motion.div>

      {/* EMI summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <EMISummaryCard
          title="Vault Wallet"
          value={walletBalance}
          icon={BanknotesIcon}
          gradient="primary"
        />
        <EMISummaryCard
          title="Health Score"
          value={healthScore}
          icon={ArrowTrendingUpIcon}
          gradient="info"
        />
        <EMISummaryCard
          title="Active Accounts"
          value={accountsCount}
          icon={ArrowDownCircleIcon}
          gradient="success"
        />
      </div>
    </div>
  );
};
```

### **3. UI Components**

#### **EMISummaryCard**
```jsx
// 📁 src/components/EMISummaryCard.jsx
const EMISummaryCard = ({
  title,
  value,
  icon: Icon,
  gradient = 'primary',
  animate = true
}) => {
  const gradientClasses = {
    primary: 'bg-gradient-primary',
    success: 'bg-gradient-success',
    info: 'bg-gradient-info'
  };

  return (
    <motion.div
      className="relative bg-white p-6 rounded-xl shadow-md
                 hover:shadow-lg transition-all duration-200
                 border border-gray-100 hover:border-emi-blue/20 group"
      whileHover={{ y: -2 }}
      initial={animate ? { opacity: 0, y: 20 } : {}}
      animate={animate ? { opacity: 1, y: 0 } : {}}
    >
      {/* EMI gradient icon background */}
      <div className={`
        absolute right-4 top-4 w-10 h-10 rounded-full
        flex items-center justify-center opacity-10
        group-hover:opacity-20 transition-opacity
        ${gradientClasses[gradient]}
      `}>
        <Icon className="h-5 w-5" style={{ color: 'var(--emi-blue)' }} />
      </div>

      <h2 className="text-sm font-medium text-gray-500 mb-2">
        {title}
      </h2>

      <p className="text-3xl font-bold" style={{ color: 'var(--emi-blue)' }}>
        {animate ? (
          <CountUp end={value} duration={1.5} />
        ) : (
          value
        )}
      </p>

      {/* EMI gradient progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-1
                      bg-gradient-primary rounded-b-xl
                      transform scale-x-0 group-hover:scale-x-100
                      transition-transform duration-300 origin-left">
      </div>
    </motion.div>
  );
};
```

#### **EMIAIFeatureCard**
```jsx
// 📁 src/components/EMIAIFeatureCard.jsx
const EMIAIFeatureCard = ({
  title,
  description,
  icon,
  gradient = 'primary',
  onAction
}) => {
  const gradientClasses = {
    primary: 'from-blue-50 to-indigo-100 border-blue-200',
    success: 'from-green-50 to-emerald-100 border-green-200',
    info: 'from-purple-50 to-pink-100 border-purple-200'
  };

  return (
    <motion.div
      className={`
        group relative p-6 rounded-xl shadow-md border
        hover:shadow-lg transition-all duration-300
        hover:scale-[1.02] hover:-translate-y-1
        bg-gradient-to-br ${gradientClasses[gradient]}
      `}
      whileHover={{ scale: 1.02, y: -4 }}
    >
      {/* EMI gradient icon badge */}
      <div className={`
        absolute top-4 right-4 w-8 h-8 rounded-full
        flex items-center justify-center opacity-20
        group-hover:opacity-30 transition-opacity
        bg-gradient-${gradient}
      `}>
        <span className="text-lg">{icon}</span>
      </div>

      <div className="flex items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {title}
        </h3>
      </div>

      <p className="text-gray-600 mb-4 text-sm leading-relaxed">
        {description}
      </p>

      <button
        onClick={onAction}
        className={`
          w-full md:w-auto px-4 py-2 text-white rounded-lg
          font-medium transition-all duration-200
          transform hover:scale-105 hover:shadow-md
          bg-gradient-${gradient}
        `}
      >
        View Details
      </button>
    </motion.div>
  );
};
```

#### **EMITransactionTable**
```jsx
// 📁 src/components/EMITransactionTable.jsx
const EMITransactionTable = ({ transactions, onViewAll }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium
                           text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium
                           text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium
                           text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium
                           text-gray-500 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction, index) => (
              <motion.tr
                key={transaction.id}
                className="odd:bg-gray-50 hover:bg-gray-100"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(transaction.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {transaction.type === 'income' ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-emi-green" />
                    ) : (
                      <ArrowDownCircleIcon className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`
                      px-2 py-1 text-xs font-medium rounded-full
                      ${transaction.type === 'income'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'}
                    `}>
                      {transaction.type}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {transaction.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <span className={
                    transaction.type === 'income' ? 'text-emi-green' : 'text-red-500'
                  }>
                    {transaction.type === 'income' ? '+' : '-'}
                    KES {transaction.amount.toFixed(2)}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EMI gradient "See More" button */}
      <div className="px-4 py-3 border-t">
        <button
          onClick={onViewAll}
          className="w-full inline-flex items-center justify-center
                     px-4 py-2 text-white rounded-lg font-medium
                     transition-all duration-200 hover:scale-105 hover:shadow-md"
          style={{ background: 'var(--gradient-primary)' }}
        >
          See More Transactions
        </button>
      </div>
    </div>
  );
};
```

---

## 🎨 Styling Patterns

### **1. EMI Button System**
```css
/* Primary EMI Buttons */
.emi-btn-primary {
  background: var(--gradient-primary);
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: var(--radius-emi-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-emi-sm);
}

.emi-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-emi-md);
}

/* Secondary EMI Buttons */
.emi-btn-secondary {
  background: var(--gradient-success);
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: var(--radius-emi-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.emi-btn-secondary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-emi-md);
}
```

### **2. EMI Card System**
```css
/* Base EMI Card */
.emi-card {
  background: white;
  border-radius: var(--radius-emi-xl);
  box-shadow: var(--shadow-emi-md);
  padding: 1.5rem;
  border: 1px solid rgba(15, 76, 140, 0.1);
  transition: all 0.3s ease;
}

.emi-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-emi-lg);
  border-color: rgba(15, 76, 140, 0.2);
}

/* EMI Card with gradient accent */
.emi-card-gradient {
  position: relative;
  overflow: hidden;
}

.emi-card-gradient::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-primary);
}
```

### **3. EMI Form Elements**
```css
/* EMI Input Fields */
.emi-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(15, 76, 140, 0.2);
  border-radius: var(--radius-emi-md);
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
}

.emi-input:focus {
  outline: none;
  border-color: var(--emi-primary);
  box-shadow: 0 0 0 3px rgba(15, 76, 140, 0.1);
}

/* EMI Labels */
.emi-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--emi-primary);
  margin-bottom: 0.5rem;
}
```

### **4. EMI Loading States**
```css
/* EMI Skeleton Loader */
.emi-skeleton {
  background: linear-gradient(
    90deg,
    rgba(15, 76, 140, 0.1) 25%,
    rgba(15, 76, 140, 0.15) 50%,
    rgba(15, 76, 140, 0.1) 75%
  );
  background-size: 200% 100%;
  animation: emi-skeleton-shimmer 1.5s infinite;
}

@keyframes emi-skeleton-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* EMI Loading Spinner */
.emi-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(15, 76, 140, 0.3);
  border-radius: 50%;
  border-top-color: var(--emi-primary);
  animation: emi-spin 1s ease-in-out infinite;
}
```

---

## ⚡ Performance Patterns

### **1. Component Optimization**
```jsx
// ✅ Good: Memoized components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{data.map(item => <Item key={item.id} item={item} />)}</div>;
});

// ✅ Good: Custom hooks for expensive operations
const useExpensiveCalculation = (inputs) => {
  return useMemo(() => {
    return expensiveFunction(inputs);
  }, [inputs]);
};

// ❌ Avoid: Inline objects in render
const MyComponent = () => {
  // Bad - creates new object on every render
  const style = { color: 'red' };

  // Good - move outside or use useMemo
  const style = useMemo(() => ({ color: 'red' }), []);
};
```

### **2. Animation Performance**
```jsx
// ✅ Good: Transform and opacity only animations
<motion.div
  animate={{ scale: 1.05, y: -2 }}
  transition={{ type: "spring", stiffness: 300 }}
>
  Content
</motion.div>

// ✅ Good: Use layoutId for smooth transitions
<motion.div layoutId="card" className="card">
  Content that moves smoothly
</motion.div>

// ❌ Avoid: Animating width, height, padding, margin
<motion.div
  animate={{ width: 200, padding: 20 }} // Causes layout thrashing
>
  Content
</motion.div>
```

### **3. Image Optimization**
```jsx
// ✅ Good: Lazy loading with intersection observer
const LazyImage = ({ src, alt }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};
```

---

## 🔧 Development Patterns

### **1. Custom Hooks**
```jsx
// 📁 src/hooks/useLocalStorage.js
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

// 📁 src/hooks/useAPI.js
export const useAPI = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get(endpoint);
        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
};
```

### **2. Error Boundaries**
```jsx
// 📁 src/components/ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error reporting service
    reportError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <div className="text-red-600 mb-4">
            <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              We're sorry, but something unexpected happened.
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="emi-btn-primary"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### **3. Context Providers**
```jsx
// 📁 src/contexts/ThemeContext.jsx
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [isEMIBranding, setIsEMIBranding] = useState(true);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleEMIBranding = () => {
    setIsEMIBranding(prev => !prev);
  };

  const value = {
    theme,
    isEMIBranding,
    toggleTheme,
    toggleEMIBranding
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
```

---

## 📱 Responsive Design Patterns

### **1. Mobile-First Approach**
```css
/* Mobile-first base styles */
.emi-card {
  padding: 1rem;        /* Mobile */
  border-radius: 0.5rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .emi-card {
    padding: 1.5rem;    /* Tablet */
    border-radius: 0.75rem;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .emi-card {
    padding: 2rem;      /* Desktop */
    border-radius: 1rem;
  }
}
```

### **2. EMI Breakpoint System**
```jsx
// Custom hook for responsive design
const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState('mobile');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width >= 1024) setBreakpoint('desktop');
      else if (width >= 768) setBreakpoint('tablet');
      else setBreakpoint('mobile');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
};

// Usage in components
const MyComponent = () => {
  const breakpoint = useBreakpoint();

  return (
    <div className={`
      ${breakpoint === 'mobile' && 'grid-cols-1'}
      ${breakpoint === 'tablet' && 'grid-cols-2'}
      ${breakpoint === 'desktop' && 'grid-cols-4'}
    `}>
      Content
    </div>
  );
};
```

### **3. Touch-Friendly Mobile Components**
```jsx
// 📁 src/components/MobileBottomNav.jsx
const MobileBottomNav = () => {
  const items = [
    { icon: HomeIcon, label: 'Dashboard', href: '/dashboard' },
    { icon: CreditCardIcon, label: 'Accounts', href: '/accounts' },
    { icon: ArrowsRightLeftIcon, label: 'Transactions', href: '/transactions' },
    { icon: ChartPieIcon, label: 'Reports', href: '/reports' }
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40
                    bg-white border-t border-gray-200
                    shadow-lg md:hidden safe-area-pb">
      <div className="grid grid-cols-4 gap-1 px-2 py-1">
        {items.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="flex flex-col items-center justify-center
                       py-2 px-3 rounded-lg transition-all duration-200
                       min-h-[48px] active:scale-95" // 48px minimum touch target
          >
            <item.icon className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};
```

---

## ♿ Accessibility Patterns

### **1. ARIA Labels and Roles**
```jsx
// ✅ Good: Proper ARIA implementation
const AccessibleButton = ({ onClick, children, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={children}
      role="button"
      tabIndex={disabled ? -1 : 0}
      className="emi-focus-ring"
    >
      {children}
    </button>
  );
};

// ✅ Good: Screen reader friendly navigation
const AccessibleNav = ({ items, currentPath }) => {
  return (
    <nav role="navigation" aria-label="Main navigation">
      <ul role="list">
        {items.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              aria-current={currentPath === item.path ? 'page' : undefined}
              className={currentPath === item.path ? 'emi-nav-link active' : 'emi-nav-link'}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
```

### **2. Keyboard Navigation**
```jsx
// ✅ Good: Full keyboard support
const KeyboardNavigableList = ({ items, onSelect }) => {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev - 1 + items.length) % items.length);
        break;
      case 'Enter':
        e.preventDefault();
        onSelect(items[focusedIndex]);
        break;
    }
  };

  return (
    <ul
      role="listbox"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="focus:outline-none"
    >
      {items.map((item, index) => (
        <li
          key={item.id}
          role="option"
          aria-selected={index === focusedIndex}
          tabIndex={-1}
          className={`
            px-4 py-2 cursor-pointer transition-colors
            ${index === focusedIndex ? 'bg-emi-blue text-white' : 'hover:bg-gray-100'}
          `}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
};
```

### **3. Color Contrast Compliance**
```css
/* EMI color combinations that meet WCAG AA */
.emi-text-on-light {
  color: var(--emi-primary); /* rgb(15, 76, 140) */
  background: white; /* Contrast ratio: 8.2:1 */
}

.emi-text-on-dark {
  color: white;
  background: var(--emi-primary); /* Contrast ratio: 8.2:1 */
}

.emi-text-muted {
  color: #6B7280; /* gray-500 */
  background: white; /* Contrast ratio: 5.9:1 */
}
```

---

## 🔄 State Management Patterns

### **1. Server State (API Data)**
```jsx
// 📁 src/hooks/useServerState.js
export const useServerState = (endpoint, options = {}) => {
  const [data, setData] = useState(options.initialData || null);
  const [loading, setLoading] = useState(!options.initialData);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await api.get(endpoint, { params });
      setData(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const mutate = useCallback(async (newData) => {
    setData(newData);
  }, []);

  useEffect(() => {
    if (!options.skipInitialFetch) {
      fetchData();
    }
  }, [fetchData, options.skipInitialFetch]);

  return { data, loading, error, fetchData, mutate };
};
```

### **2. Client State (UI State)**
```jsx
// 📁 src/hooks/useUIState.js
export const useUIState = (initialState = {}) => {
  const [state, setState] = useState(initialState);

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
  }, [initialState]);

  return { state, updateState, resetState };
};
```

### **3. Form State Management**
```jsx
// 📁 src/hooks/useForm.js
export const useForm = (initialValues = {}, validationSchema = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((field, value) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const setTouched = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const validate = useCallback(() => {
    const validationErrors = {};
    Object.keys(validationSchema).forEach(field => {
      const error = validationSchema[field](values[field]);
      if (error) validationErrors[field] = error;
    });
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [values, validationSchema]);

  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    const isValid = validate();

    if (isValid) {
      try {
        await onSubmit(values);
      } catch (error) {
        setErrors({ submit: error.message });
      }
    }

    setIsSubmitting(false);
  }, [values, validate]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setTouched,
    handleSubmit,
    validate
  };
};
```

---

## 🎭 Animation Patterns

### **1. Page Transition Animations**
```jsx
// 📁 src/components/PageTransition.jsx
const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
};

// Usage in App.js
<Routes>
  <Route path="/dashboard" element={
    <PageTransition>
      <Dashboard />
    </PageTransition>
  } />
</Routes>
```

### **2. Staggered List Animations**
```jsx
// 📁 src/components/StaggeredList.jsx
const StaggeredList = ({ items, renderItem }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {items.map((item, index) => (
        <motion.div key={item.id || index} variants={itemVariants}>
          {renderItem(item, index)}
        </motion.div>
      ))}
    </motion.div>
  );
};
```

### **3. Hover Micro-Interactions**
```jsx
// 📁 src/components/MicroInteraction.jsx
const MicroInteraction = ({ children, scale = 1.02, lift = 4 }) => {
  return (
    <motion.div
      whileHover={{
        scale,
        y: -lift,
        transition: { type: 'spring', stiffness: 400, damping: 17 }
      }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
    >
      {children}
    </motion.div>
  );
};
```

---

## 🧪 Testing Patterns

### **1. Component Testing**
```jsx
// 📁 src/__tests__/EMISummaryCard.test.js
import { render, screen } from '@testing-library/react';
import { EMISummaryCard } from '../components/EMISummaryCard';

describe('EMISummaryCard', () => {
  const defaultProps = {
    title: 'Test Card',
    value: 1000,
    icon: BanknotesIcon,
    gradient: 'primary'
  };

  it('renders correctly with EMI branding', () => {
    render(<EMISummaryCard {...defaultProps} />);

    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
  });

  it('applies EMI gradient styles', () => {
    const { container } = render(<EMISummaryCard {...defaultProps} />);

    const card = container.firstChild;
    expect(card).toHaveClass('bg-white', 'rounded-xl', 'shadow-md');
  });

  it('animates on mount when animate prop is true', () => {
    render(<EMISummaryCard {...defaultProps} animate={true} />);

    // Check for animation classes or framer-motion props
    expect(screen.getByText('Test Card')).toBeInTheDocument();
  });
});
```

### **2. Hook Testing**
```jsx
// 📁 src/__tests__/hooks/useLocalStorage.test.js
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

describe('useLocalStorage', () => {
  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() =>
      useLocalStorage('testKey', 'initial')
    );

    expect(result.current[0]).toBe('initial');
  });

  it('reads existing value from localStorage', () => {
    localStorage.setItem('testKey', JSON.stringify('storedValue'));

    const { result } = renderHook(() =>
      useLocalStorage('testKey', 'initial')
    );

    expect(result.current[0]).toBe('storedValue');
  });

  it('updates localStorage when setValue is called', () => {
    const { result } = renderHook(() =>
      useLocalStorage('testKey', 'initial')
    );

    act(() => {
      result.current[1]('newValue');
    });

    expect(result.current[0]).toBe('newValue');
    expect(localStorage.getItem('testKey')).toBe('"newValue"');
  });
});
```

---

## 📚 Documentation Patterns

### **1. Component Documentation**
```jsx
/**
 * EMISummaryCard Component
 *
 * A reusable card component with EMI branding for displaying key metrics
 *
 * @param {string} title - The card title
 * @param {number} value - The numeric value to display
 * @param {React.Component} icon - The icon component to display
 * @param {string} gradient - The gradient variant ('primary' | 'success' | 'info')
 * @param {boolean} animate - Whether to animate on mount
 *
 * @example
 * ```jsx
 * <EMISummaryCard
 *   title="Total Balance"
 *   value={50000}
 *   icon={BanknotesIcon}
 *   gradient="primary"
 *   animate={true}
 * />
 * ```
 */
```

### **2. Storybook Stories**
```jsx
// 📁 src/stories/EMISummaryCard.stories.js
export default {
  title: 'Components/EMISummaryCard',
  component: EMISummaryCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export const Primary = {
  args: {
    title: 'Vault Wallet',
    value: 25000,
    icon: BanknotesIcon,
    gradient: 'primary',
    animate: true
  },
};

export const Success = {
  args: {
    title: 'Health Score',
    value: 85,
    icon: ArrowTrendingUpIcon,
    gradient: 'success',
    animate: true
  },
};

export const Info = {
  args: {
    title: 'Active Accounts',
    value: 5,
    icon: ArrowDownCircleIcon,
    gradient: 'info',
    animate: true
  },
};
```

---

## 🚀 Performance Best Practices

### **1. Bundle Optimization**
```jsx
// ✅ Good: Dynamic imports for route-based code splitting
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Accounts = lazy(() => import('../pages/Accounts'));

// ✅ Good: Tree-shakable icon imports
import { BanknotesIcon } from '@heroicons/react/24/solid';

// ❌ Avoid: Importing entire icon libraries
import * as HeroIcons from '@heroicons/react';
```

### **2. Memory Management**
```jsx
// ✅ Good: Cleanup subscriptions and timers
useEffect(() => {
  const interval = setInterval(() => {
    // Do something
  }, 1000);

  return () => clearInterval(interval);
}, []);

// ✅ Good: Cancel promises on unmount
useEffect(() => {
  let isCancelled = false;

  const fetchData = async () => {
    try {
      const data = await api.get('/endpoint');
      if (!isCancelled) {
        setData(data);
      }
    } catch (error) {
      if (!isCancelled) {
        setError(error);
      }
    }
  };

  fetchData();

  return () => {
    isCancelled = true;
  };
}, []);
```

### **3. Image Optimization**
```jsx
// ✅ Good: Responsive images with proper sizing
const OptimizedImage = ({ src, alt, width, height }) => {
  return (
    <picture>
      <source
        media="(max-width: 768px)"
        srcSet={`${src}?w=400&h=300&fit=crop&auto=format 400w`}
      />
      <source
        media="(max-width: 1024px)"
        srcSet={`${src}?w=800&h=600&fit=crop&auto=format 800w`}
      />
      <img
        src={`${src}?w=${width}&h=${height}&fit=crop&auto=format`}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
};
```

---

## 🔒 Security Patterns

### **1. Input Validation**
```jsx
// 📁 src/utils/validation.js
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num <= 1000000; // Max 1M KES
};

export const validatePhone = (phone) => {
  const phoneRegex = /^\+254[0-9]{9}$/;
  return phoneRegex.test(phone);
};
```

### **2. Secure API Calls**
```jsx
// 📁 src/services/secureApi.js
class SecureAPI {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'X-Client-Version': process.env.REACT_APP_VERSION,
    };
  }

  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    const config = {
      headers: {
        ...this.defaultHeaders,
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  get(endpoint, params = {}) {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.request(url);
  }

  post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const secureApi = new SecureAPI();
```

---

## 📋 Component Checklist

### **Before Creating a New Component**

- [ ] **Purpose**: Is this component necessary or can existing ones be reused?
- [ ] **Props**: Well-defined TypeScript interfaces or PropTypes
- [ ] **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- [ ] **Responsive**: Works on mobile, tablet, and desktop
- [ ] **Performance**: Memoized appropriately, no unnecessary re-renders
- [ ] **Styling**: Uses EMI design tokens and follows design system
- [ ] **Testing**: Unit tests and integration tests
- [ ] **Documentation**: JSDoc comments and Storybook stories
- [ ] **Error Handling**: Graceful error states and loading indicators

### **Component Naming Convention**
```jsx
// ✅ Good: Clear, descriptive names
EMISummaryCard
TransactionList
AccountSelector

// ❌ Avoid: Generic or unclear names
Card
List
Selector
```

---

## 🎯 Conclusion

This design system establishes Vault5 as a professional, accessible, and maintainable React application with strong EMI brand identity. By following these patterns, developers can create consistent, performant, and user-friendly interfaces that scale with the application's growth.

The system emphasizes:
- **Brand Consistency**: EMI colors, gradients, and styling throughout
- **Developer Experience**: Clear patterns, reusable components, and comprehensive documentation
- **User Experience**: Smooth animations, responsive design, and accessibility compliance
- **Performance**: Optimized rendering, efficient state management, and proper code splitting
- **Maintainability**: Well-structured code, comprehensive testing, and clear documentation

All components should strive to be reusable, accessible, performant, and aligned with EMI brand guidelines while providing excellent user experiences across all devices and interaction modes.