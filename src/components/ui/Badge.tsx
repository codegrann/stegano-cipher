'use client';

import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  pulse?: boolean;
  glow?: boolean;
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  pulse = false,
  glow = false,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    error: 'bg-red-500/10 text-red-400 border-red-500/30',
    info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  };

  const glowVariants = {
    default: '',
    success: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]',
    warning: 'shadow-[0_0_10px_rgba(250,204,21,0.3)]',
    error: 'shadow-[0_0_10px_rgba(239,68,68,0.3)]',
    info: 'shadow-[0_0_10px_rgba(34,211,238,0.3)]',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono rounded-full border transition-all duration-300',
        variants[variant],
        sizes[size],
        pulse && 'animate-pulse-border',
        glow && glowVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

