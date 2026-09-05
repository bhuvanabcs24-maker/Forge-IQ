'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { CommandPalette } from './command-palette';
import {
  Sparkles,
  Command,
  LayoutDashboard,
  Boxes,
  ShoppingBag,
  Wrench,
  Bot,
  Bell,
  UserCheck,
} from 'lucide-react';

export function FloatingNav() {
  const pathname = usePathname();
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  const mainTabs = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'CAD Analysis', href: '/cad-analysis', icon: Boxes },
    { label: 'Quotations', href: '/quotations/builder', icon: ShoppingBag },
    { label: 'Shop Floor', href: '/production/planner', icon: Wrench },
    { label: 'AI Copilot', href: '/ai-assistant', icon: Sparkles },
    { label: 'Customer Portal', href: '/portal/orders', icon: Bot },
  ];

  return (
    <>
      <header className="sticky top-4 z-40 w-full max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between px-4 py-2.5 rounded-full border border-slate-200 dark:border-steel-800 bg-white/80 dark:bg-steel-950/80 backdrop-blur-xl shadow-lg shadow-slate-900/5 dark:shadow-black/40"
        >
          {/* Logo & Brand Pill */}
          <Link href="/dashboard" className="flex items-center gap-2 pl-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 via-purple-600 to-indigo-600 text-white shadow-md font-extrabold text-sm">
              F
            </div>
            <span className="font-black tracking-tight text-sm text-slate-900 dark:text-slate-100 hidden sm:inline-block">
              ForgeIQ <span className="text-[10px] text-brand-500 font-bold ml-1">AI SAAS</span>
            </span>
          </Link>

          {/* Navigation Route Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/60 dark:bg-steel-900/60 p-1 rounded-full border border-slate-200/50 dark:border-steel-800/50 text-xs">
            {mainTabs.map((tab) => {
              const isActive = pathname.startsWith(tab.href);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all ${
                    isActive
                      ? 'bg-white dark:bg-steel-800 text-brand-600 dark:text-brand-400 shadow-2xs border border-slate-200 dark:border-steel-700'
                      : 'text-slate-600 dark:text-steel-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-brand-500' : ''}`} />
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Items: Command Palette Trigger & User Profile */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCommandOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-steel-800 bg-slate-100/80 dark:bg-steel-900/80 text-xs font-semibold text-slate-600 dark:text-steel-300 hover:border-brand-500 transition-colors"
            >
              <Command className="h-3.5 w-3.5 text-brand-500" />
              <span className="hidden lg:inline-block">Command Palette</span>
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-steel-800 border border-slate-200 dark:border-steel-700 text-slate-400">
                ⌘K
              </kbd>
            </button>

            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-steel-800 text-slate-600 dark:text-steel-300 hover:text-brand-500 transition-colors relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-brand-500 animate-ping" />
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-steel-800">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs">
                JD
              </div>
            </div>
          </div>
        </motion.div>
      </header>

      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </>
  );
}
