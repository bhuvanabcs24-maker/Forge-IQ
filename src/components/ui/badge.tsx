import * as React from 'react';
import { cn, getStatusBadgeVariant } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger' | 'info';
}

export function Badge({
  className,
  status,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  if (status) {
    const statusClasses = getStatusBadgeVariant(status);
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium tracking-tight transition-colors shadow-2xs',
          statusClasses,
          className
        )}
        {...props}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
        {children || status}
      </div>
    );
  }

  const variants = {
    default: 'bg-slate-100 dark:bg-steel-800 text-slate-800 dark:text-steel-200 border-slate-200/80 dark:border-steel-700',
    secondary: 'bg-slate-100 dark:bg-steel-800 text-slate-600 dark:text-steel-300 border-slate-200 dark:border-steel-700',
    outline: 'border border-slate-200 dark:border-steel-700 text-slate-700 dark:text-steel-300 bg-transparent',
    success: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    warning: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    danger: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
    info: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium tracking-tight transition-colors shadow-2xs',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
