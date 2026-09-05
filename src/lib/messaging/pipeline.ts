import { WhatsAppOrderDraft, WhatsAppMessage } from '@/types/messaging';
import { matchOrCreateCustomer } from '@/lib/ai/customer-matcher';
import { getAiProvider } from '@/lib/ai/providers/base';
import { getMessagingProvider } from './base-provider';
import { FabricationPricingPlugin } from '@/lib/pricing/fabrication-plugin';
import { DEFAULT_FABRICATION_PRICING_RULES } from '@/lib/pricing/default-rules';
import { aiEstimatePartItem } from '@/lib/ai/quote-estimator';
import { formatCurrency } from '@/lib/utils';

export class WhatsAppOrderPipeline {
  private messagingProvider = getMessagingProvider();
  private aiProvider = getAiProvider();

  async processIncomingWhatsAppOrder(
    customerPhone: string,
    rawText: string,
    attachment?: { name: string; type: string; size: number }
  ): Promise<{ draft: WhatsAppOrderDraft; initialResponse: WhatsAppMessage }> {
    // 1. Customer Phone & Profile Matching
    const customerMatch = matchOrCreateCustomer(
      'Apex Aerospace Solutions',
      'Robert Vance',
      'rvance@apexaero.com',
      customerPhone
    );

    // 2. OCR & Document Understanding via AI Provider
    const aiResult = await this.aiProvider.processDocument({
      name: attachment?.name || 'WhatsApp_Order_PO.pdf',
      type: attachment?.type || 'application/pdf',
      size: attachment?.size || 1024 * 350,
    });

    const ext = aiResult.extractedData;

    // 3. Generate Draft Order
    const draft: WhatsAppOrderDraft = {
      id: `drft-${Date.now()}`,
      customerPhone,
      customerName: ext.customerName.value || customerMatch.matchedCustomer.contactName,
      companyName: ext.companyName.value || customerMatch.matchedCustomer.companyName,
      extractedPartTitle: ext.thickness.value + ' ' + ext.materialGrade.value + ' (' + ext.dimensions.value + ')',
      extractedQuantity: ext.quantity.value || 100,
      extractedMaterial: ext.materialGrade.value || '304 Stainless Steel',
      attachmentName: attachment?.name || 'WhatsApp_Order_PO.pdf',
      aiConfidenceScore: ext.customerName.confidence,
      status: 'pending_review',
      receivedAt: new Date().toISOString(),
    };

    // 4. Send Confirmation back to Customer on WhatsApp
    const replyText = `Hello ${draft.customerName}! We received your purchase order attachment (${draft.attachmentName}). Our AI has extracted the laser cutting specs and created Draft Order for ${draft.extractedQuantity} pcs of ${draft.extractedMaterial}. Owner review is in progress!`;

    const initialResponse = await this.messagingProvider.sendMessage({
      toPhone: customerPhone,
      text: replyText,
    });

    return { draft, initialResponse };
  }

  async approveDraftAndSendQuote(draft: WhatsAppOrderDraft): Promise<{ quotationId: string; sentMessage: WhatsAppMessage }> {
    // 1. Generate Quotation via Pricing Engine
    const rules = DEFAULT_FABRICATION_PRICING_RULES;
    const lineItem = aiEstimatePartItem(
      {
        partName: draft.extractedPartTitle,
        material: 'Stainless Steel',
        materialGrade: draft.extractedMaterial,
        thickness: '6mm',
        dimensions: '400mm x 400mm',
        quantity: draft.extractedQuantity,
      },
      rules
    );

    const plugin = new FabricationPricingPlugin();
    const breakdown = plugin.calculateQuotation([lineItem], rules);
    const quoteNumber = `RFQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // 2. Dispatch Branded PDF Quotation via WhatsApp
    const pdfUrl = `https://forgeiq.com/quotes/${quoteNumber}.pdf`;
    const quoteMsgText = `📄 Quotation ${quoteNumber} is Ready!\n\nDear ${draft.customerName},\nYour official quotation for ${draft.extractedPartTitle} (${draft.extractedQuantity} pcs) is ready.\n\nGrand Total: ${formatCurrency(breakdown.grandTotal)} (Valid for 30 days).\n\nPlease reply "APPROVE" to start production!`;

    const sentMessage = await this.messagingProvider.sendMessage({
      toPhone: draft.customerPhone,
      text: quoteMsgText,
      media: {
        id: `pdf-${Date.now()}`,
        url: pdfUrl,
        type: 'pdf',
        fileName: `${quoteNumber}_Quotation.pdf`,
      },
      interactiveButtons: [
        { id: 'approve_quote', title: 'Approve Quotation' },
        { id: 'request_changes', title: 'Request Changes' },
      ],
    });

    return { quotationId: quoteNumber, sentMessage };
  }
}

export const globalWhatsAppPipeline = new WhatsAppOrderPipeline();
