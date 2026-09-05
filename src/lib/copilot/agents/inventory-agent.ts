import { CopilotAgent, AgentProcessingResult } from './base-agent';
import { MOCK_INVENTORY } from '@/lib/mock-data/manufacturing';

export class InventoryAgent implements CopilotAgent {
  domain = 'Inventory' as const;
  name = 'Inventory & Sheet Metal Stock Agent';
  description = 'Analyzes sheet metal SKU stock levels, reorder point alerts, and material scrap rates.';

  async processQuery(query: string): Promise<AgentProcessingResult> {
    const lowStockItems = MOCK_INVENTORY.filter((item) => item.quantity <= item.reorderPoint);
    const criticalItem = MOCK_INVENTORY[1]; // 6061 Aluminum Plate (14 left)

    return {
      domain: this.domain,
      analysisText: `Audited raw material inventory. Detected **${lowStockItems.length} SKUs below reorder point thresholds**. Critical SKU **${criticalItem.sku}** (${criticalItem.name}) has only **${criticalItem.quantity} ${criticalItem.unit} remaining** (Reorder point: ${criticalItem.reorderPoint}).`,
      confidenceScore: 97,
      evidence: [
        {
          id: criticalItem.id,
          type: 'inventory',
          title: `${criticalItem.sku} - ${criticalItem.name}`,
          subtitle: `Grade: ${criticalItem.materialGrade} • Location: ${criticalItem.location}`,
          keyMetric: `${criticalItem.quantity} ${criticalItem.unit} Left`,
          linkHref: '/inventory',
        },
      ],
      suggestedActions: [
        {
          id: 'act-inv-1',
          type: 'create_po',
          label: `Issue PO for ${criticalItem.sku}`,
          description: 'Reorder 25 sheets from Ryerson Metal Distribution',
          payload: { sku: criticalItem.sku, reorderQty: 25 },
        },
      ],
    };
  }
}
