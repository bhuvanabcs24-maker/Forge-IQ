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
    <div className="p-3 rounded-lg border border-[#E4E7EC] dark:border-[#252B33] bg-[#F9FAFB] dark:bg-[#18202A] flex items-center justify-between gap-3 text-xs shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-[#11161D] text-[#155EEF] shrink-0 border border-[#E4E7EC] dark:border-[#252B33]">
          <Zap className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-[#111827] dark:text-[#F2F4F7] text-xs truncate">{action.label}</div>
          <div className="text-[11px] text-[#667085] dark:text-[#98A2B3] truncate">
            {action.description}
          </div>
        </div>
      </div>

      <Button
        size="sm"
        variant="primary"
        onClick={handleExecute}
        disabled={executed}
        className="shrink-0 text-xs h-8 px-3 font-semibold"
      >
        {executed ? (
          <span className="flex items-center gap-1 text-white font-semibold">
            <Check className="h-3.5 w-3.5" /> Executed
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
