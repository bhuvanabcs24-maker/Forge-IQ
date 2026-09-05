import { NextRequest, NextResponse } from 'next/server';
import { RazorpayGatewayProvider } from '@/lib/billing/gateways/razorpay-gateway';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, metadata } = body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json(
        { error: 'Missing required Razorpay payment confirmation parameters.' },
        { status: 400 }
      );
    }

    const gateway = new RazorpayGatewayProvider();
    const isValid = gateway.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature || ''
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Payment signature verification failed. Possible tampering detected.' },
        { status: 400 }
      );
    }

    // Payment successfully confirmed
    return NextResponse.json({
      success: true,
      message: 'Razorpay payment verified and settled successfully.',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      settledAt: new Date().toISOString(),
      metadata: metadata || null,
    });
  } catch (error: any) {
    console.error('Error verifying Razorpay payment:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to verify payment.' },
      { status: 500 }
    );
  }
}
