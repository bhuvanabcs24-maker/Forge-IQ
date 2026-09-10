'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CustomerPortalProvider, useCustomerPortal } from '@/context/customer-portal-context';
import { CustomerHeader } from '@/components/portal/customer-header';
import { LayoutDashboard, FileText, ShoppingBag, Receipt, MessageSquare, Sparkles, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function PortalContentGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useCustomerPortal();
  const isLoginPage = pathname === '/portal/login';

  // If not on login page and not authenticated, redirect to /portal/login
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.replace('/portal/login');
    }
  }, [isLoading, isAuthenticated, isLoginPage, router]);

  // If on login page, render full screen without sidebar/logged-in header
  if (isLoginPage) {
    return <>{children}</>;
  }

  // If still checking localStorage auth session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-steel-950 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-slate-500 dark:text-steel-400">
            Checking Customer Portal Authorization...
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, show sign in prompt while redirecting
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-steel-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-steel-900 border border-slate-200 dark:border-steel-800 shadow-xl text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Authentication Required
            </h2>
            <p className="text-xs text-slate-500 dark:text-steel-400 mt-1">
              You must sign in to your enterprise customer account to access order tracking and production telematics.
            </p>
          </div>
          <Button
            onClick={() => router.push('/portal/login')}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs"
          >
            <span className="flex items-center justify-center gap-1.5">
              Go to Customer Sign In <ArrowRight className="h-4 w-4" />
            </span>
          </Button>
        </div>
      </div>
    );
  }

  // Authenticated customer workspace layout
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-steel-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <CustomerHeader />

      <div className="flex flex-1">
        {/* Side Navigation Bar */}
        <aside className="w-64 border-r border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900/50 p-4 space-y-1 hidden md:block">
          <Link
            href="/portal/dashboard"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-colors ${
              pathname === '/portal/dashboard'
                ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400'
                : 'hover:bg-slate-100 dark:hover:bg-steel-800 text-slate-700 dark:text-steel-300'
            }`}
          >
            <LayoutDashboard className="h-4 w-4 text-brand-500" /> Executive Summary
          </Link>
          <Link
            href="/portal/quotations"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-colors ${
              pathname === '/portal/quotations'
                ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400'
                : 'hover:bg-slate-100 dark:hover:bg-steel-800 text-slate-700 dark:text-steel-300'
            }`}
          >
            <FileText className="h-4 w-4 text-purple-500" /> Quotations & Approvals
          </Link>
          <Link
            href="/portal/orders"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-colors ${
              pathname === '/portal/orders'
                ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400'
                : 'hover:bg-slate-100 dark:hover:bg-steel-800 text-slate-700 dark:text-steel-300'
            }`}
          >
            <ShoppingBag className="h-4 w-4 text-blue-500" /> Production Progress
          </Link>
          <Link
            href="/portal/invoices"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-colors ${
              pathname === '/portal/invoices'
                ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400'
                : 'hover:bg-slate-100 dark:hover:bg-steel-800 text-slate-700 dark:text-steel-300'
            }`}
          >
            <Receipt className="h-4 w-4 text-emerald-500" /> Invoices & Receipts
          </Link>
          <Link
            href="/portal/messages"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-colors ${
              pathname === '/portal/messages'
                ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400'
                : 'hover:bg-slate-100 dark:hover:bg-steel-800 text-slate-700 dark:text-steel-300'
            }`}
          >
            <MessageSquare className="h-4 w-4 text-amber-500" /> WhatsApp & Messages
          </Link>
          <Link
            href="/portal/ai-assistant"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-colors ${
              pathname === '/portal/ai-assistant'
                ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400'
                : 'hover:bg-slate-100 dark:hover:bg-steel-800 text-slate-700 dark:text-steel-300'
            }`}
          >
            <Sparkles className="h-4 w-4 text-purple-400" /> AI Customer Assistant
          </Link>
        </aside>

        {/* Main Workspace Area */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export default function CustomerPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <CustomerPortalProvider>
      <PortalContentGuard>{children}</PortalContentGuard>
    </CustomerPortalProvider>
  );
}
