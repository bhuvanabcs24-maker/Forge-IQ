import {
  IndustryType,
  PricingRules,
  QuotationLineItemDetail,
  CostBreakdown,
} from '@/types/quotation-engine';

export interface CalculationResult {
  lineItems: QuotationLineItemDetail[];
  costBreakdown: CostBreakdown;
}

export interface PricingPlugin {
  industry: IndustryType;
  calculateLineItem(
    item: Partial<QuotationLineItemDetail>,
    rules: PricingRules
  ): QuotationLineItemDetail;
  calculateQuotation(
    items: QuotationLineItemDetail[],
    rules: PricingRules
  ): CostBreakdown;
}

class PricingRegistry {
  private plugins: Map<IndustryType, PricingPlugin> = new Map();

  register(plugin: PricingPlugin) {
    this.plugins.set(plugin.industry, plugin);
  }

  getPlugin(industry: IndustryType): PricingPlugin | undefined {
    return this.plugins.get(industry);
  }
}

export const pricingRegistry = new PricingRegistry();
