import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  colorScheme?: 'main' | 'student' | 'admin';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  fullWidth?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// List of directional icons that need RTL support
const directionalIcons = [
  'ArrowLeft',
  'ArrowRight',
  'ChevronLeft',
  'ChevronRight',
  'ArrowLeftCircle',
  'ArrowRightCircle',
  'ArrowLeftSquare',
  'ArrowRightSquare',
  'ArrowLeftFromLine',
  'ArrowRightFromLine',
  'ArrowLeftToLine',
  'ArrowRightToLine',
  'ChevronLeftCircle',
  'ChevronRightCircle',
  'ChevronLeftSquare',
  'ChevronRightSquare',
  'ChevronFirst',
  'ChevronLast',
  'ChevronsLeft',
  'ChevronsRight',
  'ChevronsLeftRight',
  'ChevronsRightLeft',
  'FastForward',
  'Forward',
  'SkipBack',
  'SkipForward',
  'StepBack',
  'StepForward',
];

// Helper function to check if an icon is directional
const isDirectionalIcon = (icon: LucideIcon): boolean => {
  return directionalIcons.includes(icon.displayName || '');
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  colorScheme = 'main',
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  loadingText,
  children,
  className = '',
  disabled,
  fullWidth = false,
  rounded = 'lg',
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center font-medium 
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;

  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };

  const getColorClasses = (colorScheme: string) => {
    const colorPrefix = colorScheme === 'main' ? 'blue' : 'blue';
    return {
      primary: `
        bg-${colorPrefix}-600 
        hover:bg-${colorPrefix}-700 
        text-white 
        shadow-sm 
        hover:shadow-md
        focus:ring-${colorPrefix}-500
      `,
      gradient: `
        bg-${colorPrefix}-600 
        hover:bg-${colorPrefix}-700 
        text-white 
        shadow-sm 
        hover:shadow-md
        focus:ring-${colorPrefix}-500
      `,
      secondary: `
        bg-gray-600 
        hover:bg-gray-700 
        text-white 
        shadow-sm 
        hover:shadow-md
        focus:ring-gray-500
      `,
      outline: `
        border-2 border-gray-300 dark:border-gray-600 
        bg-white dark:bg-gray-800 
        hover:bg-gray-50 dark:hover:bg-gray-700 
        hover:border-${colorPrefix}-500 dark:hover:border-${colorPrefix}-400
        text-gray-700 dark:text-gray-300 
        hover:text-${colorPrefix}-600 dark:hover:text-${colorPrefix}-400
        shadow-sm hover:shadow-md
        focus:ring-${colorPrefix}-500
        focus:border-${colorPrefix}-500 dark:focus:border-${colorPrefix}-400
      `,
      ghost: `
        hover:bg-gray-100 dark:hover:bg-gray-700 
        text-gray-700 dark:text-gray-300 
        hover:text-${colorPrefix}-600 dark:hover:text-${colorPrefix}-400
        focus:ring-gray-500
      `,
      danger: `
        bg-red-600 
        hover:bg-red-700 
        text-white 
        shadow-sm 
        hover:shadow-md
        focus:ring-red-500
      `
    };
  };

  const variants = getColorClasses(colorScheme);

  const sizes = {
    xs: 'px-2 py-1 text-xs gap-1',
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
    xl: 'px-8 py-4 text-lg gap-3'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  // Get icon classes with RTL support for directional icons
  const getIconClasses = (icon: LucideIcon) => {
    const baseIconClasses = `${iconSizes[size]} flex-shrink-0`;
    if (isDirectionalIcon(icon)) {
      return `${baseIconClasses} rtl:rotate-180`;
    }
    return baseIconClasses;
  };

  const LoadingSpinner = ({ size }: { size: string }) => (
    <div className={`${iconSizes[size as keyof typeof iconSizes]} relative`}>
      <div className="absolute inset-0 border-2 border-current border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const buttonContent = (
    <>
      {isLoading ? (
        <LoadingSpinner size={size} />
      ) : Icon && iconPosition === 'left' ? (
        <Icon className={getIconClasses(Icon)} />
      ) : null}
      
      <span className={`${isLoading ? 'opacity-70' : ''}`}>
        {isLoading && loadingText ? loadingText : children}
      </span>
      
      {!isLoading && Icon && iconPosition === 'right' ? (
        <Icon className={getIconClasses(Icon)} />
      ) : null}
    </>
  );

  return (
    <button
      className={`
        ${baseClasses} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${roundedClasses[rounded]}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {buttonContent}
    </button>
  );
};