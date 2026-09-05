import { CopilotAgent, AgentProcessingResult } from './base-agent';
import { MOCK_QUOTATIONS } from '@/lib/mock-data/manufacturing';
import { formatCurrency } from '@/lib/utils';

export class QuotationAgent implements CopilotAgent {
  domain = 'Quotation' as const;
  name = 'Quotation & Pricing Intelligence Agent';
  description = 'Analyzes RFQ pipeline, part line items, margin calculations, and pricing rules.';

  async processQuery(query: string): Promise<AgentProcessingResult> {
    const pendingQuotes = MOCK_QUOTATIONS.filter((q) => q.status === 'Sent' || q.status === 'Draft');
    const targetQuote = MOCK_QUOTATIONS[1]; // RFQ-2026-0413 ($64,200)

    return {
      domain: this.domain,
      analysisText: `Evaluated quotation pipeline. Found **${pendingQuotes.length} pending RFQs** totaling **${formatCurrency(114600)}**. High-margin quotation **${targetQuote.quotationNumber}** (${formatCurrency(targetQuote.totalAmount)}) is ready for approval.`,
      confidenceScore: 96,
      evidence: [
        {
          id: targetQuote.id,
          type: 'quotation',
          title: `${targetQuote.quotationNumber} - ${targetQuote.title}`,
          subtitle: `Customer: ${targetQuote.customerName} • Status: ${targetQuote.status}`,
          keyMetric: formatCurrency(targetQuote.totalAmount),
          linkHref: '/quotations',
        },
      ],
      suggestedActions: [
        {
          id: 'act-quote-1',
          type: 'approve_quote',
          label: `Approve Quote ${targetQuote.quotationNumber}`,
          description: 'Convert approved RFQ into work order',
          payload: { quotationId: targetQuote.id },
        },
      ],
    };
  }
}
