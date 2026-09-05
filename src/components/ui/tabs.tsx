'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (val: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [currentTab, setCurrentTab] = React.useState(value || defaultValue || '');

  const activeTab = value !== undefined ? value : currentTab;

  const setActiveTab = (val: string) => {
    if (value === undefined) setCurrentTab(val);
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-steel-800 bg-slate-100 dark:bg-steel-900/60 p-1 text-slate-500 dark:text-steel-400',
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used inside Tabs');

  const isActive = context.activeTab === value;

  return (
    <button
      type="button"
      onClick={() => context.setActiveTab(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        isActive
          ? 'bg-white dark:bg-steel-800 text-slate-900 dark:text-slate-100 shadow-sm'
          : 'hover:text-slate-900 dark:hover:text-slate-200',
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used inside Tabs');

  if (context.activeTab !== value) return null;

  return <div className={cn('mt-4 animate-in fade-in duration-200', className)}>{children}</div>;
}
