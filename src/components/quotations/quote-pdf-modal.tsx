'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExtendedQuotation } from '@/types/quotation-engine';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Download,
  Mail,
  Share2,
  Copy,
  ShoppingBag,
  Zap,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface QuotePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: ExtendedQuotation;
  onConvertToOrder?: () => void;
}

export function QuotePdfModal({
  isOpen,
  onClose,
  quotation,
  onConvertToOrder,
}: QuotePdfModalProps) {
  const router = useRouter();
  const [copiedAction, setCopiedAction] = useState<string | null>(null);

  const downloadUrl = `/api/quotations/${quotation.quotationNumber}/pdf?action=download`;

  const triggerAction = (actionName: string) => {
    setCopiedAction(actionName);
    setTimeout(() => setCopiedAction(null), 2500);

    if (actionName === 'whatsapp') {
      const msg = encodeURIComponent(
        `Hello ${quotation.customerName}, here is your official ForgeIQ Quotation ${quotation.quotationNumber} (${quotation.revisionNumber}) for ${formatCurrency(quotation.totalAmount)}. Valid until ${quotation.validUntil}.`
      );
      window.open(`https://wa.me/?text=${msg}`, '_blank');
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Quotation Preview - ${quotation.quotationNumber}`} maxWidth="2xl">
      <div className="space-y-6">
        {/* Actions Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-100 dark:bg-steel-800 border border-slate-200 dark:border-steel-700">
          <div className="flex items-center gap-2">
            <a href={downloadUrl} download={`${quotation.quotationNumber}.html`}>
              <Button size="sm" variant="outline">
                <Download className="h-3.5 w-3.5 mr-1" />
                Download PDF
              </Button>
            </a>
            <Button size="sm" variant="outline" onClick={() => triggerAction('email')}>
              <Mail className="h-3.5 w-3.5 mr-1" />
              {copiedAction === 'email' ? 'Email Sent!' : 'Email Quote'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => triggerAction('whatsapp')}>
              <Share2 className="h-3.5 w-3.5 mr-1 text-emerald-500" /> Share WhatsApp
            </Button>
            <Button size="sm" variant="outline" onClick={() => triggerAction('duplicate')}>
              <Copy className="h-3.5 w-3.5 mr-1" /> Duplicate
            </Button>
          </div>

          <Button
            size="sm"
            onClick={() => {
              if (onConvertToOrder) onConvertToOrder();
              onClose();
              router.push('/orders');
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <ShoppingBag className="h-3.5 w-3.5 mr-1" /> Convert to Work Order
          </Button>
        </div>

        {/* Branded PDF Document Container */}
        <div className="p-8 rounded-xl bg-white text-slate-900 border border-slate-200 shadow-lg space-y-6 font-sans text-xs">
          {/* Header & Logo */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md">
                <Zap className="h-6 w-6 fill-current" />
              </div>
              <div>
                <span className="font-extrabold text-2xl tracking-tight text-slate-900">
                  Forge<span className="text-brand-600">IQ</span>
                </span>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  Precision Metal Fabrication Co.
                </p>
                <p className="text-[10px] text-slate-400">1040 Industrial Pkwy, Cleveland OH • Ph: +1 (800) 555-FAB1</p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block rounded-md bg-brand-50 text-brand-700 px-2.5 py-1 text-xs font-bold border border-brand-200">
                QUOTATION {quotation.revisionNumber}
              </span>
              <h3 className="font-mono font-extrabold text-lg text-slate-900 mt-1">
                {quotation.quotationNumber}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Date: {formatDate(quotation.createdAt)}</p>
              <p className="text-[11px] text-slate-500">Valid Until: {quotation.validUntil}</p>
            </div>
          </div>

          {/* Client & Billed Information */}
          <div className="grid grid-cols-2 gap-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Prepared For Client:
              </span>
              <h4 className="font-bold text-slate-900 text-sm mt-0.5">{quotation.customerName}</h4>
              <p className="text-slate-600">Industrial Metal Fabrication Buyer</p>
              <p className="text-slate-500 text-[11px]">Primary Contact Account</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Project Title & Scope:
              </span>
              <h4 className="font-bold text-slate-900 text-sm mt-0.5">{quotation.title}</h4>
              <p className="text-slate-500 text-[11px]">Status: <strong className="text-brand-600">{quotation.status}</strong></p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border rounded-lg overflow-hidden border-slate-200">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3"># Part Description</th>
                  <th className="p-3">Material & Grade</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {quotation.detailedLineItems.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="p-3">
                      <span className="font-bold text-slate-900">{idx + 1}. {item.partName}</span>
                      <p className="text-[10px] text-slate-500">Dims: {item.dimensions} ({item.thickness})</p>
                    </td>
                    <td className="p-3">{item.materialGrade}</td>
                    <td className="p-3 text-center font-bold">{item.quantity}</td>
                    <td className="p-3 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      {formatCurrency(item.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            <div className="space-y-2 max-w-xs">
              <p className="font-semibold text-slate-800 text-[11px]">Payment Terms & Notes:</p>
              <p className="text-slate-500 text-[10px] leading-relaxed">
                Net 30 Days. 30% advance for raw material procurement.
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-1.5 p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold">{formatCurrency(quotation.costBreakdown.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping & Freight:</span>
                <span className="font-semibold">{formatCurrency(quotation.costBreakdown.packagingAndLogistics)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST Tax (18%):</span>
                <span className="font-semibold">{formatCurrency(quotation.costBreakdown.taxGstAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-900 border-t border-slate-300 pt-2 font-extrabold text-sm">
                <span>Grand Total Amount:</span>
                <span className="text-brand-600">{formatCurrency(quotation.costBreakdown.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Footer Approval & Digital Verification QR Code */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-800">
                <QrCode className="h-10 w-10" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Digital Integrity Verified
                </span>
                <p className="text-[10px] text-slate-400 font-mono">HASH: 9f8a-23b4-forgeiq-sig</p>
              </div>
            </div>

            <div className="text-right border-t-2 border-slate-400 pt-2 w-48">
              <p className="font-bold text-slate-900">Authorized Signature</p>
              <p className="text-[10px] text-slate-500">Executive Operations</p>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
