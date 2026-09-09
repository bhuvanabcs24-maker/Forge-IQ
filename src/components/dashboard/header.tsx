'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/auth-context';
import { UserRole } from '@/types';
import { ROLE_BADGE_COLORS } from '@/lib/rbac';
import { cn } from '@/lib/utils';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Shield,
  User,
  LogOut,
  Sliders,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { NotificationsPanel } from './notifications-panel';
import { CommandPalette } from './command-palette';

export function Header({ onMobileMenuToggle }: { onMobileMenuToggle: () => void }) {
  const { theme, setTheme } = useTheme();
  const { user, role, setRole, unreadCount, isNotificationsOpen, setIsNotificationsOpen, logout } =
    useAuth();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  const rolesList: UserRole[] = ['Owner', 'Manager', 'Supervisor', 'Worker'];

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 dark:border-steel-800/90 bg-white/95 dark:bg-steel-950/95 backdrop-blur-md px-4 sm:px-6 select-none">
        {/* Left Side: Mobile Menu Button & Search Trigger */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:text-steel-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-steel-800"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>

          {/* Quick Command Search Trigger */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-steel-800 bg-slate-50 dark:bg-steel-900/90 px-2.5 py-1.5 text-xs text-slate-500 dark:text-steel-400 hover:border-slate-300 dark:hover:border-steel-700 transition-colors w-40 sm:w-60 shadow-2xs"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="truncate">Search SKUs, orders, machines...</span>
            <kbd className="ml-auto hidden sm:inline-block rounded border border-slate-200 dark:border-steel-700 bg-white dark:bg-steel-950 px-1 py-0.2 text-[9px] font-mono text-slate-400 dark:text-steel-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Live RBAC Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className={cn(
                'flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold tracking-tight transition-all shadow-2xs cursor-pointer',
                ROLE_BADGE_COLORS[role]
              )}
            >
              <Shield className="h-3 w-3" />
              <span>{role}</span>
              <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
            </button>

            {isRoleDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-52 rounded-lg border border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900 p-1.5 shadow-xl z-50 animate-in fade-in duration-100"
                onClick={() => setIsRoleDropdownOpen(false)}
              >
                <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-steel-800">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Switch Perspective
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-steel-400">
                    Test RBAC permissions live
                  </p>
                </div>
                <div className="py-1 space-y-0.5">
                  {rolesList.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer',
                        role === r
                          ? 'bg-slate-100 dark:bg-steel-800 text-slate-900 dark:text-white font-semibold'
                          : 'hover:bg-slate-50 dark:hover:bg-steel-800/60 text-slate-700 dark:text-steel-300'
                      )}
                    >
                      <span>{r}</span>
                      {role === r && <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Customer Portal Link */}
          <a
            href="/portal/dashboard"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 dark:border-steel-800 bg-slate-50 dark:bg-steel-900 text-slate-700 dark:text-steel-300 font-medium text-xs hover:bg-slate-100 dark:hover:bg-steel-800 transition-colors shadow-2xs"
            title="Launch Customer Self-Service Portal"
          >
            <span>Customer Portal</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>

          {/* Theme Toggle (Dark / Light) */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 dark:border-steel-800 text-slate-600 dark:text-steel-300 hover:bg-slate-100 dark:hover:bg-steel-800 transition-colors shadow-2xs cursor-pointer"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5" />}
          </button>

          {/* Notifications Trigger */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 dark:border-steel-800 text-slate-600 dark:text-steel-300 hover:bg-slate-100 dark:hover:bg-steel-800 transition-colors shadow-2xs cursor-pointer"
          >
            <Bell className="h-3.5 w-3.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand-600 text-[9px] font-mono font-bold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 rounded-md p-0.5 hover:bg-slate-100 dark:hover:bg-steel-800 transition-colors cursor-pointer"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 dark:bg-steel-800 text-white text-[11px] font-mono font-bold shadow-2xs">
                {user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'US'}
              </div>
            </button>

            {isProfileMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-52 rounded-lg border border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900 p-1.5 shadow-xl z-50 animate-in fade-in duration-100"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-steel-800">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {user?.fullName || 'User Account'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-steel-400 truncate">
                    {user?.email || 'user@forgeiq.com'}
                  </p>
                </div>

                <div className="py-1 space-y-0.5">
                  <a
                    href="/settings"
                    className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-slate-700 dark:text-steel-300 hover:bg-slate-50 dark:hover:bg-steel-800 transition-colors"
                  >
                    <Sliders className="h-3.5 w-3.5 text-slate-400" />
                    Settings
                  </a>
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50/60 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Slide-out Notifications Panel */}
      <NotificationsPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Global Command Palette Search Modal */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </>
  );
}
