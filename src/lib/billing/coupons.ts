import { Coupon } from '@/types/billing';

export const PROMOTIONAL_COUPONS: Coupon[] = [
  {
    code: 'FORGE20',
    discountPercent: 20,
    description: '20% off monthly & annual subscriptions for early adopters',
    isValid: true,
  },
  {
    code: 'LAUNCH50',
    discountPercent: 50,
    description: '50% off first month subscription',
    isValid: true,
  },
];

export function validateCouponCode(inputCode: string): Coupon | null {
  const clean = inputCode.trim().toUpperCase();
  const found = PROMOTIONAL_COUPONS.find((c) => c.code === clean && c.isValid);
  return found || null;
}
