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
    <Card className="flex flex-col h-[calc(100vh-14rem)] min-h-[580px] max-h-[740px] border border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900/95 shadow-2xs overflow-hidden rounded-xl font-sans">
      {/* Console Header */}
      <CardHeader className="border-b border-slate-200 dark:border-steel-800 bg-slate-50/80 dark:bg-steel-950/80 px-4.5 py-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-brand-600 shadow-2xs">
            <Terminal className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              Manufacturing Intelligence Console
              <span className="flex items-center gap-1 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-semibold px-2 py-0.2 border border-emerald-200 dark:border-emerald-800/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> 7 Agents Online
              </span>
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-steel-400 text-[11px]">
              Multi-Agent Orchestrator with RAG Provenance & Real-Time Deterministic Tools
            </CardDescription>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setMessages([messages[0]])}
          className="text-[11px] h-7 px-2.5 text-slate-600 dark:text-steel-300 border-slate-200 dark:border-steel-700 bg-white dark:bg-steel-800 hover:bg-slate-50 dark:hover:bg-steel-700 shadow-2xs"
        >
          <Trash2 className="h-3 w-3 mr-1" /> Clear
        </Button>
      </CardHeader>

      {/* Messages Stream */}
      <CardContent className="flex-1 p-4.5 overflow-y-auto space-y-3.5 bg-slate-50/30 dark:bg-steel-950/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex gap-2.5 max-w-3xl animate-in fade-in duration-100',
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md shrink-0 font-mono font-bold text-[10px] shadow-2xs',
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white dark:bg-steel-800'
                  : 'bg-slate-100 dark:bg-steel-800 text-slate-700 dark:text-steel-300 border border-slate-200/80 dark:border-steel-700'
              )}
            >
              {msg.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />}
            </div>

            {/* Message Bubble */}
            <div className="space-y-2.5 flex-1 min-w-0">
              {/* Agent Active Routing Pill Badges */}
              {msg.activeAgents && msg.activeAgents.length > 0 && (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-steel-400">
                  <Layers className="h-3 w-3 text-slate-400" />
                  <span className="font-mono uppercase text-[9px]">Domain Agent:</span>
                  {msg.activeAgents.map((agent) => (
                    <Badge
                      key={agent}
                      variant="outline"
                      className="text-[9px] font-mono bg-slate-100 dark:bg-steel-800 text-slate-700 dark:text-steel-300 border-slate-200 dark:border-steel-700"
                    >
                      {agent} Agent
                    </Badge>
                  ))}
                  {msg.confidenceScore && (
                    <span className="ml-auto font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {msg.confidenceScore}% Confidence
                    </span>
                  )}
                </div>
              )}

              {/* Text Body */}
              <div
                className={cn(
                  'rounded-lg p-3.5 text-xs leading-relaxed border shadow-2xs',
                  msg.sender === 'user'
                    ? 'rounded-tr-none bg-slate-900 text-white dark:bg-steel-800 dark:text-slate-100 border-slate-800 dark:border-steel-700 font-normal'
                    : 'rounded-tl-none bg-white dark:bg-steel-900/90 border-slate-200 dark:border-steel-800 text-slate-900 dark:text-slate-100'
                )}
              >
                <div className="space-y-2 whitespace-pre-wrap">
                  {msg.content.split('\n\n').map((para, i) => (
                    <div key={i}>
                      {para.startsWith('###') ? (
                        <h4 className="font-semibold text-slate-900 dark:text-white text-xs mt-1 border-b border-slate-100 dark:border-steel-800 pb-1">{para.replace('###', '')}</h4>
                      ) : (
                        <p>{para}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div suppressHydrationWarning className="mt-2 text-[9px] font-mono opacity-60 text-right text-slate-500 dark:text-slate-400">{msg.timestamp}</div>
              </div>

              {/* Live Data Evidence Citations */}
              {msg.evidence && msg.evidence.length > 0 && (
                <div className="space-y-1.5 pt-0.5">
                  <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-steel-400 px-0.5">
                    Data Citations ({msg.evidence.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {msg.evidence.map((ev) => (
                      <EvidenceCard key={ev.id} evidence={ev} />
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Action Cards */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="space-y-1.5 pt-0.5">
                  <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-steel-400 px-0.5">
                    Recommended Actions
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
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
          <div className="flex items-center gap-2 text-xs text-brand-600 dark:text-brand-400 animate-pulse p-2">
            <Cpu className="h-3.5 w-3.5 animate-spin" /> Synthesizing multi-agent response...
          </div>
        )}

        <div ref={scrollRef} />
      </CardContent>

      {/* Input Bar & Prompt Chips */}
      <div className="p-3.5 border-t border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-950/90 space-y-2.5">
        <PromptChips onSelectPrompt={(p) => handleSend(p)} />

        <div className="relative flex items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Copilot about delayed orders, stock alerts, press brake bottlenecks, or overdue invoices..."
            className="pr-12 py-2 bg-slate-50 dark:bg-steel-900 border-slate-200 dark:border-steel-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-steel-500 rounded-lg shadow-2xs focus-visible:ring-brand-500 text-xs"
          />
          <Button
            size="icon"
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="absolute right-1.5 h-6.5 w-6.5 bg-slate-900 hover:bg-slate-800 dark:bg-brand-600 dark:hover:bg-brand-500 text-white shadow-2xs rounded-md"
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
