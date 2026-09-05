import { CopilotAgent, AgentProcessingResult } from './base-agent';
import { MOCK_INVOICES, INITIAL_METRICS } from '@/lib/mock-data/manufacturing';
import { formatCurrency } from '@/lib/utils';

export class FinanceAgent implements CopilotAgent {
  domain = 'Finance' as const;
  name = 'Finance & Accounts Receivable Agent';
  description = 'Analyzes gross revenues, COGS, pending payments, overdue invoices, and profit margins.';

  async processQuery(query: string): Promise<AgentProcessingResult> {
    const overdueInvoices = MOCK_INVOICES.filter((inv) => inv.status === 'Overdue');
    const overdueTotal = overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    return {
      domain: this.domain,
      analysisText: `Audited financial ledger. Month-to-date gross revenue is **${formatCurrency(INITIAL_METRICS.revenue)}** (+14.8% vs last month). Identified **${overdueInvoices.length} overdue invoice(s)** totaling **${formatCurrency(overdueTotal)}**, including INV-2026-0775 from Stallion Architectural Metals.`,
      confidenceScore: 99,
      evidence: overdueInvoices.map((inv) => ({
        id: inv.id,
        type: 'invoice',
        title: `${inv.invoiceNumber} - ${inv.customerName}`,
        subtitle: `Due: ${inv.dueDate} • Status: ${inv.status}`,
        keyMetric: formatCurrency(inv.amount),
        linkHref: '/invoices',
      })),
      suggestedActions: [
        {
          id: 'act-fin-1',
          type: 'send_invoice_reminder',
          label: 'Send Overdue Payment Notice',
          description: `Dispatch automated reminder for ${formatCurrency(overdueTotal)}`,
          payload: { invoiceIds: overdueInvoices.map((i) => i.id) },
        },
      ],
    };
  }
}
