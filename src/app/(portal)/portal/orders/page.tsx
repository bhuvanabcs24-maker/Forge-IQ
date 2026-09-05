'use client';

import React from 'react';
import { useCustomerPortal } from '@/context/customer-portal-context';
import { PageHeader } from '@/components/shared/page-header';
import { LiveOrderTracker } from '@/components/portal/live-order-tracker';
import { CustomerOrderView } from '@/types/customer-portal';

export default function CustomerOrdersPage() {
  const { currentCustomer } = useCustomerPortal();

  const orders: CustomerOrderView[] = [
    {
      id: 'ord-1',
      orderNumber: 'WO-2026-0891',
      title: 'Titanium Laser Cut Flanges (150 pcs)',
      status: 'In Production',
      currentStageId: 'bending',
      currentStageName: 'CNC Bending',
      progressPercent: 45,
      dueDate: '2026-08-15',
      estimatedDeliveryDate: 'August 15, 2026',
      aiCompletionConfidence: 94,
      trackingNumber: 'TRK-2026-8919',
      courierName: 'FedEx Freight',
      milestones: [],
    },
    {
      id: 'ord-2',
      orderNumber: 'WO-2026-0413',
      title: 'NEMA 4X Stainless Enclosures (25 pcs)',
      status: 'In Production',
      currentStageId: 'laser_cutting',
      currentStageName: 'Laser Cutting',
      progressPercent: 25,
      dueDate: '2026-08-20',
      estimatedDeliveryDate: 'August 20, 2026',
      aiCompletionConfidence: 96,
      trackingNumber: 'TRK-2026-0413',
      courierName: 'DHL Industrial',
      milestones: [],
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Manufacturing Order Journey"
        description={`Swiggy/Amazon-style live order progress, machine telemetry, stage inspection photos, and delivery tracking for ${currentCustomer.companyName}.`}
        breadcrumbs={[
          { label: 'Portal', href: '/portal/dashboard' },
          { label: 'Orders' },
        ]}
      />

      <div className="space-y-6">
        {orders.map((ord) => (
          <LiveOrderTracker key={ord.id} order={ord} />
        ))}
      </div>
    </div>
  );
}
