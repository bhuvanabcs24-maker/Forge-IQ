'use client';

import React, { useState } from 'react';
import { CopilotAction } from '@/types/copilot';
import { Button } from '@/components/ui/button';
import { Zap, Check, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ActionCard({ action }: { action: CopilotAction }) {
  const router = useRouter();
  const [executed, setExecuted] = useState(false);

  const handleExecute = () => {
    setExecuted(true);
    setTimeout(() => {
      if (action.type === 'approve_quote') router.push('/quotations');
      else if (action.type === 'create_po') router.push('/purchase-orders');
      else if (action.type === 'rebalance_schedule') router.push('/production');
      else if (action.type === 'send_invoice_reminder') router.push('/invoices');
    }, 1200);
  };

  return (
    <div className="p-3 rounded-xl border border-brand-500/30 bg-brand-500/5 dark:bg-brand-500/10 flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/20 text-brand-600 dark:text-brand-400 shrink-0">
          <Zap className="h-4 w-4" />
        </div>
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{action.label}</div>
          <div className="text-[11px] text-slate-500 dark:text-steel-400">
            {action.description}
          </div>
        </div>
      </div>

      <Button
        size="sm"
        onClick={handleExecute}
        disabled={executed}
        className="shrink-0 bg-brand-600 hover:bg-brand-700 text-white text-xs"
      >
        {executed ? (
          <span className="flex items-center gap-1 text-emerald-300 font-bold">
            <Check className="h-3.5 w-3.5" /> Action Executed!
          </span>
        ) : (
          <span className="flex items-center gap-1">
            Execute <ArrowRight className="h-3.5 w-3.5" />
          </span>
        )}
      </Button>
    </div>
  );
}
