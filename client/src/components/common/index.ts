export { Button } from './Button';
export { Card } from './Card';
export { Input } from './Input';
export { Modal } from './Modal';
export { ConfirmationModal } from './ConfirmationModal';
export { FilterPanel } from './FilterPanel';
export { DynamicFilter } from './DynamicFilter';
export type { FilterField, FilterFieldType } from './DynamicFilter';
export { FileUpload } from './FileUpload';
export { DataTable } from './DataTable';
export { LoadingSpinner } from './LoadingSpinner';
export { AdminLayout } from './AdminLayout';
export { AuthLayout } from './AuthLayout';
export { Layout } from './Layout';
export { StudentLayout } from './StudentLayout';
export { ToastComponent, ToastContainer } from './Toast';
export type { Toast, Toast as ToastType } from './Toast';
export { ProtectedRoute } from './ProtectedRoute';

// Helper function for consistent label styling with RTL support
export const getLabelClasses = (dir: 'ltr' | 'rtl', error?: boolean, additionalClasses?: string) => {
  const textAlignment = dir === 'rtl' ? 'text-right' : 'text-left';
  const baseClasses = `block text-sm font-medium ${error ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'} mb-1 ${textAlignment}`;
  return additionalClasses ? `${baseClasses} ${additionalClasses}` : baseClasses;
}; 