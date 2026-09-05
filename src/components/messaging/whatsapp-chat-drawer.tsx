'use client';

import React, { useState } from 'react';
import { WhatsAppMessage, MediaAttachment } from '@/types/messaging';
import { globalProactiveNotifications } from '@/lib/messaging/notifications';
import { APPROVED_WHATSAPP_TEMPLATES } from '@/lib/messaging/templates';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Send,
  FileText,
  CheckCheck,
  Check,
  Paperclip,
  X,
  Phone,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhatsAppChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  customerPhone: string;
  companyName: string;
}

export function WhatsAppChatDrawer({
  isOpen,
  onClose,
  customerName,
  customerPhone,
  companyName,
}: WhatsAppChatDrawerProps) {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([
    {
      id: 'msg-1',
      customerPhone,
      sender: 'customer',
      senderName: customerName,
      content: `Hi Sarah! Sending over purchase order PDF for 150 pcs of 304 Stainless Steel flanges. Please check quote!`,
      media: {
        id: 'pdf-1',
        url: '/api/quotations/RFQ-2026-0891/pdf?action=download',
        type: 'pdf',
        fileName: 'PO_Apex_Flanges_WO891.pdf',
      },
      status: 'read',
      timestamp: '10:14 AM',
    },
    {
      id: 'msg-2',
      customerPhone,
      sender: 'business',
      senderName: 'ForgeIQ Business Assistant',
      content: `Hello Robert! We received PO_Apex_Flanges_WO891.pdf. AI Order Intake processed the laser cutting specs (150 pcs 304 SS). Official PDF Quotation RFQ-2026-0891 ($42,500.00) attached below.`,
      media: {
        id: 'pdf-2',
        url: '/api/quotations/RFQ-2026-0891/pdf?action=download',
        type: 'pdf',
        fileName: 'RFQ-2026-0891_Quotation.pdf',
      },
      status: 'read',
      timestamp: '10:16 AM',
      interactiveReplyButtons: [
        { id: 'appr', title: 'Approve Quotation' },
        { id: 'req_chg', title: 'Request Changes' },
      ],
    },
  ]);

  const [textInput, setTextInput] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const handleSend = async () => {
    if (!textInput.trim()) return;

    const userMsg: WhatsAppMessage = {
      id: `msg-${Date.now()}`,
      customerPhone,
      sender: 'business',
      senderName: 'Sarah Jenkins (Owner)',
      content: textInput,
      status: 'read',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setTextInput('');

    // Simulate customer automated conversational reply after 1.5 seconds if query
    setTimeout(async () => {
      if (textInput.toLowerCase().includes('status') || textInput.toLowerCase().includes('update')) {
        const botReply = await globalProactiveNotifications.handleConversationalQuery(
          customerPhone,
          textInput
        );
        setMessages((prev) => [...prev, botReply]);
      }
    }, 1500);
  };

  const handleTemplateSend = (templateName: string) => {
    const tmpl = APPROVED_WHATSAPP_TEMPLATES.find((t) => t.name === templateName);
    if (!tmpl) return;

    const msg: WhatsAppMessage = {
      id: `tmpl-msg-${Date.now()}`,
      customerPhone,
      sender: 'business',
      senderName: 'System Template Dispatcher',
      content: `[Template: ${tmpl.name}]\n${tmpl.bodyText}`,
      status: 'read',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      templateName: tmpl.name,
    };

    setMessages((prev) => [...prev, msg]);
    setSelectedTemplate('');
  };

  if (!isOpen) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="" maxWidth="lg">
      <div className="flex flex-col h-[580px] -m-6 text-xs">
        {/* WhatsApp Business Header Bar */}
        <div className="flex items-center justify-between p-4 bg-emerald-700 text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 font-bold text-sm">
              {customerName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{customerName}</h3>
              <p className="text-[11px] text-emerald-100 font-medium">
                {companyName} • {customerPhone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-800 text-emerald-100 border-emerald-600 text-[10px]">
              WhatsApp Cloud API Active
            </Badge>
            <button onClick={onClose} className="p-1 rounded hover:bg-emerald-600 text-emerald-100">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#efeae2] dark:bg-steel-950 industrial-grid">
          {messages.map((msg) => {
            const isMe = msg.sender === 'business' || msg.sender === 'system';

            return (
              <div
                key={msg.id}
                className={cn('flex flex-col max-w-[80%]', isMe ? 'ml-auto items-end' : 'items-start')}
              >
                <div
                  className={cn(
                    'p-3 rounded-2xl shadow-xs space-y-1.5 relative',
                    isMe
                      ? 'bg-[#d9fdd3] dark:bg-emerald-900/40 text-slate-900 dark:text-slate-100 rounded-tr-none border border-emerald-300 dark:border-emerald-700'
                      : 'bg-white dark:bg-steel-900 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-steel-800'
                  )}
                >
                  <span className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                    {msg.senderName}
                  </span>

                  <p className="whitespace-pre-wrap text-xs leading-relaxed">{msg.content}</p>

                  {/* Attachment Preview Card */}
                  {msg.media && (
                    <a
                      href={msg.media.url}
                      download={msg.media.fileName}
                      className="flex items-center gap-2.5 p-2 rounded-lg bg-white/70 dark:bg-steel-950/70 border border-slate-300 dark:border-steel-800 mt-1 hover:border-emerald-500 transition-colors"
                    >
                      <FileText className="h-5 w-5 text-rose-500 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-slate-900 dark:text-slate-100 truncate block">
                          {msg.media.fileName}
                        </span>
                        <span className="text-[10px] text-slate-500">PDF Document • Click to Download</span>
                      </div>
                    </a>
                  )}

                  {/* Interactive Reply Buttons */}
                  {msg.interactiveReplyButtons && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.interactiveReplyButtons.map((btn) => (
                        <button
                          key={btn.id}
                          onClick={() => setTextInput(btn.title)}
                          className="rounded-full border border-emerald-500 bg-white dark:bg-steel-900 text-emerald-700 dark:text-emerald-400 px-3 py-0.5 text-[10px] font-bold hover:bg-emerald-50"
                        >
                          {btn.title}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 mt-1">
                    <span>{msg.timestamp}</span>
                    {isMe && <CheckCheck className="h-3 w-3 text-emerald-600 font-bold" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message Template Quick Selector */}
        <div className="px-4 py-2 bg-slate-100 dark:bg-steel-900 border-t border-slate-200 dark:border-steel-800 flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium shrink-0 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Templates:
          </span>
          <select
            value={selectedTemplate}
            onChange={(e) => handleTemplateSend(e.target.value)}
            className="flex-1 h-7 rounded border border-slate-300 dark:border-steel-700 bg-white dark:bg-steel-800 px-2 text-[11px]"
          >
            <option value="">Select approved Meta template...</option>
            {APPROVED_WHATSAPP_TEMPLATES.map((tmpl) => (
              <option key={tmpl.id} value={tmpl.name}>
                {tmpl.name} ({tmpl.category})
              </option>
            ))}
          </select>
        </div>

        {/* Message Input Controls */}
        <div className="p-3 bg-white dark:bg-steel-900 border-t border-slate-200 dark:border-steel-800 flex items-center gap-2">
          <Input
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type WhatsApp message or query..."
            className="text-xs py-2"
          />
          <Button size="icon" onClick={handleSend} className="bg-emerald-600 hover:bg-emerald-700">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
