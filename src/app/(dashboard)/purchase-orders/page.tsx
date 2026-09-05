'use client';

import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { PurchaseOrder } from '@/types';
import { MOCK_PURCHASE_ORDERS } from '@/lib/mock-data/manufacturing';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ShoppingCart, Plus } from 'lucide-react';

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(MOCK_PURCHASE_ORDERS);

  const columns: ColumnDef<PurchaseOrder>[] = [
    {
      accessorKey: 'poNumber',
      header: 'PO #',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-500/10 text-brand-600 font-bold text-xs">
            <ShoppingCart className="h-4 w-4" />
          </div>
          <div>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
              {row.original.poNumber}
            </span>
            <div className="text-[11px] text-slate-400">
              Issued {formatDate(row.original.createdAt)}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'supplierName',
      header: 'Supplier Name',
      cell: ({ row }) => (
        <span className="font-semibold text-slate-800 dark:text-steel-200">
          {row.original.supplierName}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Receiving Status',
      cell: ({ row }) => <Badge status={row.original.status} />,
    },
    {
      accessorKey: 'itemCount',
      header: 'Items Qty',
      cell: ({ row }) => <span className="font-medium">{row.original.itemCount} Items</span>,
    },
    {
      accessorKey: 'totalCost',
      header: 'Total Cost',
      cell: ({ row }) => (
        <span className="font-bold text-slate-900 dark:text-slate-100">
          {formatCurrency(row.original.totalCost)}
        </span>
      ),
    },
    {
      accessorKey: 'expectedDelivery',
      header: 'Expected Delivery',
      cell: ({ row }) => (
        <span className="text-xs font-semibold">{row.original.expectedDelivery}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Raw Material Purchase Orders"
        description="Issue and track material procurement POs sent to steel mills and hardware distributors."
        breadcrumbs={[{ label: 'Purchase Orders' }]}
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-1" /> Issue New PO
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={purchaseOrders}
        searchKey="poNumber"
        searchPlaceholder="Search PO # or supplier name..."
      />
    </div>
  );
}
