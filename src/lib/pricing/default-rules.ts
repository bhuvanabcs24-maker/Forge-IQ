import { PricingRules } from '@/types/quotation-engine';

export const DEFAULT_FABRICATION_PRICING_RULES: PricingRules = {
  id: 'rules-fab-default',
  industry: 'Fabrication',
  materialRates: {
    '304 Stainless Steel': 380, // ₹/kg
    '316 Stainless Steel': 520, // ₹/kg
    '6061-T6 Aluminum': 310, // ₹/kg
    '5052-H32 Aluminum': 270, // ₹/kg
    'A36 Carbon Steel': 150, // ₹/kg
    'Galvanized Sheet': 170, // ₹/kg
  },
  machineRates: {
    laserCutterHourly: 3200.0, // ₹/hr
    pressBrakeHourly: 2400.0, // ₹/hr
    roboticWelderHourly: 2800.0, // ₹/hr
    powderCoatHourly: 2100.0, // ₹/hr
  },
  laborRates: {
    setupTechHourly: 550.0, // ₹/hr
    operatorHourly: 350.0, // ₹/hr
    qaInspectorHourly: 450.0, // ₹/hr
  },
  finishingRates: {
    powderCoatPerSqFt: 180.0, // ₹/sq.ft
    anodizingPerSqFt: 240.0,
    deburringPerSqFt: 60.0,
  },
  scrapAllowancePercent: 5.0, // 5%
  overheadPercent: 12.0, // 12%
  profitMarginPercent: 18.0, // 18%
  gstTaxPercent: 18.0, // 18% Indian GST
  basePackagingFee: 1500.0, // ₹1,500
  shippingPerKgRate: 45.0, // ₹45/kg
};

