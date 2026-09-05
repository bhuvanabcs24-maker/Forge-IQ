'use client';

import React, { useState } from 'react';
import { WhatsAppOrderDraft } from '@/types/messaging';
import { globalWhatsAppPipeline } from '@/lib/messaging/pipeline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, FileText, Check, X, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function DraftReviewCard({ draft }: { draft: WhatsAppOrderDraft }) {
  const router = useRouter();
  const [status, setStatus] = useState(draft.status);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await globalWhatsAppPipeline.approveDraftAndSendQuote(draft);
      setStatus('approved');
      setTimeout(() => router.push('/quotations'), 1000);
    } catch {
      // Handled
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-500" />
          <span className="font-bold text-slate-900 dark:text-slate-100">
            Incoming WhatsApp Order Draft
          </span>
        </div>
        <Badge variant={status === 'approved' ? 'success' : 'warning'}>
          {status === 'approved' ? 'Approved & Quote Sent' : 'Owner Review Pending'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 dark:text-steel-200">
        <div>Client: <strong>{draft.companyName}</strong> ({draft.customerName})</div>
        <div>Phone: <strong>{draft.customerPhone}</strong></div>
        <div>Extracted Part: <strong>{draft.extractedPartTitle}</strong></div>
        <div>Qty: <strong>{draft.extractedQuantity} pcs</strong></div>
      </div>

      {status === 'pending_review' && (
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-500/20">
          <Button size="sm" variant="outline" onClick={() => setStatus('rejected')}>
            <X className="h-3.5 w-3.5 mr-1" /> Reject
          </Button>
          <Button
            size="sm"
            onClick={handleApprove}
            disabled={isProcessing}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isProcessing ? (
              'Generating Quote PDF...'
            ) : (
              <span className="flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Approve & Dispatch PDF Quote
              </span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
