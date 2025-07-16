import React from 'react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray' | 'success' | 'danger' | 'warning' | 'info';
  variant?: 'spinner' | 'dots' | 'bars' | 'pulse' | 'ring' | 'dual-ring' | 'ripple';
  className?: string;
  text?: string;
  centered?: boolean;
  overlay?: boolean;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  variant = 'spinner',
  className = '',
  text,
  centered = false,
  overlay = false,
  fullScreen = false
}) => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colors = {
    primary: 'text-blue-500',
    secondary: 'text-gray-600',
    white: 'text-white',
    gray: 'text-gray-500',
    success: 'text-green-500',
    danger: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-400'
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const SpinnerVariant = () => (
    <div className={`${sizes[size]} ${colors[color]} animate-spin`}>
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );

  const DotsVariant = () => (
    <div className={`flex space-x-1 ${colors[color]}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${sizes[size]} bg-current rounded-full animate-bounce`}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );

  const BarsVariant = () => (
    <div className={`flex space-x-1 ${colors[color]}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`w-1 bg-current rounded-full animate-pulse`}
          style={{ 
            height: size === 'xs' ? '12px' : size === 'sm' ? '16px' : size === 'md' ? '24px' : size === 'lg' ? '32px' : '48px',
            animationDelay: `${i * 0.1}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );

  const PulseVariant = () => (
    <div className={`${sizes[size]} ${colors[color]} animate-pulse`}>
      <div className="w-full h-full bg-current rounded-full opacity-75" />
    </div>
  );

  const RingVariant = () => (
    <div className={`${sizes[size]} ${colors[color]} animate-spin`}>
      <div className="w-full h-full border-4 border-current border-t-transparent rounded-full" />
    </div>
  );

  const DualRingVariant = () => (
    <div className={`${sizes[size]} ${colors[color]} relative`}>
      <div className="w-full h-full border-4 border-current border-t-transparent rounded-full animate-spin" />
      <div className="absolute inset-0 w-full h-full border-4 border-current border-b-transparent rounded-full animate-spin opacity-30" style={{ animationDirection: 'reverse' }} />
    </div>
  );

  const RippleVariant = () => (
    <div className={`${sizes[size]} ${colors[color]} relative`}>
      <div className="absolute inset-0 w-full h-full border-4 border-current rounded-full animate-ping" />
      <div className="absolute inset-0 w-full h-full border-4 border-current rounded-full animate-ping opacity-30" style={{ animationDelay: '0.5s' }} />
    </div>
  );

  const getVariantComponent = () => {
    switch (variant) {
      case 'dots':
        return <DotsVariant />;
      case 'bars':
        return <BarsVariant />;
      case 'pulse':
        return <PulseVariant />;
      case 'ring':
        return <RingVariant />;
      case 'dual-ring':
        return <DualRingVariant />;
      case 'ripple':
        return <RippleVariant />;
      default:
        return <SpinnerVariant />;
    }
  };

  const LoadingContent = () => (
    <div className={`flex items-center ${text ? 'space-x-3' : ''} ${centered ? 'justify-center' : ''}`}>
      {getVariantComponent()}
      {text && (
        <span className={`${textSizes[size]} ${colors[color]} font-medium animate-pulse`}>
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingContent />
        </div>
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-10 flex items-center justify-center">
        <LoadingContent />
      </div>
    );
  }

  if (centered) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <LoadingContent />
      </div>
    );
  }

  return (
    <div className={className}>
      <LoadingContent />
    </div>
  );
};

// Skeleton loading components
interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  animation?: 'pulse' | 'wave' | 'shimmer';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = 'w-full',
  height = 'h-4',
  rounded = 'md',
  animation = 'pulse'
}) => {
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };

  const getAnimationClasses = () => {
    switch (animation) {
      case 'wave':
        return 'animate-bounce';
      case 'shimmer':
        return 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700';
      default:
        return 'animate-pulse bg-gray-200 dark:bg-gray-700';
    }
  };

  return (
    <div
      className={`
        ${width} ${height} 
        ${roundedClasses[rounded]} 
        ${getAnimationClasses()}
        ${className}
      `}
    />
  );
};

// Skeleton text component
interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  className = '',
  lastLineWidth = 'w-3/4'
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? lastLineWidth : 'w-full'}
          height="h-4"
        />
      ))}
    </div>
  );
};

// Skeleton card component
interface SkeletonCardProps {
  className?: string;
  showAvatar?: boolean;
  showImage?: boolean;
  lines?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className = '',
  showAvatar = false,
  showImage = false,
  lines = 3
}) => {
  return (
    <div className={`p-4 ${className}`}>
      {showImage && (
        <Skeleton width="w-full" height="h-48" className="mb-4" />
      )}
      
      <div className="flex items-start space-x-3">
        {showAvatar && (
          <Skeleton width="w-12" height="h-12" rounded="full" />
        )}
        
        <div className="flex-1">
          <Skeleton width="w-3/4" height="h-5" className="mb-2" />
          <SkeletonText lines={lines} />
        </div>
      </div>
    </div>
  );
};