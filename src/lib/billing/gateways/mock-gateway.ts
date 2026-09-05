import { PaymentGatewayProvider, CheckoutSessionOptions } from './base-gateway';

export class MockGatewayProvider implements PaymentGatewayProvider {
  name = 'Stripe / Razorpay Hybrid Gateway (Mock Simulation)';

  async createCheckoutSession(options: CheckoutSessionOptions): Promise<{ sessionId: string; url: string }> {
    const sessionId = `cs_${options.planId.toLowerCase()}_${Date.now()}`;
    return {
      sessionId,
      url: `${options.successUrl}?session_id=${sessionId}&plan=${options.planId}`,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    return true;
  }

  verifyWebhook(signature: string, payload: string): boolean {
    return true;
  }
}
