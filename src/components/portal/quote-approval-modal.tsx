'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CustomerQuoteView } from '@/types/customer-portal';
import { formatCurrency } from '@/lib/utils';
import { FileText, Check, ShieldCheck, RefreshCw, X } from 'lucide-react';

interface QuoteApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: CustomerQuoteView;
  onApprove: (signerName: string) => void;
  onRevisionRequest: (notes: string) => void;
}

export function QuoteApprovalModal({
  isOpen,
  onClose,
  quote,
  onApprove,
  onRevisionRequest,
}: QuoteApprovalModalProps) {
  const [signerName, setSignerName] = useState('Robert Vance (Director of Procurement)');
  const [revisionNotes, setRevisionNotes] = useState('');
  const [isRevisionMode, setIsRevisionMode] = useState(false);

  const handleConfirmApproval = () => {
    onApprove(signerName);
    onClose();
  };

  const handleConfirmRevision = () => {
    onRevisionRequest(revisionNotes);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Digital Quotation Review - ${quote.quotationNumber}`} maxWidth="md">
      <div className="space-y-4 text-xs">
        {/* Quote Core Summary */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-steel-800 bg-slate-50 dark:bg-steel-900/60 flex items-center justify-between">
          <div>
            <span className="text-slate-500 block">Quotation Title:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{quote.title}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 block">Grand Total:</span>
            <span className="font-extrabold text-brand-600 dark:text-brand-400 text-base">
              {formatCurrency(quote.totalAmount)}
            </span>
          </div>
        </div>

        {!isRevisionMode ? (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>Digital approval authorizes raw material reservation and initiates shop floor dispatch.</span>
            </div>

            <div>
              <label className="block font-semibold mb-1">Authorized Digital Signer Name</label>
              <Input value={signerName} onChange={(e) => setSignerName(e.target.value)} />
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-steel-800">
              <Button variant="outline" onClick={() => setIsRevisionMode(true)}>
                <RefreshCw className="h-3.5 w-3.5 mr-1 text-amber-500" /> Request Price Revision
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleConfirmApproval}>
                  <Check className="h-3.5 w-3.5 mr-1" /> Sign & Digitally Approve Quote
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block font-semibold mb-1">Requested Revision Notes / Comments</label>
              <textarea
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="Specify required drawing changes, quantity updates, or price adjustments..."
                className="w-full h-24 p-3 rounded-lg border border-slate-300 dark:border-steel-700 bg-white dark:bg-steel-800 text-xs"
              />
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-steel-800">
              <Button variant="outline" onClick={() => setIsRevisionMode(false)}>
                Back to Approval
              </Button>

              <Button onClick={handleConfirmRevision}>
                Submit Revision Request
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
