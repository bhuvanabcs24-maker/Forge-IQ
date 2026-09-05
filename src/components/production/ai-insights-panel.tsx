'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AiProductionInsight } from '@/types/production-planner';
import { Sparkles, AlertTriangle, Clock, Zap, Check } from 'lucide-react';

export function AiInsightsPanel() {
  const [appliedIds, setAppliedIds] = useState<string[]>([]);

  const insights: AiProductionInsight[] = [
    {
      id: 'ins-1',
      type: 'bottleneck',
      title: 'CNC Press Brake Queue Bottleneck Detected',
      description: '4 high-priority jobs queued at Bending stage. Recommending shifting 2 jobs to Night Shift operator (Alex Rivera).',
      impactScore: 'High',
      suggestedAction: 'Rebalance Shift Load',
    },
    {
      id: 'ins-2',
      type: 'idle_machine',
      title: 'Robotic Welding Cell Idle Capacity',
      description: 'Panasonic Welding Cell operating @ 42% capacity. WO-2026-0892 can be accelerated by 1.5 days.',
      impactScore: 'Medium',
      suggestedAction: 'Accelerate Job WO-0892',
    },
    {
      id: 'ins-3',
      type: 'delay_risk',
      title: 'Material Delivery Delay Risk - Galvanized Sheets',
      description: 'Supplier Ryerson lead time increased by 1 day. Recommending stock allocation adjustment.',
      impactScore: 'High',
      suggestedAction: 'Reserve Safety Stock',
    },
  ];

  const handleApply = (id: string) => {
    setAppliedIds([...appliedIds, id]);
  };

  return (
    <Card className="border-purple-500/30 bg-gradient-to-r from-purple-900/20 via-steel-900/90 to-brand-900/20">
      <CardHeader className="pb-3 border-b border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 font-bold">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base text-slate-100 flex items-center gap-2">
                AI Shop Floor Insights & Optimization Telemetry
              </CardTitle>
              <CardDescription className="text-steel-300">
                Proactive scheduling advice, bottleneck detection, and delivery risk mitigation
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
            3 Active Insights
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((ins) => {
          const isApplied = appliedIds.includes(ins.id);

          return (
            <div
              key={ins.id}
              className="p-3.5 rounded-xl border border-steel-800 bg-steel-900/80 space-y-2 text-xs flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={ins.impactScore === 'High' ? 'danger' : 'warning'}
                    className="text-[10px] uppercase font-bold"
                  >
                    {ins.impactScore} Impact
                  </Badge>
                  <span className="text-[10px] text-steel-400 font-mono">
                    {ins.type.toUpperCase()}
                  </span>
                </div>
                <h4 className="font-bold text-slate-100">{ins.title}</h4>
                <p className="text-steel-300 leading-relaxed text-[11px]">{ins.description}</p>
              </div>

              <Button
                size="sm"
                variant={isApplied ? 'outline' : 'primary'}
                onClick={() => handleApply(ins.id)}
                disabled={isApplied}
                className="w-full mt-2 text-xs"
              >
                {isApplied ? (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Check className="h-3.5 w-3.5" /> Optimization Applied
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-brand-400" /> {ins.suggestedAction}
                  </span>
                )}
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
