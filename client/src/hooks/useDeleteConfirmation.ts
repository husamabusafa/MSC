import { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';

export interface DeleteConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  onConfirm: () => Promise<void> | void;
  onSuccess?: (message?: string) => void;
  onError?: (error: any) => void;
  successMessage?: string;
  errorMessage?: string;
}

export const useDeleteConfirmation = () => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConfirmation, setCurrentConfirmation] = useState<DeleteConfirmationOptions | null>(null);
  const { showSuccess, showError } = useNotification();

  const confirmDelete = (options: DeleteConfirmationOptions) => {
    setCurrentConfirmation(options);
    setIsConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!currentConfirmation) return;
    
    setIsLoading(true);
    try {
      await currentConfirmation.onConfirm();
      setIsConfirmOpen(false);
      setCurrentConfirmation(null);
      
      if (currentConfirmation.onSuccess) {
        currentConfirmation.onSuccess(currentConfirmation.successMessage);
      } else {
        showSuccess(currentConfirmation.successMessage || 'Item deleted successfully');
      }
    } catch (error) {
      if (currentConfirmation.onError) {
        currentConfirmation.onError(error);
      } else {
        showError(
          currentConfirmation.errorMessage || 'Failed to delete item',
          error instanceof Error ? error.message : 'An error occurred'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsConfirmOpen(false);
    setCurrentConfirmation(null);
    setIsLoading(false);
  };

  return {
    confirmDelete,
    isConfirmOpen,
    isLoading,
    currentConfirmation,
    handleConfirm,
    handleCancel,
  };
}; 