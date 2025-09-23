import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const Notifications = () => {
  const { showError, showSuccess } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchNotifications();
  }, [navigate]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/api/notifications');
      setNotifications(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Notifications fetch error:', error);
      if (error.response?.status === 401) navigate('/login');
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications(notifications.map(n =>
        n._id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      showError('Failed to mark as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
      showSuccess('Notification deleted');
    } catch (error) {
      showError('Failed to delete notification');
    }
  };

  const handleActionClick = (notification) => {
    // Navigate based on notification type
    if (notification.type === 'missed_deposit' && notification.relatedId) {
      navigate(`/accounts`);
    } else if (notification.type === 'surplus_deposit' && notification.relatedId) {
      navigate(`/accounts`);
    } else if (notification.type === 'goal_achievement') {
      navigate(`/goals`);
    } else if (notification.type === 'lending_reminder') {
      navigate(`/lending`);
    } else if (notification.type === 'loan_due') {
      navigate(`/loans`);
    }
  };

  if (loading) return <div className="p-8">Loading notifications...</div>;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Notifications</h1>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No notifications yet</h3>
            <p className="text-sm">You'll see important updates about your financial activities here.</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification._id}
              className={`p-4 rounded-lg shadow border-l-4 ${
                notification.read
                  ? 'bg-gray-50 border-gray-300'
                  : 'bg-blue-50 border-blue-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                    {!notification.read && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-2">{notification.message}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{new Date(notification.createdAt).toLocaleString()}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      notification.severity === 'high' ? 'bg-red-100 text-red-800' :
                      notification.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {notification.severity}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                      Mark Read
                    </button>
                  )}
                  {(notification.type === 'missed_deposit' ||
                    notification.type === 'surplus_deposit' ||
                    notification.type === 'goal_achievement' ||
                    notification.type === 'lending_reminder' ||
                    notification.type === 'loan_due') && (
                    <button
                      onClick={() => handleActionClick(notification)}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                    >
                      View
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;