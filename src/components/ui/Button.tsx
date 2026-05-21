'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'cyber';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  ripple?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      ripple = true,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && !disabled && !isLoading) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();

        setRipples(prev => [...prev, { x, y, id }]);
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== id));
        }, 600);
      }
      onClick?.(e);
    };

    const baseStyles = cn(
      'relative overflow-hidden inline-flex items-center justify-center gap-2 font-medium rounded-lg',
      'transition-all duration-200 ease-out',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'
    );

    const variants = {
      primary: cn(
        'bg-emerald-600 text-white hover:bg-emerald-500',
        'focus-visible:ring-emerald-500',
        'shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:shadow-xl',
        'active:bg-emerald-700 active:scale-[0.98]',
        'hover:-translate-y-0.5'
      ),
      secondary: cn(
        'bg-zinc-800 text-zinc-100 hover:bg-zinc-700',
        'focus-visible:ring-zinc-500',
        'border border-zinc-700 hover:border-zinc-600',
        'hover:-translate-y-0.5'
      ),
      ghost: cn(
        'bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800',
        'focus-visible:ring-zinc-500'
      ),
      danger: cn(
        'bg-red-600 text-white hover:bg-red-500',
        'focus-visible:ring-red-500',
        'shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:shadow-xl',
        'hover:-translate-y-0.5'
      ),
      cyber: cn(
        'bg-transparent text-emerald-400 border border-emerald-500/50',
        'hover:bg-emerald-500/10 hover:border-emerald-400 hover:text-emerald-300',
        'focus-visible:ring-emerald-500',
        'shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/30',
        'hover:-translate-y-0.5'
      ),
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        onClick={handleClick}
        {...props}
      >
        {/* Ripple effects */}
        {ripples.map(({ x, y, id }) => (
          <span
            key={id}
            className="absolute bg-white/30 rounded-full pointer-events-none animate-ripple"
            style={{
              left: x,
              top: y,
              width: 10,
              height: 10,
              marginLeft: -5,
              marginTop: -5,
            }}
          />
        ))}

        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4"
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
        ) : (
          leftIcon
        )}
        <span className="relative z-10">{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };

