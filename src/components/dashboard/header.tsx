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
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#E4E7EC] dark:border-[#252B33] bg-white dark:bg-[#11161D] px-6 select-none shadow-[0_1px_2px_rgba(16,24,40,0.02)]">
        {/* Left Side: Mobile Menu Button & Search Field */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 rounded-lg text-[#667085] hover:text-[#111827] dark:hover:text-[#F2F4F7] hover:bg-[#F9FAFB] dark:hover:bg-[#18202A] cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Premium Global Command Search */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="flex items-center gap-2.5 rounded-lg border border-[#E4E7EC] dark:border-[#252B33] bg-[#F9FAFB] dark:bg-[#18202A] px-3.5 h-10 text-sm text-[#667085] dark:text-[#98A2B3] hover:border-[#D0D5DD] dark:hover:border-[#344054] transition-colors w-[260px] sm:w-[320px] cursor-pointer shadow-[0_1px_2px_rgba(16,24,40,0.02)]"
          >
            <Search className="h-[18px] w-[18px] shrink-0 text-[#667085] dark:text-[#98A2B3]" />
            <span className="truncate text-sm font-normal">Search orders, SKUs, machines...</span>
            <kbd className="ml-auto hidden sm:inline-flex items-center justify-center rounded border border-[#D0D5DD] dark:border-[#344054] bg-white dark:bg-[#11161D] px-1.5 h-5 text-[11px] font-medium text-[#667085] dark:text-[#98A2B3] shadow-2xs font-mono">
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
                'flex items-center gap-1.5 rounded-lg border px-3 h-10 text-xs font-semibold tracking-tight transition-colors cursor-pointer shadow-[0_1px_2px_rgba(16,24,40,0.02)]',
                ROLE_BADGE_COLORS[role]
              )}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>{role}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60 ml-0.5" />
            </button>

            {isRoleDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-52 rounded-xl border border-[#E4E7EC] dark:border-[#252B33] bg-white dark:bg-[#11161D] p-1.5 shadow-[0_8px_24px_-4px_rgba(16,24,40,0.08)] z-50 animate-in fade-in duration-100"
                onClick={() => setIsRoleDropdownOpen(false)}
              >
                <div className="px-3 py-2 border-b border-[#E4E7EC] dark:border-[#252B33]">
                  <p className="text-xs font-semibold text-[#111827] dark:text-[#F2F4F7]">
                    Switch Perspective
                  </p>
                  <p className="text-[11px] text-[#667085] dark:text-[#98A2B3]">
                    Live RBAC permissions preview
                  </p>
                </div>
                <div className="py-1 space-y-0.5">
                  {rolesList.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer',
                        role === r
                          ? 'bg-[#EFF4FF] dark:bg-[#155EEF]/15 text-[#175CD3] dark:text-[#528BFF] font-semibold'
                          : 'hover:bg-[#F9FAFB] dark:hover:bg-[#18202A] text-[#344054] dark:text-[#D0D5DD]'
                      )}
                    >
                      <span>{r}</span>
                      {role === r && <span className="h-1.5 w-1.5 rounded-full bg-[#155EEF]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Customer Portal Link */}
          <a
            href="/portal/login"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 h-10 rounded-lg border border-[#D0D5DD] dark:border-[#252B33] bg-white dark:bg-[#11161D] text-[#344054] dark:text-[#D0D5DD] font-medium text-xs hover:bg-[#F9FAFB] dark:hover:bg-[#18202A] transition-colors shadow-[0_1px_2px_rgba(16,24,40,0.02)]"
            title="Launch Customer Self-Service Portal"
          >
            <span>Customer Portal</span>
            <ExternalLink className="h-3 w-3 text-[#667085]" />
          </a>

          {/* Theme Toggle (40x40px, 8px radius) */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#D0D5DD] dark:border-[#252B33] bg-white dark:bg-[#11161D] text-[#667085] dark:text-[#98A2B3] hover:bg-[#F9FAFB] dark:hover:bg-[#18202A] transition-colors shadow-[0_1px_2px_rgba(16,24,40,0.02)] cursor-pointer"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-[18px] w-[18px] text-amber-400" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>

          {/* Notifications Trigger (40x40px, 8px radius) */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-[#D0D5DD] dark:border-[#252B33] bg-white dark:bg-[#11161D] text-[#667085] dark:text-[#98A2B3] hover:bg-[#F9FAFB] dark:hover:bg-[#18202A] transition-colors shadow-[0_1px_2px_rgba(16,24,40,0.02)] cursor-pointer"
            title="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-[#155EEF]" />
            )}
          </button>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F2F4F7] dark:bg-[#18202A] border border-[#E4E7EC] dark:border-[#252B33] text-[#344054] dark:text-[#D0D5DD] text-xs font-semibold shadow-[0_1px_2px_rgba(16,24,40,0.02)] hover:bg-[#E4E7EC] transition-colors cursor-pointer"
              title="Account Menu"
            >
              {user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'US'}
            </button>

            {isProfileMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl border border-[#E4E7EC] dark:border-[#252B33] bg-white dark:bg-[#11161D] p-1.5 shadow-[0_8px_24px_-4px_rgba(16,24,40,0.08)] z-50 animate-in fade-in duration-100"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <div className="px-3 py-2 border-b border-[#E4E7EC] dark:border-[#252B33]">
                  <p className="text-sm font-semibold text-[#111827] dark:text-[#F2F4F7] truncate">
                    {user?.fullName || 'User Account'}
                  </p>
                  <p className="text-xs text-[#667085] dark:text-[#98A2B3] truncate">
                    {user?.email || 'user@forgeiq.com'}
                  </p>
                </div>

                <div className="py-1 space-y-0.5">
                  <a
                    href="/settings"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-[#344054] dark:text-[#D0D5DD] hover:bg-[#F9FAFB] dark:hover:bg-[#18202A] transition-colors"
                  >
                    <Sliders className="h-4 w-4 text-[#667085]" />
                    Account Settings
                  </a>
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-[#B42318] hover:bg-[#FEF3F2] dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
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
