import { CopilotAgent, AgentProcessingResult } from './base-agent';
import { MOCK_CUSTOMERS, MOCK_ORDERS } from '@/lib/mock-data/manufacturing';
import { formatCurrency } from '@/lib/utils';

export class SalesAgent implements CopilotAgent {
  domain = 'Sales' as const;
  name = 'Sales & Account Intelligence Agent';
  description = 'Analyzes B2B client accounts, lifetime spend, active orders, and customer activity.';

  async processQuery(query: string): Promise<AgentProcessingResult> {
    const activeClientsCount = MOCK_CUSTOMERS.filter((c) => c.status === 'Active').length;
    const topClient = MOCK_CUSTOMERS[2]; // Vanguard Enclosures ($312,000)

    return {
      domain: this.domain,
      analysisText: `Analyzed customer database across ${MOCK_CUSTOMERS.length} total client accounts (${activeClientsCount} active accounts). Top account by lifetime value is **${topClient.companyName}** (${formatCurrency(topClient.lifetimeValue)}).`,
      confidenceScore: 98,
      evidence: [
        {
          id: topClient.id,
          type: 'customer',
          title: topClient.companyName,
          subtitle: `Contact: ${topClient.contactName} • ${topClient.industry}`,
          keyMetric: formatCurrency(topClient.lifetimeValue),
          linkHref: '/customers',
        },
      ],
      suggestedActions: [
        {
          id: 'act-sales-1',
          type: 'approve_quote',
          label: `Review ${topClient.companyName} Account`,
          description: 'View active work orders and lifetime spend',
          payload: { customerId: topClient.id },
        },
      ],
    };
  }
}
