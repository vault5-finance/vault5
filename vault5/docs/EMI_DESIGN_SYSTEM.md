# EMI (Enhanced Microfinance Interface) Design System

## Overview

The EMI Design System is Vault5's comprehensive design language and component library that establishes professional fintech-grade visual identity. EMI focuses on trust-building, accessibility, and modern user experience principles.

## Core Principles

### Trust & Professionalism
- **Color Psychology**: Blue and teal tones convey trust and financial stability
- **Typography**: Clean, readable fonts with proper hierarchy
- **Spacing**: Consistent spacing system for visual harmony
- **Animations**: Subtle, purposeful micro-interactions

### Accessibility First
- **WCAG 2.1 AA Compliance**: All components meet accessibility standards
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Minimum 4.5:1 contrast ratio for text

### Mobile-First Design
- **Responsive Grid**: 12-column grid system with mobile breakpoints
- **Touch Targets**: Minimum 44px touch targets for mobile devices
- **Progressive Enhancement**: Core functionality works without JavaScript

## Color Palette

### Primary Colors
```css
--emi-blue: #2563eb;      /* Primary actions, links */
--emi-blue-light: #3b82f6; /* Hover states, secondary actions */
--emi-blue-dark: #1d4ed8;  /* Active states, emphasis */

--emi-teal: #0d9488;      /* Success states, trust indicators */
--emi-teal-light: #14b8a6; /* Accents, highlights */
--emi-teal-dark: #0f766e;  /* Strong success indicators */
```

### Neutral Colors
```css
--emi-gray-50: #f8fafc;   /* Backgrounds, cards */
--emi-gray-100: #f1f5f9;  /* Subtle backgrounds */
--emi-gray-200: #e2e8f0;  /* Borders, dividers */
--emi-gray-300: #cbd5e1;  /* Disabled states */
--emi-gray-400: #94a3b8;  /* Secondary text */
--emi-gray-500: #64748b;  /* Body text */
--emi-gray-600: #475569;  /* Headings */
--emi-gray-700: #334155;  /* Strong text */
--emi-gray-800: #1e293b;  /* Dark backgrounds */
--emi-gray-900: #0f172a;  /* Dark text on light */
```

### Semantic Colors
```css
--emi-success: #10b981;   /* Success states */
--emi-warning: #f59e0b;   /* Warning states */
--emi-error: #ef4444;     /* Error states */
--emi-info: #3b82f6;      /* Info states */
```

## Typography

### Font Families
- **Primary**: Inter (sans-serif) - Clean, modern, highly readable
- **Monospace**: JetBrains Mono - For code, transaction IDs, technical data

### Font Sizes
```css
--emi-text-xs: 0.75rem;   /* 12px - Captions, metadata */
--emi-text-sm: 0.875rem;  /* 14px - Body text, labels */
--emi-text-base: 1rem;    /* 16px - Primary body text */
--emi-text-lg: 1.125rem;  /* 18px - Large body text */
--emi-text-xl: 1.25rem;   /* 20px - Small headings */
--emi-text-2xl: 1.5rem;   /* 24px - Section headings */
--emi-text-3xl: 1.875rem; /* 30px - Page headings */
--emi-text-4xl: 2.25rem;  /* 36px - Hero headings */
```

### Font Weights
```css
--emi-font-light: 300;    /* Light text, subtle elements */
--emi-font-normal: 400;   /* Regular body text */
--emi-font-medium: 500;   /* Emphasized text, labels */
--emi-font-semibold: 600; /* Headings, buttons */
--emi-font-bold: 700;     /* Strong headings, CTAs */
```

## Spacing System

### Spacing Scale
```css
--emi-space-1: 0.25rem;   /* 4px */
--emi-space-2: 0.5rem;    /* 8px */
--emi-space-3: 0.75rem;   /* 12px */
--emi-space-4: 1rem;      /* 16px */
--emi-space-5: 1.25rem;   /* 20px */
--emi-space-6: 1.5rem;    /* 24px */
--emi-space-8: 2rem;      /* 32px */
--emi-space-10: 2.5rem;   /* 40px */
--emi-space-12: 3rem;     /* 48px */
--emi-space-16: 4rem;     /* 64px */
--emi-space-20: 5rem;     /* 80px */
--emi-space-24: 6rem;     /* 96px */
```

## Component Library

### Buttons

#### Primary Button
```jsx
<button className="emi-btn-primary">
  Action Label
</button>
```

#### Secondary Button
```jsx
<button className="emi-btn-secondary">
  Secondary Action
</button>
```

#### Ghost Button
```jsx
<button className="emi-btn-ghost">
  Ghost Action
</button>
```

### Cards

#### Standard Card
```jsx
<div className="emi-card">
  <div className="emi-card-header">
    <h3 className="emi-card-title">Card Title</h3>
    <p className="emi-card-description">Card description</p>
  </div>
  <div className="emi-card-content">
    Card content
  </div>
</div>
```

#### Metric Card
```jsx
<div className="emi-metric-card">
  <div className="emi-metric-header">
    <h4 className="emi-metric-title">Metric Title</h4>
    <div className="emi-metric-icon">
      <Icon className="w-5 h-5" />
    </div>
  </div>
  <div className="emi-metric-value">
    <CountUp end={value} />
    <span className="emi-metric-unit">KES</span>
  </div>
  <div className="emi-metric-trend">
    <SparklineChart data={trendData} />
  </div>
</div>
```

### Form Elements

#### Input Field
```jsx
<div className="emi-form-group">
  <label className="emi-label">Field Label</label>
  <input
    type="text"
    className="emi-input"
    placeholder="Enter value"
  />
  <p className="emi-help-text">Helper text</p>
</div>
```

