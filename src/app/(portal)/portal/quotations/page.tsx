'use client';

import React, { useState } from 'react';
import { useCustomerPortal } from '@/context/customer-portal-context';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QuoteApprovalModal } from '@/components/portal/quote-approval-modal';
import { QuotePdfViewerModal } from '@/components/quotations/quote-pdf-viewer-modal';
import { CustomerQuoteView } from '@/types/customer-portal';
import { formatCurrency } from '@/lib/utils';
import { globalProactiveNotifications } from '@/lib/messaging/notifications';
import { FileText, Eye, CheckCircle2, Download, RefreshCw, Sparkles } from 'lucide-react';

export default function CustomerQuotationsPage() {
  const { currentCustomer } = useCustomerPortal();

  const [quotes, setQuotes] = useState<CustomerQuoteView[]>([
    {
      id: 'q-1',
      quotationNumber: 'RFQ-2026-0891',
      title: 'Batch 500 Avionics Heat Sink Flanges',
      status: 'Sent',
      totalAmount: 42500,
      validUntil: '2026-08-30',
      pdfUrl: '/api/quotations/RFQ-2026-0891/pdf?action=download',
      lineItemsCount: 2,
    },
    {
      id: 'q-2',
      quotationNumber: 'RFQ-2026-0413',
      title: 'Structural Steel Support Ribs (304 SS)',
      status: 'Approved',
      totalAmount: 64200,
      validUntil: '2026-08-15',
      pdfUrl: '/api/quotations/RFQ-2026-0413/pdf?action=download',
      lineItemsCount: 4,
    },
  ]);

  const [selectedApprovalQuote, setSelectedApprovalQuote] = useState<CustomerQuoteView | null>(null);
  const [selectedPreviewNumber, setSelectedPreviewNumber] = useState<string | null>(null);

  const handleApprove = (signerName: string) => {
    if (!selectedApprovalQuote) return;

    setQuotes((prev) =>
      prev.map((q) => (q.id === selectedApprovalQuote.id ? { ...q, status: 'Approved' } : q))
    );

    globalProactiveNotifications.notifyQuoteApproved(
      currentCustomer.phone,
      selectedApprovalQuote.quotationNumber,
      signerName,
      selectedApprovalQuote.totalAmount
    );
  };

  const handleRevisionRequest = (notes: string) => {
    setQuotes((prev) =>
      prev.map((q) => (q.id === selectedApprovalQuote?.id ? { ...q, status: 'Draft' } : q))
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Active Quotations & Digital Approvals"
        description={`Review official pricing proposals, download PDF quotes, or digitally sign approvals for ${currentCustomer.companyName}.`}
        breadcrumbs={[
          { label: 'Portal', href: '/portal/dashboard' },
          { label: 'Quotations' },
        ]}
      />

      <div className="space-y-4">
        {quotes.map((quote) => (
          <Card key={quote.id} className="border-slate-200 dark:border-steel-800">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 font-bold shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {quote.quotationNumber}
                    </span>
                    <Badge status={quote.status} />
                  </div>
                  <h4 className="font-semibold text-slate-800 dark:text-steel-200 mt-0.5">
                    {quote.title}
                  </h4>
                  <div className="text-[11px] text-slate-500 dark:text-steel-400 mt-0.5">
                    {quote.lineItemsCount} Line Items • Valid until {quote.validUntil}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-100 dark:border-steel-800 pt-3 sm:pt-0">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-400 block">Total Estimate</span>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                    {formatCurrency(quote.totalAmount)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPreviewNumber(quote.quotationNumber)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" /> Preview
                  </Button>

                  <a href={`/api/quotations/${quote.quotationNumber}/pdf?action=download`} download={`${quote.quotationNumber}.html`}>
                    <Button variant="outline" size="sm">
                      <Download className="h-3.5 w-3.5 mr-1" /> Download PDF
                    </Button>
                  </a>

                  {quote.status === 'Sent' && (
                    <Button size="sm" onClick={() => setSelectedApprovalQuote(quote)}>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Review & Approve
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedApprovalQuote && (
        <QuoteApprovalModal
          isOpen={!!selectedApprovalQuote}
          onClose={() => setSelectedApprovalQuote(null)}
          quote={selectedApprovalQuote}
          onApprove={handleApprove}
          onRevisionRequest={handleRevisionRequest}
        />
      )}

      {selectedPreviewNumber && (
        <QuotePdfViewerModal
          isOpen={!!selectedPreviewNumber}
          onClose={() => setSelectedPreviewNumber(null)}
          quotationNumber={selectedPreviewNumber}
        />
      )}
    </div>
  );
}
