import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import api from '../services/api';

const NotificationsContext = createContext(null);

export const NotificationsProvider = ({ children }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.get('/api/notifications');
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      // silent fail to avoid user disruption
    } finally {
      setLoading(false);
    }
  }, [token]);

  const markAsRead = useCallback(async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => (n._id === id ? { ...n, read: true } : n)));
    } catch (e) {}
  }, []);

  const deleteNotification = useCallback(async (id) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (e) {}
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.put('/api/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {}
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = {
    notifications,
    unreadCount,
    loading,
    refresh,
    markAsRead,
    deleteNotification,
    markAllAsRead,
  };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const useNotifications = () => useContext(NotificationsContext);
export default NotificationsContext;