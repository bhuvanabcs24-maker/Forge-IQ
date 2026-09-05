import { NextResponse } from 'next/server';
import { runForgeIqEndToEndJourney } from '@/lib/testing/e2e-scenario-runner';

export async function GET() {
  try {
    const results = runForgeIqEndToEndJourney();
    const allPassed = results.every((r) => r.status === 'PASSED');

    return NextResponse.json({
      success: allPassed,
      totalScenarios: results.length,
      passedCount: results.filter((r) => r.status === 'PASSED').length,
      failedCount: results.filter((r) => r.status === 'FAILED').length,
      scenarios: results,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Error running e2e scenario journey',
      },
      { status: 500 }
    );
  }
}
