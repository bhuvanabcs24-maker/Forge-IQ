import { NextRequest, NextResponse } from 'next/server';
import { getAiProvider } from '@/lib/ai/providers/base';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileName, fileType, fileSize, samplePresetId, providerName } = body;

    const provider = getAiProvider(providerName);
    const result = await provider.processDocument(
      { name: fileName || 'document.pdf', type: fileType || 'application/pdf', size: fileSize || 1024 * 500 },
      { samplePresetId }
    );

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'AI document processing failed' },
      { status: 500 }
    );
  }
}
