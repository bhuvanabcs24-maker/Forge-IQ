import { NextRequest, NextResponse } from 'next/server';
import { verifySmsOtp } from '@/lib/auth/otp-dev-provider';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { verificationId, code } = body;

    const result = await verifySmsOtp(verificationId, code);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'OTP verification failed.' },
      { status: 400 }
    );
  }
}
