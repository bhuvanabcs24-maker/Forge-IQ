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
          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors',
          statusClasses,
          className
        )}
        {...props}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
        {children || status}
      </div>
    );
  }

  const variants = {
    default: 'bg-slate-100 dark:bg-steel-800 text-slate-800 dark:text-steel-200 border-slate-200 dark:border-steel-700',
    secondary: 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20',
    outline: 'border border-slate-300 dark:border-steel-700 text-slate-700 dark:text-steel-300',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
