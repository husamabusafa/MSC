import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { Button } from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'danger',
  loading = false
}) => {
  const { t } = useI18n();

  if (!isOpen) return null;

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <Trash2 className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-blue-500" />;
    }
  };

  const getButtonVariant = () => {
    switch (variant) {
      case 'danger':
        return 'danger';
      case 'warning':
        return 'secondary';
      default:
        return 'primary';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-4">
            <div className="flex items-center space-x-4 rtl:space-x-reverse mb-4">
              <div className="flex-shrink-0">
                {getIcon()}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {message}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              {cancelText || t('common.cancel')}
            </Button>
            <Button
              variant={getButtonVariant()}
              onClick={onConfirm}
              className="flex-1"
              isLoading={loading}
            >
              {confirmText || t('common.confirm')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 