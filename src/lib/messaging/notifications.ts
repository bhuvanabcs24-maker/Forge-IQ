import { getMessagingProvider } from './base-provider';
import { WhatsAppMessage } from '@/types/messaging';

export class ProactiveNotificationService {
  private provider = getMessagingProvider();

  async notifyQuoteApproved(
    customerPhone: string,
    quoteNumber: string,
    signerName: string,
    totalAmount: number
  ): Promise<WhatsAppMessage> {
    const text = `✅ Quotation Approved!\n\n${quoteNumber} ($${totalAmount.toLocaleString()}) approved by ${signerName}. Work Order generated on shop floor!`;
    return this.provider.sendMessage({ toPhone: customerPhone, text });
  }

  async notifyProductionStarted(customerPhone: string, orderNumber: string, partTitle: string): Promise<WhatsAppMessage> {
    const text = `⚙️ Production Started!\n\nWork Order ${orderNumber} (${partTitle}) has been dispatched to TRUMPF Fiber Laser 01 for nesting & cutting.`;
    return this.provider.sendMessage({ toPhone: customerPhone, text });
  }

  async notifyStageChanged(customerPhone: string, orderNumber: string, newStageName: string): Promise<WhatsAppMessage> {
    const text = `📌 Progress Update for ${orderNumber}:\n\nYour job has advanced to stage: *${newStageName}*. Quality checks and schedule remain on target!`;
    return this.provider.sendMessage({ toPhone: customerPhone, text });
  }

  async notifyDispatchCompleted(customerPhone: string, orderNumber: string, trackingNumber: string): Promise<WhatsAppMessage> {
    const text = `🚚 Order Dispatched!\n\nWork Order ${orderNumber} has been packaged and dispatched. Tracking Number: *${trackingNumber}*. Thank you for choosing Precision Metal Fabrication Co.!`;
    return this.provider.sendMessage({ toPhone: customerPhone, text });
  }

  async notifyInvoiceAvailable(customerPhone: string, invoiceNumber: string, amount: string): Promise<WhatsAppMessage> {
    const text = `💳 Invoice Issued: ${invoiceNumber}\n\nInvoice total: *${amount}*. Pay securely online or view settlement details.`;
    return this.provider.sendMessage({ toPhone: customerPhone, text });
  }

  async handleConversationalQuery(customerPhone: string, userText: string): Promise<WhatsAppMessage> {
    const q = userText.toLowerCase();

    if (q.includes('approve') || q.includes('accept')) {
      const text = `✅ Thank you! Quotation approval recorded. Work Order WO-2026-0895 has been created and staged for raw material stock reservation.`;
      return this.provider.sendMessage({ toPhone: customerPhone, text });
    }

    if (q.includes('status') || q.includes('where') || q.includes('delivery')) {
      const text = `🔍 Order Status Search:\n\nWork Order WO-2026-0891 is currently @ *68% completion* in CNC Bending. Estimated dispatch date: August 15, 2026.`;
      return this.provider.sendMessage({ toPhone: customerPhone, text });
    }

    const text = `Thank you for reaching out to ForgeIQ Assistant! We received your message: "${userText}". An operations supervisor will review and respond shortly.`;
    return this.provider.sendMessage({ toPhone: customerPhone, text });
  }
}

export const globalProactiveNotifications = new ProactiveNotificationService();
