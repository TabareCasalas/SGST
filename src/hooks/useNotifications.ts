import { useState, useCallback } from 'react';
import { NotificationItem } from '../components/UI/NotificationContainer';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = useCallback((
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string,
    autoClose = true,
    duration = 5000
  ) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const newNotification: NotificationItem = {
      id,
      type,
      title,
      message,
      autoClose,
      duration
    };

    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showSuccess = useCallback((title: string, message: string) => {
    addNotification('success', title, message);
  }, [addNotification]);

  const showError = useCallback((title: string, message: string) => {
    addNotification('error', title, message);
  }, [addNotification]);

  const showWarning = useCallback((title: string, message: string) => {
    addNotification('warning', title, message);
  }, [addNotification]);

  const showInfo = useCallback((title: string, message: string) => {
    addNotification('info', title, message);
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
}; 