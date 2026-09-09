'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Boxes, ShoppingBag, Wrench, Bot, FileCode } from 'lucide-react';

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
    { label: 'Track Live Orders (Swiggy UI)', href: '/portal/orders', icon: Bot },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl border border-indigo-100 dark:border-purple-500/30 bg-gradient-to-br from-white via-slate-50/70 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-steel-950 p-6 sm:p-8 text-slate-900 dark:text-white shadow-sm dark:shadow-2xl space-y-6"
    >
      {/* Background Mesh Overlay */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-purple-500/10 dark:bg-purple-600/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-64 w-64 rounded-full bg-brand-500/10 dark:bg-brand-600/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 font-mono text-[10px] font-bold">
            <Sparkles className="h-3 w-3 text-purple-600 dark:text-purple-400 animate-pulse" /> FORGEIQ COPILOT 3.0
          </span>
          <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">Precision Metal Fabrication Co.</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          AI Manufacturing Intelligence Platform
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl font-normal">
          Instant CAD feature parsing, 1-click pricing estimation, shop floor machine scheduling, and real-time order tracking.
        </p>
      </div>

      {/* Interactive AI Prompt Input Command Box */}
      <form onSubmit={handlePromptSubmit} className="relative z-10 max-w-3xl">
        <div className="relative flex items-center rounded-2xl border border-slate-200 dark:border-purple-500/40 bg-white dark:bg-slate-900/90 backdrop-blur-xl p-2 shadow-sm dark:shadow-xl focus-within:border-brand-500 dark:focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
          <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400 ml-3 shrink-0" />
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask ForgeIQ Copilot... (e.g. 'Which orders are delayed?', 'Estimate 500 stainless brackets')"
            className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 font-sans"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
          >
            Ask Copilot <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>

      {/* Quick Action Chips */}
      <div className="relative z-10 pt-1 flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mr-1">Quick Shortcuts:</span>
        {quickActionPills.map((pill) => {
          const Icon = pill.icon;
          return (
            <button
              key={pill.label}
              onClick={() => router.push(pill.href)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-2xs transition-all cursor-pointer"
            >
              <Icon className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              {pill.label}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
