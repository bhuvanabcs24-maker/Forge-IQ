'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'metal';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', onClick, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all focus-visible:outline-none focus-visible:ring-1.5 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-40 select-none cursor-pointer tracking-tight';

    const variants = {
      primary:
        'bg-slate-900 text-white hover:bg-slate-800 dark:bg-brand-600 dark:text-white dark:hover:bg-brand-500 shadow-xs border border-slate-800 dark:border-brand-500 active:scale-[0.98]',
      secondary:
        'bg-slate-100 text-slate-800 hover:bg-slate-200/80 dark:bg-steel-800 dark:text-steel-100 dark:hover:bg-steel-700 border border-slate-200 dark:border-steel-700 shadow-2xs active:scale-[0.98]',
      outline:
        'border border-slate-200 dark:border-steel-700 bg-white dark:bg-steel-900 text-slate-700 dark:text-steel-200 hover:bg-slate-50 dark:hover:bg-steel-800 shadow-2xs active:scale-[0.98]',
      ghost:
        'bg-transparent hover:bg-slate-100 dark:hover:bg-steel-800 text-slate-600 dark:text-steel-300 hover:text-slate-900 dark:hover:text-slate-100',
      danger:
        'bg-rose-600 text-white hover:bg-rose-500 border border-rose-700 shadow-2xs active:scale-[0.98]',
      metal:
        'bg-slate-50 dark:bg-steel-800/90 border border-slate-300 dark:border-steel-700 text-slate-900 dark:text-slate-100 hover:border-slate-400 dark:hover:border-steel-600 shadow-2xs active:scale-[0.98]',
    };

    const sizes = {
      sm: 'h-8 px-2.5 text-xs gap-1.5',
      md: 'h-9 px-3.5 text-xs gap-2',
      lg: 'h-10 px-4 text-sm gap-2',
      icon: 'h-8.5 w-8.5 p-0 text-xs',
    };

    return (
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.12 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled}
        onClick={onClick}
        {...(props as any)}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';

export { Button };
