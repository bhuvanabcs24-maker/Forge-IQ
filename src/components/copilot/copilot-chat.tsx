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
import { Bot, Send, User, Sparkles, ShieldCheck, Layers, Trash2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CopilotChat() {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome-1',
      sender: 'copilot',
      content: `### Welcome to ForgeIQ Copilot Operations Manager! 👋

I am your multi-agent AI operations manager. I am connected to all **14 platform modules** in real-time.

Ask me any natural-language operational query about delayed work orders, machine OEE bottlenecks, raw sheet metal stock, quotation profit margins, or customer overdue balances!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
      const responseMsg = await globalCopilotOrchestrator.processQuery(query);
      setMessages((prev) => [...prev, responseMsg]);
    } catch {
      // Error handling
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Card className="flex flex-col h-[650px] border-steel-800 bg-steel-900/90 shadow-xl overflow-hidden">
      {/* Header */}
      <CardHeader className="border-b border-steel-800 bg-steel-950/80 px-5 py-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 text-white shadow-md shadow-brand-500/20">
            <Zap className="h-6 w-6 fill-current" />
          </div>
          <div>
            <CardTitle className="text-base text-white flex items-center gap-2 font-sans">
              ForgeIQ Copilot Core
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> 7 Agents Online
              </span>
            </CardTitle>
            <CardDescription className="text-steel-400 text-xs">
              Multi-Agent AI Operations Engine with Live Data Provenance & Tool Execution
            </CardDescription>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setMessages([messages[0]])}
          className="text-xs text-steel-400 border-steel-700"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear Chat
        </Button>
      </CardHeader>

      {/* Messages Stream */}
      <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex gap-3 max-w-3xl animate-in fade-in duration-150',
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-xl shrink-0 font-bold text-xs shadow-sm',
                msg.sender === 'user'
                  ? 'bg-slate-700 text-white'
                  : 'bg-gradient-to-br from-brand-600 to-purple-600 text-white'
              )}
            >
              {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            {/* Message Bubble */}
            <div className="space-y-3 flex-1 min-w-0">
              {/* Agent Active Routing Pill Badges */}
              {msg.activeAgents && msg.activeAgents.length > 0 && (
                <div className="flex items-center gap-1.5 text-[10px] text-steel-400">
                  <Layers className="h-3 w-3 text-purple-400" />
                  <span>Routed Domain Agents:</span>
                  {msg.activeAgents.map((agent) => (
                    <Badge
                      key={agent}
                      variant="outline"
                      className="text-[9px] bg-purple-500/10 text-purple-300 border-purple-500/30"
                    >
                      {agent} Agent
                    </Badge>
                  ))}
                  {msg.confidenceScore && (
                    <span className="ml-auto font-bold text-emerald-400">
                      {msg.confidenceScore}% Confidence
                    </span>
                  )}
                </div>
              )}

              {/* Text Body */}
              <div
                className={cn(
                  'rounded-2xl p-4 text-xs leading-relaxed border shadow-sm',
                  msg.sender === 'user'
                    ? 'rounded-tr-none bg-brand-600 text-white border-brand-500 font-medium'
                    : 'rounded-tl-none bg-steel-900 border-steel-800 text-slate-100'
                )}
              >
                <div className="space-y-2 whitespace-pre-wrap">
                  {msg.content.split('\n\n').map((para, i) => (
                    <div key={i}>
                      {para.startsWith('###') ? (
                        <h4 className="font-bold text-brand-400 text-sm mt-1">{para.replace('###', '')}</h4>
                      ) : (
                        <p>{para}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-[9px] opacity-60 text-right">{msg.timestamp}</div>
              </div>

              {/* Live Data Evidence Citations */}
              {msg.evidence && msg.evidence.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-steel-400 px-1">
                    Live Data Evidence Citations ({msg.evidence.length})
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
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-brand-400 px-1">
                    Proposed Operational Next Actions
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
          <div className="flex items-center gap-2 text-xs text-purple-400 animate-pulse p-2">
            <Sparkles className="h-4 w-4 animate-spin" /> Synthesizing multi-agent response...
          </div>
        )}

        <div ref={scrollRef} />
      </CardContent>

      {/* Input Bar & Prompt Chips */}
      <div className="p-4 border-t border-steel-800 bg-steel-950/80 space-y-3">
        <PromptChips onSelectPrompt={(p) => handleSend(p)} />

        <div className="relative flex items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Copilot about delayed orders, stock alerts, press brake bottlenecks, or overdue invoices..."
            className="pr-12 py-2.5 bg-steel-900 border-steel-700 text-white placeholder:text-steel-500"
          />
          <Button
            size="icon"
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="absolute right-1.5 h-7 w-7 bg-brand-600 hover:bg-brand-500"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
