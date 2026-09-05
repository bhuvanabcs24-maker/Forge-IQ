'use client';

import React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QuotationRevision } from '@/types/quotation-engine';
import { formatCurrency, formatDate } from '@/lib/utils';
import { History, CheckCircle2, ArrowRight } from 'lucide-react';

interface RevisionHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  revisions: QuotationRevision[];
  currentRevision: string;
}

export function RevisionHistoryDialog({
  isOpen,
  onClose,
  revisions,
  currentRevision,
}: RevisionHistoryDialogProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Quotation Revision Version History" maxWidth="md">
      <div className="space-y-4 text-xs">
        <p className="text-slate-500 dark:text-steel-400">
          Every quotation edit generates an immutable revision entry preserving original cost snapshots.
        </p>

        <div className="space-y-3">
          {revisions.map((rev) => {
            const isCurrent = rev.revisionNumber === currentRevision;

            return (
              <div
                key={rev.revisionNumber}
                className={`p-3.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/15'
                    : 'border-slate-200 dark:border-steel-800 bg-slate-50/50 dark:bg-steel-900/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-brand-600 dark:text-brand-400 text-sm">
                      {rev.revisionNumber}
                    </span>
                    {isCurrent && (
                      <span className="rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5">
                        Active Revision
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {formatDate(rev.createdAt)} by {rev.createdBy}
                  </span>
                </div>

                <p className="mt-1 text-slate-700 dark:text-steel-200 font-medium">
                  {rev.changeSummary}
                </p>

                <div className="mt-2 flex justify-between items-center text-[11px] border-t border-slate-200/60 dark:border-steel-800 pt-2">
                  <span className="text-slate-500">{rev.lineItems.length} Line Items</span>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">
                    Grand Total: {formatCurrency(rev.costBreakdown.grandTotal)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-steel-800">
          <Button onClick={onClose}>Close Revisions</Button>
        </div>
      </div>
    </Dialog>
  );
}
