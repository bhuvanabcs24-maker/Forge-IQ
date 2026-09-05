'use client';

import React from 'react';
import Link from 'next/link';
import { DataEvidence } from '@/types/copilot';
import { ShoppingBag, FileText, Boxes, Cpu, Users, Receipt, Truck, ExternalLink } from 'lucide-react';

export function EvidenceCard({ evidence }: { evidence: DataEvidence }) {
  const getIcon = () => {
    switch (evidence.type) {
      case 'order':
        return <ShoppingBag className="h-3.5 w-3.5 text-brand-500" />;
      case 'quotation':
        return <FileText className="h-3.5 w-3.5 text-purple-500" />;
      case 'inventory':
        return <Boxes className="h-3.5 w-3.5 text-amber-500" />;
      case 'machine':
        return <Cpu className="h-3.5 w-3.5 text-blue-500" />;
      case 'customer':
        return <Users className="h-3.5 w-3.5 text-emerald-500" />;
      case 'invoice':
        return <Receipt className="h-3.5 w-3.5 text-rose-500" />;
      case 'supplier':
        return <Truck className="h-3.5 w-3.5 text-indigo-500" />;
      default:
        return <FileText className="h-3.5 w-3.5 text-brand-500" />;
    }
  };

  return (
    <Link
      href={evidence.linkHref || '/dashboard'}
      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900/90 hover:border-brand-500 dark:hover:border-brand-500 transition-all text-xs group"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="p-1.5 rounded-md bg-slate-100 dark:bg-steel-800 shrink-0">
          {getIcon()}
        </div>
        <div className="min-w-0">
          <div className="font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-brand-500">
            {evidence.title}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-steel-400 truncate">
            {evidence.subtitle}
          </div>
        </div>
      </div>

      {evidence.keyMetric && (
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className="font-mono font-bold text-slate-800 dark:text-steel-200 text-[11px] bg-slate-100 dark:bg-steel-800 px-2 py-0.5 rounded">
            {evidence.keyMetric}
          </span>
          <ExternalLink className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
    </Link>
  );
}
