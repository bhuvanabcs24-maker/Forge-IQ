import { MOCK_ORDERS, MOCK_QUOTATIONS, MOCK_INVOICES } from '@/lib/mock-data/manufacturing';
import { formatCurrency } from '@/lib/utils';

export function queryCustomerAiAssistant(queryText: string, companyName: string): {
  answer: string;
  confidenceScore: number;
  relatedEntityLink?: string;
} {
  const q = queryText.toLowerCase();

  if (q.includes('status') || q.includes('progress') || q.includes('order')) {
    const order = MOCK_ORDERS[0]; // WO-2026-0891
    return {
      answer: `### Work Order Status for ${companyName}\n\nYour active Work Order **${order.orderNumber}** (${order.title}) is currently @ **${order.progressPercent}% completion** in CNC Bending.\n\nEstimated completion date: **${order.dueDate}** (94% AI Confidence).`,
      confidenceScore: 94,
      relatedEntityLink: '/portal/orders',
    };
  }

  if (q.includes('deliver') || q.includes('when') || q.includes('tracking')) {
    const order = MOCK_ORDERS[0];
    return {
      answer: `### Delivery Forecast for ${companyName}\n\nWork Order **${order.orderNumber}** is on schedule for dispatch on **August 15, 2026**. Tracking number **TRK-2026-8919** will activate upon shipping completion.`,
      confidenceScore: 96,
      relatedEntityLink: '/portal/orders',
    };
  }

  if (q.includes('quotation') || q.includes('quote') || q.includes('explain')) {
    const quote = MOCK_QUOTATIONS[0];
    return {
      answer: `### Latest Quotation Overview for ${companyName}\n\nYour active Quotation **${quote.quotationNumber}** (${quote.title}) is priced at **${formatCurrency(quote.totalAmount)}**.\n\n**Price Breakdown:** Material costs account for 52% of total, Fiber Laser runtime 24%, Press Brake 14%, and Freight/GST 10%.`,
      confidenceScore: 98,
      relatedEntityLink: '/portal/quotations',
    };
  }

  if (q.includes('invoice') || q.includes('payment') || q.includes('pay')) {
    const invoice = MOCK_INVOICES[0];
    return {
      answer: `### Accounts & Invoices for ${companyName}\n\nYour latest Invoice **${invoice.invoiceNumber}** for **${formatCurrency(invoice.amount)}** is currently **${invoice.status}** (Due Date: ${invoice.dueDate}).`,
      confidenceScore: 100,
      relatedEntityLink: '/portal/invoices',
    };
  }

  return {
    answer: `ForgeIQ Customer Assistant is active for **${companyName}**. Ask me about active work order progress, delivery forecasts, digital quote approvals, or invoice downloads!`,
    confidenceScore: 95,
  };
}
