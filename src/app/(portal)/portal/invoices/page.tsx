'use client';

import React, { useState } from 'react';
import { useCustomerPortal } from '@/context/customer-portal-context';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CustomerInvoiceView } from '@/types/customer-portal';
import { formatCurrency } from '@/lib/utils';
import { Receipt, Download, CreditCard, CheckCircle } from 'lucide-react';
import { RazorpayPaymentModal } from '@/components/billing/razorpay-payment-modal';

export default function CustomerInvoicesPage() {
  const { currentCustomer } = useCustomerPortal();

  const [invoices, setInvoices] = useState<CustomerInvoiceView[]>([
    {
      id: 'inv-1',
      invoiceNumber: 'INV-2026-0771',
      amount: 78000,
      dueDate: '2026-08-01',
      status: 'Paid',
      pdfUrl: '/api/quotations/INV-2026-0771/pdf?action=download',
    },
    {
      id: 'inv-2',
      invoiceNumber: 'INV-2026-0775',
      amount: 19600,
      dueDate: '2026-08-25',
      status: 'Pending',
      pdfUrl: '/api/quotations/INV-2026-0775/pdf?action=download',
    },
  ]);

  const [selectedInvoice, setSelectedInvoice] = useState<CustomerInvoiceView | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [recentlyPaidId, setRecentlyPaidId] = useState<string | null>(null);

  const handleOpenPayModal = (inv: CustomerInvoiceView) => {
    setSelectedInvoice(inv);
    setIsPayModalOpen(true);
  };

  const handlePaymentSuccess = (payment: { paymentId: string; orderId: string }) => {
    if (!selectedInvoice) return;

    // Update invoice status to Paid
    setInvoices((prev) =>
      prev.map((item) =>
        item.id === selectedInvoice.id ? { ...item, status: 'Paid' } : item
      )
    );
    setRecentlyPaidId(selectedInvoice.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices & Settlement Ledger"
        description={`View billing statements, payment receipts, and settlement history for ${currentCustomer.companyName}.`}
        breadcrumbs={[
          { label: 'Portal', href: '/portal/dashboard' },
          { label: 'Invoices' },
        ]}
      />

      <div className="space-y-4">
        {invoices.map((inv) => (
          <Card key={inv.id} className="border-slate-200 dark:border-steel-800">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 font-bold shrink-0">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {inv.invoiceNumber}
                    </span>
                    <Badge variant={inv.status === 'Paid' ? 'success' : 'warning'}>
                      {inv.status}
                    </Badge>
                    {recentlyPaidId === inv.id && (
                      <span className="text-emerald-500 flex items-center gap-1 font-semibold text-[11px]">
                        <CheckCircle className="h-3 w-3" /> Settled via Razorpay
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-steel-400 mt-0.5">
                    Due Date: {inv.dueDate}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-100 dark:border-steel-800 pt-3 sm:pt-0">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-400 block">Amount</span>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                    {formatCurrency(inv.amount)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <a href={`/api/quotations/${inv.invoiceNumber}/pdf?action=download`} download={`${inv.invoiceNumber}.html`}>
                    <Button variant="outline" size="sm">
                      <Download className="h-3.5 w-3.5 mr-1" /> PDF Invoice
                    </Button>
                  </a>

                  {inv.status === 'Pending' && (
                    <Button
                      size="sm"
                      onClick={() => handleOpenPayModal(inv)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
                    >
                      <CreditCard className="h-3.5 w-3.5 mr-1" /> Pay with Razorpay
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedInvoice && (
        <RazorpayPaymentModal
          isOpen={isPayModalOpen}
          onClose={() => setIsPayModalOpen(false)}
          title="Settle Outstanding Invoice"
          description={`Payment to ForgeIQ Manufacturing Network for ${selectedInvoice.invoiceNumber}`}
          itemTitle={`Invoice ${selectedInvoice.invoiceNumber}`}
          itemSubtitle={`Due Date: ${selectedInvoice.dueDate} • Billed to ${currentCustomer.companyName}`}
          amount={selectedInvoice.amount}
          metadata={{
            invoiceNumber: selectedInvoice.invoiceNumber,
            customerId: currentCustomer.id,
            companyName: currentCustomer.companyName,
          }}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
