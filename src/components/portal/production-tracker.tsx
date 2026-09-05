'use client';

import React from 'react';
import { CustomerOrderView } from '@/types/customer-portal';
import { FABRICATION_WORKFLOW_TEMPLATE } from '@/lib/production/default-templates';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CheckCircle2, Clock, Truck, ShieldCheck } from 'lucide-react';

export function ProductionTracker({ order }: { order: CustomerOrderView }) {
  const stages = FABRICATION_WORKFLOW_TEMPLATE.stages;
  const currentStageIndex = 3; // CNC Bending

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900 shadow-sm space-y-6 text-xs">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-steel-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              {order.orderNumber} - {order.title}
            </h3>
            <Badge status={order.status} />
          </div>
          <p className="text-slate-500 dark:text-steel-400 mt-0.5">
            Active Shop Floor Stage: <strong className="text-brand-500">{order.currentStageName}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Estimated Delivery</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              {order.estimatedDeliveryDate}
            </span>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
            {order.aiCompletionConfidence}% AI Conf
          </Badge>
        </div>
      </div>

      {/* 9-Stage Visual Progress Bar Timeline */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-steel-200">
          <span>Overall Job Progress ({order.progressPercent}%)</span>
          <span>Stage {currentStageIndex + 1} of {stages.length}</span>
        </div>

        <div className="h-2.5 w-full bg-slate-100 dark:bg-steel-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${order.progressPercent}%` }}
          />
        </div>
      </div>

      {/* 9-Stage Timeline Nodes */}
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 pt-2">
        {stages.map((stage, idx) => {
          const isDone = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;

          return (
            <div
              key={stage.id}
              className={`p-2.5 rounded-xl border transition-all text-center space-y-1 ${
                isCurrent
                  ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/20 ring-2 ring-brand-500/30'
                  : isDone
                  ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10'
                  : 'border-slate-200 dark:border-steel-800 opacity-50'
              }`}
            >
              <div className="flex justify-center">
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : isCurrent ? (
                  <Clock className="h-4 w-4 text-brand-500 animate-spin" />
                ) : (
                  <span className="h-4 w-4 rounded-full border border-slate-300 dark:border-steel-700 inline-block" />
                )}
              </div>
              <span className="font-bold text-[10px] block text-slate-800 dark:text-steel-200 truncate">
                {stage.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
