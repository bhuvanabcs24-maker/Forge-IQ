'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerPortal } from '@/context/customer-portal-context';
import { PageHeader } from '@/components/shared/page-header';
import { WhatsAppChatDrawer } from '@/components/messaging/whatsapp-chat-drawer';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowLeft, RotateCcw } from 'lucide-react';

export default function CustomerMessagesPage() {
  const { currentCustomer } = useCustomerPortal();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

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
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        customerName={currentCustomer.contactName}
        customerPhone={currentCustomer.phone}
        companyName={currentCustomer.companyName}
      />

      {!isOpen && (
        <div className="rounded-xl border border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900 p-10 text-center space-y-4 shadow-sm max-w-xl mx-auto mt-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600">
            <MessageSquare className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Conversation Closed</h3>
            <p className="text-sm text-slate-500 dark:text-steel-400 mt-1">
              You have closed the WhatsApp chat with {currentCustomer.contactName}. You can reopen it at any time or return to the customer dashboard.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => router.push('/portal/dashboard')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Return to Dashboard
            </Button>
            <Button
              onClick={() => setIsOpen(true)}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <RotateCcw className="h-4 w-4" /> Reopen Chat
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
