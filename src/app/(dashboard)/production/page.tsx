'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { KanbanBoard } from '@/components/production/kanban-board';
import { AiInsightsPanel } from '@/components/production/ai-insights-panel';
import { Button } from '@/components/ui/button';
import { Sparkles, Sliders } from 'lucide-react';

export default function ProductionPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Production & Shop Floor Dispatch"
        description="Monitor active jobs across Material Staging, Laser Cutting, Bending, Welding, Finishing, QC, and Dispatch."
        breadcrumbs={[{ label: 'Production' }]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/settings/workflow-templates">
              <Button variant="outline">
                <Sliders className="h-4 w-4 mr-1" /> Workflow Templates
              </Button>
            </Link>
            <Link href="/production/planner">
              <Button>
                <Sparkles className="h-4 w-4 mr-1 text-purple-400" /> AI Production Planner
              </Button>
            </Link>
          </div>
        }
      />

      {/* Proactive AI Insights Panel */}
      <AiInsightsPanel />

      {/* Multi-Stage Kanban Board */}
      <KanbanBoard />
    </div>
  );
}
