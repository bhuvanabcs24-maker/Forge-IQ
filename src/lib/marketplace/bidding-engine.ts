import { FactoryBid, MarketplaceRfq, EscrowTransaction } from '@/types/marketplace';
import { globalEscrowService } from './escrow-service';

export class BiddingEngine {
  private bids: FactoryBid[] = [
    {
      id: 'bid-101',
      rfqId: 'rfq-2026-0891',
      factoryId: 'fac-1',
      factoryName: 'AlphaTech Precision Engineering Pvt Ltd',
      bidAmount: 42500,
      estimatedLeadTimeDays: 7,
      capacityDeclaration: 'Dedicated open capacity on TRUMPF TruLaser 3030 6kW fleet & Amada 130T Brake',
      status: 'submitted',
      expirationDate: '2026-08-30',
      createdAt: '2026-08-07',
    },
    {
      id: 'bid-102',
      rfqId: 'rfq-2026-0891',
      factoryId: 'fac-3',
      factoryName: 'Zenith Industrial Sheet Metal Works',
      bidAmount: 39800,
      estimatedLeadTimeDays: 9,
      capacityDeclaration: 'Open runtime on Bystronic 6kW Laser & robotic welding cell',
      status: 'submitted',
      expirationDate: '2026-08-30',
      createdAt: '2026-08-07',
    },
    {
      id: 'bid-103',
      rfqId: 'rfq-2026-0891',
      factoryId: 'fac-2',
      factoryName: 'Apex Aerospace & Defense Fabricators',
      bidAmount: 48500,
      estimatedLeadTimeDays: 5,
      capacityDeclaration: 'High-precision AS9100D fast-track routing with Zeiss CMM inspection',
      status: 'submitted',
      expirationDate: '2026-08-30',
      createdAt: '2026-08-08',
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
