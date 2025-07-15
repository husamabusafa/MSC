import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastContainer } from '../components/common/Toast';

interface NotificationContextProps {
  showNotification: (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message?: string,
    options?: { duration?: number; autoClose?: boolean }
  ) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const showNotification = useCallback((
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message?: string,
    options?: { duration?: number; autoClose?: boolean }
  ) => {
    const id = generateId();
    const toast: Toast = {
      id,
      type,
      title,
      message,
      duration: options?.duration || 4000,
      autoClose: options?.autoClose !== false,
    };

    setToasts(prev => [...prev, toast]);
  }, []);

  const showSuccess = useCallback((title: string, message?: string) => {
    showNotification('success', title, message);
  }, [showNotification]);

  const showError = useCallback((title: string, message?: string) => {
    showNotification('error', title, message);
  }, [showNotification]);

  const showWarning = useCallback((title: string, message?: string) => {
    showNotification('warning', title, message);
  }, [showNotification]);

  const showInfo = useCallback((title: string, message?: string) => {
    showNotification('info', title, message);
  }, [showNotification]);

  const removeNotification = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const value = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeNotification} />
    </NotificationContext.Provider>
  );
}; 