import { useCallback } from 'react';
import { useAppStore } from '../stores/useAppStore';

export const useAppNotifications = () => {
  const { addNotification } = useAppStore();

  const showSuccess = useCallback((title: string, message: string) => {
    addNotification({
      type: 'success',
      title,
      message,
      autoClose: true,
      duration: 5000
    });
  }, [addNotification]);

  const showError = useCallback((title: string, message: string) => {
    addNotification({
      type: 'error',
      title,
      message,
      autoClose: true,
      duration: 7000
    });
  }, [addNotification]);

  const showWarning = useCallback((title: string, message: string) => {
    addNotification({
      type: 'warning',
      title,
      message,
      autoClose: true,
      duration: 6000
    });
  }, [addNotification]);

  const showInfo = useCallback((title: string, message: string) => {
    addNotification({
      type: 'info',
      title,
      message,
      autoClose: true,
      duration: 5000
    });
  }, [addNotification]);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};