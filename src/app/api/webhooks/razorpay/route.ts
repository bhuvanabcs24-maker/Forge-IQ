import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const signature = req.headers.get('x-razorpay-signature') || '';

    // Process Razorpay subscription events
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Razorpay webhook handler failed' }, { status: 400 });
  }
}
