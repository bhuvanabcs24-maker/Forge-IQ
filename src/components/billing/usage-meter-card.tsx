'use client';

import React from 'react';
import { UsageMetrics } from '@/types/billing';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Cpu, MessageSquare, Users, HardDrive } from 'lucide-react';

export function UsageMeterCard({ metrics }: { metrics: UsageMetrics }) {
  const meters = [
    {
      title: 'AI Processing Requests',
      used: metrics.aiRequestsUsed,
      limit: metrics.aiRequestsLimit,
      unit: 'reqs',
      icon: <Cpu className="h-4 w-4 text-purple-500" />,
    },
    {
      title: 'WhatsApp Business Messages',
      used: metrics.whatsappMessagesUsed,
      limit: metrics.whatsappMessagesLimit,
      unit: 'msgs',
      icon: <MessageSquare className="h-4 w-4 text-emerald-500" />,
    },
    {
      title: 'Active Team Seats',
      used: metrics.activeSeatsUsed,
      limit: metrics.activeSeatsLimit,
      unit: 'seats',
      icon: <Users className="h-4 w-4 text-blue-500" />,
    },
    {
      title: 'Cloud Document Storage',
      used: metrics.storageGbUsed,
      limit: metrics.storageGbLimit,
      unit: 'GB',
      icon: <HardDrive className="h-4 w-4 text-amber-500" />,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Real-Time Usage Metering Telemetry</CardTitle>
        <CardDescription>Monthly resource consumption metrics for Precision Fab Co.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {meters.map((m, idx) => {
          const pct = Math.round((m.used / m.limit) * 100);

          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-steel-800 bg-slate-50/50 dark:bg-steel-900/50 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  {m.icon} {m.title}
                </span>
                <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-steel-300">
                  {pct}%
                </span>
              </div>

              <div className="h-2 w-full bg-slate-200 dark:bg-steel-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    pct > 90 ? 'bg-rose-500' : pct > 75 ? 'bg-amber-500' : 'bg-brand-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="text-[10px] text-slate-500 dark:text-steel-400 text-right">
                {m.used} / {m.limit} {m.unit}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
