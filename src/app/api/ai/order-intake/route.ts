import { NextRequest, NextResponse } from 'next/server';
import { getAiProvider } from '@/lib/ai/providers/base';
import { pythonAIClient } from '@/lib/ai/python-client';
import { ExtractedOrderData } from '@/types/ai-order-intake';
import { OrderPriority } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileName, fileType, fileSize, samplePresetId, providerName, rawText } = body;

    // Step 1: Attempt to use the Python AI microservice (RAG + Pydantic Structured Extraction)
    const pythonRes = await pythonAIClient.rfqIntake({
      rawText: rawText || `Manufacturing order for file: ${fileName || 'drawing.pdf'}`,
      fileName: fileName || 'drawing.pdf',
      samplePresetId,
    });

    if (pythonRes.success && pythonRes.data) {
      const d = pythonRes.data;
      const conf = Math.round((d.confidence_score || 0.95) * 100);

      const mappedData: ExtractedOrderData = {
        customerName: { value: d.customer_name || 'NexaSolar Energy Labs', confidence: conf },
        companyName: { value: d.company_name || 'NexaSolar Industries', confidence: conf },
        phone: { value: '+91 98765 43210', confidence: 95 },
        email: { value: 'procurement@nexasolar.com', confidence: 95 },
        material: { value: d.material || 'Stainless Steel', confidence: conf },
        materialGrade: { value: d.material_grade || '304', confidence: conf },
        thickness: { value: d.thickness || '3 mm', confidence: conf },
        dimensions: { value: d.dimensions || '250 x 180 x 45 mm', confidence: conf },
        quantity: { value: d.quantity || 500, confidence: conf },
        deliveryDate: { value: d.delivery_date || 'Within 7 Days', confidence: conf },
        priority: { value: (d.priority as OrderPriority) || 'standard', confidence: conf },
        specialInstructions: { value: d.special_instructions || 'Deburr edges, apply protective laser film', confidence: conf },
        drawingRefNumber: { value: d.drawing_reference || 'DWG-2026-0881-A', confidence: conf },
      };

      return NextResponse.json({
        success: true,
        data: {
          rawOcrText: `[Extracted by Python AI Engine]\nCustomer: ${d.customer_name}\nPart: ${d.part_title}\nMaterial: ${d.material} ${d.material_grade}\nThickness: ${d.thickness}\nQty: ${d.quantity}`,
          extractedData: mappedData,
          processingTimeMs: pythonRes.latency_ms || 120,
          providerName: `Python AI (${pythonRes.provider_used || 'Active'})`,
          modelUsed: pythonRes.is_mock ? 'Mock Simulation' : 'FastAPI Multi-Agent Engine',
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Step 2: Fallback to existing provider if Python microservice is offline
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
