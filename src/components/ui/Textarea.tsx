'use client';

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  showCount?: boolean;
  maxLength?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, showCount, maxLength, value, ...props }, ref) => {
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="relative">
        <textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          className={cn(
            'w-full min-h-[120px] p-4 rounded-lg font-mono text-sm resize-y',
            'bg-zinc-900 text-zinc-50 placeholder:text-zinc-500',
            'border border-zinc-700',
            'transition-all duration-200',
            'focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            showCount && 'pb-8',
            className
          )}
          {...props}
        />
        {showCount && maxLength && (
          <div className="absolute bottom-2 right-3 text-xs text-zinc-500 font-mono">
            {currentLength}/{maxLength}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };

