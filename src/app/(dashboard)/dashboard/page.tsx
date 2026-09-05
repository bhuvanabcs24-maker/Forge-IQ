'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AiCommandHero } from '@/components/dashboard/ai-command-hero';
import { OnboardingWizard } from '@/components/dashboard/onboarding-wizard';
import { MetricCard } from '@/components/shared/metric-card';
import { RevenueChart } from '@/components/charts/revenue-chart';
import { ProductionChart } from '@/components/charts/production-chart';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  INITIAL_METRICS,
  MOCK_ACTIVITIES,
  MOCK_ORDERS,
} from '@/lib/mock-data/manufacturing';
import { formatCurrency, formatTimeAgo } from '@/lib/utils';
import { CreateOrderModal } from '@/components/modals/create-order-modal';
import { CreateCustomerModal } from '@/components/modals/create-customer-modal';
import {
  ShoppingBag,
  FileText,
  Factory,
  AlertTriangle,
  DollarSign,
  CreditCard,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
  Cpu,
  Truck,
  Layers,
  Wrench,
  Flame,
  ArrowUpRight,
} from 'lucide-react';

export default function DashboardPage() {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  // 7-Stage Factory Operating Lifecycle
  const factoryLifecycle = [
    { step: '1. RECEIVE', label: 'Inbound RFQ', status: 'done', count: '3 New' },
    { step: '2. QUOTE', label: 'AI Cost Estimator', status: 'current', count: '1 Pending' },
    { step: '3. PLAN', label: 'Shop Floor Scheduling', status: 'upcoming', count: '4 Scheduled' },
    { step: '4. MANUFACTURE', label: 'Laser, Bend, Weld', status: 'active', count: '6 In-Cut' },
    { step: '5. QC', label: 'CMM Inspection', status: 'upcoming', count: '2 Ready' },
    { step: '6. DISPATCH', label: 'Courier & Freight', status: 'upcoming', count: '1 Loaded' },
    { step: '7. GET PAID', label: 'Escrow Payout', status: 'upcoming', count: '₹48k Due' },
  ];

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Apple & Vercel Style AI Command Hero Header */}
      <AiCommandHero />

      {/* FACTORY LIFECYCLE STRIP: RECEIVE ➔ QUOTE ➔ PLAN ➔ MANUFACTURE ➔ QC ➔ DISPATCH ➔ GET PAID */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-steel-800 bg-white/70 dark:bg-steel-950/80 backdrop-blur-md shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-500">
              OPERATIONAL LIFECYCLE
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Receive ➔ Quote ➔ Plan ➔ Manufacture ➔ QC ➔ Dispatch ➔ Get Paid
            </span>
          </div>

          <Link href="/production/planner" className="text-[11px] text-brand-500 font-bold hover:underline flex items-center gap-1">
            Open Shop Floor Board <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {factoryLifecycle.map((item, idx) => (
            <div
              key={item.step}
              className={`p-2.5 rounded-xl border text-xs transition-all ${
                item.status === 'current'
                  ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/15 ring-1 ring-brand-500/30'
                  : item.status === 'active'
                  ? 'border-purple-500/40 bg-purple-500/10 text-purple-300'
                  : item.status === 'done'
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-slate-200 dark:border-steel-800/80 bg-slate-50/50 dark:bg-steel-900/40'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400">
                <span>{item.step}</span>
                <span className={item.status === 'current' ? 'text-brand-500' : 'text-slate-500'}>
                  {item.count}
                </span>
              </div>
              <div className="font-bold text-slate-900 dark:text-slate-100 text-[11px] mt-1 truncate">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WHAT NEEDS MY ATTENTION & WHAT SHOULD I DO NEXT CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WHAT NEEDS MY ATTENTION? */}
        <Card className="border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-steel-900/90 to-slate-950 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <h3 className="font-black text-sm text-slate-100 tracking-tight">
                WHAT NEEDS MY ATTENTION? (3 Alerts)
              </h3>
            </div>
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
              Priority Action Required
            </Badge>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-steel-950/80 border border-steel-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-purple-400" />
                  Inbound RFQ #RFQ-2026-0891 from Apex Aerospace
                </span>
                <p className="text-[11px] text-slate-400">
                  500 SS304 Brackets (3mm) requires pricing estimate turnaround within 4 hours.
                </p>
              </div>
              <Link href="/quotations/builder">
                <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px]">
                  Quote with AI →
                </Button>
              </Link>
            </div>

            <div className="p-3 rounded-xl bg-steel-950/80 border border-steel-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Wrench className="h-3.5 w-3.5 text-brand-400" />
                  Press Brake 01 Tooling Changeover
                </span>
                <p className="text-[11px] text-slate-400">
                  Tooling setup required for Batch 150 titanium flanges before 02:00 PM shift.
                </p>
              </div>
              <Link href="/machines">
                <Button size="sm" variant="outline" className="border-steel-700 text-slate-300 text-[11px]">
                  View Telemetry
                </Button>
              </Link>
            </div>

            <div className="p-3 rounded-xl bg-steel-950/80 border border-steel-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-amber-400" />
                  Low Stock Warning: 304 SS Sheet (3mm)
                </span>
                <p className="text-[11px] text-slate-400">
                  Remaining inventory: 8 sheets (Below reorder threshold of 15 sheets).
                </p>
              </div>
              <Link href="/inventory">
                <Button size="sm" variant="outline" className="border-steel-700 text-slate-300 text-[11px]">
                  Reorder PO
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* WHAT SHOULD I DO NEXT? */}
        <Card className="border-brand-500/30 bg-gradient-to-br from-brand-950/20 via-steel-900/90 to-slate-950 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-brand-500/20 text-brand-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="font-black text-sm text-slate-100 tracking-tight">
                WHAT SHOULD I DO NEXT? (Agentic Dispatch)
              </h3>
            </div>
            <Badge className="bg-brand-500/20 text-brand-400 border-brand-500/30 text-[10px]">
              AI Recommended
            </Badge>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-steel-950/80 border border-steel-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Approve CMM Quality Pass on Job #FG-2042
                </span>
                <p className="text-[11px] text-slate-400">
                  Welding verified by Priya Sharma. Move to final Finishing & Dispatch stage.
                </p>
              </div>
              <Link href="/production/planner">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]">
                  Pass QC Check
                </Button>
              </Link>
            </div>

            <div className="p-3 rounded-xl bg-steel-950/80 border border-steel-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-blue-400" />
                  Dispatch Pallet #PLT-098 to FedEx Freight
                </span>
                <p className="text-[11px] text-slate-400">
                  Print shipping bill of lading & notify buyer with live tracking link.
                </p>
              </div>
              <Link href="/orders">
                <Button size="sm" variant="outline" className="border-steel-700 text-slate-300 text-[11px]">
                  Generate Label
                </Button>
              </Link>
            </div>

            <div className="p-3 rounded-xl bg-steel-950/80 border border-steel-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                  Claim Escrow Milestone Payout (₹48,000)
                </span>
                <p className="text-[11px] text-slate-400">
                  Buyer confirmed dock delivery. Funds ready for automated bank disbursement.
                </p>
              </div>
              <Link href="/invoices">
                <Button size="sm" className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-[11px]">
                  Claim Payout
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Workspace Onboarding Guide */}
      <OnboardingWizard />

      {/* 6 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Orders"
          value={INITIAL_METRICS.totalOrders}
          trendPercent={INITIAL_METRICS.ordersTrendPercent}
          icon={<ShoppingBag className="h-4 w-4 text-brand-500" />}
          subtitle="18 currently in production"
        />
        <MetricCard
          title="Pending Quotations"
          value={INITIAL_METRICS.pendingQuotations}
          trendPercent={INITIAL_METRICS.quotationsTrendPercent}
          icon={<FileText className="h-4 w-4 text-purple-500" />}
          subtitle={`${formatCurrency(1146000)} pipeline value`}
        />
        <MetricCard
          title="Active Production Jobs"
          value={INITIAL_METRICS.activeProductionJobs}
          trendPercent={INITIAL_METRICS.jobsTrendPercent}
          icon={<Factory className="h-4 w-4 text-brand-500" />}
          subtitle="4 machines operational"
          highlight
        />
        <MetricCard
          title="Low Inventory Alerts"
          value={INITIAL_METRICS.lowInventoryAlerts}
          trendPercent={-12.0}
          icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
          subtitle="Requires reorder issue"
        />
        <MetricCard
          title="Gross Revenue"
          value={formatCurrency(INITIAL_METRICS.revenue)}
          trendPercent={INITIAL_METRICS.revenueTrendPercent}
          icon={<DollarSign className="h-4 w-4 text-emerald-500" />}
          subtitle="Month to date total"
        />
        <MetricCard
          title="Pending Payments"
          value={formatCurrency(INITIAL_METRICS.pendingPayments)}
          trendPercent={-4.5}
          icon={<CreditCard className="h-4 w-4 text-brand-500" />}
          subtitle="3 invoices overdue"
        />
      </div>

      {/* Financial & Shop Floor Telemetry Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-500" /> Financial Telemetry & Revenue Performance
              </CardTitle>
              <CardDescription>Monthly revenue vs COGS material costs</CardDescription>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-brand-500 font-bold">
                <span className="h-2 w-2 rounded-full bg-brand-500" /> Revenue
              </span>
              <span className="flex items-center gap-1 text-slate-400 font-bold">
                <span className="h-2 w-2 rounded-full bg-slate-500" /> COGS
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Factory className="h-4 w-4 text-brand-500" /> Shop Floor Job Status
            </CardTitle>
            <CardDescription>Active work order stage breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ProductionChart />
          </CardContent>
        </Card>
      </div>

      {/* Priority Work Orders & Real-time Operations Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-brand-500" /> Priority Work Orders
              </CardTitle>
              <CardDescription>Active shop floor jobs in production</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={() => setIsOrderModalOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Create Work Order
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-steel-800">
              {MOCK_ORDERS.slice(0, 4).map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-slate-50/50 dark:hover:bg-steel-800/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {order.orderNumber}
                      </span>
                      <Badge status={order.status} />
                      <Badge variant="outline" className="text-[10px]">
                        {order.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-steel-300 font-semibold">
                      {order.title}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Customer: {order.customerName} • Due: {order.dueDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-28 space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500">
                        <span>Progress</span>
                        <span>{order.progressPercent}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-steel-800 overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full transition-all duration-300"
                          style={{ width: `${order.progressPercent}%` }}
                        />
                      </div>
                    </div>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand-500" /> Activity Timeline
            </CardTitle>
            <CardDescription>System events & machine updates</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {MOCK_ACTIVITIES.map((act) => (
              <div key={act.id} className="flex gap-3 items-start text-xs">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-500 font-bold">
                  •
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="text-slate-800 dark:text-steel-200 font-medium leading-tight">
                    {act.action}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>By {act.user}</span>
                    <span>{formatTimeAgo(act.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <CreateOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onAddOrder={() => {}}
      />
      <CreateCustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onAddCustomer={() => {}}
      />
    </div>
  );
}
