'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PlanComparisonGrid } from '@/components/billing/plan-comparison-grid';
import { UsageMeterCard } from '@/components/billing/usage-meter-card';
import { SubscriptionTier, BillingCycle, BillingInvoice } from '@/types/billing';
import { getLiveUsageMetrics } from '@/lib/billing/usage-metering';
import { validateCouponCode } from '@/lib/billing/coupons';
import { getPaymentGateway } from '@/lib/billing/gateways/base-gateway';
import { formatCurrency } from '@/lib/utils';
import { CreditCard, Check, Download, Tag, Zap, ShieldCheck } from 'lucide-react';

export default function AdminBillingConsolePage() {
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>('Professional');
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number | null>(null);
  const [couponMsg, setCouponMsg] = useState('');

  const metrics = getLiveUsageMetrics(currentTier);

  const invoices: BillingInvoice[] = [
    {
      id: 'sub-inv-1',
      invoiceNumber: 'INV-FORGE-2026-07',
      amount: 499,
      status: 'Paid',
      billingDate: '2026-07-01',
      periodStart: '2026-07-01',
      periodEnd: '2026-07-31',
      pdfUrl: '/api/quotations/INV-FORGE-2026-07/pdf?action=download',
    },
    {
      id: 'sub-inv-2',
      invoiceNumber: 'INV-FORGE-2026-06',
      amount: 499,
      status: 'Paid',
      billingDate: '2026-06-01',
      periodStart: '2026-06-01',
      periodEnd: '2026-06-30',
      pdfUrl: '/api/quotations/INV-FORGE-2026-06/pdf?action=download',
    },
  ];

  const handleApplyCoupon = () => {
    const res = validateCouponCode(couponCode);
    if (res) {
      setDiscountPercent(res.discountPercent);
      setCouponMsg(`Coupon ${res.code} Applied! (${res.discountPercent}% discount)`);
    } else {
      setDiscountPercent(null);
      setCouponMsg('Invalid coupon code.');
    }
  };

  const handleUpgradePlan = async (tier: SubscriptionTier, cycle: BillingCycle) => {
    const gateway = getPaymentGateway();
    const session = await gateway.createCheckoutSession({
      planId: tier,
      cycle,
      successUrl: window.location.href,
      cancelUrl: window.location.href,
    });
    setCurrentTier(tier);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Billing Console & Subscriptions"
        description="Manage multi-tenant SaaS plan tiers, billing cycles, coupon redemptions, payment methods, and invoice downloads."
        breadcrumbs={[
          { label: 'Settings', href: '/settings' },
          { label: 'Billing Console' },
        ]}
      />

      {/* Active Subscription Summary Bar */}
      <Card className="border-brand-500/30 bg-gradient-to-r from-brand-900/20 via-steel-900/90 to-purple-900/20">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400 font-bold shrink-0">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-100">
                  {currentTier} Fab Plan
                </h3>
                <Badge variant="success" className="font-bold">
                  Active Subscription
                </Badge>
              </div>
              <p className="text-steel-300 mt-0.5">
                Next Renewal: <strong>August 30, 2026</strong> • Payment Method: <strong>Visa ending in 4242</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-steel-400 block">Monthly Charge</span>
              <span className="font-extrabold text-slate-100 text-base">
                {formatCurrency(discountPercent ? 499 * (1 - discountPercent / 100) : 499)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-Time Usage Meters */}
      <UsageMeterCard metrics={metrics} />

      {/* Coupon Redemption Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-brand-500" />
            <span className="font-bold text-slate-900 dark:text-slate-100">
              Promotional Code & Coupon Redemption
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Input
              placeholder="e.g. FORGE20"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="w-40 text-xs"
            />
            <Button size="sm" onClick={handleApplyCoupon}>
              Apply Coupon
            </Button>
          </div>
        </CardContent>
        {couponMsg && (
          <div className={`px-4 pb-3 text-xs font-bold ${discountPercent ? 'text-emerald-500' : 'text-rose-500'}`}>
            {couponMsg}
          </div>
        )}
      </Card>

      {/* Subscription Plan Tier Comparison Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Subscription Plan Tiers & Upgrades</CardTitle>
          <CardDescription>Select the optimal tier for your manufacturing scale</CardDescription>
        </CardHeader>
        <CardContent>
          <PlanComparisonGrid currentTier={currentTier} onUpgradePlan={handleUpgradePlan} />
        </CardContent>
      </Card>

      {/* Invoices History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Billing History & Invoices</CardTitle>
          <CardDescription>Download tax invoices for corporate accounting</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-steel-800/60 border-y border-slate-200 dark:border-steel-800 font-semibold">
                <tr>
                  <th className="p-3">Invoice Number</th>
                  <th className="p-3">Billing Period</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-steel-800/60">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-steel-800/40">
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{inv.invoiceNumber}</td>
                    <td className="p-3 text-slate-500">{inv.periodStart} to {inv.periodEnd}</td>
                    <td className="p-3"><Badge variant="success">{inv.status}</Badge></td>
                    <td className="p-3 text-right font-extrabold text-slate-900 dark:text-slate-100">{formatCurrency(inv.amount)}</td>
                    <td className="p-3 text-center">
                      <a href={`/api/quotations/${inv.invoiceNumber}/pdf?action=download`} download={`${inv.invoiceNumber}.html`}>
                        <Button variant="outline" size="sm">
                          <Download className="h-3.5 w-3.5 mr-1" /> PDF Invoice
                        </Button>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
