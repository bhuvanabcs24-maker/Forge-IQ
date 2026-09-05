import { AgentDomain, CopilotMessage, DataEvidence, CopilotAction } from '@/types/copilot';
import { SalesAgent } from './agents/sales-agent';
import { QuotationAgent } from './agents/quotation-agent';
import { ProductionAgent } from './agents/production-agent';
import { InventoryAgent } from './agents/inventory-agent';
import { PurchaseAgent } from './agents/purchase-agent';
import { FinanceAgent } from './agents/finance-agent';
import { AnalyticsAgent } from './agents/analytics-agent';

export class CopilotOrchestrator {
  private salesAgent = new SalesAgent();
  private quotationAgent = new QuotationAgent();
  private productionAgent = new ProductionAgent();
  private inventoryAgent = new InventoryAgent();
  private purchaseAgent = new PurchaseAgent();
  private financeAgent = new FinanceAgent();
  private analyticsAgent = new AnalyticsAgent();

  async processQuery(userQuery: string): Promise<CopilotMessage> {
    const q = userQuery.toLowerCase();
    const activeDomains: AgentDomain[] = [];
    const evidenceList: DataEvidence[] = [];
    const actionList: CopilotAction[] = [];
    let responseText = '';
    let confidenceScore = 95;

    // 1. Intent Classification & Multi-Agent Routing
    if (q.includes('delayed') || q.includes('due') || q.includes('status')) {
      activeDomains.push('Production', 'Sales');
      const prodRes = await this.productionAgent.processQuery(userQuery);
      const salesRes = await this.salesAgent.processQuery(userQuery);

      responseText = `### 🚨 Production & Order Delay Assessment\n\n${prodRes.analysisText}\n\n${salesRes.analysisText}\n\n**Key Takeaway:** High-priority work order **WO-2026-0891** (Titanium Flanges) is on schedule at 68% progress. Press Brake 01 is approaching peak capacity, which could delay secondary bending jobs if not rebalanced.`;
      evidenceList.push(...prodRes.evidence, ...salesRes.evidence);
      actionList.push(...prodRes.suggestedActions);
      confidenceScore = 96;
    } else if (q.includes('accept') || q.includes('capacity') || q.includes('another job') || q.includes('this week')) {
      activeDomains.push('Production', 'Analytics');
      const prodRes = await this.productionAgent.processQuery(userQuery);
      const analRes = await this.analyticsAgent.processQuery(userQuery);

      responseText = `### ⚡ Capacity & Order Intake Feasibility\n\n**Yes, Precision Fab Co. can accept 2 additional work orders this week.**\n\n${analRes.analysisText}\n\nTRUMPF Fiber Laser 01 has 18 hours of open runtime before Friday. However, raw stock for 6061 Aluminum is currently below reorder thresholds.`;
      evidenceList.push(...analRes.evidence, ...prodRes.evidence);
      actionList.push(...prodRes.suggestedActions);
      confidenceScore = 94;
    } else if (q.includes('overdue') || q.includes('payment') || q.includes('unpaid') || q.includes('invoice')) {
      activeDomains.push('Finance', 'Sales');
      const finRes = await this.financeAgent.processQuery(userQuery);
      const salesRes = await this.salesAgent.processQuery(userQuery);

      responseText = `### 💰 Overdue Accounts Receivable Summary\n\n${finRes.analysisText}\n\nInvoice **INV-2026-0775** (₹1,96,000.00) from Stallion Architectural Metals is **7 days past due** (Due July 31). Apex Aerospace settled their ₹7,80,000 invoice earlier today.`;
      evidenceList.push(...finRes.evidence, ...salesRes.evidence);
      actionList.push(...finRes.suggestedActions);
      confidenceScore = 99;
    } else if (q.includes('reorder') || q.includes('inventory') || q.includes('stock') || q.includes('shortage')) {
      activeDomains.push('Inventory', 'Purchase');
      const invRes = await this.inventoryAgent.processQuery(userQuery);
      const purRes = await this.purchaseAgent.processQuery(userQuery);

      responseText = `### 📦 Raw Material Stock & Procurement Advisory\n\n${invRes.analysisText}\n\n${purRes.analysisText}\n\n**Action Required:** Reorder **RAW-AL6061-250** (6061-T6 Aluminum) and **HW-PEM-M6-SS** (PEM Fasteners) immediately to prevent shop floor dispatch holds next week.`;
      evidenceList.push(...invRes.evidence, ...purRes.evidence);
      actionList.push(...invRes.suggestedActions, ...purRes.suggestedActions);
      confidenceScore = 97;
    } else if (q.includes('overloaded') || q.includes('machine') || q.includes('oee') || q.includes('maintenance')) {
      activeDomains.push('Production', 'Analytics');
      const prodRes = await this.productionAgent.processQuery(userQuery);

      responseText = `### ⚙️ Equipment Load & Machine Telemetry\n\n${prodRes.analysisText}\n\n**Overload Alert:** Bystronic Xpert Pro Press Brake is operating @ **91.2% OEE** with an 82% queue density. Gema Powder Coat Line is currently in maintenance calibration until tomorrow.`;
      evidenceList.push(...prodRes.evidence);
      actionList.push(...prodRes.suggestedActions);
      confidenceScore = 95;
    } else if (q.includes('profit') || q.includes('cost') || q.includes('margin') || q.includes('decreased')) {
      activeDomains.push('Finance', 'Quotation', 'Inventory');
      const finRes = await this.financeAgent.processQuery(userQuery);
      const quoteRes = await this.quotationAgent.processQuery(userQuery);

      responseText = `### 📈 Profit Margin & Cost Variance Telemetry\n\n${finRes.analysisText}\n\n${quoteRes.analysisText}\n\n**Root Cause Analysis:** Raw material cost for 304 Stainless Steel rose +4.2% this month. In addition, material scrap rate spiked to 5.0% on un-optimized laser nesting runs. Re-nesting and enforcing scrap allowances will restore margins to 20.0%.`;
      evidenceList.push(...finRes.evidence, ...quoteRes.evidence);
      actionList.push(...quoteRes.suggestedActions);
      confidenceScore = 92;
    } else {
      // Default Multi-Agent Synthesis: Priorities overview
      activeDomains.push('Sales', 'Production', 'Finance');
      const salesRes = await this.salesAgent.processQuery(userQuery);
      const prodRes = await this.productionAgent.processQuery(userQuery);
      const finRes = await this.financeAgent.processQuery(userQuery);

      responseText = `### 🎯 Today's Operational Priorities Overview\n\n1. **Production:** ${prodRes.analysisText}\n2. **Finance:** ${finRes.analysisText}\n3. **Sales:** ${salesRes.analysisText}\n\nForgeIQ Copilot is actively monitoring all 14 platform modules. Ask follow-up questions about specific orders, quotes, or inventory items!`;
      evidenceList.push(...prodRes.evidence, ...finRes.evidence, ...salesRes.evidence);
      actionList.push(...prodRes.suggestedActions, ...finRes.suggestedActions);
      confidenceScore = 98;
    }

    return {
      id: `msg-${Date.now()}`,
      sender: 'copilot',
      content: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      activeAgents: activeDomains,
      confidenceScore,
      evidence: evidenceList,
      suggestedActions: actionList,
    };
  }
}

export const globalCopilotOrchestrator = new CopilotOrchestrator();
