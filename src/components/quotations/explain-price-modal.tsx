'use client';

import React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  QuotationLineItemDetail,
  CostBreakdown,
  PricingRules,
} from '@/types/quotation-engine';
import { generatePriceExplanation } from '@/lib/pricing/explain-price';
import { Sparkles, FileText, CheckCircle2 } from 'lucide-react';

interface ExplainPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: QuotationLineItemDetail[];
  breakdown: CostBreakdown;
  rules: PricingRules;
}

export function ExplainPriceModal({
  isOpen,
  onClose,
  items,
  breakdown,
  rules,
}: ExplainPriceModalProps) {
  const explanation = generatePriceExplanation(items, breakdown, rules);

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="AI Natural-Language Price Explanation" maxWidth="lg">
      <div className="space-y-4 text-xs">
        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-300 flex items-center gap-2 font-medium">
          <Sparkles className="h-4 w-4 text-purple-500 shrink-0" />
          <span>Transparent cost telemetry generated from active administrative pricing rules and AI vision estimates.</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-sans leading-relaxed border border-steel-800 space-y-3 overflow-y-auto max-h-[380px]">
          {explanation.split('\n\n').map((paragraph, idx) => (
            <div key={idx} className="space-y-1">
              {paragraph.startsWith('###') ? (
                <h4 className="font-bold text-brand-400 text-sm">{paragraph.replace('###', '')}</h4>
              ) : (
                <p className="text-slate-300">{paragraph}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-steel-800">
          <Button onClick={onClose}>Close Explanation</Button>
        </div>
      </div>
    </Dialog>
  );
}
