'use client';

import React from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { AiInsightsPanel } from '@/components/production/ai-insights-panel';
import { KanbanBoard } from '@/components/production/kanban-board';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Cpu, UserCheck, Zap, Layers } from 'lucide-react';

export default function ProductionPlannerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Production Planner & Schedule Optimizer"
        description="Automated machine assignment, worker skill matching, inventory reservation checks, and bottleneck mitigation."
        breadcrumbs={[
          { label: 'Production', href: '/production' },
          { label: 'AI Planner' },
        ]}
      />

      <AiInsightsPanel />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4 text-brand-500" /> Active Shop Floor Stage Pipeline
          </CardTitle>
          <CardDescription>Live job movement with AI recommendation status</CardDescription>
        </CardHeader>
        <CardContent>
          <KanbanBoard />
        </CardContent>
      </Card>
    </div>
  );
}
