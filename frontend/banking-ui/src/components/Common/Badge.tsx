import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gray',
  size = 'md',
  className,
}) => {
  const variantClasses = {
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
    gray: 'badge-gray',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  };

  return (
    <span
      className={clsx(
        'badge',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;