import { NextRequest, NextResponse } from 'next/server';
import { globalCopilotOrchestrator } from '@/lib/copilot/orchestrator';
import { pythonAIClient } from '@/lib/ai/python-client';
import { CopilotMessage, AgentDomain, DataEvidence, CopilotAction } from '@/types/copilot';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, context } = body;
    const safeQuery = query || 'Show today operational priorities';

    // Step 1: Query the Python AI Multi-Agent & RAG service
    const pythonRes = await pythonAIClient.chatCompletions(safeQuery, context);

    if (pythonRes.success && pythonRes.data) {
      const d = pythonRes.data;

      const mappedEvidence: DataEvidence[] = (d.supporting_evidence || []).map((ev: any, idx: number) => ({
        id: `ev-py-${idx}`,
        type: 'machine' as const,
        title: ev.metric_name,
        subtitle: `Source: ${ev.source || 'Shop Floor AI Telemetry'} • Confidence: ${Math.round((ev.confidence || 0.95) * 100)}%`,
        keyMetric: String(ev.value),
        linkHref: '/production/planner',
      }));

      const suggestedActions: CopilotAction[] = d.suggested_action
        ? [
            {
              id: `act-${Date.now()}`,
              type: 'rebalance_schedule',
              label: d.suggested_action,
              description: d.recommendation || 'Action proposed by Python AI Production Agent',
              payload: { action: d.suggested_action },
            },
          ]
        : [];

      // Map agent domain safely
      let domain: AgentDomain = 'Production';
      if (d.agent_routed?.includes('Inventory')) domain = 'Inventory';
      else if (d.agent_routed?.includes('Quotation')) domain = 'Quotation';
      else if (d.agent_routed?.includes('Analytics')) domain = 'Analytics';
      else if (d.agent_routed?.includes('Customer') || d.agent_routed?.includes('Buyer')) domain = 'Sales';

      const copilotMessage: CopilotMessage = {
        id: `msg-${Date.now()}`,
        sender: 'copilot',
        content: d.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        activeAgents: [domain],
        confidenceScore: Math.round((d.confidence || 0.95) * 100),
        evidence: mappedEvidence,
        suggestedActions,
      };

      return NextResponse.json({
        success: true,
        message: copilotMessage,
        source: 'Python FastAPI Engine (RAG + Multi-Agent)',
      });
    }

    // Step 2: Graceful fallback to local deterministic orchestrator
    const response = await globalCopilotOrchestrator.processQuery(safeQuery);

    return NextResponse.json({
      success: true,
      message: response,
      source: 'Deterministic Local Orchestrator',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Copilot query failed' },
      { status: 500 }
    );
  }
}
