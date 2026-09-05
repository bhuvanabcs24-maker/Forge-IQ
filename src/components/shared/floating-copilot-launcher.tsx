'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Bot } from 'lucide-react';
import { CopilotChat } from '@/components/copilot/copilot-chat';

export function FloatingCopilotLauncher() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25 }}
            className="mb-4 w-[420px] max-w-[calc(100vw-2rem)] shadow-2xl rounded-2xl overflow-hidden border border-purple-500/30"
          >
            <div className="relative">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 z-50 text-steel-400 hover:text-white p-1 rounded-full bg-steel-900/80"
              >
                <X className="h-4 w-4" />
              </button>
              <CopilotChat />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-purple-600 to-indigo-600 text-white shadow-xl shadow-brand-500/30 ring-4 ring-purple-500/20"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6 animate-pulse" />}
      </motion.button>
    </div>
  );
}
