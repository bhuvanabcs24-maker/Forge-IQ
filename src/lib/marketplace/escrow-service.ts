import { EscrowTransaction, DisputeRecord, EscrowStatus } from '@/types/marketplace';

export class EscrowService {
  private escrows: EscrowTransaction[] = [];
  private disputes: DisputeRecord[] = [];
  private defaultMarketplaceFeePercent: number = 5.0; // Default 5% platform transaction fee

  /**
   * Configure global or tenant marketplace fee percentage
   */
  setDefaultMarketplaceFee(percent: number) {
    this.defaultMarketplaceFeePercent = percent;
  }

  getMarketplaceFeePercent(): number {
    return this.defaultMarketplaceFeePercent;
  }

  createEscrowDeposit(
    rfqId: string,
    buyerOrgId: string,
    factoryId: string,
    totalAmount: number,
    customFeePercent?: number
  ): EscrowTransaction {
    const feePercent = customFeePercent !== undefined ? customFeePercent : this.defaultMarketplaceFeePercent;
    const marketplaceFeeAmount = Math.round((totalAmount * feePercent) / 100);
    const factoryPayoutAmount = totalAmount - marketplaceFeeAmount;

    const escrow: EscrowTransaction = {
      id: `esc-${Date.now()}`,
      rfqId,
      buyerOrgId,
      factoryId,
      totalAmount,
      heldAmount: totalAmount,
      marketplaceFeePercent: feePercent,
      marketplaceFeeAmount,
      factoryPayoutAmount,
      status: 'deposit_held',
      milestoneReleases: [
        { stageName: 'Raw Material Procurement Deposit (30%)', amount: Math.round(totalAmount * 0.3), isReleased: false },
        { stageName: 'Machining & Fabrication Completion (40%)', amount: Math.round(totalAmount * 0.4), isReleased: false },
        { stageName: 'Quality Inspection & Dispatch Clearance (30%)', amount: Math.round(totalAmount * 0.3), isReleased: false },
      ],
      createdAt: new Date().toISOString(),
    };

    this.escrows.push(escrow);
    return escrow;
  }

  releaseMilestone(escrowId: string, milestoneIndex: number): EscrowTransaction {
    const escrow = this.escrows.find((e) => e.id === escrowId);
    if (!escrow) throw new Error('Escrow not found');

    if (escrow.milestoneReleases[milestoneIndex]) {
      escrow.milestoneReleases[milestoneIndex].isReleased = true;
      escrow.milestoneReleases[milestoneIndex].releasedAt = new Date().toISOString();
      escrow.heldAmount -= escrow.milestoneReleases[milestoneIndex].amount;

      if (escrow.heldAmount <= 0) {
        escrow.status = 'released_to_factory';
        escrow.disbursedAt = new Date().toISOString();
      }
    }

    return escrow;
  }

  /**
   * Final delivery confirmation: Releases all remaining funds, deducts platform fee, and disburses factory payout
   */
  confirmDeliveryAndDisburse(escrowId: string): EscrowTransaction {
    const escrow = this.escrows.find((e) => e.id === escrowId);
    if (!escrow) throw new Error('Escrow not found');

    escrow.milestoneReleases.forEach((m) => {
      m.isReleased = true;
      if (!m.releasedAt) m.releasedAt = new Date().toISOString();
    });

    escrow.heldAmount = 0;
    escrow.status = 'released_to_factory';
    escrow.disbursedAt = new Date().toISOString();

    return escrow;
  }

  raiseDispute(escrowId: string, raisedBy: 'buyer' | 'factory', reason: string): DisputeRecord {
    const escrow = this.escrows.find((e) => e.id === escrowId);
    if (escrow) {
      escrow.status = 'disputed';
    }

    const dispute: DisputeRecord = {
      id: `disp-${Date.now()}`,
      escrowId,
      raisedBy,
      reason,
      status: 'Open',
      createdAt: new Date().toISOString(),
    };

    this.disputes.push(dispute);
    return dispute;
  }

  getEscrowById(escrowId: string): EscrowTransaction | undefined {
    return this.escrows.find((e) => e.id === escrowId);
  }
}

export const globalEscrowService = new EscrowService();
