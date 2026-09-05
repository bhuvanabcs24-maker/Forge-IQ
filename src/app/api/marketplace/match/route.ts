import { NextRequest, NextResponse } from 'next/server';
import { globalFactoryMatchingEngine } from '@/lib/marketplace/matching-engine';
import { MarketplaceRfq } from '@/types/marketplace';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rfq: MarketplaceRfq = body.rfq || {
      id: `rfq-${Date.now()}`,
      buyerOrgId: 'org-1',
      buyerOrgName: 'Apex Aerospace Solutions',
      title: 'Titanium Flanges Batch 200',
      materialGrade: '304 Stainless Steel',
      quantity: 150,
      targetPrice: 45000,
      deliveryDueDate: '2026-08-30',
      status: 'Open',
      createdAt: new Date().toISOString(),
    };

    const matches = globalFactoryMatchingEngine.matchFactoriesForRfq(rfq);

    return NextResponse.json({
      success: true,
      rfqId: rfq.id,
      candidateCount: matches.length,
      matches,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Factory matching failed' }, { status: 500 });
  }
}
