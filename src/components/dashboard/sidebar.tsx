'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { hasPermission } from '@/lib/rbac';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  FileText,
  Boxes,
  Factory,
  Cpu,
  UserCheck,
  Truck,
  ShoppingCart,
  Receipt,
  BarChart3,
  Bot,
  Settings,
  Calculator,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Sparkles,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  isAi?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Customers', href: '/customers', icon: <Users className="h-4 w-4" /> },
  { label: 'Orders', href: '/orders', icon: <ShoppingBag className="h-4 w-4" />, badge: '18' },
  { label: 'Quotations', href: '/quotations', icon: <FileText className="h-4 w-4" /> },
  { label: 'Pricing Rules', href: '/settings/pricing-rules', icon: <Calculator className="h-4 w-4" /> },
  { label: 'Inventory', href: '/inventory', icon: <Boxes className="h-4 w-4" />, badge: 'Low Stock' },
  { label: 'Production', href: '/production', icon: <Factory className="h-4 w-4" /> },
  { label: 'Machines', href: '/machines', icon: <Cpu className="h-4 w-4" /> },
  { label: 'Workers', href: '/workers', icon: <UserCheck className="h-4 w-4" /> },
  { label: 'Suppliers', href: '/suppliers', icon: <Truck className="h-4 w-4" /> },
  { label: 'Purchase Orders', href: '/purchase-orders', icon: <ShoppingCart className="h-4 w-4" /> },
  { label: 'Invoices', href: '/invoices', icon: <Receipt className="h-4 w-4" /> },
  { label: 'Reports', href: '/reports', icon: <BarChart3 className="h-4 w-4" /> },
  { label: 'AI Order Intake', href: '/ai-order-intake', icon: <Sparkles className="h-4 w-4" />, badge: 'AI Intake', isAi: true },
  { label: 'AI Assistant', href: '/ai-assistant', icon: <Bot className="h-4 w-4" />, isAi: true },
  { label: 'Settings', href: '/settings', icon: <Settings className="h-4 w-4" /> },
];

export function Sidebar({
  isMobileOpen = false,
  onMobileClose,
}: {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { role, logout } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900/95 transition-all duration-300 ease-in-out',
          collapsed ? 'w-20' : 'w-64',
          // Mobile state
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Brand Logo Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-steel-800">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-500/20">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white font-sans flex items-center gap-1">
                  Forge<span className="text-brand-500">IQ</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-steel-400">
                  Manufacturing OS
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 dark:border-steel-700 bg-slate-50 dark:bg-steel-800 text-slate-500 dark:text-steel-300 hover:text-brand-500 transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isAllowed = hasPermission(role, item.href);
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            if (!isAllowed) return null;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group relative',
                  isActive
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
                    : 'text-slate-600 dark:text-steel-300 hover:bg-slate-100 dark:hover:bg-steel-800/60 hover:text-slate-900 dark:hover:text-slate-100',
                  item.isAi && 'text-purple-600 dark:text-purple-400 font-semibold'
                )}
                title={collapsed ? item.label : undefined}
              >
                <div
                  className={cn(
                    'shrink-0 transition-transform group-hover:scale-110',
                    isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-steel-400',
                    item.isAi && 'text-purple-500'
                  )}
                >
                  {item.icon}
                </div>

                {!collapsed && <span className="truncate">{item.label}</span>}

                {!collapsed && item.badge && (
                  <span
                    className={cn(
                      'ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold',
                      item.badge === 'Low Stock'
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        : 'bg-slate-200 dark:bg-steel-800 text-slate-700 dark:text-steel-300'
                    )}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Left Active Marker Indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-brand-600 dark:bg-brand-400" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer Organization Profile / Role Indicator & Sign Out */}
        <div className="p-3 border-t border-slate-200 dark:border-steel-800 bg-slate-50/50 dark:bg-steel-900/60 space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200 dark:bg-steel-800 text-slate-700 dark:text-steel-300">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  Precision Fab Co.
                </span>
                <span className="text-[10px] text-slate-500 dark:text-steel-400 truncate">
                  Role: <strong className="text-brand-600 dark:text-brand-400">{role}</strong>
                </span>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className={cn(
              'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all w-full',
              collapsed && 'justify-center px-1.5'
            )}
            title="Sign Out of ForgeIQ"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
