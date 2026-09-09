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
          <Card className="border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold">
                <Layers className="h-4 w-4 text-purple-600 dark:text-purple-400" /> Multi-Agent Domain Architecture
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">7 specialized autonomous domain agents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-steel-800 bg-slate-50/70 dark:bg-steel-900/60 hover:bg-slate-100 dark:hover:bg-steel-800/80 transition-colors flex items-center justify-between shadow-2xs">
                <span className="font-bold text-slate-900 dark:text-slate-100">Sales Agent</span>
                <Badge variant="outline" className="text-[10px] bg-white dark:bg-steel-800 border-slate-200 dark:border-steel-700 text-slate-600 dark:text-steel-300">Client LTV & Accounts</Badge>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-steel-800 bg-slate-50/70 dark:bg-steel-900/60 hover:bg-slate-100 dark:hover:bg-steel-800/80 transition-colors flex items-center justify-between shadow-2xs">
                <span className="font-bold text-slate-900 dark:text-slate-100">Quotation Agent</span>
                <Badge variant="outline" className="text-[10px] bg-white dark:bg-steel-800 border-slate-200 dark:border-steel-700 text-slate-600 dark:text-steel-300">RFQ Pipeline & Margins</Badge>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-steel-800 bg-slate-50/70 dark:bg-steel-900/60 hover:bg-slate-100 dark:hover:bg-steel-800/80 transition-colors flex items-center justify-between shadow-2xs">
                <span className="font-bold text-slate-900 dark:text-slate-100">Production Agent</span>
                <Badge variant="outline" className="text-[10px] bg-white dark:bg-steel-800 border-slate-200 dark:border-steel-700 text-slate-600 dark:text-steel-300">Shop Floor & OEE Rates</Badge>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-steel-800 bg-slate-50/70 dark:bg-steel-900/60 hover:bg-slate-100 dark:hover:bg-steel-800/80 transition-colors flex items-center justify-between shadow-2xs">
                <span className="font-bold text-slate-900 dark:text-slate-100">Inventory Agent</span>
                <Badge variant="outline" className="text-[10px] bg-white dark:bg-steel-800 border-slate-200 dark:border-steel-700 text-slate-600 dark:text-steel-300">SKU Reorder Thresholds</Badge>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-steel-800 bg-slate-50/70 dark:bg-steel-900/60 hover:bg-slate-100 dark:hover:bg-steel-800/80 transition-colors flex items-center justify-between shadow-2xs">
                <span className="font-bold text-slate-900 dark:text-slate-100">Purchase Agent</span>
                <Badge variant="outline" className="text-[10px] bg-white dark:bg-steel-800 border-slate-200 dark:border-steel-700 text-slate-600 dark:text-steel-300">POs & Vendor Lead Times</Badge>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-steel-800 bg-slate-50/70 dark:bg-steel-900/60 hover:bg-slate-100 dark:hover:bg-steel-800/80 transition-colors flex items-center justify-between shadow-2xs">
                <span className="font-bold text-slate-900 dark:text-slate-100">Finance Agent</span>
                <Badge variant="outline" className="text-[10px] bg-white dark:bg-steel-800 border-slate-200 dark:border-steel-700 text-slate-600 dark:text-steel-300">Revenues & Overdue Invoices</Badge>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-steel-800 bg-slate-50/70 dark:bg-steel-900/60 hover:bg-slate-100 dark:hover:bg-steel-800/80 transition-colors flex items-center justify-between shadow-2xs">
                <span className="font-bold text-slate-900 dark:text-slate-100">Analytics Agent</span>
                <Badge variant="outline" className="text-[10px] bg-white dark:bg-steel-800 border-slate-200 dark:border-steel-700 text-slate-600 dark:text-steel-300">Cross-Domain Synthesis</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> Plant Operational Preferences Memory
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">Configured operational rules for Precision Fab Co.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              {preferences.map((pref) => (
                <div key={pref.key} className="p-3 rounded-xl bg-slate-50/70 dark:bg-steel-900/60 border border-slate-200 dark:border-steel-800 space-y-1 shadow-2xs">
                  <div className="font-bold text-slate-900 dark:text-slate-100">{pref.label}</div>
                  <div className="text-slate-600 dark:text-steel-400 text-[11px] leading-relaxed">{pref.value}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
