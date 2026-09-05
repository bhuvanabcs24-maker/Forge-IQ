import { CopilotAgent, AgentProcessingResult } from './base-agent';
import { MOCK_ORDERS, MOCK_MACHINES } from '@/lib/mock-data/manufacturing';

export class ProductionAgent implements CopilotAgent {
  domain = 'Production' as const;
  name = 'Production & Shop Floor Dispatch Agent';
  description = 'Analyzes active work orders, machine OEE telemetry, press brake bottlenecks, and worker shifts.';

  async processQuery(query: string): Promise<AgentProcessingResult> {
    const delayedOrders = MOCK_ORDERS.filter((o) => o.priority === 'Rush' && o.progressPercent < 70);
    const targetOrder = MOCK_ORDERS[0]; // WO-2026-0891

    return {
      domain: this.domain,
      analysisText: `Inspected shop floor dispatch telemetry. **WO-2026-0891** (${targetOrder.title}) is at **${targetOrder.progressPercent}% progress** on TRUMPF Fiber Laser 01. Press Brake queue is at 82% capacity.`,
      confidenceScore: 94,
      evidence: [
        {
          id: targetOrder.id,
          type: 'order',
          title: `${targetOrder.orderNumber} - ${targetOrder.title}`,
          subtitle: `Customer: ${targetOrder.customerName} • Due: ${targetOrder.dueDate}`,
          keyMetric: `${targetOrder.progressPercent}% Completed`,
          linkHref: '/production',
        },
        {
          id: 'mach-2',
          type: 'machine',
          title: MOCK_MACHINES[1].name,
          subtitle: 'Bystronic Press Brake • OEE 91.2%',
          keyMetric: '82% Load Queue',
          linkHref: '/machines',
        },
      ],
      suggestedActions: [
        {
          id: 'act-prod-1',
          type: 'rebalance_schedule',
          label: 'Rebalance Shift Load for Press Brake',
          description: 'Reallocate 2 jobs to Night Shift operator (Alex Rivera)',
          payload: { machineId: 'mach-2' },
        },
      ],
    };
  }
}
