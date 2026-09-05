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
  Sparkles,
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
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-steel-800 bg-white/90 dark:bg-steel-900/90 backdrop-blur-md px-4 sm:px-6">
        {/* Left Side: Mobile Menu Button & Search Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 rounded-md text-slate-500 hover:text-slate-900 dark:text-steel-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-steel-800"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Quick Command Search Trigger */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-steel-700 bg-slate-50 dark:bg-steel-800/80 px-3 py-1.5 text-xs text-slate-500 dark:text-steel-400 hover:border-brand-500 transition-colors w-44 sm:w-64"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="truncate">Search orders, SKUs, customers...</span>
            <kbd className="ml-auto hidden sm:inline-block rounded border border-slate-300 dark:border-steel-600 bg-white dark:bg-steel-900 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:text-steel-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live RBAC Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide transition-all shadow-xs',
                ROLE_BADGE_COLORS[role]
              )}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Role: {role}</span>
              <ChevronDown className="h-3 w-3 opacity-70 ml-0.5" />
            </button>

            {isRoleDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-steel-700 bg-white dark:bg-steel-900 p-2 shadow-xl z-50 animate-in fade-in duration-150"
                onClick={() => setIsRoleDropdownOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-100 dark:border-steel-800">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Switch Perspective
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-steel-400">
                    Test RBAC navigation permissions live
                  </p>
                </div>
                <div className="py-1 space-y-1">
                  {rolesList.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                        role === r
                          ? 'bg-brand-500/15 text-brand-600 dark:text-brand-400'
                          : 'hover:bg-slate-100 dark:hover:bg-steel-800 text-slate-700 dark:text-steel-300'
                      )}
                    >
                      <span>{r}</span>
                      {role === r && <Sparkles className="h-3 w-3 text-brand-500" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Customer Portal Link */}
          <a
            href="/portal/dashboard"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-xs hover:bg-purple-500/20 transition-colors"
            title="Launch Customer Self-Service Portal"
          >
            <Sparkles className="h-3.5 w-3.5" /> Customer Portal
          </a>

          {/* Theme Toggle (Dark / Light) */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-steel-700 text-slate-600 dark:text-steel-300 hover:bg-slate-100 dark:hover:bg-steel-800 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Notifications Trigger */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-steel-700 text-slate-600 dark:text-steel-300 hover:bg-slate-100 dark:hover:bg-steel-800 transition-colors"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white shadow-sm animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-steel-800 transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-steel-900 text-white text-xs font-bold shadow-sm">
                {user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'US'}
              </div>
            </button>

            {isProfileMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-steel-700 bg-white dark:bg-steel-900 p-2 shadow-xl z-50 animate-in fade-in duration-150"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-100 dark:border-steel-800">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {user?.fullName || 'User Account'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-steel-400 truncate">
                    {user?.email || 'user@forgeiq.com'}
                  </p>
                </div>

                <div className="py-1 space-y-0.5">
                  <a
                    href="/settings"
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-steel-300 hover:bg-slate-100 dark:hover:bg-steel-800"
                  >
                    <Sliders className="h-3.5 w-3.5" />
                    Account & Company Settings
                  </a>
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
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
