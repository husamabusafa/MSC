import React, { forwardRef, useState, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  error?: string;
  helperText?: string;
  variant?: 'default' | 'floating' | 'filled' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  success?: boolean;
  loading?: boolean;
  endIcon?: LucideIcon;
  onEndIconClick?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  icon: Icon,
  iconPosition = 'left',
  error,
  helperText,
  variant = 'default',
  size = 'md',
  rounded = 'lg',
  success = false,
  loading = false,
  endIcon: EndIcon,
  onEndIconClick,
  className = '',
  value,
  onChange,
  ...props
}, ref) => {
  const { dir } = useI18n();
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  useEffect(() => {
    setHasValue(Boolean(value) || Boolean(props.defaultValue));
  }, [value, props.defaultValue]);

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-5 py-4 text-base'
  };

  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const getIconPadding = () => {
    if (!Icon) return '';
    
    const paddingMap = {
      sm: 'ps-9',
      md: 'ps-11',
      lg: 'ps-12'
    };

    const endPaddingMap = {
      sm: 'pe-9',
      md: 'pe-11',
      lg: 'pe-12'
    };

    if (iconPosition === 'left') {
      return dir === 'rtl' ? endPaddingMap[size] : paddingMap[size];
    } else {
      return dir === 'rtl' ? paddingMap[size] : endPaddingMap[size];
    }
  };

  const getStateClasses = () => {
    if (error) {
      return 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50 dark:bg-red-900/10';
    }
    if (success) {
      return 'border-green-300 dark:border-green-600 focus:border-green-500 focus:ring-green-500/20 bg-green-50/50 dark:bg-green-900/10';
    }
    return 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 dark:focus:ring-blue-400/20';
  };

  const getVariantClasses = () => {
    const stateClasses = getStateClasses();
    const iconPadding = getIconPadding();
    
    switch (variant) {
      case 'floating':
        return `
          border-2 transition-all duration-200
          bg-white dark:bg-gray-800
          ${stateClasses}
          focus:outline-none focus:ring-4
          hover:border-gray-400 dark:hover:border-gray-500
          ${sizeClasses[size]}
          ${iconPadding}
        `;
      case 'filled':
        return `
          border-0 border-b-2 rounded-none
          bg-gray-100 dark:bg-gray-700
          ${stateClasses}
          focus:outline-none focus:ring-0
          hover:bg-gray-200 dark:hover:bg-gray-600
          transition-all duration-200
          ${sizeClasses[size]}
          ${iconPadding}
        `;
      case 'outline':
        return `
          border-2 bg-transparent
          ${stateClasses}
          focus:outline-none focus:ring-4
          hover:border-gray-400 dark:hover:border-gray-500
          transition-all duration-200
          ${sizeClasses[size]}
          ${iconPadding}
        `;
      default:
        return `
          border transition-all duration-200
          bg-white dark:bg-gray-800
          ${stateClasses}
          focus:outline-none focus:ring-2
          hover:border-gray-400 dark:hover:border-gray-500
          ${sizeClasses[size]}
          ${iconPadding}
        `;
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    props.onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(Boolean(e.target.value));
    onChange?.(e);
  };

  const inputClasses = `
    block w-full text-gray-900 dark:text-white
    placeholder-gray-500 dark:placeholder-gray-400
    disabled:opacity-50 disabled:cursor-not-allowed
    ${getVariantClasses()}
    ${roundedClasses[rounded]}
    ${className}
  `;

  const getLabelClasses = () => {
    if (variant === 'floating') {
      const isFloating = focused || hasValue;
      const startPosition = dir === 'rtl' ? 'right-4' : 'left-4';
      const iconAdjustedPosition = dir === 'rtl' ? 'right-11' : 'left-11';
      
      return `
        absolute ${startPosition} transition-all duration-200 pointer-events-none
        ${isFloating 
          ? 'top-2 text-xs text-blue-600 dark:text-blue-400' 
          : `top-1/2 -translate-y-1/2 text-sm ${error ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`
        }
        ${Icon && iconPosition === 'left' ? iconAdjustedPosition : ''}
      `;
    }
    
    // For non-floating labels, align text based on direction
    const textAlignment = dir === 'rtl' ? 'text-right' : 'text-left';
    return `block text-sm font-medium ${error ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'} mb-2 ${textAlignment}`;
  };

  const getIconClasses = () => {
    if (error) return 'text-red-400';
    if (success) return 'text-green-400';
    if (focused) return 'text-blue-500 dark:text-blue-400';
    return 'text-gray-400 dark:text-gray-500';
  };

  const getIconContainerClasses = (position: 'start' | 'end') => {
    const baseClasses = 'absolute inset-y-0 flex items-center';
    const paddingClasses = position === 'start' ? 'ps-3' : 'pe-3';
    const positionClasses = position === 'start' 
      ? (dir === 'rtl' ? 'right-0' : 'left-0')
      : (dir === 'rtl' ? 'left-0' : 'right-0');
    
    return `${baseClasses} ${positionClasses} ${paddingClasses}`;
  };

  const LoadingSpinner = () => (
    <div className={`${iconSizes[size]} animate-spin border-2 border-current border-t-transparent rounded-full`} />
  );

  const shouldShowStartIcon = Icon && iconPosition === 'left';
  const shouldShowEndIcon = (Icon && iconPosition === 'right') || EndIcon || loading;

  return (
    <div className={`space-y-1 ${variant === 'floating' ? 'relative' : ''}`}>
      {label && variant !== 'floating' && (
        <label className={getLabelClasses()}>
          {label}
        </label>
      )}
      
      <div className="relative">
        {/* Start Icon */}
        {shouldShowStartIcon && (
          <div className={`${getIconContainerClasses('start')} pointer-events-none`}>
            <Icon className={`${iconSizes[size]} ${getIconClasses()}`} />
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          className={inputClasses}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {/* Floating Label */}
        {label && variant === 'floating' && (
          <label className={getLabelClasses()}>
            {label}
          </label>
        )}

        {/* End Icon */}
        {shouldShowEndIcon && (
          <div className={`${getIconContainerClasses('end')} ${onEndIconClick ? 'cursor-pointer' : 'pointer-events-none'}`}>
            {loading ? (
              <LoadingSpinner />
            ) : EndIcon ? (
              <EndIcon 
                className={`${iconSizes[size]} ${getIconClasses()} ${onEndIconClick ? 'hover:text-gray-600 dark:hover:text-gray-300' : ''}`}
                onClick={onEndIconClick}
              />
            ) : Icon && iconPosition === 'right' ? (
              <Icon className={`${iconSizes[size]} ${getIconClasses()}`} />
            ) : null}
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
          {error}
        </p>
      )}

      {/* Success Message */}
      {success && !error && (
        <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
          <span className="w-1 h-1 bg-green-500 rounded-full"></span>
          Success!
        </p>
      )}
      
      {/* Helper Text */}
      {helperText && !error && !success && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';