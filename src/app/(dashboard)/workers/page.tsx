'use client';

import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Worker } from '@/types';
import { MOCK_WORKERS } from '@/lib/mock-data/manufacturing';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { UserCheck, Plus, Award } from 'lucide-react';

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>(MOCK_WORKERS);

  const columns: ColumnDef<Worker>[] = [
    {
      accessorKey: 'employeeCode',
      header: 'Employee ID',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
          {row.original.employeeCode}
        </span>
      ),
    },
    {
      accessorKey: 'fullName',
      header: 'Worker Name & Role',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-slate-800 dark:text-steel-200">
            {row.original.fullName}
          </div>
          <div className="text-xs text-slate-500">
            Role: <strong className="text-brand-500">{row.original.role}</strong>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'specialization',
      header: 'Technical Skill Specialization',
      cell: ({ row }) => (
        <span className="text-xs font-medium text-slate-700 dark:text-steel-300">
          {row.original.specialization}
        </span>
      ),
    },
    {
      accessorKey: 'shift',
      header: 'Shift',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs font-semibold">
          {row.original.shift} Shift
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge status={row.original.status} />,
    },
    {
      accessorKey: 'hourlyRate',
      header: 'Hourly Rate',
      cell: ({ row }) => (
        <span className="font-bold text-slate-900 dark:text-slate-100">
          {formatCurrency(row.original.hourlyRate)}/hr
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workers & Shift Allocation"
        description="Manage machine operators, MIG/TIG certified welders, shift schedules, and safety credentials."
        breadcrumbs={[{ label: 'Workers' }]}
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-1" /> Add Worker Profile
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={workers}
        searchKey="employeeCode"
        searchPlaceholder="Search ID, worker name, or specialization..."
      />
    </div>
  );
}
