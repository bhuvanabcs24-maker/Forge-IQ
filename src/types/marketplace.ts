export type EscrowStatus =
  | 'deposit_held'
  | 'in_production'
  | 'quality_passed'
  | 'released_to_factory'
  | 'disputed'
  | 'refunded';

export type BidStatus = 'submitted' | 'accepted' | 'rejected' | 'expired';

export type BuyerPreference = 'lowest_price' | 'fastest_delivery' | 'highest_quality' | 'balanced';

export interface FactoryProfile {
  id: string;
  factoryName: string;
  location: string;
  verifiedStatus: 'Verified' | 'Pending';
  certifications: string[]; // ISO 9001, AS9100D, IATF 16949
  supportedMaterials: string[];
  machineCapabilities: string[]; // 6kW Fiber Laser, 250T Press Brake, 5-Axis CNC, Robotic Welding
  qualityScore: number; // 1 - 5 (e.g. 4.9)
  onTimeDeliveryRate: number; // 0 - 100%
  historicalCompletedOrders: number;
}

export interface MarketplaceRfq {
  id: string;
  buyerOrgId: string;
  buyerOrgName: string;
  title: string;
  materialGrade: string;
  thickness?: string;
  quantity: number;
  targetPrice: number;
  deliveryDueDate: string;
  cadAttachmentUrl?: string;
  naturalLanguagePrompt?: string;
  status: 'Open' | 'Bidding_Closed' | 'Awarded';
  createdAt: string;
}

export interface FactoryBid {
  id: string;
  rfqId: string;
  factoryId: string;
  factoryName: string;
  bidAmount: number;
  estimatedLeadTimeDays: number;
  capacityDeclaration: string;
  status: BidStatus;
  expirationDate: string;
  createdAt: string;
}

export interface EscrowTransaction {
  id: string;
  rfqId: string;
  buyerOrgId: string;
  factoryId: string;
  totalAmount: number;
  heldAmount: number;
  marketplaceFeePercent: number; // Configurable transaction fee (e.g. 5%)
  marketplaceFeeAmount: number;
  factoryPayoutAmount: number;
  status: EscrowStatus;
  milestoneReleases: Array<{
    stageName: string;
    amount: number;
    releasedAt?: string;
    isReleased: boolean;
  }>;
  createdAt: string;
  disbursedAt?: string;
}

export interface MarketplaceReview {
  id: string;
  rfqId: string;
  factoryId: string;
  buyerOrgId: string;
  qualityRating: number; // 1-5
  deliveryRating: number; // 1-5
  comments: string;
  createdAt: string;
}

export interface DisputeRecord {
  id: string;
  escrowId: string;
  raisedBy: 'buyer' | 'factory';
  reason: string;
  status: 'Open' | 'Under_Review' | 'Resolved';
  resolutionSummary?: string;
  createdAt: string;
}
