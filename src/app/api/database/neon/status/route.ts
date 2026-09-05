import { NextResponse } from 'next/server';
import { testNeonConnection } from '@/lib/db/neon';

export async function GET() {
  const status = await testNeonConnection();
  return NextResponse.json({
    status: status.connected ? 'connected' : 'disconnected',
    details: status,
    configuredUrl: process.env.DATABASE_URL
      ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')
      : 'Not configured (using fallback)',
  });
}
