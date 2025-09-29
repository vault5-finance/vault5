import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  // Deduplicate identical messages within a short time window to prevent infinite spam
  const recentRef = useRef(new Map()); // key -> timestamp

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'error', duration = 5000) => {
    const key = `${type}:${message}`;
    const now = Date.now();
    const ttl = 8000; // 8s dedupe window

    const last = recentRef.current.get(key);
    if (last && now - last < ttl) {
      // Skip duplicate toast within TTL
      return null;
    }
    recentRef.current.set(key, now);

    const id = now + Math.random();
    const toast = { id, message, type, duration };
    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    // Cleanup dedupe key after TTL
    setTimeout(() => {
      if (recentRef.current.get(key) === now) {
        recentRef.current.delete(key);
      }
    }, ttl + 100);

    return id;
  }, [removeToast]);

  const showError = useCallback((message, duration = 5000) => addToast(message, 'error', duration), [addToast]);
  const showSuccess = useCallback((message, duration = 5000) => addToast(message, 'success', duration), [addToast]);
  const showWarning = useCallback((message, duration = 5000) => addToast(message, 'warning', duration), [addToast]);
  const showInfo = useCallback((message, duration = 5000) => addToast(message, 'info', duration), [addToast]);

  const value = useMemo(() => ({
    showError,
    showSuccess,
    showWarning,
    showInfo,
    removeToast
  }), [showError, showSuccess, showWarning, showInfo, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-0 right-0 z-50 space-y-2 p-4">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
            duration={toast.duration}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};