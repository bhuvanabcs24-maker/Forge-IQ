'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal } from 'lucide-react';
import { CopilotChat } from '@/components/copilot/copilot-chat';

export function FloatingCopilotLauncher() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.18 }}
            className="mb-3 w-[440px] max-w-[calc(100vw-2rem)] shadow-2xl rounded-xl overflow-hidden border border-slate-200 dark:border-steel-800"
          >
            <div className="relative">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-2.5 right-2.5 z-50 text-slate-500 dark:text-steel-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-md bg-white/90 dark:bg-steel-900/90 border border-slate-200 dark:border-steel-700 shadow-2xs"
                title="Close Copilot"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <CopilotChat />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-brand-600 shadow-lg border border-slate-700 dark:border-brand-500 hover:bg-slate-800 dark:hover:bg-brand-500 transition-colors cursor-pointer"
        title="ForgeIQ AI Intelligence Copilot"
      >
        {isOpen ? <X className="h-4.5 w-4.5" /> : <Terminal className="h-4.5 w-4.5" />}
      </motion.button>
    </div>
  );
}
