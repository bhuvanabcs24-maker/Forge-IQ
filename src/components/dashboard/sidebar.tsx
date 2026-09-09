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
    title: 'WORKSPACE',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-[18px] w-[18px]" /> },
      { label: 'Customers', href: '/customers', icon: <Users className="h-[18px] w-[18px]" /> },
      { label: 'Orders', href: '/orders', icon: <ShoppingBag className="h-[18px] w-[18px]" />, badge: '18' },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { label: 'Quotations', href: '/quotations', icon: <FileText className="h-[18px] w-[18px]" /> },
      { label: 'Pricing Rules', href: '/settings/pricing-rules', icon: <Calculator className="h-[18px] w-[18px]" /> },
      { label: 'Inventory', href: '/inventory', icon: <Boxes className="h-[18px] w-[18px]" />, badge: 'Low Stock' },
      { label: 'Production', href: '/production', icon: <Factory className="h-[18px] w-[18px]" /> },
      { label: 'Machines', href: '/machines', icon: <Cpu className="h-[18px] w-[18px]" /> },
      { label: 'Workers', href: '/workers', icon: <UserCheck className="h-[18px] w-[18px]" /> },
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { label: 'AI Order Intake', href: '/ai-order-intake', icon: <Sparkles className="h-[18px] w-[18px]" />, badge: 'AI', isAi: true },
      { label: 'AI Assistant', href: '/ai-assistant', icon: <Bot className="h-[18px] w-[18px]" />, isAi: true },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { label: 'Suppliers', href: '/suppliers', icon: <Truck className="h-[18px] w-[18px]" /> },
      { label: 'Purchase Orders', href: '/purchase-orders', icon: <ShoppingCart className="h-[18px] w-[18px]" /> },
      { label: 'Invoices', href: '/invoices', icon: <Receipt className="h-[18px] w-[18px]" /> },
      { label: 'Reports', href: '/reports', icon: <BarChart3 className="h-[18px] w-[18px]" /> },
      { label: 'Settings', href: '/settings', icon: <Settings className="h-[18px] w-[18px]" /> },
    ],
  },
];

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
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-[#E4E7EC] dark:border-[#252B33] bg-white dark:bg-[#11161D] transition-all duration-200 ease-in-out select-none',
          collapsed ? 'w-16' : 'w-[240px]',
          // Mobile state
          isMobileOpen ? 'translate-x-0 w-[240px]' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Brand Logo Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-[#E4E7EC] dark:border-[#252B33]">
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#155EEF] text-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
              <Zap className="h-4.5 w-4.5 fill-current" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-[15px] tracking-tight text-[#111827] dark:text-[#F2F4F7]">
                  Forge<span className="text-[#155EEF]">IQ</span>
                </span>
                <span className="text-[11px] font-normal text-[#667085] dark:text-[#98A2B3]">
                  Manufacturing OS
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded-md border border-[#E4E7EC] dark:border-[#252B33] bg-white dark:bg-[#11161D] text-[#667085] hover:text-[#111827] dark:hover:text-[#F2F4F7] transition-colors cursor-pointer"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {NAV_SECTIONS.map((section) => {
            const allowedItems = section.items.filter((item) => hasPermission(role, item.href));
            if (allowedItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                {!collapsed && (
                  <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#667085] dark:text-[#98A2B3]">
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
                        'flex items-center gap-2.5 rounded-lg px-2.5 h-10 text-sm font-medium transition-colors group relative',
                        isActive
                          ? 'bg-[#EFF4FF] dark:bg-[#155EEF]/15 text-[#175CD3] dark:text-[#528BFF] font-medium'
                          : 'text-[#344054] dark:text-[#D0D5DD] hover:bg-[#F9FAFB] dark:hover:bg-[#18202A] hover:text-[#111827] dark:hover:text-[#F2F4F7]'
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <div
                        className={cn(
                          'shrink-0 transition-colors',
                          isActive
                            ? 'text-[#175CD3] dark:text-[#528BFF]'
                            : 'text-[#667085] dark:text-[#98A2B3] group-hover:text-[#344054] dark:group-hover:text-[#F2F4F7]'
                        )}
                      >
                        {item.icon}
                      </div>

                      {!collapsed && <span className="truncate text-sm">{item.label}</span>}

                      {!collapsed && item.badge && (
                        <span
                          className={cn(
                            'ml-auto rounded-full px-2 py-0.5 text-[11px] font-medium tracking-tight',
                            item.badge === 'Low Stock'
                              ? 'bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]'
                              : item.badge === 'AI'
                              ? 'bg-[#EFF4FF] text-[#175CD3] border border-[#B2DDFF]'
                              : 'bg-[#F2F4F7] text-[#344054] border border-[#E4E7EC]'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer User Profile & Sign Out */}
        <div className="p-3 border-t border-[#E4E7EC] dark:border-[#252B33] bg-white dark:bg-[#11161D] space-y-2">
          <div className="flex items-center gap-2.5 px-1 py-0.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F2F4F7] dark:bg-[#18202A] text-[#344054] dark:text-[#D0D5DD] border border-[#E4E7EC] dark:border-[#252B33]">
              <ShieldCheck className="h-4 w-4 text-[#067647]" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-semibold text-[#111827] dark:text-[#F2F4F7] truncate">
                  Precision Fab Co.
                </span>
                <span className="text-[12px] text-[#667085] dark:text-[#98A2B3] truncate">
                  Role: <strong className="text-[#344054] dark:text-[#D0D5DD]">{role}</strong>
                </span>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className={cn(
              'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-[#667085] hover:text-[#B42318] hover:bg-[#FEF3F2] dark:hover:bg-rose-950/20 transition-colors w-full cursor-pointer',
              collapsed && 'justify-center px-1'
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
