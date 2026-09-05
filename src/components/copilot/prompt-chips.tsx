'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export const OPERATIONAL_PROMPTS = [
  'Which orders are delayed?',
  'Can we accept another production job this week?',
  "Show today's priorities.",
  'Which customers have overdue payments?',
  'Which machines are overloaded?',
  'Why has profit decreased this month?',
  'What inventory should I reorder?',
];

export function PromptChips({ onSelectPrompt }: { onSelectPrompt: (prompt: string) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-steel-400 px-1">
        <Sparkles className="h-3 w-3 text-brand-500" /> Operational Insights Shortcuts:
      </div>
      <div className="flex flex-wrap gap-1.5">
        {OPERATIONAL_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(prompt)}
            className="rounded-full border border-slate-200 dark:border-steel-700 bg-white dark:bg-steel-800/80 px-3 py-1 text-xs text-slate-700 dark:text-steel-200 hover:border-brand-500 hover:text-brand-500 transition-colors shadow-2xs font-medium"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
