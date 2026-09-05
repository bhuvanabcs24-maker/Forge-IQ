import { NextRequest, NextResponse } from 'next/server';
import { RazorpayGatewayProvider } from '@/lib/billing/gateways/razorpay-gateway';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = 'INR', receipt, notes } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid or missing amount. Must be a positive number.' },
        { status: 400 }
      );
    }

    const gateway = new RazorpayGatewayProvider();
    
    // Amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(amount * 100);

    const order = await gateway.createOrder({
      amount: amountInPaise,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {},
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      keyId: order.keyId,
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to initialize Razorpay order.' },
      { status: 500 }
    );
  }
}
