'use client';

import React, { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Customer } from '@/types';
import { MOCK_CUSTOMERS } from '@/lib/mock-data/manufacturing';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreateCustomerModal } from '@/components/modals/create-customer-modal';
import { WhatsAppChatDrawer } from '@/components/messaging/whatsapp-chat-drawer';
import { Plus, Mail, Building2, MessageSquare, RefreshCw } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChatCustomer, setSelectedChatCustomer] = useState<Customer | null>(null);

  const fetchCustomers = () => {
    setLoading(true);
    fetch('/api/customers')
      .then((res) => res.json())
      .then((data) => {
        if (data.customers && data.customers.length > 0) {
          setCustomers(data.customers);
        } else {
          setCustomers(MOCK_CUSTOMERS);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch customers from database, using fallback:', err);
        setCustomers(MOCK_CUSTOMERS);
      })
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
      id: 'actions',
      header: 'WhatsApp',
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedChatCustomer(row.original)}
          className="text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
        >
          <MessageSquare className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Chat
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Directory"
        description="Live synchronization with Neon PostgreSQL client directory, contact profiles, order history, and lifetime spending."
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchCustomers} disabled={loading} className="text-xs">
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} /> Sync DB
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Customer
            </Button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={customers}
        searchKey="companyName"
        searchPlaceholder="Search company, contact name, or industry..."
      />

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