#### Select Dropdown
```jsx
<div className="emi-form-group">
  <label className="emi-label">Select Option</label>
  <select className="emi-select">
    <option value="">Choose option</option>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
  </select>
</div>
```

### Navigation

#### Bottom Navigation (Mobile)
```jsx
<nav className="emi-bottom-nav">
  <Link to="/dashboard" className="emi-nav-item active">
    <HomeIcon className="w-6 h-6" />
    <span className="emi-nav-label">Dashboard</span>
  </Link>
  <Link to="/transactions" className="emi-nav-item">
    <TransactionIcon className="w-6 h-6" />
    <span className="emi-nav-label">Transactions</span>
  </Link>
  <Link to="/lending" className="emi-nav-item">
    <LendingIcon className="w-6 h-6" />
    <span className="emi-nav-label">Lending</span>
  </Link>
  <Link to="/settings" className="emi-nav-item">
    <SettingsIcon className="w-6 h-6" />
    <span className="emi-nav-label">Settings</span>
  </Link>
</nav>
```

### Animations & Micro-interactions

#### Hover Effects
```css
.emi-hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.emi-hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}
```

#### Loading States
```jsx
<div className="emi-loading-skeleton">
  <div className="emi-skeleton-line w-full h-4 mb-2"></div>
  <div className="emi-skeleton-line w-3/4 h-4 mb-2"></div>
  <div className="emi-skeleton-line w-1/2 h-4"></div>
</div>
```

### Charts & Data Visualization

#### Sparkline Chart
```jsx
<SparklineChart
  data={trendData}
  color="--emi-blue"
  height={40}
/>
```

#### Metric Progress Ring
```jsx
<CircularProgress
  value={85}
  size={80}
  color="--emi-success"
  strokeWidth={6}
/>
```

## Implementation Guidelines

### CSS Custom Properties
All EMI design tokens are implemented as CSS custom properties for easy theming and consistency:

```css
:root {
  /* Colors */
  --emi-blue: #2563eb;
  --emi-teal: #0d9488;
  --emi-gray-50: #f8fafc;
  /* ... more color variables */

  /* Typography */
  --emi-font-family: 'Inter', system-ui, sans-serif;
  --emi-font-size-base: 1rem;
  /* ... more typography variables */

  /* Spacing */
  --emi-space-4: 1rem;
  --emi-space-6: 1.5rem;
  /* ... more spacing variables */

  /* Shadows */
  --emi-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --emi-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --emi-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

  /* Border Radius */
  --emi-radius-sm: 0.25rem;
  --emi-radius-md: 0.375rem;
  --emi-radius-lg: 0.5rem;
  --emi-radius-xl: 0.75rem;
}
```

### Tailwind Integration
EMI design system integrates seamlessly with Tailwind CSS:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        emi: {
          blue: 'var(--emi-blue)',
          teal: 'var(--emi-teal)',
          gray: {
            50: 'var(--emi-gray-50)',
            100: 'var(--emi-gray-100)',
            // ... more grays
          }
        }
      },
      fontFamily: {
        emi: ['Inter', 'system-ui', 'sans-serif']
      },
      spacing: {
        'emi-1': 'var(--emi-space-1)',
        'emi-2': 'var(--emi-space-2)',
        // ... more spacing
      }
    }
  }
}
```

### React Component Patterns

#### Consistent Props Interface
```jsx
const Button = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  ...props
}) => {
  const baseClasses = 'emi-btn';
  const variantClasses = {
    primary: 'emi-btn-primary',
    secondary: 'emi-btn-secondary',
    ghost: 'emi-btn-ghost'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
};
```

#### Accessibility First
```jsx
const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="emi-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="emi-modal">
            <header className="emi-modal-header">
              <h2 id="modal-title" className="emi-modal-title">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="emi-modal-close"
                aria-label="Close modal"
              >
                <XIcon />
              </button>
            </header>
            <div className="emi-modal-content">
              {children}
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
```

## Usage in Development

### Importing EMI Components
```jsx
import { Button, Card, Input } from '../components/emi';
import '../styles/emi-tokens.css';
```

### Applying EMI Classes
```jsx
<div className="emi-card emi-shadow-md">
  <h3 className="emi-text-xl emi-font-semibold emi-text-gray-700">
    Card Title
  </h3>
  <p className="emi-text-sm emi-text-gray-500 emi-mt-2">
    Card description with EMI typography.
  </p>
</div>
```

### Custom Styling with EMI Tokens
```css
.custom-component {
  background-color: var(--emi-gray-50);
  border: 1px solid var(--emi-gray-200);
  border-radius: var(--emi-radius-md);
  padding: var(--emi-space-4);
  color: var(--emi-gray-700);
  font-family: var(--emi-font-family);
}
```

## Maintenance & Updates

### Version Control
- EMI design tokens are versioned alongside component releases
- Breaking changes require migration guides
- New components follow established patterns

### Testing
- Visual regression tests for all EMI components
- Accessibility audits for WCAG compliance
- Cross-browser compatibility testing

### Documentation
- Component API documentation with examples
- Design token reference
- Usage guidelines and best practices

## Future Enhancements

### Planned Features
- **Dark Mode**: Complete dark theme implementation
- **High Contrast Mode**: Enhanced accessibility for visually impaired users
- **Animation Library**: Standardized motion design system
- **Icon System**: Comprehensive icon library with consistent naming
- **Theme Customization**: User-configurable color schemes

### Performance Optimizations
- CSS-in-JS integration for dynamic theming
- Component lazy loading for better bundle splitting
- Optimized animation performance with hardware acceleration

---

*EMI Design System v1.0 - Establishing professional fintech-grade user experiences*