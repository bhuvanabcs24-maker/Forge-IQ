'use client';

import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Supplier } from '@/types';
import { MOCK_SUPPLIERS } from '@/lib/mock-data/manufacturing';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, Plus, Star } from 'lucide-react';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);

  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: 'companyName',
      header: 'Supplier Vendor',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 font-bold text-xs">
            <Truck className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {row.original.companyName}
            </span>
            <div className="text-xs text-slate-500">Contact: {row.original.contactPerson}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'materialsSupplied',
      header: 'Materials Supplied',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.materialsSupplied.map((m, i) => (
            <Badge key={i} variant="outline" className="text-[10px]">
              {m}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'averageLeadTimeDays',
      header: 'Avg Lead Time',
      cell: ({ row }) => (
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {row.original.averageLeadTimeDays} Days
        </span>
      ),
    },
    {
      accessorKey: 'rating',
      header: 'Vendor Rating',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 font-bold text-amber-500 text-xs">
          <Star className="h-3.5 w-3.5 fill-current" /> {row.original.rating} / 5.0
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge status={row.original.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers & Vendor Directory"
        description="Manage sheet metal mills, hardware distributors, industrial gas vendors, and lead times."
        breadcrumbs={[{ label: 'Suppliers' }]}
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-1" /> Add Vendor
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={suppliers}
        searchKey="companyName"
        searchPlaceholder="Search supplier vendor or material category..."
      />
    </div>
  );
}
