'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs = [],
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-2.5 pb-5 border-b border-[#E4E7EC] dark:border-[#252B33] mb-6">
      {/* Breadcrumb Navigation */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-[#667085] dark:text-[#98A2B3]">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 hover:text-[#111827] dark:hover:text-[#F2F4F7] transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="h-3.5 w-3.5 text-[#667085]/60 dark:text-[#98A2B3]/60" />
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-[#111827] dark:hover:text-[#F2F4F7] transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-medium text-[#111827] dark:text-[#F2F4F7]">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Header Core & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-bold tracking-[-0.025em] text-[#111827] dark:text-[#F2F4F7] font-sans leading-[1.2]">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-[#667085] dark:text-[#98A2B3] mt-1 font-normal leading-[1.55]">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
