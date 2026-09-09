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
    <div className="p-2.5 rounded-lg border border-slate-200 dark:border-steel-800 bg-slate-50/70 dark:bg-steel-950/70 flex items-center justify-between gap-3 text-xs shadow-2xs">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-200 dark:bg-steel-800 text-slate-700 dark:text-steel-300 shrink-0 border border-slate-300/80 dark:border-steel-700">
          <Zap className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate">{action.label}</div>
          <div className="text-[10px] text-slate-500 dark:text-steel-400 truncate">
            {action.description}
          </div>
        </div>
      </div>

      <Button
        size="sm"
        onClick={handleExecute}
        disabled={executed}
        className="shrink-0 text-[11px] h-7 px-2.5 font-medium"
      >
        {executed ? (
          <span className="flex items-center gap-1 text-emerald-300 font-semibold">
            <Check className="h-3 w-3" /> Executed
          </span>
        ) : (
          <span className="flex items-center gap-1">
            Execute <ArrowRight className="h-3 w-3" />
          </span>
        )}
      </Button>
    </div>
  );
}
