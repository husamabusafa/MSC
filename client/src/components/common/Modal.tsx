import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  variant?: 'default' | 'glass' | 'centered' | 'bottom' | 'side';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  animation?: 'fade' | 'slide' | 'scale' | 'bounce';
  backdrop?: 'blur' | 'dark' | 'light';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  fullHeight?: boolean;
  className?: string;
  overlayClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  animation = 'scale',
  backdrop = 'blur',
  rounded = 'xl',
  fullHeight = false,
  className = '',
  overlayClassName = '',
  headerClassName = '',
  contentClassName = '',
  footer
}) => {
  const { t } = useI18n();
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      document.body.style.overflow = 'hidden';
      // Small delay to ensure smooth animation
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
      // Keep mounted until animation completes
      setTimeout(() => setIsMounted(false), 300);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isMounted) return null;

  const sizes = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    full: 'max-w-full mx-4'
  };

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl'
  };

  const getBackdropClasses = () => {
    const baseClasses = 'fixed inset-0 transition-all duration-300';
    switch (backdrop) {
      case 'blur':
        return `${baseClasses} bg-gray-900/75 backdrop-blur-sm`;
      case 'dark':
        return `${baseClasses} bg-gray-900/90`;
      case 'light':
        return `${baseClasses} bg-white/80 backdrop-blur-sm`;
      default:
        return `${baseClasses} bg-gray-900/75 backdrop-blur-sm`;
    }
  };

  const getAnimationClasses = () => {
    const baseClasses = 'transition-all duration-300 ease-in-out';
    
    if (!isVisible) {
      switch (animation) {
        case 'fade':
          return `${baseClasses} opacity-0`;
        case 'slide':
          return `${baseClasses} opacity-0 translate-y-8`;
        case 'scale':
          return `${baseClasses} opacity-0 scale-95`;
        case 'bounce':
          return `${baseClasses} opacity-0 scale-50`;
        default:
          return `${baseClasses} opacity-0 scale-95`;
      }
    }
    
    switch (animation) {
      case 'fade':
        return `${baseClasses} opacity-100`;
      case 'slide':
        return `${baseClasses} opacity-100 translate-y-0`;
      case 'scale':
        return `${baseClasses} opacity-100 scale-100`;
      case 'bounce':
        return `${baseClasses} opacity-100 scale-100`;
      default:
        return `${baseClasses} opacity-100 scale-100`;
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'glass':
        return 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-white/20 dark:border-gray-700/30';
      case 'centered':
        return 'bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700';
      case 'bottom':
        return 'bg-white dark:bg-gray-800 shadow-2xl border-t border-gray-200 dark:border-gray-700';
      case 'side':
        return 'bg-white dark:bg-gray-800 shadow-2xl border-l border-gray-200 dark:border-gray-700';
      default:
        return 'bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700';
    }
  };

  const getLayoutClasses = () => {
    switch (variant) {
      case 'bottom':
        return 'fixed bottom-0 left-0 right-0 rounded-t-2xl';
      case 'side':
        return 'fixed top-0 right-0 bottom-0 w-full max-w-md';
      default:
        return `inline-block align-bottom text-left overflow-hidden transform sm:my-8 sm:align-middle sm:w-full ${sizes[size]} ${roundedClasses[rounded]}`;
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };

  const containerClasses = variant === 'bottom' || variant === 'side' 
    ? 'fixed inset-0 z-50'
    : 'fixed inset-0 z-50 overflow-y-auto';

  const contentWrapperClasses = variant === 'bottom' || variant === 'side'
    ? 'flex items-end justify-center min-h-screen'
    : 'flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0';

  return (
    <div className={containerClasses}>
      {/* Backdrop */}
      <div 
        className={`${getBackdropClasses()} ${!isVisible ? 'opacity-0' : 'opacity-100'} ${overlayClassName}`}
        onClick={handleBackdropClick}
      />

      {/* Modal Content */}
      <div className={contentWrapperClasses}>
        <div 
          className={`
            ${getLayoutClasses()}
            ${getVariantClasses()}
            ${getAnimationClasses()}
            ${fullHeight ? 'min-h-[80vh]' : ''}
            ${className}
          `}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className={`
              flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700
              ${headerClassName}
            `}>
              {title && (
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className={`
            px-6 py-4 
            ${fullHeight ? 'flex-1 overflow-y-auto' : ''} 
            ${contentClassName}
          `}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};