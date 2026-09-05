import { MessageTemplate } from '@/types/messaging';

export const APPROVED_WHATSAPP_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tmpl-1',
    name: 'quotation_ready_v1',
    category: 'UTILITY',
    language: 'en_US',
    headerText: 'Quotation Ready for Review',
    bodyText: 'Hello {{1}}, your quotation {{2}} for {{3}} is ready. Total Amount: {{4}}. Valid until {{5}}.',
    footerText: 'ForgeIQ Precision Manufacturing',
    status: 'APPROVED',
  },
  {
    id: 'tmpl-2',
    name: 'production_stage_update_v1',
    category: 'UTILITY',
    language: 'en_US',
    headerText: 'Production Status Update',
    bodyText: 'Update for Work Order {{1}}: Part {{2}} has advanced to stage {{3}}. Estimated delivery: {{4}}.',
    footerText: 'ForgeIQ Shop Floor Dispatch',
    status: 'APPROVED',
  },
  {
    id: 'tmpl-3',
    name: 'dispatch_completion_v1',
    category: 'UTILITY',
    language: 'en_US',
    headerText: 'Order Dispatched & Shipped',
    bodyText: 'Great news! Work Order {{1}} has been packaged and dispatched. Tracking Number: {{2}}.',
    footerText: 'ForgeIQ Logistics',
    status: 'APPROVED',
  },
  {
    id: 'tmpl-4',
    name: 'overdue_invoice_reminder_v1',
    category: 'UTILITY',
    language: 'en_US',
    headerText: 'Payment Reminder Notice',
    bodyText: 'Friendly reminder that Invoice {{1}} for {{2}} (Amount: {{3}}) was due on {{4}}.',
    footerText: 'ForgeIQ Accounts Receivable',
    status: 'APPROVED',
  },
];
