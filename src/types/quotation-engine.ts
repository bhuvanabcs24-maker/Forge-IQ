import { Quotation } from './index';

export type IndustryType = 'Fabrication' | 'Furniture' | 'Textile' | 'Printing' | 'Electrical' | 'Logistics';

export interface PricingRules {
  id: string;
  industry: IndustryType;
  // Material Catalog ($/kg)
  materialRates: Record<string, number>;
  // Machine Hourly Rates ($/hr)
  machineRates: {
    laserCutterHourly: number;
    pressBrakeHourly: number;
    roboticWelderHourly: number;
    powderCoatHourly: number;
  };
  // Labor Rates ($/hr)
  laborRates: {
    setupTechHourly: number;
    operatorHourly: number;
    qaInspectorHourly: number;
  };
  // Finishing Rates ($/sq.ft)
  finishingRates: {
    powderCoatPerSqFt: number;
    anodizingPerSqFt: number;
    deburringPerSqFt: number;
  };
  // Financial Multipliers (%)
  scrapAllowancePercent: number; // e.g. 5.0
  overheadPercent: number; // e.g. 12.0
  profitMarginPercent: number; // e.g. 20.0
  gstTaxPercent: number; // e.g. 8.0
  basePackagingFee: number; // e.g. $50.00
  shippingPerKgRate: number; // e.g. $1.50/kg
}

export interface AiEstimateField<T> {
  value: T;
  confidence: number; // 0-100
  aiAssumptionNotes?: string;
}

export interface QuotationLineItemDetail {
  id: string;
  partName: string;
  material: string;
  materialGrade: string;
  thickness: string;
  dimensions: string;
  quantity: number;
  // AI Generated Estimates
  estimatedWeightKg: AiEstimateField<number>;
  estimatedLaserRuntimeMins: AiEstimateField<number>;
  estimatedBendsCount: AiEstimateField<number>;
  estimatedLaborHours: AiEstimateField<number>;
  estimatedScrapPercent: AiEstimateField<number>;
  complexityFactor: AiEstimateField<number>; // 1.0 - 2.0
  // Computed Financial Breakdown
  materialCost: number;
  machineCost: number;
  laborCost: number;
  finishingCost: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CostBreakdown {
  materialTotal: number;
  machineTotal: number;
  laborTotal: number;
  finishingTotal: number;
  packagingAndLogistics: number;
  subtotal: number;
  overheadAmount: number;
  profitMarginAmount: number;
  taxGstAmount: number;
  grandTotal: number;
}

export interface QuotationRevision {
  revisionNumber: string; // e.g. "v1.0", "v1.1"
  createdAt: string;
  createdBy: string;
  changeSummary: string;
  lineItems: QuotationLineItemDetail[];
  costBreakdown: CostBreakdown;
  validUntil: string;
}

export interface ExtendedQuotation extends Quotation {
  revisionNumber: string;
  industry: IndustryType;
  detailedLineItems: QuotationLineItemDetail[];
  costBreakdown: CostBreakdown;
  pricingRulesSnapshot: PricingRules;
  revisionHistory: QuotationRevision[];
  paymentTerms: string;
  notes: string;
  approvalSignature?: {
    approvedBy: string;
    approvedAt: string;
    digitalSignatureHash: string;
  };
}
