'use client';

import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Invoice } from '@/types';
import { MOCK_INVOICES } from '@/lib/mock-data/manufacturing';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Receipt, Plus, Download } from 'lucide-react';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice #',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 font-bold text-xs">
            <Receipt className="h-4 w-4" />
          </div>
          <div>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
              {row.original.invoiceNumber}
            </span>
            <div className="text-[11px] text-slate-400">
              Issued {formatDate(row.original.issuedDate)}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'customerName',
      header: 'Billed Customer',
      cell: ({ row }) => (
        <span className="font-semibold text-slate-800 dark:text-steel-200">
          {row.original.customerName}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Payment Status',
      cell: ({ row }) => <Badge status={row.original.status} />,
    },
    {
      accessorKey: 'amount',
      header: 'Subtotal Amount',
      cell: ({ row }) => (
        <span className="font-medium text-slate-800 dark:text-steel-200">
          {formatCurrency(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: 'taxAmount',
      header: 'Tax / GST',
      cell: ({ row }) => (
        <span className="text-xs text-slate-500">{formatCurrency(row.original.taxAmount)}</span>
      ),
    },
    {
      id: 'total',
      header: 'Grand Total',
      cell: ({ row }) => (
        <span className="font-extrabold text-slate-900 dark:text-slate-100">
          {formatCurrency(row.original.amount + row.original.taxAmount)}
        </span>
      ),
    },
    {
      accessorKey: 'dueDate',
      header: 'Payment Due',
      cell: ({ row }) => <span className="text-xs font-semibold">{row.original.dueDate}</span>,
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row }) => (
        <Button variant="outline" size="sm">
          <Download className="h-3.5 w-3.5 mr-1" /> PDF
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Invoices"
        description="Generate customer invoices, track payment status, tax calculations, and accounts receivable."
        breadcrumbs={[{ label: 'Invoices' }]}
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-1" /> Create Invoice
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={invoices}
        searchKey="invoiceNumber"
        searchPlaceholder="Search invoice # or customer name..."
      />
    </div>
  );
}
