'use client';

import React from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { CopilotChat } from '@/components/copilot/copilot-chat';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { copilotMemory } from '@/lib/copilot/memory';
import { Sparkles, Zap, ShieldCheck, Layers, Cpu } from 'lucide-react';

export default function AiAssistantPage() {
  const preferences = copilotMemory.getPreferences();

  return (
    <div className="space-y-6">
      <PageHeader
        title="ForgeIQ Copilot - AI Operations Manager"
        description="Multi-agent conversational intelligence layer with live platform telemetry, live data citations, and 1-click execution cards."
        breadcrumbs={[{ label: 'AI Operations Manager' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Interactive Copilot Chat Window */}
        <div className="lg:col-span-2">
          <CopilotChat />
        </div>

        {/* Multi-Agent System Architecture & Operational Memory */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-purple-500" /> Multi-Agent Domain Architecture
              </CardTitle>
              <CardDescription>7 specialized autonomous domain agents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg border border-steel-800 bg-steel-900/60 flex items-center justify-between">
                <span className="font-bold text-slate-100">Sales Agent</span>
                <Badge variant="outline" className="text-[9px]">Client LTV & Accounts</Badge>
              </div>
              <div className="p-2.5 rounded-lg border border-steel-800 bg-steel-900/60 flex items-center justify-between">
                <span className="font-bold text-slate-100">Quotation Agent</span>
                <Badge variant="outline" className="text-[9px]">RFQ Pipeline & Margins</Badge>
              </div>
              <div className="p-2.5 rounded-lg border border-steel-800 bg-steel-900/60 flex items-center justify-between">
                <span className="font-bold text-slate-100">Production Agent</span>
                <Badge variant="outline" className="text-[9px]">Shop Floor & OEE Rates</Badge>
              </div>
              <div className="p-2.5 rounded-lg border border-steel-800 bg-steel-900/60 flex items-center justify-between">
                <span className="font-bold text-slate-100">Inventory Agent</span>
                <Badge variant="outline" className="text-[9px]">SKU Reorder Thresholds</Badge>
              </div>
              <div className="p-2.5 rounded-lg border border-steel-800 bg-steel-900/60 flex items-center justify-between">
                <span className="font-bold text-slate-100">Purchase Agent</span>
                <Badge variant="outline" className="text-[9px]">POs & Vendor Lead Times</Badge>
              </div>
              <div className="p-2.5 rounded-lg border border-steel-800 bg-steel-900/60 flex items-center justify-between">
                <span className="font-bold text-slate-100">Finance Agent</span>
                <Badge variant="outline" className="text-[9px]">Revenues & Overdue Invoices</Badge>
              </div>
              <div className="p-2.5 rounded-lg border border-steel-800 bg-steel-900/60 flex items-center justify-between">
                <span className="font-bold text-slate-100">Analytics Agent</span>
                <Badge variant="outline" className="text-[9px]">Cross-Domain Synthesis</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> Plant Operational Preferences Memory
              </CardTitle>
              <CardDescription>Configured operational rules for Precision Fab Co.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {preferences.map((pref) => (
                <div key={pref.key} className="p-2.5 rounded-lg bg-steel-900/60 border border-steel-800 space-y-0.5">
                  <div className="font-bold text-slate-100">{pref.label}</div>
                  <div className="text-steel-400 text-[11px]">{pref.value}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
