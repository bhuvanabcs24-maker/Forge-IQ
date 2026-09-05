import { CopilotAgent, AgentProcessingResult } from './base-agent';
import { MOCK_SUPPLIERS, MOCK_PURCHASE_ORDERS } from '@/lib/mock-data/manufacturing';
import { formatCurrency } from '@/lib/utils';

export class PurchaseAgent implements CopilotAgent {
  domain = 'Purchase' as const;
  name = 'Procurement & Vendor Intelligence Agent';
  description = 'Analyzes purchase orders, supplier lead times, vendor ratings, and raw material procurement.';

  async processQuery(query: string): Promise<AgentProcessingResult> {
    const preferredSupplier = MOCK_SUPPLIERS[0]; // Ryerson
    const pendingPo = MOCK_PURCHASE_ORDERS[0]; // PO-2026-0189

    return {
      domain: this.domain,
      analysisText: `Reviewed vendor procurement contracts. Top supplier **${preferredSupplier.companyName}** has a **${preferredSupplier.rating}/5.0 rating** and **${preferredSupplier.averageLeadTimeDays}-day average lead time**. Active PO **${pendingPo.poNumber}** (${formatCurrency(pendingPo.totalCost)}) expected delivery on ${pendingPo.expectedDelivery}.`,
      confidenceScore: 95,
      evidence: [
        {
          id: pendingPo.id,
          type: 'supplier',
          title: `${pendingPo.poNumber} - ${pendingPo.supplierName}`,
          subtitle: `Status: ${pendingPo.status} • Delivery: ${pendingPo.expectedDelivery}`,
          keyMetric: formatCurrency(pendingPo.totalCost),
          linkHref: '/purchase-orders',
        },
      ],
      suggestedActions: [
        {
          id: 'act-po-1',
          type: 'create_po',
          label: 'Issue Purchase Order to Ryerson',
          description: 'Procure 304 SS & Aluminum 6061 stock',
          payload: { supplierId: preferredSupplier.id },
        },
      ],
    };
  }
}
