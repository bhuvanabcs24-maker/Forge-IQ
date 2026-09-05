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
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer';

    const variants = {
      primary: 'bg-gradient-to-r from-brand-600 to-blue-600 text-white hover:from-brand-500 hover:to-blue-500 shadow-md shadow-brand-500/25 border border-brand-400/30',
      secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-steel-800 dark:text-steel-100 dark:hover:bg-steel-700 border border-slate-300 dark:border-steel-700',
      outline: 'border border-slate-300 dark:border-steel-700 bg-white/50 dark:bg-steel-900/60 backdrop-blur-md hover:bg-slate-100 dark:hover:bg-steel-800 text-slate-800 dark:text-steel-200 shadow-2xs',
      ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-steel-800/80 text-slate-700 dark:text-steel-300',
      danger: 'bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-500 hover:to-red-500 shadow-md shadow-rose-500/20 border border-rose-400/30',
      metal: 'bg-gradient-to-b from-slate-100 to-slate-200 dark:from-steel-800 dark:to-steel-900 border border-slate-300 dark:border-steel-700 text-slate-900 dark:text-slate-100 hover:border-brand-500 shadow-xs',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-9.5 px-4 text-xs gap-2',
      lg: 'h-11 px-6 text-sm gap-2.5',
      icon: 'h-9 w-9 p-0 text-xs',
    };

    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
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
