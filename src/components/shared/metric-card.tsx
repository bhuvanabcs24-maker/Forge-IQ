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
  const isCurrency = typeof value === 'string' && value.includes('$');

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
      <Card
        className={cn(
          'relative overflow-hidden transition-all duration-200 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-steel-700',
          highlight && 'border-brand-500/40 dark:border-brand-500/30 bg-brand-500/5'
        )}
      >
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-steel-400">
              {title}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-steel-800 text-brand-600 dark:text-brand-400 shadow-2xs">
              {icon}
            </div>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              {!isNaN(numericValue) ? (
                <AnimatedKpiCounter value={numericValue} prefix={isCurrency ? '$' : ''} />
              ) : (
                value
              )}
            </div>

            {trendPercent !== undefined && (
              <div
                className={cn(
                  'flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full',
                  isPositive && 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
                  isNegative && 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
                  !isPositive && !isNegative && 'bg-slate-500/15 text-slate-600 dark:text-slate-400'
                )}
              >
                {isPositive && <TrendingUp className="h-3.5 w-3.5" />}
                {isNegative && <TrendingDown className="h-3.5 w-3.5" />}
                {!isPositive && !isNegative && <Minus className="h-3.5 w-3.5" />}
                <span>{Math.abs(trendPercent)}%</span>
              </div>
            )}
          </div>

          {(subtitle || trendLabel) && (
            <p className="mt-2 text-xs text-slate-500 dark:text-steel-400 font-medium">
              {subtitle || trendLabel}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
