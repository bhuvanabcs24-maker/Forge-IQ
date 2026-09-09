'use client';

import React, { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Customer } from '@/types';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreateCustomerModal } from '@/components/modals/create-customer-modal';
import { WhatsAppChatDrawer } from '@/components/messaging/whatsapp-chat-drawer';
import { Plus, Mail, Building2, MessageSquare, RefreshCw } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChatCustomer, setSelectedChatCustomer] = useState<Customer | null>(null);

  const fetchCustomers = () => {
    setLoading(true);
    fetch('/api/customers')
      .then((res) => res.json())
      .then((data) => {
        if (data.customers) {
          setCustomers(data.customers);
        }
      })
      .catch((err) => console.error('Failed to fetch customers from database:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: 'companyName',
      header: 'Company / Client Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EFF8FF] dark:bg-[#155EEF]/15 text-[#155EEF] font-bold text-xs border border-[#B2DDFF] dark:border-[#155EEF]/30">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-[#111827] dark:text-[#F2F4F7]">
              {row.original.companyName}
            </div>
            <div className="text-xs text-[#667085] dark:text-[#98A2B3]">
              {row.original.industry}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'contactName',
      header: 'Primary Contact',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-[#111827] dark:text-[#F2F4F7]">
            {row.original.contactName}
          </div>
          <div className="flex items-center gap-2 text-xs text-[#667085] dark:text-[#98A2B3] mt-0.5">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" /> {row.original.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge status={row.original.status} />,
    },
    {
      accessorKey: 'totalOrders',
      header: 'Total Orders',
      cell: ({ row }) => (
        <span className="font-semibold text-[#344054] dark:text-[#D0D5DD] tabular-nums">
          {row.original.totalOrders}
        </span>
      ),
    },
    {
      accessorKey: 'lifetimeValue',
      header: 'Lifetime Value',
      cell: ({ row }) => (
        <span className="font-bold text-[#111827] dark:text-[#F2F4F7] tabular-nums">
          {formatCurrency(row.original.lifetimeValue)}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Customer Since',
      cell: ({ row }) => (
        <span className="text-xs text-[#667085] dark:text-[#98A2B3]">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: 'whatsappChat',
      header: 'WhatsApp',
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setSelectedChatCustomer(row.original)}
          className="h-8 px-2.5 text-xs text-[#067647] dark:text-[#32D583] hover:bg-[#ECFDF3] dark:hover:bg-[#067647]/20 border-[#ABEFC6] dark:border-[#067647]/40"
        >
          <MessageSquare className="h-3.5 w-3.5 mr-1" /> Chat
        </Button>
      ),
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12 font-sans">
      <PageHeader
        title="Customer Directory"
        description="Live synchronization with Neon PostgreSQL client directory, contact profiles, order history, and lifetime spending."
        breadcrumbs={[{ label: 'Customers' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchCustomers} disabled={loading} className="text-xs">
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} /> Sync DB
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Customer
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="p-12 text-center text-slate-500 dark:text-steel-400">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-500" />
          <p className="text-sm">Fetching client directory from Neon database...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={customers}
          searchKey="companyName"
          searchPlaceholder="Search company, contact name, or industry..."
        />
      )}

      <CreateCustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddCustomer={(newCust) => {
          setCustomers((prev) => [newCust, ...prev.filter((c) => c.companyName !== newCust.companyName && c.id !== newCust.id)]);
        }}
      />

      {selectedChatCustomer && (
        <WhatsAppChatDrawer
          isOpen={!!selectedChatCustomer}
          onClose={() => setSelectedChatCustomer(null)}
          customerName={selectedChatCustomer.contactName}
          customerPhone={selectedChatCustomer.phone}
          companyName={selectedChatCustomer.companyName}
        />
      )}
    </div>
  );
}
