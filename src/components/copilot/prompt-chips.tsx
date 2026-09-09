'use client';

import React from 'react';
import { Terminal } from 'lucide-react';

export const OPERATIONAL_PROMPTS = [
  'Which orders are delayed?',
  'Can we accept another production job this week?',
  "Show today's priorities.",
  'Which customers have overdue payments?',
  'Which machines are overloaded?',
  'What inventory should I reorder?',
];

export function PromptChips({ onSelectPrompt }: { onSelectPrompt: (prompt: string) => void }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-steel-500 px-0.5">
        <Terminal className="h-3 w-3" /> Quick Query Shortcuts:
      </div>
      <div className="flex flex-wrap gap-1.5">
        {OPERATIONAL_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(prompt)}
            className="rounded-md border border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900 px-2.5 py-1 text-[11px] text-slate-700 dark:text-steel-300 hover:border-slate-300 dark:hover:border-steel-700 hover:text-slate-900 dark:hover:text-white transition-colors shadow-2xs font-medium cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
