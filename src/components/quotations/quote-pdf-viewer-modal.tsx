'use client';

import React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Printer, ExternalLink, ShieldCheck } from 'lucide-react';

interface QuotePdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotationNumber: string;
}

export function QuotePdfViewerModal({
  isOpen,
  onClose,
  quotationNumber,
}: QuotePdfViewerModalProps) {
  const pdfUrl = `/api/quotations/${quotationNumber}/pdf?action=preview`;
  const downloadUrl = `/api/quotations/${quotationNumber}/pdf?action=download`;

  const handlePrint = () => {
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Dynamic PDF Document Preview - ${quotationNumber}`}
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs">
        <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-purple-400" />
            <span className="font-bold text-slate-200">
              ForgeIQ Verified PDF Document ({quotationNumber})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint}>
              <Printer className="h-3.5 w-3.5 mr-1" /> Print Document
            </Button>
            <a href={downloadUrl} download={`${quotationNumber}.html`}>
              <Button size="sm">
                <Download className="h-3.5 w-3.5 mr-1" /> Download PDF File
              </Button>
            </a>
          </div>
        </div>

        {/* Embedded PDF Printable Viewer Frame */}
        <div className="h-[520px] w-full rounded-xl border border-slate-200 dark:border-steel-800 overflow-hidden bg-white">
          <iframe
            src={pdfUrl}
            className="w-full h-full border-none"
            title={`PDF Document ${quotationNumber}`}
          />
        </div>
      </div>
    </Dialog>
  );
}
