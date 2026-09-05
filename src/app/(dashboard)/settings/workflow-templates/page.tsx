'use client';

import React from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ALL_WORKFLOW_TEMPLATES } from '@/lib/production/default-templates';
import { Sliders, Plus, Layers, Check } from 'lucide-react';

export default function WorkflowTemplatesAdminPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Workflow Templates & Industry Configurator"
        description="Configure production stage pipelines for Sheet Metal Fabrication, Electrical Panels, Furniture, and Printing."
        breadcrumbs={[
          { label: 'Settings', href: '/settings' },
          { label: 'Workflow Templates' },
        ]}
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-1" /> New Industry Template
          </Button>
        }
      />

      <div className="space-y-6">
        {ALL_WORKFLOW_TEMPLATES.map((tmpl) => (
          <Card key={tmpl.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{tmpl.name}</CardTitle>
                  <Badge variant={tmpl.isDefault ? 'secondary' : 'outline'}>
                    {tmpl.industry} {tmpl.isDefault && '• Active Default'}
                  </Badge>
                </div>
                <CardDescription className="mt-1">{tmpl.description}</CardDescription>
              </div>
              <Button size="sm" variant="outline">
                Edit Stages
              </Button>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-9 gap-2">
                {tmpl.stages.map((stage, idx) => (
                  <div
                    key={stage.id}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-steel-800 bg-slate-50/50 dark:bg-steel-900/50 space-y-1 text-xs"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: stage.color }}
                      />
                      <span>
                        {idx + 1}. {stage.name}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{stage.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
