'use client';

import React, { useState } from 'react';
import { useCustomerPortal } from '@/context/customer-portal-context';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { queryCustomerAiAssistant } from '@/lib/ai/customer-assistant';
import { Sparkles, Send, ShieldCheck, Bot, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CustomerAiAssistantPage() {
  const { currentCustomer } = useCustomerPortal();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; confidence?: number; link?: string }>>([
    {
      sender: 'assistant',
      text: `Hello ${currentCustomer.contactName}! I am your dedicated ForgeIQ Customer AI Assistant, scoped strictly to **${currentCustomer.companyName}** records. Ask me about active work order progress, delivery forecasts, digital quote approvals, or invoice downloads!`,
      confidence: 100,
    },
  ]);

  const handleSend = (textQuery?: string) => {
    const q = textQuery || input;
    if (!q.trim()) return;

    const userMsg = { sender: 'user' as const, text: q };
    const res = queryCustomerAiAssistant(q, currentCustomer.companyName);
    const assistantMsg = { sender: 'assistant' as const, text: res.answer, confidence: res.confidenceScore, link: res.relatedEntityLink };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    if (!textQuery) setInput('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer AI Self-Service Assistant"
        description={`Secure AI Assistant scoped exclusively to ${currentCustomer.companyName} orders, quotations, and invoices.`}
        breadcrumbs={[
          { label: 'Portal', href: '/portal/dashboard' },
          { label: 'AI Assistant' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col h-[560px]">
          <CardHeader className="border-b border-slate-200 dark:border-steel-800 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <CardTitle className="text-base">Dedicated Account Assistant</CardTitle>
              </div>
              <Badge variant="success" className="text-[10px]">
                Isolated Data Sandbox Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 max-w-xl text-xs ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-xl font-bold text-xs shrink-0 ${
                    msg.sender === 'user'
                      ? 'bg-slate-700 text-white'
                      : 'bg-gradient-to-br from-brand-600 to-purple-600 text-white'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>

                <div
                  className={`p-3.5 rounded-2xl space-y-2 border ${
                    msg.sender === 'user'
                      ? 'bg-brand-600 text-white border-brand-500 rounded-tr-none'
                      : 'bg-slate-50 dark:bg-steel-900 border-slate-200 dark:border-steel-800 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                  {msg.link && (
                    <Link href={msg.link}>
                      <Button size="sm" variant="outline" className="mt-1 text-[10px]">
                        View Details <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </CardContent>

          <div className="p-3 border-t border-slate-200 dark:border-steel-800 flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your order status, delivery date, latest quote, or invoice..."
              className="text-xs"
            />
            <Button size="icon" onClick={() => handleSend()}>
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </Card>

        {/* Shortcuts card */}
        <Card className="space-y-4 p-4 text-xs">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-purple-500" /> Suggested Customer Queries
          </h4>
          <div className="space-y-2">
            {[
              'What is the status of my order?',
              'When will my order be delivered?',
              'Show my latest quotation.',
              'Download my invoice.',
              'Explain this quotation.',
            ].map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-steel-800 hover:border-brand-500 dark:hover:border-brand-500 transition-colors font-medium text-slate-700 dark:text-steel-200"
              >
                {q}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
