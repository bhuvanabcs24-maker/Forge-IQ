import { AgentDomain, DataEvidence, CopilotAction } from '@/types/copilot';

export interface AgentProcessingResult {
  domain: AgentDomain;
  analysisText: string;
  confidenceScore: number;
  evidence: DataEvidence[];
  suggestedActions: CopilotAction[];
}

export interface CopilotAgent {
  domain: AgentDomain;
  name: string;
  description: string;
  processQuery(query: string, context?: any): Promise<AgentProcessingResult>;
}
