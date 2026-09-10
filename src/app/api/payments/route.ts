import { NextRequest, NextResponse } from 'next/server';
import { RazorpayGatewayProvider } from '@/lib/billing/gateways/razorpay-gateway';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const amount = Number(body.amount) || 12500;
    const currency = body.currency || 'INR';
    const receipt = body.receipt || `pay_${Date.now()}`;

    const gateway = new RazorpayGatewayProvider();
    const amountInPaise = Math.round(amount * 100);

    const order = await gateway.createOrder({
      amount: amountInPaise,
      currency,
      receipt,
      notes: body.notes || { type: 'production_order_advance' },
    });

    return NextResponse.json({
      success: true,
      paymentId: `PAY-${Date.now()}`,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: 'Created',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Payment initiation failed.' },
      { status: 500 }
    );
  }
}
