'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary:
      'bg-gradient-to-b from-[#2A8BB3] to-[#31B2E8] text-white hover:from-[#31B2E8] hover:to-[#2A8BB3] focus:ring-[#31B2E8]',
    secondary:
      'bg-[#E6F4F9] text-[#2A8BB3] hover:bg-[#D1EDF6] focus:ring-[#31B2E8]',
    outline:
      'border border-[#31B2E8] bg-white text-[#2A8BB3] hover:bg-[#E6F4F9] focus:ring-[#31B2E8]',
    ghost:
      'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-[#31B2E8]',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
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
      )}
      {children}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  label: string;
}

export function IconButton({
  variant = 'ghost',
  size = 'md',
  children,
  label,
  className = '',
  ...props
}: IconButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary:
      'bg-gradient-to-b from-[#2A8BB3] to-[#31B2E8] text-white hover:from-[#31B2E8] hover:to-[#2A8BB3] focus:ring-[#31B2E8]',
    secondary:
      'bg-[#E6F4F9] text-[#2A8BB3] hover:bg-[#D1EDF6] focus:ring-[#31B2E8]',
    outline:
      'border border-[#31B2E8] bg-white text-[#2A8BB3] hover:bg-[#E6F4F9] focus:ring-[#31B2E8]',
    ghost:
      'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-[#31B2E8]',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizeStyles = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      aria-label={label}
      {...props}
    >
      {children}
    </button>
  );
}
