'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftElement, rightElement, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        {leftElement && (
          <div className="absolute left-3 flex items-center text-zinc-500">
            {leftElement}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full h-10 px-4 rounded-lg font-mono text-sm',
            'bg-zinc-900 text-zinc-50 placeholder:text-zinc-500',
            'border border-zinc-700',
            'transition-all duration-200',
            'focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            leftElement && 'pl-10',
            rightElement && 'pr-10',
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 flex items-center text-zinc-500">
            {rightElement}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };

