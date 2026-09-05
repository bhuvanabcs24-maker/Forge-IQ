import { UsageMetrics, SubscriptionTier } from '@/types/billing';
import { SUBSCRIPTION_PLANS } from './plans';

export function getLiveUsageMetrics(currentTier: SubscriptionTier = 'Professional'): UsageMetrics {
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === currentTier) || SUBSCRIPTION_PLANS[1];

  return {
    aiRequestsUsed: 840,
    aiRequestsLimit: plan.maxAiRequestsPerMonth,
    whatsappMessagesUsed: 620,
    whatsappMessagesLimit: plan.maxWhatsAppMessagesPerMonth,
    activeSeatsUsed: 8,
    activeSeatsLimit: plan.maxSeats,
    storageGbUsed: 28.4,
    storageGbLimit: plan.maxStorageGb,
  };
}
