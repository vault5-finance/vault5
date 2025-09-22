/**
 * Performance monitoring utilities for Vault5
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.startTime = performance.now();
  }

  // Track component load time
  trackComponentLoad(componentName, startTime) {
    const loadTime = performance.now() - startTime;
    this.recordMetric(`component_load_${componentName}`, loadTime);
    console.log(`Component ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
  }

  // Track API call performance
  trackApiCall(endpoint, startTime, success = true) {
    const duration = performance.now() - startTime;
    const status = success ? 'success' : 'error';
    this.recordMetric(`api_${endpoint}_${status}`, duration);
    console.log(`API ${endpoint} ${status} in ${duration.toFixed(2)}ms`);
  }

  // Track user interactions
  trackUserInteraction(interactionType, duration) {
    this.recordMetric(`interaction_${interactionType}`, duration);
  }

  // Record custom metric
  recordMetric(name, value) {
    this.metrics.set(name, {
      value,
      timestamp: Date.now()
    });

    // Send to analytics service if available
    if (window.gtag) {
      window.gtag('event', 'performance_metric', {
        event_category: 'Performance',
        event_label: name,
        value: Math.round(value)
      });
    }
  }

  // Get performance report
  getReport() {
    const report = {
      totalLoadTime: performance.now() - this.startTime,
      metrics: Object.fromEntries(this.metrics),
      navigation: {
        domContentLoaded: performance.getEntriesByType('navigation')[0]?.domContentLoadedEventEnd,
        loadComplete: performance.getEntriesByType('navigation')[0]?.loadEventEnd
      },
      resources: performance.getEntriesByType('resource').map(entry => ({
        name: entry.name,
        duration: entry.duration,
        size: entry.transferSize
      }))
    };

    return report;
  }

  // Log performance report
  logReport() {
    const report = this.getReport();
    console.group('🚀 Performance Report');
    console.log('Total Load Time:', `${report.totalLoadTime.toFixed(2)}ms`);
    console.log('DOM Content Loaded:', `${report.navigation.domContentLoaded?.toFixed(2)}ms`);
    console.log('Load Complete:', `${report.navigation.loadComplete?.toFixed(2)}ms`);
    console.log('Metrics:', report.metrics);
    console.log('Resources:', report.resources.slice(0, 10)); // Top 10 resources
    console.groupEnd();
  }
}

// Web Vitals tracking
const trackWebVitals = () => {
  // Track Core Web Vitals - fallback if web-vitals not available
  if ('web-vitals' in window) {
    try {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      }).catch(() => {
        console.log('Web Vitals not available, using basic performance metrics');
      });
    } catch (error) {
      console.log('Web Vitals not available, using basic performance metrics');
    }
  }
};

// Resource timing observer
const observeResourceTiming = () => {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 1000) { // Log slow resources (>1s)
          console.warn(`Slow resource: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
  }
};

// Memory usage tracking
const trackMemoryUsage = () => {
  if ('memory' in performance) {
    const memInfo = performance.memory;
    console.log('Memory Usage:', {
      used: `${(memInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      total: `${(memInfo.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      limit: `${(memInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
    });
  }
};

// Initialize performance monitoring
const initializePerformanceMonitoring = () => {
  window.performanceMonitor = new PerformanceMonitor();

  // Track initial load
  window.addEventListener('load', () => {
    setTimeout(() => {
      window.performanceMonitor.logReport();
      trackWebVitals();
      observeResourceTiming();
      trackMemoryUsage();
    }, 1000);
  });

  // Track route changes (if using React Router)
  const trackRouteChange = (path) => {
    window.performanceMonitor.recordMetric('route_change', path);
  };

  // Track errors
  window.addEventListener('error', (event) => {
    window.performanceMonitor.recordMetric('javascript_error', {
      message: event.message,
      filename: event.filename,
      line: event.lineno,
      column: event.colno
    });
  });

  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    window.performanceMonitor.recordMetric('unhandled_promise_rejection', event.reason);
  });

  return {
    trackComponentLoad: window.performanceMonitor.trackComponentLoad.bind(window.performanceMonitor),
    trackApiCall: window.performanceMonitor.trackApiCall.bind(window.performanceMonitor),
    trackUserInteraction: window.performanceMonitor.trackUserInteraction.bind(window.performanceMonitor),
    trackRouteChange
  };
};

export default initializePerformanceMonitoring;
export { PerformanceMonitor };