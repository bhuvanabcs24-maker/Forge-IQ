'use client';

import React from 'react';
import Link from 'next/link';
import { CustomerPortalProvider } from '@/context/customer-portal-context';
import { CustomerHeader } from '@/components/portal/customer-header';
import { LayoutDashboard, FileText, ShoppingBag, Receipt, MessageSquare, Sparkles } from 'lucide-react';

export default function CustomerPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <CustomerPortalProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-steel-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
        <CustomerHeader />

        <div className="flex flex-1">
          {/* Side Navigation Bar */}
          <aside className="w-64 border-r border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900/50 p-4 space-y-1 hidden md:block">
            <Link
              href="/portal/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-100 dark:hover:bg-steel-800 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-brand-500" /> Executive Summary
            </Link>
            <Link
              href="/portal/quotations"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-100 dark:hover:bg-steel-800 transition-colors"
            >
              <FileText className="h-4 w-4 text-purple-500" /> Quotations & Approvals
            </Link>
            <Link
              href="/portal/orders"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-100 dark:hover:bg-steel-800 transition-colors"
            >
              <ShoppingBag className="h-4 w-4 text-blue-500" /> Production Progress
            </Link>
            <Link
              href="/portal/invoices"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-100 dark:hover:bg-steel-800 transition-colors"
            >
              <Receipt className="h-4 w-4 text-emerald-500" /> Invoices & Receipts
            </Link>
            <Link
              href="/portal/messages"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-100 dark:hover:bg-steel-800 transition-colors"
            >
              <MessageSquare className="h-4 w-4 text-amber-500" /> WhatsApp & Messages
            </Link>
            <Link
              href="/portal/ai-assistant"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-100 dark:hover:bg-steel-800 transition-colors"
            >
              <Sparkles className="h-4 w-4 text-purple-400" /> AI Customer Assistant
            </Link>
          </aside>

          {/* Main Workspace Area */}
          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </CustomerPortalProvider>
  );
}
