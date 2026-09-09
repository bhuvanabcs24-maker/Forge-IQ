'use client';

import React, { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Order } from '@/types';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreateOrderModal } from '@/components/modals/create-order-modal';
import Link from 'next/link';
import { Plus, ShoppingBag, Sparkles, Database, RefreshCw } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) {
          setOrders(data.orders);
        }
      })
      .catch((err) => console.error('Failed to fetch orders from database:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'orderNumber',
      header: 'Work Order #',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EFF8FF] dark:bg-[#155EEF]/15 text-[#155EEF] font-bold text-xs border border-[#B2DDFF] dark:border-[#155EEF]/30">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-[#111827] dark:text-[#F2F4F7]">
              {row.original.orderNumber}
            </span>
            <div className="text-[11px] text-[#667085] dark:text-[#98A2B3]">
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
          <div className="font-semibold text-[#111827] dark:text-[#F2F4F7]">
            {row.original.title}
          </div>
          <div className="text-xs text-[#667085] dark:text-[#98A2B3]">
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
        return (
          <Badge
            variant={p === 'Rush' ? 'danger' : p === 'High' ? 'warning' : 'default'}
          >
            {p}
          </Badge>
        );
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
          <div className="flex justify-between text-xs font-medium text-[#667085] dark:text-[#98A2B3]">
            <span>Progress</span>
            <span className="tabular-nums">{row.original.progressPercent}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#E4E7EC] dark:bg-[#252B33] overflow-hidden">
            <div
              className="h-full bg-[#155EEF] rounded-full transition-all duration-300"
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
        <span className="font-bold text-[#111827] dark:text-[#F2F4F7] tabular-nums">
          {formatCurrency(row.original.totalAmount)}
        </span>
      ),
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => (
        <span className="text-xs font-medium text-[#344054] dark:text-[#D0D5DD]">
          {row.original.dueDate}
        </span>
      ),
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12 font-sans">
      <PageHeader
        title="Work Orders & Sales Orders"
        description="Live synchronization with Neon PostgreSQL fabrication records, priority schedules, stage completions, and delivery deadlines."
        breadcrumbs={[{ label: 'Orders' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading} className="text-xs">
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} /> Sync DB
            </Button>
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

      {loading ? (
        <div className="p-12 text-center text-slate-500 dark:text-steel-400">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-500" />
          <p className="text-sm">Fetching work orders from Neon database...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={orders}
          searchKey="orderNumber"
          searchPlaceholder="Search order number, part title, or customer..."
        />
      )}

      <CreateOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddOrder={(newOrder) => {
          setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id && o.orderNumber !== newOrder.orderNumber)]);
        }}
      />
    </div>
  );
}
