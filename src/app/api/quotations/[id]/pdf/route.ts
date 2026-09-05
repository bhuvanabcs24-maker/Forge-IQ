import { NextRequest, NextResponse } from 'next/server';
import { generateQuotationPdfHtml } from '@/lib/pdf/quotation-pdf-generator';
import { ExtendedQuotation } from '@/types/quotation-engine';
import { DEFAULT_FABRICATION_PRICING_RULES } from '@/lib/pricing/default-rules';
import { aiEstimatePartItem } from '@/lib/ai/quote-estimator';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'preview';

  const sampleItem1 = aiEstimatePartItem(
    {
      partName: 'Avionics Heat Sink Base Plate',
      material: 'Stainless Steel',
      materialGrade: '304 Stainless Steel',
      thickness: '6mm',
      dimensions: '400mm x 400mm',
      quantity: 150,
    },
    DEFAULT_FABRICATION_PRICING_RULES
  );

  const sampleItem2 = aiEstimatePartItem(
    {
      partName: 'Mounting Support Flange',
      material: 'Aluminum',
      materialGrade: '6061-T6 Aluminum',
      thickness: '4mm',
      dimensions: '250mm x 180mm',
      quantity: 150,
    },
    DEFAULT_FABRICATION_PRICING_RULES
  );

  const quote: ExtendedQuotation = {
    id: id || 'RFQ-2026-0891',
    quotationNumber: id.includes('RFQ') ? id : 'RFQ-2026-0891',
    customerName: 'Apex Aerospace Solutions',
    customerId: 'cust-1',
    title: 'Batch 500 Avionics Heat Sink Flanges',
    status: 'Approved',
    totalAmount: 46492,
    validUntil: '2026-08-30',
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
    lineItems: [
      {
        id: 'li-1',
        partName: 'Avionics Heat Sink Base Plate',
        materialGrade: '304 Stainless Steel',
        thickness: '6mm',
        dimensions: '400mm x 400mm',
        quantity: 150,
        unitPrice: 165,
        totalPrice: 24750,
        estimatedLaserCutTimeMins: 14,
        estimatedWeightKg: 5.8,
      },
      {
        id: 'li-2',
        partName: 'Mounting Support Flange',
        materialGrade: '6061-T6 Aluminum',
        thickness: '4mm',
        dimensions: '250mm x 180mm',
        quantity: 150,
        unitPrice: 98,
        totalPrice: 14700,
        estimatedLaserCutTimeMins: 8,
        estimatedWeightKg: 2.4,
      },
    ] as any,
    revisionNumber: 'v1.0',
    industry: 'Fabrication',
    detailedLineItems: [sampleItem1, sampleItem2],
    costBreakdown: {
      materialTotal: 18500,
      machineTotal: 9200,
      laborTotal: 4800,
      finishingTotal: 2400,
      packagingAndLogistics: 1500,
      subtotal: 39400,
      overheadAmount: 1800,
      profitMarginAmount: 5200,
      taxGstAmount: 7092,
      grandTotal: 46492,
    },
    pricingRulesSnapshot: DEFAULT_FABRICATION_PRICING_RULES,
    revisionHistory: [],
    paymentTerms: 'Net 30 Days. 30% advance for raw material procurement.',
    notes: 'ISO 9001:2015 CMM Inspection report included.',
    createdDate: '2026-08-01',
    validUntilDate: '2026-08-30',
  } as any;

  const html = generateQuotationPdfHtml(quote);

  if (action === 'download') {
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${quote.quotationNumber}.html"`,
      },
    });
  }

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
