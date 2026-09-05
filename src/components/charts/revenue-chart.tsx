'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { MOCK_REVENUE_CHART_DATA } from '@/lib/mock-data/manufacturing';
import { ForgeIqTooltip } from '@/components/ui/forge-iq-tooltip';

export function RevenueChart() {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={MOCK_REVENUE_CHART_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="costGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#64748B" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#64748B" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} vertical={false} />
          <XAxis
            dataKey="month"
            stroke="#94A3B8"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#334155', opacity: 0.2 }}
          />
          <YAxis
            stroke="#94A3B8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value / 1000}k`}
          />
          <Tooltip content={<ForgeIqTooltip valueFormatter={(val) => formatCurrency(val)} />} />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Gross Revenue"
            stroke="#3B82F6"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#revenueGlow)"
          />
          <Area
            type="monotone"
            dataKey="costs"
            name="Material & COGS"
            stroke="#64748B"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fillOpacity={1}
            fill="url(#costGlow)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
