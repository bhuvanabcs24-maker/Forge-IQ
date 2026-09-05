import {
  MessagingChannel,
  WhatsAppMessage,
  MediaAttachment,
  MessageTemplate,
} from '@/types/messaging';

export interface SendMessageOptions {
  toPhone: string;
  text: string;
  media?: MediaAttachment;
  templateName?: string;
  templateParams?: Record<string, string>;
  interactiveButtons?: { id: string; title: string }[];
}

export interface MessagingProvider {
  channel: MessagingChannel;
  name: string;
  sendMessage(options: SendMessageOptions): Promise<WhatsAppMessage>;
  sendTemplate(toPhone: string, templateName: string, params?: Record<string, string>): Promise<WhatsAppMessage>;
  verifyWebhook(signature: string, rawBody: string): boolean;
}

import { WhatsAppCloudApiProvider } from './whatsapp-provider';

export function getMessagingProvider(channel?: string): MessagingProvider {
  const selected = (channel || process.env.NEXT_PUBLIC_MESSAGING_PROVIDER || 'whatsapp').toLowerCase();

  switch (selected) {
    case 'whatsapp':
    default:
      return new WhatsAppCloudApiProvider();
  }
}
