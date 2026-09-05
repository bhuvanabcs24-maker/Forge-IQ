'use client';

import React from 'react';
import Link from 'next/link';
import { useCustomerPortal } from '@/context/customer-portal-context';
import { MOCK_CUSTOMERS } from '@/lib/mock-data/manufacturing';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, User, Sparkles, LogOut, ArrowLeft } from 'lucide-react';

export function CustomerHeader() {
  const { currentCustomer, switchCustomerAccount } = useCustomerPortal();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-steel-800 bg-white/90 dark:bg-steel-900/90 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <Link href="/portal/dashboard" className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 text-white font-black text-xs shadow-md">
            F
          </div>
          <span className="text-sm">ForgeIQ Customer Portal</span>
        </Link>

        {/* Customer Account Switcher for Demo Scope Testing */}
        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-steel-800 text-xs">
          <span className="text-slate-500">Client Scope:</span>
          <Select
            options={MOCK_CUSTOMERS.map((c) => ({ label: c.companyName, value: c.id }))}
            value={currentCustomer.customerId}
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
              {currentCustomer.contactName}
            </span>
            <span className="text-[10px] text-slate-500 block">{currentCustomer.companyName}</span>
          </div>

          <Link href="/dashboard">
            <Button variant="outline" size="sm" title="Exit to Internal Admin Dashboard">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Admin Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
