'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { MOCK_PRODUCTION_STATUS_DATA } from '@/lib/mock-data/manufacturing';
import { ForgeIqTooltip } from '@/components/ui/forge-iq-tooltip';

export function ProductionChart() {
  return (
    <div className="h-[240px] w-full flex flex-col justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={MOCK_PRODUCTION_STATUS_DATA}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={4}
            dataKey="count"
          >
            {MOCK_PRODUCTION_STATUS_DATA.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<ForgeIqTooltip valueFormatter={(val) => `${val} Active Jobs`} />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-2 px-2">
        {MOCK_PRODUCTION_STATUS_DATA.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.fill }}
            />
            <span className="text-slate-600 dark:text-steel-300 truncate">{item.name}</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100 ml-auto">
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
