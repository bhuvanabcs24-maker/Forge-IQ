import { UserRole } from './index';

export type SubscriptionTier = 'Starter' | 'Professional' | 'Enterprise';

export type BillingCycle = 'monthly' | 'yearly';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  maxSeats: number;
  maxAiRequestsPerMonth: number;
  maxWhatsAppMessagesPerMonth: number;
  maxStorageGb: number;
  features: string[];
  isPopular?: boolean;
}

export interface UsageMetrics {
  aiRequestsUsed: number;
  aiRequestsLimit: number;
  whatsappMessagesUsed: number;
  whatsappMessagesLimit: number;
  activeSeatsUsed: number;
  activeSeatsLimit: number;
  storageGbUsed: number;
  storageGbLimit: number;
}

export interface BillingInvoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Failed';
  billingDate: string;
  periodStart: string;
  periodEnd: string;
  pdfUrl: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  description: string;
  isValid: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Invited';
  joinedAt: string;
}
