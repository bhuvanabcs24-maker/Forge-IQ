import { SubscriptionTier } from '@/types/billing';

export interface ModuleAccessRights {
  aiOrderIntake: boolean;
  aiQuotationEngine: boolean;
  productionPlanner: boolean;
  whatsappIntegration: boolean;
  copilotAssistant: boolean;
  customerPortal: boolean;
  customTemplates: boolean;
  marketplaceEnabled: boolean;
}

export const TIER_FEATURE_MATRIX: Record<SubscriptionTier, ModuleAccessRights> = {
  Starter: {
    aiOrderIntake: false,
    aiQuotationEngine: false,
    productionPlanner: false,
    whatsappIntegration: false,
    copilotAssistant: false,
    customerPortal: false,
    customTemplates: false,
    marketplaceEnabled: false,
  },
  Professional: {
    aiOrderIntake: true,
    aiQuotationEngine: true,
    productionPlanner: true,
    whatsappIntegration: true,
    copilotAssistant: false,
    customerPortal: true,
    customTemplates: false,
    marketplaceEnabled: false,
  },
  Enterprise: {
    aiOrderIntake: true,
    aiQuotationEngine: true,
    productionPlanner: true,
    whatsappIntegration: true,
    copilotAssistant: true,
    customerPortal: true,
    customTemplates: true,
    marketplaceEnabled: false, // Feature-flagged hidden until release launch
  },
};

export function canAccessModule(tier: SubscriptionTier, moduleName: keyof ModuleAccessRights): boolean {
  const rights = TIER_FEATURE_MATRIX[tier] || TIER_FEATURE_MATRIX.Professional;
  return rights[moduleName];
}
