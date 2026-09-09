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
  icon?: React.ReactNode;
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
    <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.15 }}>
      <Card
        className={cn(
          'relative overflow-hidden border border-[#E4E7EC] dark:border-[#252B33] bg-white dark:bg-[#11161D] shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all',
          highlight && 'border-[#155EEF]/50 ring-1 ring-[#155EEF]/20'
        )}
      >
        <CardContent className="p-5">
          {/* Label + small icon */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-[0.01em] text-[#667085] dark:text-[#98A2B3]">
              {title}
            </span>
            {icon && (
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F9FAFB] dark:bg-[#18202A] text-[#667085] dark:text-[#98A2B3] border border-[#E4E7EC] dark:border-[#252B33]">
                {icon}
              </div>
            )}
          </div>

          {/* Large Number / KPI */}
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <div className="text-[26px] font-bold tracking-tight text-[#111827] dark:text-[#F2F4F7] tabular-nums font-sans leading-none">
              {!isNaN(numericValue) ? (
                <AnimatedKpiCounter value={numericValue} prefix={prefix} />
              ) : (
                value
              )}
            </div>

            {trendPercent !== undefined && (
              <div
                className={cn(
                  'flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-[6px] border shrink-0',
                  isPositive && 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6] dark:bg-[#067647]/20 dark:text-[#32D583] dark:border-[#067647]/40',
                  isNegative && 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA] dark:bg-[#B42318]/20 dark:text-[#FDA29B] dark:border-[#B42318]/40',
                  !isPositive && !isNegative && 'bg-[#F9FAFB] text-[#667085] border-[#E4E7EC] dark:bg-[#18202A] dark:text-[#98A2B3] dark:border-[#252B33]'
                )}
              >
                {isPositive && <TrendingUp className="h-3 w-3" />}
                {isNegative && <TrendingDown className="h-3 w-3" />}
                {!isPositive && !isNegative && <Minus className="h-3 w-3" />}
                <span>{Math.abs(trendPercent)}%</span>
              </div>
            )}
          </div>

          {/* Contextual description */}
          {(subtitle || trendLabel) && (
            <p className="mt-2 text-[13px] text-[#667085] dark:text-[#98A2B3] font-normal leading-tight">
              {subtitle || trendLabel}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

