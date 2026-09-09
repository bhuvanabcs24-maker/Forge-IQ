'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AnimatedKpiCounter } from '@/components/ui/motion';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MetricCardProps {
  title: string;
  value: string | number;
  trendPercent?: number;
  trendLabel?: string;
  icon: React.ReactNode;
  subtitle?: string;
  highlight?: boolean;
}

export function MetricCard({
  title,
  value,
  trendPercent,
  trendLabel = 'vs last month',
  icon,
  subtitle,
  highlight = false,
}: MetricCardProps) {
  const isPositive = trendPercent && trendPercent > 0;
  const isNegative = trendPercent && trendPercent < 0;

  const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, ''));
  const isRupee = typeof value === 'string' && value.includes('₹');
  const isDollar = typeof value === 'string' && value.includes('$');
  const prefix = isRupee ? '₹' : isDollar ? '$' : '';

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
      <Card
        className={cn(
          'relative overflow-hidden transition-all duration-150 border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900/90 shadow-2xs hover:border-slate-300 dark:hover:border-steel-700',
          highlight && 'border-brand-500/40 dark:border-brand-500/30'
        )}
      >
        <CardContent className="p-4.5 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-steel-400 font-sans">
              {title}
            </span>
            <div className="flex h-7.5 w-7.5 items-center justify-center rounded-md bg-slate-100 dark:bg-steel-800 text-slate-600 dark:text-steel-300 border border-slate-200/80 dark:border-steel-700">
              {icon}
            </div>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between">
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums font-sans">
              {!isNaN(numericValue) ? (
                <AnimatedKpiCounter value={numericValue} prefix={prefix} />
              ) : (
                value
              )}
            </div>

            {trendPercent !== undefined && (
              <div
                className={cn(
                  'flex items-center gap-1 text-[11px] font-mono font-medium px-1.5 py-0.2 rounded border',
                  isPositive && 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
                  isNegative && 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
                  !isPositive && !isNegative && 'bg-slate-50 dark:bg-steel-800 text-slate-600 dark:text-steel-300 border-slate-200 dark:border-steel-700'
                )}
              >
                {isPositive && <TrendingUp className="h-3 w-3" />}
                {isNegative && <TrendingDown className="h-3 w-3" />}
                {!isPositive && !isNegative && <Minus className="h-3 w-3" />}
                <span>{Math.abs(trendPercent)}%</span>
              </div>
            )}
          </div>

          {(subtitle || trendLabel) && (
            <p className="mt-1.5 text-xs text-slate-500 dark:text-steel-400 font-normal">
              {subtitle || trendLabel}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
