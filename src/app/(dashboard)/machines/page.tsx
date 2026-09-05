'use client';

import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Machine } from '@/types';
import { MOCK_MACHINES } from '@/lib/mock-data/manufacturing';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cpu, Plus, Wrench, Activity } from 'lucide-react';

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>(MOCK_MACHINES);

  const columns: ColumnDef<Machine>[] = [
    {
      accessorKey: 'code',
      header: 'Machine Code',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 font-bold text-xs">
            <Cpu className="h-4 w-4" />
          </div>
          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
            {row.original.code}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Equipment Name & Type',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-slate-800 dark:text-steel-200">
            {row.original.name}
          </div>
          <div className="text-xs text-slate-500">Type: {row.original.type}</div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Operational State',
      cell: ({ row }) => <Badge status={row.original.status} />,
    },
    {
      accessorKey: 'efficiencyRate',
      header: 'OEE Efficiency Rate',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-emerald-500" />
          <span className="font-extrabold text-slate-900 dark:text-slate-100">
            {row.original.efficiencyRate}%
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'hoursLoggedThisMonth',
      header: 'Hours Logged',
      cell: ({ row }) => (
        <span className="text-xs font-semibold">{row.original.hoursLoggedThisMonth} hrs</span>
      ),
    },
    {
      accessorKey: 'nextScheduledMaintenance',
      header: 'Next Maintenance',
      cell: ({ row }) => (
        <span className="text-xs text-slate-500">{row.original.nextScheduledMaintenance}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Log Status',
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setMachines((prev) =>
              prev.map((m) =>
                m.id === row.original.id
                  ? {
                      ...m,
                      status: m.status === 'Maintenance' ? 'Operational' : 'Maintenance',
                    }
                  : m
              )
            );
          }}
        >
          <Wrench className="h-3.5 w-3.5 mr-1" /> Toggle Maint
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Machines Fleet & Telemetry"
        description="Monitor TRUMPF fiber lasers, Bystronic press brakes, robotic welding cells, and maintenance cycles."
        breadcrumbs={[{ label: 'Machines' }]}
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-1" /> Add Machine
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={machines}
        searchKey="code"
        searchPlaceholder="Search machine code, name, or equipment type..."
      />
    </div>
  );
}
