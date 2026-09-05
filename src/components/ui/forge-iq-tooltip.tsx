'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';

export interface ForgeIqTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string | number;
  valueFormatter?: (value: number) => string;
}

export function ForgeIqTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: ForgeIqTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      style={{
        backgroundColor: '#0F172A',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.35)',
        borderRadius: '12px',
        padding: '12px 16px',
        color: '#FFFFFF',
        fontSize: '14px',
        fontWeight: 600,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
      className="space-y-1.5 min-w-[160px] pointer-events-none z-50"
    >
      {label && (
        <div className="text-[12px] font-bold tracking-wider text-[#CBD5E1] border-b border-slate-700/60 pb-1 uppercase">
          {label}
        </div>
      )}

      <div className="space-y-1">
        {payload.map((entry: any, index: number) => {
          const formattedValue = valueFormatter
            ? valueFormatter(entry.value)
            : typeof entry.value === 'number' && entry.name?.toLowerCase().includes('revenue')
            ? formatCurrency(entry.value)
            : entry.value;

          return (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 text-[13px]">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color || entry.fill || '#3B82F6' }}
                />
                <span className="text-[#CBD5E1] font-medium">{entry.name || 'Value'}:</span>
              </div>
              <span className="font-extrabold text-[#FFFFFF] font-mono">{formattedValue}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
