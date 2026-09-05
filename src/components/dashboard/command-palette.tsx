'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  Boxes,
  FileText,
  ShoppingBag,
  Sparkles,
  Bot,
  Package,
  Wrench,
  Users,
  Building2,
  FileCheck,
  BarChart3,
  Settings,
  Shield,
  ArrowRight,
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'AI Intelligence' | 'Management';
  icon: React.ReactNode;
  href: string;
  shortcut?: string;
}

export function CommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Parent handles opening
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const commands: CommandItem[] = [
    { id: '1', title: 'Executive Landing Dashboard', category: 'Navigation', icon: <LayoutDashboard className="h-4 w-4 text-brand-500" />, href: '/dashboard', shortcut: 'G D' },
    { id: '2', title: 'CAD & Engineering Intelligence', category: 'AI Intelligence', icon: <Boxes className="h-4 w-4 text-purple-500" />, href: '/cad-analysis', shortcut: 'G C' },
    { id: '3', title: 'AI Order Intake (OCR & Docs)', category: 'AI Intelligence', icon: <FileText className="h-4 w-4 text-blue-500" />, href: '/ai-order-intake', shortcut: 'G I' },
    { id: '4', title: 'AI Interactive Quote Builder', category: 'AI Intelligence', icon: <ShoppingBag className="h-4 w-4 text-emerald-500" />, href: '/quotations/builder', shortcut: 'G Q' },
    { id: '5', title: 'ForgeIQ Copilot (Multi-Agent Assistant)', category: 'AI Intelligence', icon: <Sparkles className="h-4 w-4 text-purple-400" />, href: '/ai-assistant', shortcut: 'G A' },
    { id: '6', title: 'Shop Floor Production Planner', category: 'Navigation', icon: <Wrench className="h-4 w-4 text-amber-500" />, href: '/production/planner', shortcut: 'G P' },
    { id: '7', title: 'Inventory & Material Stock', category: 'Management', icon: <Package className="h-4 w-4 text-slate-400" />, href: '/inventory', shortcut: 'G M' },
    { id: '8', title: 'Customer Directory & Accounts', category: 'Management', icon: <Users className="h-4 w-4 text-slate-400" />, href: '/customers', shortcut: 'G U' },
    { id: '9', title: 'Customer Portal Live Order Tracker', category: 'Navigation', icon: <Bot className="h-4 w-4 text-brand-400" />, href: '/portal/orders' },
    { id: '10', title: 'Admin Billing & Subscriptions', category: 'Management', icon: <Settings className="h-4 w-4 text-slate-400" />, href: '/settings/billing', shortcut: 'G S' },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="" maxWidth="md">
      <div className="space-y-3 -mt-2">
        {/* Search Bar Input */}
        <div className="relative flex items-center border-b border-slate-200 dark:border-steel-800 pb-3">
          <Search className="h-4 w-4 text-slate-400 mr-2.5 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search modules... (e.g. CAD, Quotes, Copilot)"
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400 font-sans"
            autoFocus
          />
          <kbd className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-steel-800 text-slate-500 shrink-0">
            ESC
          </kbd>
        </div>

        {/* Command List Results */}
        <div className="max-h-80 overflow-y-auto space-y-1 pr-1">
          {filteredCommands.map((cmd) => (
            <button
              key={cmd.id}
              onClick={() => handleSelect(cmd.href)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-steel-800/80 transition-colors text-left text-xs font-semibold text-slate-800 dark:text-slate-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-steel-800/60 group-hover:scale-105 transition-transform">
                  {cmd.icon}
                </div>
                <span>{cmd.title}</span>
              </div>

              <div className="flex items-center gap-2">
                {cmd.shortcut && (
                  <span className="font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-steel-800 px-1.5 py-0.5 rounded">
                    {cmd.shortcut}
                  </span>
                )}
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}

          {filteredCommands.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-400">
              No matching modules or commands found for "{query}"
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
