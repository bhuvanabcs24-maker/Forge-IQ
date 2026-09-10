'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCustomerPortal } from '@/context/customer-portal-context';
import { MOCK_CUSTOMERS } from '@/lib/mock-data/manufacturing';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, User, Sparkles, LogOut, ArrowLeft } from 'lucide-react';

export function CustomerHeader() {
  const router = useRouter();
  const { currentCustomer, switchCustomerAccount, logout } = useCustomerPortal();

  const handleSignOut = () => {
    logout();
    router.push('/portal/login');
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-steel-800 bg-white/90 dark:bg-steel-900/90 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <Link href="/portal/dashboard" className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 text-white font-black text-xs shadow-md">
            F
          </div>
          <span className="text-sm">ForgeIQ Customer Portal</span>
        </Link>

        {/* Active Enterprise Buyer Organization Scope */}
        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-steel-800 text-xs">
          <span className="text-slate-500 font-medium">Enterprise Account:</span>
          <Select
            options={MOCK_CUSTOMERS.map((c) => ({ label: c.companyName, value: c.id }))}
            value={currentCustomer?.customerId || 'cust-1'}
            onChange={(e) => switchCustomerAccount(e.target.value)}
            className="h-8 text-xs font-semibold"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <Link href="/portal/ai-assistant">
          <Button variant="outline" size="sm" className="hidden sm:flex border-purple-500/30 text-purple-400">
            <Sparkles className="h-3.5 w-3.5 mr-1 text-purple-500" /> AI Assistant
          </Button>
        </Link>

        <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-steel-800">
          <div className="text-right hidden sm:block">
            <span className="font-bold block text-slate-900 dark:text-slate-100">
              {currentCustomer?.contactName || 'Client User'}
            </span>
            <span className="text-[10px] text-slate-500 block">
              {currentCustomer?.companyName || 'Enterprise Account'}
            </span>
          </div>

          <Link href="/dashboard">
            <Button variant="outline" size="sm" title="Switch to Factory Management Suite">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Factory OS
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
            title="Sign out of Customer Portal"
          >
            <LogOut className="h-3.5 w-3.5 sm:mr-1" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
