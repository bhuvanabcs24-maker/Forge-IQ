'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'metal';
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', onClick, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155EEF]/20 focus-visible:border-[#155EEF] disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer tracking-tight';

    const variants = {
      // Primary: Height 40px, padding 0 16px, radius 8px, font 14px/600, bg #155EEF, text white, hover #124ec7, active #0d3ea8. No gradient, no glow.
      primary:
        'bg-[#155EEF] text-white hover:bg-[#124ec7] active:bg-[#0d3ea8] font-semibold shadow-[0_1px_2px_rgba(16,24,40,0.05)] border border-[#155EEF]',
      // Secondary: Height 40px, padding 0 16px, radius 8px, bg white, border #D0D5DD, text #344054, hover #F9FAFB.
      secondary:
        'bg-white dark:bg-steel-800 border border-[#D0D5DD] dark:border-steel-700 text-[#344054] dark:text-steel-200 hover:bg-[#F9FAFB] dark:hover:bg-steel-700 active:bg-slate-100 shadow-[0_1px_2px_rgba(16,24,40,0.04)]',
      // Outline: similar to secondary
      outline:
        'bg-white dark:bg-steel-800 border border-[#D0D5DD] dark:border-steel-700 text-[#344054] dark:text-steel-200 hover:bg-[#F9FAFB] dark:hover:bg-steel-700 active:bg-slate-100 shadow-[0_1px_2px_rgba(16,24,40,0.04)]',
      // Ghost: transparent background, no border, hover #F2F4F7, text #344054.
      ghost:
        'bg-transparent hover:bg-[#F2F4F7] dark:hover:bg-steel-800 text-[#344054] dark:text-steel-300',
      // Destructive: Subtle red-tinted surface with restrained red border/text.
      danger:
        'bg-[#FEF3F2] dark:bg-rose-950/30 border border-[#FECDCA] dark:border-rose-900/50 text-[#B42318] dark:text-rose-400 hover:bg-[#FEE4E2] dark:hover:bg-rose-900/30 font-semibold shadow-[0_1px_2px_rgba(16,24,40,0.04)]',
      metal:
        'bg-white dark:bg-steel-800 border border-[#D0D5DD] dark:border-steel-700 text-[#344054] dark:text-steel-200 hover:bg-[#F9FAFB] dark:hover:bg-steel-700 shadow-[0_1px_2px_rgba(16,24,40,0.04)]',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-11 px-5 text-sm gap-2.5',
      icon: 'h-10 w-10 p-0 text-sm',
      'icon-sm': 'h-8 w-8 p-0 text-xs',
    };

    return (
      <motion.button
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.985 }}
        transition={{ duration: 0.1 }}
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
