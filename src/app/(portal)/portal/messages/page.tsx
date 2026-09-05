'use client';

import React from 'react';
import { useCustomerPortal } from '@/context/customer-portal-context';
import { PageHeader } from '@/components/shared/page-header';
import { WhatsAppChatDrawer } from '@/components/messaging/whatsapp-chat-drawer';

export default function CustomerMessagesPage() {
  const { currentCustomer } = useCustomerPortal();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Unified Customer Communications & WhatsApp Stream"
        description={`Direct messaging channel with ForgeIQ plant supervisors and account managers for ${currentCustomer.companyName}.`}
        breadcrumbs={[
          { label: 'Portal', href: '/portal/dashboard' },
          { label: 'Messages' },
        ]}
      />

      <WhatsAppChatDrawer
        isOpen={true}
        onClose={() => {}}
        customerName={currentCustomer.contactName}
        customerPhone={currentCustomer.phone}
        companyName={currentCustomer.companyName}
      />
    </div>
  );
}
