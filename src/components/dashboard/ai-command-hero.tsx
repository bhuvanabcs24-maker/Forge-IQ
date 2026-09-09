'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, Boxes, ShoppingBag, Wrench, Bot, Terminal, Activity } from 'lucide-react';

export function AiCommandHero() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    router.push(`/ai-assistant?q=${encodeURIComponent(prompt)}`);
  };

  const quickActionPills = [
    { label: 'Analyze CAD Drawing (.dxf)', href: '/cad-analysis', icon: Boxes },
    { label: 'Build Itemized RFQ Quote', href: '/quotations/builder', icon: ShoppingBag },
    { label: 'Check Shop Capacity & Scheduling', href: '/production/planner', icon: Wrench },
    { label: 'Track Live Orders', href: '/portal/orders', icon: Bot },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="relative rounded-xl border border-[#E4E7EC] dark:border-[#252B33] bg-white dark:bg-[#11161D] p-6 text-[#111827] dark:text-[#F2F4F7] shadow-[0_1px_2px_rgba(16,24,40,0.04)] space-y-4"
    >
      {/* Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E4E7EC] dark:border-[#252B33] pb-3.5">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] bg-[#F9FAFB] dark:bg-[#18202A] text-[#344054] dark:text-[#D0D5DD] font-mono text-[11px] font-semibold border border-[#E4E7EC] dark:border-[#252B33]">
            <Terminal className="h-3.5 w-3.5 text-[#155EEF]" /> FORGEIQ OS // INTELLIGENCE CONSOLE
          </span>
          <span className="text-[#667085] dark:text-[#98A2B3] text-xs">•</span>
          <span className="text-[#667085] dark:text-[#98A2B3] text-xs font-normal">Sheet Metal & Precision Fabrication</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-medium text-[#067647] dark:text-[#32D583] bg-[#ECFDF3] dark:bg-[#067647]/20 px-2.5 py-0.5 rounded-[6px] border border-[#ABEFC6] dark:border-[#067647]/40">
          <Activity className="h-3.5 w-3.5" />
          <span>SHOP TELEMETRY: CONNECTED</span>
        </div>
      </div>

      <div className="space-y-1">
        <h2 className="text-[20px] font-semibold tracking-tight text-[#111827] dark:text-[#F2F4F7] leading-[1.3] font-sans">
          Manufacturing Operations & AI Copilot
        </h2>
        <p className="text-sm text-[#667085] dark:text-[#98A2B3] max-w-2xl font-normal leading-[1.55]">
          Instant CAD feature extraction, dynamic laser & bending cost estimation, shop floor scheduling, and autonomous production tracking.
        </p>
      </div>

      {/* Interactive AI Command Prompt Input Box */}
      <form onSubmit={handlePromptSubmit} className="max-w-3xl pt-1">
        <div className="flex items-center rounded-lg border border-[#D0D5DD] dark:border-[#344054] bg-[#F9FAFB] dark:bg-[#18202A] p-1 shadow-[0_1px_2px_rgba(16,24,40,0.04)] focus-within:border-[#155EEF] focus-within:ring-2 focus-within:ring-[#155EEF]/15 transition-all">
          <Terminal className="h-4 w-4 text-[#667085] dark:text-[#98A2B3] ml-2.5 shrink-0" />
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask ForgeIQ Copilot (e.g., 'Which orders are delayed?', 'Check TRUMPF TruLaser speed for SS304')..."
            className="w-full bg-transparent px-3 py-2 text-sm text-[#111827] dark:text-[#F2F4F7] outline-none placeholder:text-[#667085] dark:placeholder:text-[#98A2B3] font-sans"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#155EEF] hover:bg-[#124ec7] active:bg-[#0d3ea8] text-white font-semibold text-xs tracking-normal shadow-sm transition-all shrink-0 cursor-pointer"
          >
            Execute <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>

      {/* Quick Operational Action Shortcuts */}
      <div className="pt-1 flex flex-wrap items-center gap-2">
        <span className="text-xs text-[#667085] dark:text-[#98A2B3] font-medium mr-1 uppercase tracking-wider text-[11px]">
          Operational Shortcuts:
        </span>
        {quickActionPills.map((pill) => {
          const Icon = pill.icon;
          return (
            <button
              key={pill.label}
              onClick={() => router.push(pill.href)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#D0D5DD] dark:border-[#344054] bg-white dark:bg-[#11161D] hover:bg-[#F9FAFB] dark:hover:bg-[#18202A] text-xs font-medium text-[#344054] dark:text-[#D0D5DD] hover:text-[#111827] dark:hover:text-[#F2F4F7] shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-colors cursor-pointer"
            >
              <Icon className="h-3.5 w-3.5 text-[#667085] dark:text-[#98A2B3]" />
              {pill.label}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
