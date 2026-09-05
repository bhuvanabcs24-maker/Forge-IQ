import { NextRequest, NextResponse } from 'next/server';
import { RazorpayGatewayProvider } from '@/lib/billing/gateways/razorpay-gateway';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';

    const gateway = new RazorpayGatewayProvider();
    const isValid = gateway.verifyWebhook(signature, rawBody);

    if (!isValid) {
      console.warn('Razorpay webhook signature mismatch. Ignoring untrusted payload.');
      return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;

    console.log(`[Razorpay Webhook] Received verified event: ${event}`);

    switch (event) {
      case 'payment.captured':
        console.log(`[Razorpay] Payment captured: ${paymentEntity?.id}, Amount: ₹${(paymentEntity?.amount || 0) / 100}`);
        break;

      case 'order.paid':
        console.log(`[Razorpay] Order fully paid: ${orderEntity?.id}, Receipt: ${orderEntity?.receipt}`);
        break;

      case 'payment.failed':
        console.warn(`[Razorpay] Payment failed: ${paymentEntity?.id}, Reason: ${paymentEntity?.error_description}`);
        break;

      case 'subscription.charged':
        console.log(`[Razorpay] SaaS subscription billed successfully.`);
        break;

      case 'subscription.cancelled':
        console.log(`[Razorpay] SaaS subscription cancelled.`);
        break;

      default:
        console.log(`[Razorpay] Unhandled webhook event: ${event}`);
    }

    return NextResponse.json({ received: true, status: 'processed', event }, { status: 200 });
  } catch (error: any) {
    console.error('Razorpay webhook handler exception:', error);
    return NextResponse.json(
      { error: error?.message || 'Razorpay webhook processing failed' },
      { status: 400 }
    );
  }
}
