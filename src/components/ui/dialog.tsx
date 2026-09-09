'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  hideHeader?: boolean;
  noPadding?: boolean;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  hideHeader = false,
  noPadding = false,
}: DialogProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={cn(
          'relative w-full rounded-[14px] border border-[#E4E7EC] dark:border-[#252B33] bg-white dark:bg-[#11161D] shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all z-10 overflow-hidden max-h-[90vh] flex flex-col font-sans',
          maxWidthClasses[maxWidth]
        )}
      >
        {/* Header */}
        {!hideHeader && (
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#E4E7EC] dark:border-[#252B33] bg-[#FFFFFF] dark:bg-[#11161D]">
            <div>
              <h3 className="text-[20px] font-semibold tracking-tight text-[#111827] dark:text-[#F2F4F7] leading-[1.3]">
                {title}
              </h3>
              {description && (
                <p className="text-[13px] text-[#667085] dark:text-[#98A2B3] mt-0.5 font-normal">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[#667085] hover:text-[#111827] dark:hover:text-[#F2F4F7] hover:bg-[#F2F4F7] dark:hover:bg-[#18202A] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        )}

        {/* Content */}
        <div className={cn('overflow-y-auto text-sm text-[#111827] dark:text-[#F2F4F7]', noPadding ? 'p-0' : 'p-6')}>{children}</div>
      </div>
    </div>
  );
}
