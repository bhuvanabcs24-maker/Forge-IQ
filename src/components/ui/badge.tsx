import * as React from 'react';
import { cn, getStatusBadgeVariant } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger' | 'info';
  dot?: boolean;
}

export function Badge({
  className,
  status,
  variant = 'default',
  dot = true,
  children,
  ...props
}: BadgeProps) {
  if (status) {
    const statusClasses = getStatusBadgeVariant(status);
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 h-6 px-2 py-0.5 rounded-[6px] border text-xs font-medium tracking-normal transition-colors select-none',
          statusClasses,
          className
        )}
        {...props}
      >
        {dot && <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />}
        <span>{children || status}</span>
      </div>
    );
  }

  const variants = {
    default: 'bg-[#F9FAFB] dark:bg-[#18202A] text-[#344054] dark:text-[#98A2B3] border-[#E4E7EC] dark:border-[#252B33]',
    secondary: 'bg-[#F2F4F7] dark:bg-[#1F242F] text-[#475467] dark:text-[#D0D5DD] border-transparent',
    outline: 'border border-[#D0D5DD] dark:border-[#344054] text-[#344054] dark:text-[#98A2B3] bg-transparent',
    success: 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6] dark:bg-[#067647]/20 dark:text-[#32D583] dark:border-[#067647]/40',
    warning: 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89] dark:bg-[#B54708]/20 dark:text-[#FDB022] dark:border-[#B54708]/40',
    danger: 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA] dark:bg-[#B42318]/20 dark:text-[#FDA29B] dark:border-[#B42318]/40',
    info: 'bg-[#EFF8FF] text-[#175CD3] border-[#B2DDFF] dark:bg-[#175CD3]/20 dark:text-[#84ADFF] dark:border-[#175CD3]/40',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 h-6 px-2 py-0.5 rounded-[6px] border text-xs font-medium tracking-normal transition-colors select-none',
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && variant !== 'outline' && variant !== 'default' && variant !== 'secondary' && (
        <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />
      )}
      <span>{children}</span>
    </div>
  );
}

