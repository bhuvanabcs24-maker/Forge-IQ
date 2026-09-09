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

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'OPERATIONS',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
      { label: 'Customers', href: '/customers', icon: <Users className="h-4 w-4" /> },
      { label: 'Orders', href: '/orders', icon: <ShoppingBag className="h-4 w-4" />, badge: '18' },
      { label: 'Quotations', href: '/quotations', icon: <FileText className="h-4 w-4" /> },
      { label: 'Pricing Rules', href: '/settings/pricing-rules', icon: <Calculator className="h-4 w-4" /> },
      { label: 'Inventory', href: '/inventory', icon: <Boxes className="h-4 w-4" />, badge: 'Low Stock' },
    ],
  },
  {
    title: 'SHOP FLOOR',
    items: [
      { label: 'Production', href: '/production', icon: <Factory className="h-4 w-4" /> },
      { label: 'Machines', href: '/machines', icon: <Cpu className="h-4 w-4" /> },
      { label: 'Workers', href: '/workers', icon: <UserCheck className="h-4 w-4" /> },
    ],
  },
  {
    title: 'COMMERCE & SUPPLY',
    items: [
      { label: 'Suppliers', href: '/suppliers', icon: <Truck className="h-4 w-4" /> },
      { label: 'Purchase Orders', href: '/purchase-orders', icon: <ShoppingCart className="h-4 w-4" /> },
      { label: 'Invoices', href: '/invoices', icon: <Receipt className="h-4 w-4" /> },
      { label: 'Reports', href: '/reports', icon: <BarChart3 className="h-4 w-4" /> },
    ],
  },
  {
    title: 'INTELLIGENCE & SYSTEM',
    items: [
      { label: 'AI Order Intake', href: '/ai-order-intake', icon: <Sparkles className="h-4 w-4" />, badge: 'AI', isAi: true },
      { label: 'AI Assistant', href: '/ai-assistant', icon: <Bot className="h-4 w-4" />, isAi: true },
      { label: 'Settings', href: '/settings', icon: <Settings className="h-4 w-4" /> },
    ],
  },
];

// Flat export for compatibility with any components importing NAV_ITEMS
export const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);

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
          'fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-950 transition-all duration-300 ease-in-out select-none',
          collapsed ? 'w-16' : 'w-64',
          // Mobile state
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Brand Logo Header */}
        <div className="flex h-14 items-center justify-between px-3.5 border-b border-slate-200 dark:border-steel-800/90">
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-brand-600 shadow-xs">
              <Zap className="h-4 w-4 fill-current" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                    Forge<span className="text-brand-600 dark:text-brand-400">IQ</span>
                  </span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-100 dark:bg-steel-800 text-slate-500 dark:text-steel-400 font-semibold border border-slate-200 dark:border-steel-700">
                    v2.6
                  </span>
                </div>
                <span className="text-[9px] uppercase font-semibold tracking-wider text-slate-400 dark:text-steel-500">
                  Manufacturing OS
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 dark:border-steel-800 bg-slate-50 dark:bg-steel-900 text-slate-500 dark:text-steel-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
          {NAV_SECTIONS.map((section) => {
            const allowedItems = section.items.filter((item) => hasPermission(role, item.href));
            if (allowedItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-0.5">
                {!collapsed && (
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-steel-500">
                    {section.title}
                  </div>
                )}
                {allowedItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onMobileClose}
                      className={cn(
                        'flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all group relative',
                        isActive
                          ? 'bg-slate-100 dark:bg-steel-800 text-slate-900 dark:text-white font-semibold'
                          : 'text-slate-600 dark:text-steel-300 hover:bg-slate-50 dark:hover:bg-steel-900 hover:text-slate-900 dark:hover:text-slate-100',
                        item.isAi && !isActive && 'text-slate-700 dark:text-steel-200'
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <div
                        className={cn(
                          'shrink-0 transition-colors',
                          isActive
                            ? 'text-brand-600 dark:text-brand-400'
                            : 'text-slate-400 dark:text-steel-400 group-hover:text-slate-700 dark:group-hover:text-steel-200',
                          item.isAi && 'text-brand-500 dark:text-brand-400'
                        )}
                      >
                        {item.icon}
                      </div>

                      {!collapsed && <span className="truncate">{item.label}</span>}

                      {!collapsed && item.badge && (
                        <span
                          className={cn(
                            'ml-auto rounded px-1.5 py-0.2 text-[10px] font-semibold tracking-tight border',
                            item.badge === 'Low Stock'
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60'
                              : 'bg-slate-100 dark:bg-steel-800 text-slate-700 dark:text-steel-300 border-slate-200 dark:border-steel-700'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Left Active Marker Indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 rounded-r bg-brand-600 dark:bg-brand-500" />
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer Organization Profile / Role Indicator & Sign Out */}
        <div className="p-2.5 border-t border-slate-200 dark:border-steel-800/90 bg-slate-50/60 dark:bg-steel-900/40 space-y-1.5">
          <div className="flex items-center gap-2.5 px-1">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-200 dark:bg-steel-800 text-slate-700 dark:text-steel-300">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  Precision Fab Co.
                </span>
                <span className="text-[10px] text-slate-500 dark:text-steel-400 truncate">
                  Role: <strong className="text-slate-700 dark:text-steel-200">{role}</strong>
                </span>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className={cn(
              'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-slate-600 dark:text-steel-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/60 dark:hover:bg-rose-950/30 transition-colors w-full cursor-pointer',
              collapsed && 'justify-center px-1'
            )}
            title="Sign Out of ForgeIQ"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
