import { PricingRules } from '@/types/quotation-engine';

export const DEFAULT_FABRICATION_PRICING_RULES: PricingRules = {
  id: 'rules-fab-default',
  industry: 'Fabrication',
  materialRates: {
    '304 Stainless Steel': 4.8, // $/kg
    '316 Stainless Steel': 6.5,
    '6061-T6 Aluminum': 3.9,
    '5052-H32 Aluminum': 3.4,
    'A36 Carbon Steel': 1.85,
    'Galvanized Sheet': 2.1,
  },
  machineRates: {
    laserCutterHourly: 120.0, // $/hr
    pressBrakeHourly: 95.0, // $/hr
    roboticWelderHourly: 110.0, // $/hr
    powderCoatHourly: 85.0, // $/hr
  },
  laborRates: {
    setupTechHourly: 45.0, // $/hr
    operatorHourly: 35.0, // $/hr
    qaInspectorHourly: 40.0, // $/hr
  },
  finishingRates: {
    powderCoatPerSqFt: 2.5, // $/sq.ft
    anodizingPerSqFt: 3.2,
    deburringPerSqFt: 0.8,
  },
  scrapAllowancePercent: 5.0, // 5%
  overheadPercent: 12.0, // 12%
  profitMarginPercent: 18.0, // 18%
  gstTaxPercent: 8.0, // 8% GST
  basePackagingFee: 45.0, // $45.00
  shippingPerKgRate: 1.25, // $1.25/kg
};
