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
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#667085] dark:text-[#98A2B3] px-0.5">
        <Terminal className="h-3.5 w-3.5 text-[#155EEF]" /> Quick Operational Shortcuts:
      </div>
      <div className="flex flex-wrap gap-2">
        {OPERATIONAL_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(prompt)}
            className="rounded-lg border border-[#D0D5DD] dark:border-[#344054] bg-white dark:bg-[#11161D] px-3 py-1.5 text-xs text-[#344054] dark:text-[#D0D5DD] hover:border-[#155EEF] hover:text-[#155EEF] dark:hover:text-[#528BFF] transition-colors shadow-[0_1px_2px_rgba(16,24,40,0.04)] font-medium cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
