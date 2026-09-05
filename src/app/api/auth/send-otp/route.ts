import { NextRequest, NextResponse } from 'next/server';
import { sendSmsOtp } from '@/lib/auth/otp-dev-provider';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = body;

    const result = await sendSmsOtp(phone);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to dispatch SMS OTP.' },
      { status: 400 }
    );
  }
}
