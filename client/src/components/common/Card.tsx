import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  variant?: 'default' | 'glass' | 'elevated' | 'bordered' | 'gradient';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  interactive?: boolean;
  animateIn?: boolean;
  backdrop?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
  variant = 'default',
  rounded = 'xl',
  shadow = 'sm',
  interactive = false,
  animateIn = false,
  backdrop = false
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl'
  };

  const baseClasses = `
    relative overflow-hidden transition-all duration-300 ease-in-out
    ${interactive ? 'cursor-pointer' : ''}
    ${hover ? 'hover:shadow-lg hover:-translate-y-1' : ''}
    ${animateIn ? 'animate-fade-in' : ''}
  `;

  const variantClasses = {
    default: `
      bg-white dark:bg-gray-800 
      border border-gray-200 dark:border-gray-700
      ${shadowClasses[shadow]}
      ${hover ? 'hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600' : ''}
    `,
    glass: `
      bg-white/70 dark:bg-gray-800/70 
      backdrop-blur-md border border-white/20 dark:border-gray-700/30
      ${shadowClasses[shadow]}
      ${hover ? 'hover:bg-white/80 dark:hover:bg-gray-800/80 hover:shadow-xl' : ''}
      before:absolute before:inset-0 before:rounded-inherit before:bg-gradient-to-br before:from-white/10 before:to-transparent before:pointer-events-none
    `,
    elevated: `
      bg-white dark:bg-gray-800 
      shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50
      border border-gray-100 dark:border-gray-700
      ${hover ? 'hover:shadow-2xl hover:shadow-gray-200/60 dark:hover:shadow-gray-900/60' : ''}
    `,
    bordered: `
      bg-white dark:bg-gray-800 
      border-2 border-gray-200 dark:border-gray-700
      ${hover ? 'hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md' : ''}
    `,
    gradient: `
      bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900
      border border-gray-200 dark:border-gray-700
      ${shadowClasses[shadow]}
      ${hover ? 'hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-800 hover:shadow-lg' : ''}
    `
  };

  const backdropClasses = backdrop ? 'backdrop-blur-sm' : '';

  const interactiveClasses = interactive ? `
    transform-gpu
    hover:scale-[1.02]
    active:scale-[0.98]
    focus:outline-none
    focus:ring-2
    focus:ring-blue-500/50
    focus:ring-offset-2
    focus:ring-offset-white
    dark:focus:ring-offset-gray-900
  ` : '';

  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${roundedClasses[rounded]}
        ${backdropClasses}
        ${interactiveClasses}
        ${className}
      `}
      {...(interactive && {
        tabIndex: 0,
        role: 'button'
      })}
    >
      {/* Shimmer effect for glass variant */}
      {variant === 'glass' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Decorative corner gradient */}
      {variant === 'elevated' && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full -translate-y-16 translate-x-16 pointer-events-none" />
      )}
    </div>
  );
};