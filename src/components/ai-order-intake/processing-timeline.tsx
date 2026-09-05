'use client';

import React from 'react';
import { ProcessingTimelineStep } from '@/types/ai-order-intake';
import { CheckCircle2, Clock, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProcessingTimeline({ steps }: { steps: ProcessingTimelineStep[] }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900/90 p-4 shadow-sm">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-steel-400 mb-3">
        Document Processing Status Timeline
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {steps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';
          const isError = step.status === 'error';

          return (
            <div
              key={step.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border text-xs transition-all relative',
                isCompleted && 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400',
                isCurrent && 'border-brand-500/40 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold shadow-xs',
                isError && 'border-rose-500/30 bg-rose-500/5 text-rose-600 dark:text-rose-400',
                step.status === 'pending' && 'border-slate-200 dark:border-steel-800 text-slate-400 dark:text-steel-500 opacity-60'
              )}
            >
              <div className="shrink-0">
                {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                {isCurrent && <Loader2 className="h-4 w-4 text-brand-500 animate-spin" />}
                {isError && <AlertCircle className="h-4 w-4 text-rose-500" />}
                {step.status === 'pending' && <Clock className="h-4 w-4" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-bold truncate text-slate-900 dark:text-slate-100">{step.title}</div>
                {step.timestamp && (
                  <div className="text-[10px] opacity-75 truncate">{step.timestamp}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
