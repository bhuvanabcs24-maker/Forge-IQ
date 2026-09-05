import { NextRequest, NextResponse } from 'next/server';
import { globalCopilotOrchestrator } from '@/lib/copilot/orchestrator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    const response = await globalCopilotOrchestrator.processQuery(query || 'Show today priorities');

    return NextResponse.json({
      success: true,
      message: response,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Copilot query failed' },
      { status: 500 }
    );
  }
}
