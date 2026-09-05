'use client';

import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Order } from '@/types';
import { MOCK_ORDERS } from '@/lib/mock-data/manufacturing';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreateOrderModal } from '@/components/modals/create-order-modal';
import Link from 'next/link';
import { Plus, ShoppingBag, Sparkles } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'orderNumber',
      header: 'Work Order #',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-500/10 text-brand-600 font-bold text-xs">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {row.original.orderNumber}
            </span>
            <div className="text-[11px] text-slate-400 dark:text-steel-400">
              Created {formatDate(row.original.createdAt)}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Part / Assembly Title',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-slate-800 dark:text-steel-200">
            {row.original.title}
          </div>
          <div className="text-xs text-slate-500 dark:text-steel-400">
            Customer: {row.original.customerName}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => {
        const p = row.original.priority;
        const color =
          p === 'Rush'
            ? 'bg-rose-500/15 text-rose-600 border-rose-500/30'
            : p === 'High'
            ? 'bg-amber-500/15 text-amber-600 border-amber-500/30'
            : 'bg-slate-100 text-slate-700 dark:bg-steel-800 dark:text-steel-300';
        return <Badge className={color}>{p}</Badge>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Stage Status',
      cell: ({ row }) => <Badge status={row.original.status} />,
    },
    {
      accessorKey: 'progressPercent',
      header: 'Completion Progress',
      cell: ({ row }) => (
        <div className="w-32 space-y-1">
          <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-steel-300">
            <span>Progress</span>
            <span>{row.original.progressPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-steel-800 overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-300"
              style={{ width: `${row.original.progressPercent}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total Value',
      cell: ({ row }) => (
        <span className="font-bold text-slate-900 dark:text-slate-100">
          {formatCurrency(row.original.totalAmount)}
        </span>
      ),
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-steel-300">
          {row.original.dueDate}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Work Orders & Sales Orders"
        description="Track fabrication work orders, priority schedules, stage completions, and delivery deadlines."
        breadcrumbs={[{ label: 'Orders' }]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/ai-order-intake">
              <Button variant="outline">
                <Sparkles className="h-4 w-4 mr-1 text-purple-500" /> AI Document Import
              </Button>
            </Link>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> New Work Order
            </Button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={orders}
        searchKey="orderNumber"
        searchPlaceholder="Search order number, part title, or customer..."
      />

      <CreateOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddOrder={(newOrder) => setOrders([newOrder as Order, ...orders])}
      />
    </div>
  );
}
