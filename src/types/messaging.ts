export type MessagingChannel = 'whatsapp' | 'telegram' | 'email' | 'sms';

export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';

export interface MediaAttachment {
  id: string;
  url: string;
  type: 'pdf' | 'image' | 'audio' | 'document';
  fileName: string;
  fileSize?: number;
}

export interface WhatsAppMessage {
  id: string;
  customerPhone: string;
  sender: 'customer' | 'business' | 'system';
  senderName: string;
  content: string;
  media?: MediaAttachment;
  status: MessageStatus;
  timestamp: string;
  templateName?: string;
  interactiveReplyButtons?: { id: string; title: string }[];
}

export interface MessageTemplate {
  id: string;
  name: string;
  category: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
  language: string;
  headerText?: string;
  bodyText: string;
  footerText?: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

export interface WhatsAppOrderDraft {
  id: string;
  customerPhone: string;
  customerName: string;
  companyName: string;
  extractedPartTitle: string;
  extractedQuantity: number;
  extractedMaterial: string;
  attachmentName: string;
  aiConfidenceScore: number;
  status: 'pending_review' | 'approved' | 'rejected';
  createdOrderId?: string;
  createdQuotationId?: string;
  receivedAt: string;
}

export interface ConversationThread {
  customerId: string;
  customerPhone: string;
  customerName: string;
  companyName: string;
  unreadCount: number;
  lastMessageTime: string;
  messages: WhatsAppMessage[];
}

export interface WebhookEventPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: { display_phone_number: string; phone_number_id: string };
        contacts?: Array<{ profile: { name: string }; wa_id: string }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          text?: { body: string };
          document?: { id: string; filename: string; mime_type: string };
          type: string;
        }>;
      };
      field: string;
    }>;
  }>;
}
