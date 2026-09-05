import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = 'No data available',
  description = 'There are no records matching your current filter criteria or initial dataset.',
  icon,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-slate-300 dark:border-steel-800 bg-slate-50/50 dark:bg-steel-900/30">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-steel-800 text-slate-400 dark:text-steel-400 mb-4">
        {icon || <PackageOpen className="h-7 w-7" />}
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-steel-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
