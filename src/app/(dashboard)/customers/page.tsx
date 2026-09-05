'use client';

import React, { useState } from 'react';
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
import { Plus, Mail, Phone, Building2, MessageSquare } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChatCustomer, setSelectedChatCustomer] = useState<Customer | null>(null);

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: 'companyName',
      header: 'Company / Client Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 font-bold text-xs">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              {row.original.companyName}
            </div>
            <div className="text-xs text-slate-500 dark:text-steel-400">
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
          <div className="font-medium text-slate-800 dark:text-steel-200">
            {row.original.contactName}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-steel-400 mt-0.5">
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
        <span className="font-semibold text-slate-800 dark:text-steel-200">
          {row.original.totalOrders}
        </span>
      ),
    },
    {
      accessorKey: 'lifetimeValue',
      header: 'Lifetime Value',
      cell: ({ row }) => (
        <span className="font-bold text-slate-900 dark:text-slate-100">
          {formatCurrency(row.original.lifetimeValue)}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Customer Since',
      cell: ({ row }) => (
        <span className="text-xs text-slate-500 dark:text-steel-400">
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
          className="text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border-emerald-500/30"
        >
          <MessageSquare className="h-3.5 w-3.5 mr-1" /> Chat
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Directory"
        description="Manage B2B client accounts, contact profiles, order history, and lifetime spending."
        breadcrumbs={[{ label: 'Customers' }]}
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Customer
          </Button>
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
        onAddCustomer={(newCust) => setCustomers([newCust, ...customers])}
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
