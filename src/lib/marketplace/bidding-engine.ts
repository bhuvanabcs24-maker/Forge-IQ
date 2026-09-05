import { FactoryBid, MarketplaceRfq, EscrowTransaction } from '@/types/marketplace';
import { globalEscrowService } from './escrow-service';

export class BiddingEngine {
  private bids: FactoryBid[] = [
    {
      id: 'bid-101',
      rfqId: 'rfq-2026-0891',
      factoryId: 'fac-1',
      factoryName: 'Precision Metal Fabrication Co.',
      bidAmount: 42500,
      estimatedLeadTimeDays: 8,
      capacityDeclaration: 'Immediate open runtime on TRUMPF 6kW Fiber Laser',
      status: 'submitted',
      expirationDate: '2026-08-30',
      createdAt: '2026-08-07',
    },
    {
      id: 'bid-102',
      rfqId: 'rfq-2026-0891',
      factoryId: 'fac-2',
      factoryName: 'Vanguard Industrial Sheet Metal',
      bidAmount: 44800,
      estimatedLeadTimeDays: 10,
      capacityDeclaration: 'Open runtime on Amada Laser & 150T Press Brake',
      status: 'submitted',
      expirationDate: '2026-08-30',
      createdAt: '2026-08-07',
    },
  ];

  getBidsForRfq(rfqId: string): FactoryBid[] {
    return this.bids.filter((b) => b.rfqId === rfqId);
  }

  submitBid(bid: Omit<FactoryBid, 'id' | 'status' | 'createdAt'>): FactoryBid {
    const newBid: FactoryBid = {
      ...bid,
      id: `bid-${Date.now()}`,
      status: 'submitted',
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.bids.push(newBid);
    return newBid;
  }

  acceptBid(bidId: string, buyerOrgId: string): { acceptedBid: FactoryBid; escrow: EscrowTransaction } {
    const bid = this.bids.find((b) => b.id === bidId);
    if (!bid) throw new Error('Bid not found');

    bid.status = 'accepted';

    // Initiate Escrow Payment Workflow
    const escrow = globalEscrowService.createEscrowDeposit(
      bid.rfqId,
      buyerOrgId,
      bid.factoryId,
      bid.bidAmount
    );

    return { acceptedBid: bid, escrow };
  }
}

export const globalBiddingEngine = new BiddingEngine();
