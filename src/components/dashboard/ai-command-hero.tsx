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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900/90 p-5 sm:p-6 text-slate-900 dark:text-white shadow-2xs space-y-4"
    >
      {/* Precision Telemetry Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-steel-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-steel-800 text-slate-700 dark:text-steel-300 font-mono text-[10px] font-semibold border border-slate-200 dark:border-steel-700">
            <Terminal className="h-3 w-3 text-brand-600 dark:text-brand-400" /> FORGEIQ OS // INTELLIGENCE CONSOLE
          </span>
          <span className="text-slate-400 dark:text-steel-500 text-xs">•</span>
          <span className="text-slate-600 dark:text-steel-400 text-xs font-medium">Sheet Metal & Fabrication Works</span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
          <Activity className="h-3 w-3 animate-pulse" />
          <span>SHOP TELEMETRY: CONNECTED</span>
        </div>
      </div>

      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
          Manufacturing Operations & AI Copilot
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-steel-400 max-w-2xl font-normal">
          Instant CAD feature extraction, dynamic laser & bending cost estimation, shop floor scheduling, and autonomous production tracking.
        </p>
      </div>

      {/* Interactive AI Command Prompt Input Box */}
      <form onSubmit={handlePromptSubmit} className="max-w-3xl pt-1">
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-steel-700 bg-slate-50 dark:bg-steel-950 p-1.5 shadow-2xs focus-within:border-brand-500/80 focus-within:ring-1 focus-within:ring-brand-500/20 transition-all">
          <Terminal className="h-4 w-4 text-slate-400 dark:text-steel-400 ml-2.5 shrink-0" />
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask ForgeIQ Copilot (e.g., 'Which orders are delayed?', 'Check TRUMPF TruLaser speed for SS304')..."
            className="w-full bg-transparent px-3 py-1.5 text-xs sm:text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-steel-500 font-sans"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-brand-600 dark:hover:bg-brand-500 text-white font-medium text-xs shadow-2xs transition-all shrink-0 cursor-pointer"
          >
            Execute <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>

      {/* Quick Operational Action Shortcuts */}
      <div className="pt-1 flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-slate-400 dark:text-steel-500 font-medium mr-1 uppercase tracking-wider text-[10px]">
          Operational Shortcuts:
        </span>
        {quickActionPills.map((pill) => {
          const Icon = pill.icon;
          return (
            <button
              key={pill.label}
              onClick={() => router.push(pill.href)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 dark:border-steel-700 bg-white dark:bg-steel-800 hover:bg-slate-50 dark:hover:bg-steel-700 text-xs font-medium text-slate-700 dark:text-steel-300 hover:text-slate-900 dark:hover:text-white shadow-2xs transition-colors cursor-pointer"
            >
              <Icon className="h-3.5 w-3.5 text-slate-400 dark:text-steel-400" />
              {pill.label}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
