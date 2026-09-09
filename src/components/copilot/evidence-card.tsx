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
      className="flex items-center justify-between p-2 rounded-md border border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-950/80 hover:border-slate-300 dark:hover:border-steel-700 transition-colors text-xs group shadow-2xs"
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="p-1 rounded bg-slate-100 dark:bg-steel-800 shrink-0 border border-slate-200/80 dark:border-steel-700">
          {getIcon()}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-slate-900 dark:text-slate-100 truncate text-[11px]">
            {evidence.title}
          </div>
          <div className="text-[10px] font-mono text-slate-500 dark:text-steel-400 truncate">
            {evidence.subtitle}
          </div>
        </div>
      </div>

      {evidence.keyMetric && (
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <span className="font-mono text-[10px] font-semibold text-slate-700 dark:text-steel-300 bg-slate-100 dark:bg-steel-800 px-1.5 py-0.2 rounded border border-slate-200 dark:border-steel-700">
            {evidence.keyMetric}
          </span>
          <ExternalLink className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
    </Link>
  );
}
