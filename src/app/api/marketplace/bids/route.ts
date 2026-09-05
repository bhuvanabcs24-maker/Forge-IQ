import { NextRequest, NextResponse } from 'next/server';
import { globalBiddingEngine } from '@/lib/marketplace/bidding-engine';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rfqId = searchParams.get('rfqId') || 'rfq-2026-0891';

  const bids = globalBiddingEngine.getBidsForRfq(rfqId);

  return NextResponse.json({ success: true, rfqId, bids });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, bidId, buyerOrgId, newBid } = body;

    if (action === 'accept') {
      const result = globalBiddingEngine.acceptBid(bidId, buyerOrgId || 'org-1');
      return NextResponse.json({ success: true, acceptedBid: result.acceptedBid, escrow: result.escrow });
    }

    if (newBid) {
      const created = globalBiddingEngine.submitBid(newBid);
      return NextResponse.json({ success: true, bid: created });
    }

    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Bidding execution failed' }, { status: 500 });
  }
}
