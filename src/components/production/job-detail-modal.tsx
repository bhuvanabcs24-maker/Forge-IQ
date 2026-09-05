'use client';

import React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductionJobCard } from '@/types/production-planner';
import { formatDate } from '@/lib/utils';
import { Boxes, AlertTriangle, History, ShieldCheck, Cpu, UserCheck } from 'lucide-react';

interface JobDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: ProductionJobCard;
}

export function JobDetailModal({
  isOpen,
  onClose,
  job,
}: JobDetailModalProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Job Audit Details - ${job.orderNumber}`} maxWidth="lg">
      <div className="space-y-6 text-xs">
        {/* Job Core Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-steel-800/60 border border-slate-200 dark:border-steel-700">
          <div>
            <span className="text-slate-500 block">Work Order:</span>
            <span className="font-mono font-bold text-brand-500 text-sm">{job.orderNumber}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Customer:</span>
            <span className="font-bold">{job.customerName}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Priority:</span>
            <Badge variant="outline">{job.priority}</Badge>
          </div>
          <div>
            <span className="text-slate-500 block">Due Date:</span>
            <span className="font-bold">{job.dueDate}</span>
          </div>
        </div>

        {/* Material Stock Reservation Status */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-sm">
              <Boxes className="h-4 w-4 text-amber-500" /> Material Stock Reservation Gate
            </span>
            <Badge variant={job.materialReservation.hasShortage ? 'danger' : 'success'}>
              {job.materialReservation.hasShortage ? 'Shortage Warning' : 'Stock Reserved & Staged'}
            </Badge>
          </div>

          <div className="text-slate-600 dark:text-steel-300">
            SKU: <span className="font-mono font-bold">{job.materialReservation.requiredSku}</span> • Required: <strong>{job.materialReservation.requiredQuantity} {job.materialReservation.unit}</strong> • In Stock: <strong>{job.materialReservation.availableQuantity} {job.materialReservation.unit}</strong>
          </div>

          {job.materialReservation.hasShortage && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Production hard-locked due to stock shortage. Purchase Recommendation issued: <strong>{job.materialReservation.recommendedPoNumber}</strong>.</span>
            </div>
          )}
        </div>

        {/* Audit Trail Timeline */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
            <History className="h-4 w-4 text-brand-500" /> Stage Transition Audit Log History
          </h4>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {job.auditTrail.map((entry) => (
              <div
                key={entry.id}
                className="p-3 rounded-lg border border-slate-200 dark:border-steel-800 bg-slate-50/50 dark:bg-steel-900/50 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-800 dark:text-steel-200">
                    Transitioned from &quot;{entry.fromStage}&quot; to &quot;{entry.toStage}&quot;
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-steel-400 mt-0.5">
                    By {entry.user} ({entry.role}) • {formatDate(entry.timestamp)}
                  </div>
                </div>
                <ShieldCheck className="h-4 w-4 text-emerald-500 opacity-80 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-steel-800">
          <Button onClick={onClose}>Close Job Audit</Button>
        </div>
      </div>
    </Dialog>
  );
}
