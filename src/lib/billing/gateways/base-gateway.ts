import { SubscriptionTier, BillingCycle } from '@/types/billing';

export interface CheckoutSessionOptions {
  planId: SubscriptionTier;
  cycle: BillingCycle;
  couponCode?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface PaymentGatewayProvider {
  name: string;
  createCheckoutSession(options: CheckoutSessionOptions): Promise<{ sessionId: string; url: string }>;
  cancelSubscription(subscriptionId: string): Promise<boolean>;
  verifyWebhook(signature: string, payload: string): boolean;
}

import { MockGatewayProvider } from './mock-gateway';

export function getPaymentGateway(providerName?: string): PaymentGatewayProvider {
  const selected = (providerName || process.env.NEXT_PUBLIC_PAYMENT_GATEWAY || 'mock').toLowerCase();

  switch (selected) {
    case 'stripe':
    case 'razorpay':
    case 'mock':
    default:
      return new MockGatewayProvider();
  }
}
