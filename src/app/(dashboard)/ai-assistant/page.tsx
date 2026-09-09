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
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12 font-sans">
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
          <Card className="border border-[#E4E7EC] dark:border-[#252B33] bg-white dark:bg-[#11161D] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <CardHeader className="pb-3.5">
              <CardTitle className="text-sm flex items-center gap-2 text-[#111827] dark:text-[#F2F4F7] font-semibold">
                <Layers className="h-4 w-4 text-[#155EEF]" /> Multi-Agent Domain Architecture
              </CardTitle>
              <CardDescription className="text-xs text-[#667085] dark:text-[#98A2B3]">7 specialized autonomous domain agents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="p-3 rounded-lg border border-[#E4E7EC] dark:border-[#252B33] bg-[#F9FAFB] dark:bg-[#18202A] hover:bg-white dark:hover:bg-[#11161D] transition-colors flex items-center justify-between shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <span className="font-semibold text-[#111827] dark:text-[#F2F4F7]">Sales Agent</span>
                <Badge variant="outline" className="text-xs">Client LTV & Accounts</Badge>
              </div>
              <div className="p-3 rounded-lg border border-[#E4E7EC] dark:border-[#252B33] bg-[#F9FAFB] dark:bg-[#18202A] hover:bg-white dark:hover:bg-[#11161D] transition-colors flex items-center justify-between shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <span className="font-semibold text-[#111827] dark:text-[#F2F4F7]">Quotation Agent</span>
                <Badge variant="outline" className="text-xs">RFQ Pipeline & Margins</Badge>
              </div>
              <div className="p-3 rounded-lg border border-[#E4E7EC] dark:border-[#252B33] bg-[#F9FAFB] dark:bg-[#18202A] hover:bg-white dark:hover:bg-[#11161D] transition-colors flex items-center justify-between shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <span className="font-semibold text-[#111827] dark:text-[#F2F4F7]">Production Agent</span>
                <Badge variant="outline" className="text-xs">Shop Floor & OEE Rates</Badge>
              </div>
              <div className="p-3 rounded-lg border border-[#E4E7EC] dark:border-[#252B33] bg-[#F9FAFB] dark:bg-[#18202A] hover:bg-white dark:hover:bg-[#11161D] transition-colors flex items-center justify-between shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <span className="font-semibold text-[#111827] dark:text-[#F2F4F7]">Inventory Agent</span>
                <Badge variant="outline" className="text-xs">SKU Reorder Thresholds</Badge>
              </div>
              <div className="p-3 rounded-lg border border-[#E4E7EC] dark:border-[#252B33] bg-[#F9FAFB] dark:bg-[#18202A] hover:bg-white dark:hover:bg-[#11161D] transition-colors flex items-center justify-between shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <span className="font-semibold text-[#111827] dark:text-[#F2F4F7]">Purchase Agent</span>
                <Badge variant="outline" className="text-xs">POs & Vendor Lead Times</Badge>
              </div>
              <div className="p-3 rounded-lg border border-[#E4E7EC] dark:border-[#252B33] bg-[#F9FAFB] dark:bg-[#18202A] hover:bg-white dark:hover:bg-[#11161D] transition-colors flex items-center justify-between shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <span className="font-semibold text-[#111827] dark:text-[#F2F4F7]">Finance Agent</span>
                <Badge variant="outline" className="text-xs">Revenues & Overdue Invoices</Badge>
              </div>
              <div className="p-3 rounded-lg border border-[#E4E7EC] dark:border-[#252B33] bg-[#F9FAFB] dark:bg-[#18202A] hover:bg-white dark:hover:bg-[#11161D] transition-colors flex items-center justify-between shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <span className="font-semibold text-[#111827] dark:text-[#F2F4F7]">Analytics Agent</span>
                <Badge variant="outline" className="text-xs">Cross-Domain Synthesis</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#E4E7EC] dark:border-[#252B33] bg-white dark:bg-[#11161D] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <CardHeader className="pb-3.5">
              <CardTitle className="text-sm flex items-center gap-2 text-[#111827] dark:text-[#F2F4F7] font-semibold">
                <ShieldCheck className="h-4 w-4 text-[#067647]" /> Plant Operational Preferences Memory
              </CardTitle>
              <CardDescription className="text-xs text-[#667085] dark:text-[#98A2B3]">Configured operational rules for Precision Fab Co.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              {preferences.map((pref) => (
                <div key={pref.key} className="p-3 rounded-lg bg-[#F9FAFB] dark:bg-[#18202A] border border-[#E4E7EC] dark:border-[#252B33] space-y-1 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                  <div className="font-semibold text-[#111827] dark:text-[#F2F4F7]">{pref.label}</div>
                  <div className="text-[#667085] dark:text-[#98A2B3] text-xs leading-relaxed">{pref.value}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
