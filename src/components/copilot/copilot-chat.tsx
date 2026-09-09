'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CopilotMessage } from '@/types/copilot';
import { globalCopilotOrchestrator } from '@/lib/copilot/orchestrator';
import { EvidenceCard } from './evidence-card';
import { ActionCard } from './action-card';
import { PromptChips } from './prompt-chips';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, User, Sparkles, Layers, Trash2, Terminal, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CopilotChat() {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome-1',
      sender: 'copilot',
      content: `### Welcome to ForgeIQ Copilot Operations Manager! 👋

I am your multi-agent AI operations manager. I am connected to all **14 platform modules** in real-time.

Ask me any natural-language operational query about delayed work orders, machine OEE bottlenecks, raw sheet metal stock, quotation profit margins, or customer overdue balances!`,
      timestamp: '09:00 AM',
      confidenceScore: 100,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (queryText?: string) => {
    const query = queryText || input;
    if (!query.trim()) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages((prev) => [...prev, data.message]);
          return;
        }
      }
      // Fallback if API returned non-ok
      const responseMsg = await globalCopilotOrchestrator.processQuery(query);
      setMessages((prev) => [...prev, responseMsg]);
    } catch (err) {
      console.warn('Backend copilot chat API failed, falling back to local orchestrator:', err);
      const responseMsg = await globalCopilotOrchestrator.processQuery(query);
      setMessages((prev) => [...prev, responseMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-14rem)] min-h-[580px] max-h-[760px] border border-[#E4E7EC] dark:border-[#252B33] bg-white dark:bg-[#11161D] shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden rounded-xl font-sans">
      {/* Console Header */}
      <CardHeader className="border-b border-[#E4E7EC] dark:border-[#252B33] bg-[#F9FAFB] dark:bg-[#18202A] px-5 py-3.5 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#155EEF] text-white shadow-sm">
            <Terminal className="h-4.5 w-4.5" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-[#111827] dark:text-[#F2F4F7] flex items-center gap-2">
              Manufacturing Intelligence Console
              <span className="flex items-center gap-1.5 rounded-[6px] bg-[#ECFDF3] dark:bg-[#067647]/20 text-[#067647] dark:text-[#32D583] text-[11px] font-medium px-2 py-0.5 border border-[#ABEFC6] dark:border-[#067647]/40">
                <span className="h-1.5 w-1.5 rounded-full bg-[#067647] dark:bg-[#32D583]" /> 7 Agents Online
              </span>
            </CardTitle>
            <CardDescription className="text-[#667085] dark:text-[#98A2B3] text-xs">
              Multi-Agent Orchestrator with RAG Provenance & Real-Time Deterministic Tools
            </CardDescription>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setMessages([messages[0]])}
          className="text-xs h-8 px-3 text-[#344054] dark:text-[#D0D5DD] border-[#D0D5DD] dark:border-[#344054] bg-white dark:bg-[#11161D] hover:bg-[#F9FAFB] dark:hover:bg-[#18202A]"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1.5 text-[#667085]" /> Clear
        </Button>
      </CardHeader>

      {/* Messages Stream - Natural Canvas Layout */}
      <CardContent className="flex-1 p-6 overflow-y-auto space-y-6 bg-white dark:bg-[#11161D]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex gap-3.5 max-w-3xl animate-in fade-in duration-100',
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg shrink-0 text-xs',
                msg.sender === 'user'
                  ? 'bg-[#111827] text-white dark:bg-[#18202A] dark:text-[#F2F4F7] border border-[#344054]'
                  : 'bg-[#EFF4FF] text-[#155EEF] dark:bg-[#155EEF]/20 border border-[#B2DDFF] dark:border-[#155EEF]/40'
              )}
            >
              {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            {/* Message Content Container */}
            <div className="space-y-3 flex-1 min-w-0">
              {/* AI Execution Timeline & Domain Verification */}
              {msg.sender === 'copilot' && msg.activeAgents && msg.activeAgents.length > 0 && (
                <div className="p-2.5 rounded-lg border border-[#E4E7EC] dark:border-[#252B33] bg-[#F9FAFB] dark:bg-[#18202A] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-medium text-[#667085] dark:text-[#98A2B3]">
                    <span className="uppercase tracking-wider">Execution Pipeline</span>
                    {msg.confidenceScore && (
                      <span className="text-[#067647] dark:text-[#32D583] font-semibold">
                        Confidence {msg.confidenceScore}%
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {msg.activeAgents.map((agent) => (
                      <div
                        key={agent}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[#344054] dark:text-[#D0D5DD]"
                      >
                        <span className="text-[#067647] dark:text-[#32D583]">✓</span>
                        <span>{agent} capability verified</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Typography */}
              {msg.sender === 'user' ? (
                <div className="rounded-lg p-3.5 text-sm leading-relaxed border border-[#E4E7EC] dark:border-[#252B33] bg-[#F9FAFB] dark:bg-[#18202A] text-[#111827] dark:text-[#F2F4F7] shadow-sm">
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <div suppressHydrationWarning className="mt-2 text-[11px] text-[#667085] dark:text-[#98A2B3] text-right font-mono">
                    {msg.timestamp}
                  </div>
                </div>
              ) : (
                <div className="text-sm leading-relaxed text-[#111827] dark:text-[#F2F4F7] space-y-3">
                  <div className="space-y-2.5 whitespace-pre-wrap">
                    {msg.content.split('\n\n').map((para, i) => (
                      <div key={i}>
                        {para.startsWith('###') ? (
                          <h4 className="font-semibold text-base text-[#111827] dark:text-[#F2F4F7] mt-3 pb-1 border-b border-[#E4E7EC] dark:border-[#252B33]">
                            {para.replace('###', '').trim()}
                          </h4>
                        ) : (
                          <p className="leading-[1.6] text-sm text-[#111827] dark:text-[#F2F4F7]">{para}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div suppressHydrationWarning className="text-xs text-[#667085] dark:text-[#98A2B3] font-mono">
                    {msg.timestamp}
                  </div>
                </div>
              )}

              {/* Live Data Evidence Citations */}
              {msg.evidence && msg.evidence.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-[#E4E7EC] dark:border-[#252B33]">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#667085] dark:text-[#98A2B3]">
                    Sources · {msg.evidence.length}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.evidence.map((ev) => (
                      <EvidenceCard key={ev.id} evidence={ev} />
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Action Cards */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-[#E4E7EC] dark:border-[#252B33]">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#667085] dark:text-[#98A2B3]">
                    Recommended Operations Actions
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {msg.suggestedActions.map((act) => (
                      <ActionCard key={act.id} action={act} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs font-medium text-[#155EEF] animate-pulse p-2">
            <Cpu className="h-3.5 w-3.5 animate-spin" /> Synthesizing deterministic multi-agent response...
          </div>
        )}

        <div ref={scrollRef} />
      </CardContent>

      {/* Input Bar & Prompt Chips - 64px Premium Composer */}
      <div className="p-4 border-t border-[#E4E7EC] dark:border-[#252B33] bg-[#F9FAFB] dark:bg-[#18202A] space-y-3">
        <PromptChips onSelectPrompt={(p) => handleSend(p)} />

        <div className="flex items-center h-14 rounded-xl border border-[#D0D5DD] dark:border-[#344054] bg-white dark:bg-[#11161D] px-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)] focus-within:border-[#155EEF] focus-within:ring-2 focus-within:ring-[#155EEF]/15 transition-all">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Copilot about delayed orders, stock alerts, press brake bottlenecks, or overdue invoices..."
            className="w-full bg-transparent px-2 py-2 text-sm text-[#111827] dark:text-[#F2F4F7] placeholder:text-[#667085] dark:placeholder:text-[#98A2B3] outline-none font-sans"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#155EEF] hover:bg-[#124ec7] active:bg-[#0d3ea8] text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer"
            title="Send query"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
