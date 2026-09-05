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
    <div className="flex flex-col gap-3 pb-6 border-b border-slate-200/80 dark:border-steel-800/80 mb-6">
      {/* Breadcrumb Navigation */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-steel-400">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-steel-600" />
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-medium text-slate-800 dark:text-steel-200">
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-slate-500 dark:text-steel-400 mt-1">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
