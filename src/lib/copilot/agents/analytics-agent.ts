import { CopilotAgent, AgentProcessingResult } from './base-agent';
import { INITIAL_METRICS } from '@/lib/mock-data/manufacturing';
import { formatCurrency } from '@/lib/utils';

export class AnalyticsAgent implements CopilotAgent {
  domain = 'Analytics' as const;
  name = 'Executive Analytics & Telemetry Agent';
  description = 'Synthesizes cross-domain metrics, capacity forecasts, scrap rates, and executive reports.';

  async processQuery(query: string): Promise<AgentProcessingResult> {
    return {
      domain: this.domain,
      analysisText: `Cross-domain telemetry synthesis: Platform is operating @ **94.2% OEE capacity**. Overall material scrap rate reduced to **3.1%**. Gross margin sits at **18.4%**. Plant can absorb **+2 additional high-volume work orders** this week before requiring overtime shifts.`,
      confidenceScore: 93,
      evidence: [
        {
          id: 'ev-anal-1',
          type: 'order',
          title: 'Executive Telemetry Summary',
          subtitle: 'Plant Capacity: 94.2% OEE • Scrap Rate: 3.1%',
          keyMetric: `${INITIAL_METRICS.activeProductionJobs} Active Jobs`,
          linkHref: '/reports',
        },
      ],
      suggestedActions: [
        {
          id: 'act-anal-1',
          type: 'rebalance_schedule',
          label: 'Export Executive Telemetry Report',
          description: 'Generate PDF analytics summary',
          payload: { reportType: 'executive' },
        },
      ],
    };
  }
}
