'use client';

import React, { useState } from 'react';
import { SubscriptionTier, BillingCycle } from '@/types/billing';
import { SUBSCRIPTION_PLANS } from '@/lib/billing/plans';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Check, Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface PlanComparisonGridProps {
  currentTier: SubscriptionTier;
  onUpgradePlan: (planId: SubscriptionTier, cycle: BillingCycle) => void;
}

export function PlanComparisonGrid({
  currentTier,
  onUpgradePlan,
}: PlanComparisonGridProps) {
  const [cycle, setCycle] = useState<BillingCycle>('yearly');

  return (
    <div className="space-y-6">
      {/* Monthly vs Yearly Billing Toggle */}
      <div className="flex justify-center items-center gap-3">
        <span className={`text-xs font-bold ${cycle === 'monthly' ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>
          Monthly Billing
        </span>

        <button
          onClick={() => setCycle(cycle === 'monthly' ? 'yearly' : 'monthly')}
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-300 dark:bg-steel-700 transition-colors"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              cycle === 'yearly' ? 'translate-x-6 bg-brand-500' : 'translate-x-1'
            }`}
          />
        </button>

        <span className={`text-xs font-bold flex items-center gap-1.5 ${cycle === 'yearly' ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>
          Yearly Billing
          <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px]">
            Save 20%
          </Badge>
        </span>
      </div>

      {/* 3 Tier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrent = plan.id === currentTier;
          const price = cycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;

          return (
            <Card
              key={plan.id}
              className={`flex flex-col justify-between transition-all relative ${
                plan.isPopular
                  ? 'border-brand-500 shadow-lg ring-2 ring-brand-500/30 dark:bg-steel-900'
                  : 'border-slate-200 dark:border-steel-800'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand-600 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-sm">
                  Most Popular
                </div>
              )}

              <CardHeader className="pt-6">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{plan.name}</span>
                  {isCurrent && (
                    <Badge variant="success" className="text-[10px]">
                      Active Plan
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-xs mt-1">{plan.description}</CardDescription>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-steel-800">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                    {formatCurrency(price)}
                  </span>
                  <span className="text-xs text-slate-500"> / month</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 text-xs flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-xs mb-2">
                    Included Features:
                  </div>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-700 dark:text-steel-200">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full mt-6"
                  variant={isCurrent ? 'outline' : plan.isPopular ? 'primary' : 'outline'}
                  disabled={isCurrent}
                  onClick={() => onUpgradePlan(plan.id, cycle)}
                >
                  {isCurrent ? 'Current Active Tier' : `Upgrade to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
