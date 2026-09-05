export type AgentDomain =
  | 'Sales'
  | 'Quotation'
  | 'Production'
  | 'Inventory'
  | 'Purchase'
  | 'Finance'
  | 'Analytics';

export interface DataEvidence {
  id: string;
  type: 'order' | 'quotation' | 'inventory' | 'machine' | 'customer' | 'invoice' | 'supplier';
  title: string;
  subtitle: string;
  keyMetric?: string;
  linkHref?: string;
}

export interface CopilotAction {
  id: string;
  type: 'approve_quote' | 'create_po' | 'assign_worker' | 'rebalance_schedule' | 'send_invoice_reminder';
  label: string;
  description: string;
  payload: any;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'copilot';
  content: string;
  timestamp: string;
  activeAgents?: AgentDomain[];
  confidenceScore?: number; // 0 - 100
  evidence?: DataEvidence[];
  suggestedActions?: CopilotAction[];
}

export interface IntentClassification {
  primaryDomain: AgentDomain;
  secondaryDomains: AgentDomain[];
  intentCategory: string;
  extractedEntities: string[];
}

export interface OperationalPreference {
  key: string;
  label: string;
  value: string;
  category: 'Supplier' | 'Safety Stock' | 'Machine Shift' | 'Payment Terms';
}
