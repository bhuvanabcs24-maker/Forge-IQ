'use client';

import React from 'react';
import Link from 'next/link';
import { DataEvidence } from '@/types/copilot';
import { ShoppingBag, FileText, Boxes, Cpu, Users, Receipt, Truck, ExternalLink } from 'lucide-react';

export function EvidenceCard({ evidence }: { evidence: DataEvidence }) {
  const getIcon = () => {
    switch (evidence.type) {
      case 'order':
        return <ShoppingBag className="h-3.5 w-3.5 text-slate-600 dark:text-steel-300" />;
      case 'quotation':
        return <FileText className="h-3.5 w-3.5 text-slate-600 dark:text-steel-300" />;
      case 'inventory':
        return <Boxes className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />;
      case 'machine':
        return <Cpu className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />;
      case 'customer':
        return <Users className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'invoice':
        return <Receipt className="h-3.5 w-3.5 text-slate-600 dark:text-steel-300" />;
      case 'supplier':
        return <Truck className="h-3.5 w-3.5 text-slate-600 dark:text-steel-300" />;
      default:
        return <FileText className="h-3.5 w-3.5 text-slate-600 dark:text-steel-300" />;
    }
  };

  return (
    <Link
      href={evidence.linkHref || '/dashboard'}
      className="flex items-center justify-between p-2.5 rounded-lg border border-[#E4E7EC] dark:border-[#252B33] bg-[#F9FAFB] dark:bg-[#18202A] hover:border-[#D0D5DD] dark:hover:border-[#344054] hover:bg-white dark:hover:bg-[#11161D] transition-colors text-xs group shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="p-1.5 rounded-md bg-white dark:bg-[#11161D] shrink-0 border border-[#E4E7EC] dark:border-[#252B33]">
          {getIcon()}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-[#111827] dark:text-[#F2F4F7] truncate text-xs">
            {evidence.title}
          </div>
          <div className="text-[11px] font-mono text-[#667085] dark:text-[#98A2B3] truncate">
            {evidence.subtitle}
          </div>
        </div>
      </div>

      {evidence.keyMetric && (
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <span className="font-mono text-[11px] font-semibold text-[#344054] dark:text-[#D0D5DD] bg-white dark:bg-[#11161D] px-2 py-0.5 rounded-[6px] border border-[#E4E7EC] dark:border-[#252B33]">
            {evidence.keyMetric}
          </span>
          <ExternalLink className="h-3 w-3 text-[#667085] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
    </Link>
  );
}
