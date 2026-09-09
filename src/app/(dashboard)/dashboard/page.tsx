'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AiCommandHero } from '@/components/dashboard/ai-command-hero';
import { OnboardingWizard } from '@/components/dashboard/onboarding-wizard';
import { MetricCard } from '@/components/shared/metric-card';
import { RevenueChart } from '@/components/charts/revenue-chart';
import { ProductionChart } from '@/components/charts/production-chart';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MOCK_ACTIVITIES } from '@/lib/mock-data/manufacturing';
import { formatCurrency, formatTimeAgo } from '@/lib/utils';
import { CreateOrderModal } from '@/components/modals/create-order-modal';
import { CreateCustomerModal } from '@/components/modals/create-customer-modal';
import { Order, Machine, InventoryItem } from '@/types';
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
  RefreshCw,
} from 'lucide-react';

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const fetchDashboardData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/orders').then((r) => r.json()).catch(() => ({ orders: [] })),
      fetch('/api/machines').then((r) => r.json()).catch(() => ({ machines: [] })),
      fetch('/api/inventory').then((r) => r.json()).catch(() => ({ inventory: [] })),
    ]).then(([orderData, machineData, invData]) => {
      if (orderData.orders) setOrders(orderData.orders);
      if (machineData.machines) setMachines(machineData.machines);
      if (invData.inventory) setInventory(invData.inventory);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Real-world metrics calculated from live database
  const totalOrderCount = orders.length;
  const activeOrdersCount = orders.filter((o) => o.status === 'In Production' || o.status === 'Pending').length;
  const activeMachinesCount = machines.filter((m) => m.status === 'Operational' || m.status === 'In Use').length;
  const lowStockCount = inventory.filter((i) => i.quantity <= i.reorderPoint).length;
  const totalRevenue = orders.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);

  // 7-Stage Factory Operating Lifecycle
  const factoryLifecycle = [
    { step: '1.RFQ', label: 'Inbound RFQ', status: 'done', count: '3 New' },
    { step: '2.QUOTE', label: 'AI Cost Estimator', status: 'current', count: '1 Pending' },
    { step: '3.PLAN', label: 'Shop Scheduling', status: 'upcoming', count: `${activeOrdersCount} Sched.` },
    { step: '4.PRODUCE', label: 'Laser, Bend, Weld', status: 'active', count: `${activeMachinesCount} In-Cut` },
    { step: '5.QC', label: 'CMM Inspection', status: 'upcoming', count: '2 Ready' },
    { step: '6.DISPATCH', label: 'Courier & Freight', status: 'upcoming', count: '1 Loaded' },
    { step: '7.PAYOUT', label: 'Escrow Settlement', status: 'upcoming', count: '₹48k Due' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12 font-sans">
      {/* Enterprise AI Command Hero Header */}
      <AiCommandHero />

      {/* FACTORY LIFECYCLE STRIP */}
      <div className="p-5 rounded-xl border border-[#E4E7EC] dark:border-[#252B33] bg-white dark:bg-[#11161D] shadow-[0_1px_2px_rgba(16,24,40,0.04)] space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085] dark:text-[#98A2B3]">
              OPERATIONAL WORKFLOW
            </span>
            <span className="text-[#D0D5DD] dark:text-[#344054] text-xs">•</span>
            <span className="text-xs font-semibold text-[#111827] dark:text-[#F2F4F7]">
              RFQ ➔ Quote ➔ Plan ➔ Manufacture ➔ QC ➔ Dispatch ➔ Payout
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              className="text-xs text-[#667085] hover:text-[#111827] dark:hover:text-[#F2F4F7] flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Sync DB
            </button>
            <Link href="/production/planner" className="text-xs text-[#155EEF] font-semibold hover:underline flex items-center gap-1">
              Shop Floor Board <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {factoryLifecycle.map((item) => (
            <div
              key={item.step}
              className={`p-3 rounded-lg border text-xs min-h-[72px] flex flex-col justify-between transition-colors ${
                item.status === 'current'
                  ? 'border-[#155EEF]/60 bg-[#EFF4FF] dark:bg-[#155EEF]/15 ring-1 ring-[#155EEF]/20'
                  : item.status === 'active'
                  ? 'border-[#D0D5DD] dark:border-[#344054] bg-[#F9FAFB] dark:bg-[#18202A]'
                  : item.status === 'done'
                  ? 'border-[#ABEFC6] dark:border-[#067647]/40 bg-[#ECFDF3]/60 dark:bg-[#067647]/15'
                  : 'border-[#E4E7EC] dark:border-[#252B33] bg-white dark:bg-[#11161D]'
              }`}
            >
              <div className="flex items-center justify-between gap-1.5 text-[11px] font-mono leading-none">
                <span className="font-semibold text-[#475467] dark:text-[#98A2B3] whitespace-nowrap">
                  {item.step}
                </span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap shrink-0 ${
                    item.status === 'current'
                      ? 'bg-[#155EEF]/10 text-[#175CD3] dark:bg-[#155EEF]/25 dark:text-[#528BFF]'
                      : item.status === 'done'
                      ? 'bg-[#ECFDF3] text-[#027A48] dark:bg-[#067647]/20 dark:text-[#6CE9A6]'
                      : item.status === 'active'
                      ? 'bg-[#F2F4F7] text-[#344054] dark:bg-[#1D2939] dark:text-[#D0D5DD]'
                      : 'bg-[#F9FAFB] text-[#667085] dark:bg-[#161B22] dark:text-[#8C95A0]'
                  }`}
                >
                  {item.count}
                </span>
              </div>
              <div className="font-semibold text-[#111827] dark:text-[#F2F4F7] text-xs mt-2 whitespace-nowrap overflow-hidden text-ellipsis leading-tight">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WHAT NEEDS MY ATTENTION & WHAT SHOULD I DO NEXT CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* WHAT NEEDS MY ATTENTION? */}
        <Card className="border border-[#E4E7EC] dark:border-[#252B33] bg-white dark:bg-[#11161D] p-5 space-y-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-[#FFFAEB] dark:bg-[#B54708]/20 text-[#B54708] dark:text-[#FDB022] border border-[#FEDF89] dark:border-[#B54708]/40">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-[#111827] dark:text-[#F2F4F7] tracking-tight">
                OPERATIONAL ATTENTION REQUIRED
              </h3>
            </div>
            <Badge variant="warning">
              Triage
            </Badge>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3.5 rounded-lg bg-[#F9FAFB] dark:bg-[#18202A] border border-[#E4E7EC] dark:border-[#252B33] shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:border-[#D0D5DD] dark:hover:border-[#344054] transition-colors flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <span className="font-semibold text-[#111827] dark:text-[#F2F4F7] flex items-center gap-1.5 truncate text-xs">
                  <FileText className="h-3.5 w-3.5 text-[#155EEF] shrink-0" />
                  Inbound RFQ #RFQ-2026-0891 from Apex Aerospace
                </span>
                <p className="text-[12px] text-[#667085] dark:text-[#98A2B3]">
                  500 SS304 Brackets (3mm) requires pricing estimate turnaround within 4 hours.
                </p>
              </div>
              <Link href="/quotations/builder" className="shrink-0">
                <Button size="sm" variant="primary" className="text-xs h-8 px-3">
                  Quote →
                </Button>
              </Link>
            </div>

            <div className="p-3.5 rounded-lg bg-[#F9FAFB] dark:bg-[#18202A] border border-[#E4E7EC] dark:border-[#252B33] shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:border-[#D0D5DD] dark:hover:border-[#344054] transition-colors flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <span className="font-semibold text-[#111827] dark:text-[#F2F4F7] flex items-center gap-1.5 truncate text-xs">
                  <Wrench className="h-3.5 w-3.5 text-[#667085] dark:text-[#98A2B3] shrink-0" />
                  Press Brake 01 Tooling Changeover
                </span>
                <p className="text-[12px] text-[#667085] dark:text-[#98A2B3]">
                  Tooling setup required for Batch 150 titanium flanges before 02:00 PM shift.
                </p>
              </div>
              <Link href="/machines" className="shrink-0">
                <Button size="sm" variant="outline" className="text-xs h-8 px-3">
                  Telemetry
                </Button>
              </Link>
            </div>

            <div className="p-3.5 rounded-lg bg-[#F9FAFB] dark:bg-[#18202A] border border-[#E4E7EC] dark:border-[#252B33] shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:border-[#D0D5DD] dark:hover:border-[#344054] transition-colors flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <span className="font-semibold text-[#111827] dark:text-[#F2F4F7] flex items-center gap-1.5 truncate text-xs">
                  <Layers className="h-3.5 w-3.5 text-[#B54708] shrink-0" />
                  {lowStockCount > 0 ? `Low Stock: ${lowStockCount} items below threshold` : 'Inventory Stock In-Spec'}
                </span>
                <p className="text-[12px] text-[#667085] dark:text-[#98A2B3]">
                  {lowStockCount > 0
                    ? 'Automated purchase orders recommended to prevent manufacturing delays.'
                    : 'All critical raw sheet materials and fasteners within target safety margins.'}
                </p>
              </div>
              <Link href="/inventory" className="shrink-0">
                <Button size="sm" variant="outline" className="text-xs h-8 px-3">
                  Stock
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* WHAT SHOULD I DO NEXT? */}
        <Card className="border border-[#E4E7EC] dark:border-[#252B33] bg-white dark:bg-[#11161D] p-5 space-y-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-[#EFF8FF] dark:bg-[#175CD3]/20 text-[#175CD3] dark:text-[#84ADFF] border border-[#B2DDFF] dark:border-[#175CD3]/40">
                <Cpu className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-[#111827] dark:text-[#F2F4F7] tracking-tight">
                PROPOSED OPERATIONAL ACTIONS
              </h3>
            </div>
            <Badge variant="info">
              AI Recommended
            </Badge>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3.5 rounded-lg bg-[#F9FAFB] dark:bg-[#18202A] border border-[#E4E7EC] dark:border-[#252B33] shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:border-[#D0D5DD] dark:hover:border-[#344054] transition-colors flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <span className="font-semibold text-[#111827] dark:text-[#F2F4F7] flex items-center gap-1.5 truncate text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#067647] dark:text-[#32D583] shrink-0" />
                  Approve CMM Quality Pass on Job #FG-2042
                </span>
                <p className="text-[12px] text-[#667085] dark:text-[#98A2B3]">
                  Welding verified by Priya Sharma. Move to final Finishing & Dispatch stage.
                </p>
              </div>
              <Link href="/production/planner" className="shrink-0">
                <Button size="sm" variant="primary" className="text-xs h-8 px-3">
                  Pass QC
                </Button>
              </Link>
            </div>

            <div className="p-3.5 rounded-lg bg-[#F9FAFB] dark:bg-[#18202A] border border-[#E4E7EC] dark:border-[#252B33] shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:border-[#D0D5DD] dark:hover:border-[#344054] transition-colors flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <span className="font-semibold text-[#111827] dark:text-[#F2F4F7] flex items-center gap-1.5 truncate text-xs">
                  <Truck className="h-3.5 w-3.5 text-[#155EEF] shrink-0" />
                  Dispatch Pallet #PLT-098 to Freight
                </span>
                <p className="text-[12px] text-[#667085] dark:text-[#98A2B3]">
                  Print shipping bill of lading & notify buyer with tracking telemetry.
                </p>
              </div>
              <Link href="/orders" className="shrink-0">
                <Button size="sm" variant="outline" className="text-xs h-8 px-3">
                  Label
                </Button>
              </Link>
            </div>

            <div className="p-3.5 rounded-lg bg-[#F9FAFB] dark:bg-[#18202A] border border-[#E4E7EC] dark:border-[#252B33] shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:border-[#D0D5DD] dark:hover:border-[#344054] transition-colors flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <span className="font-semibold text-[#111827] dark:text-[#F2F4F7] flex items-center gap-1.5 truncate text-xs">
                  <DollarSign className="h-3.5 w-3.5 text-[#067647] dark:text-[#32D583] shrink-0" />
                  Claim Escrow Milestone Payout (₹48,000)
                </span>
                <p className="text-[12px] text-[#667085] dark:text-[#98A2B3]">
                  Buyer confirmed dock delivery. Funds ready for automated bank disbursement.
                </p>
              </div>
              <Link href="/invoices" className="shrink-0">
                <Button size="sm" variant="primary" className="text-xs h-8 px-3">
                  Payout
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Workspace Onboarding Guide */}
      <OnboardingWizard />

      {/* 6 Key Metric Cards connected directly to Neon DB */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Orders"
          value={totalOrderCount}
          trendPercent={12.5}
          icon={<ShoppingBag className="h-4 w-4 text-[#155EEF]" />}
          subtitle={`${activeOrdersCount} currently active`}
        />
        <MetricCard
          title="Pending Quotes"
          value={3}
          trendPercent={8.4}
          icon={<FileText className="h-4 w-4 text-[#6941C6]" />}
          subtitle={`${formatCurrency(1146000)} pipeline`}
        />
        <MetricCard
          title="Active Production"
          value={activeOrdersCount}
          trendPercent={15.0}
          icon={<Factory className="h-4 w-4 text-[#155EEF]" />}
          subtitle={`${activeMachinesCount} machines operating`}
        />
        <MetricCard
          title="Low Stock Alerts"
          value={lowStockCount}
          trendPercent={-12.0}
          icon={<AlertTriangle className="h-4 w-4 text-[#B54708]" />}
          subtitle="Real-time stock threshold"
        />
        <MetricCard
          title="Gross Revenue"
          value={formatCurrency(totalRevenue)}
          trendPercent={18.2}
          icon={<DollarSign className="h-4 w-4 text-[#067647]" />}
          subtitle="Neon DB contract total"
        />
        <MetricCard
          title="Active Machines"
          value={activeMachinesCount}
          trendPercent={100}
          icon={<Cpu className="h-4 w-4 text-[#175CD3]" />}
          subtitle={`${machines.length} units in fleet`}
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
                <ShoppingBag className="h-4 w-4 text-brand-500" /> Priority Work Orders (Neon PostgreSQL)
              </CardTitle>
              <CardDescription>Live fabrication orders from database</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={() => setIsOrderModalOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Create Work Order
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-slate-500">
                <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-brand-500" />
                <p className="text-xs">Loading live work orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No orders found. Click "Create Work Order" to create one in Neon DB.
              </div>
            ) : (
              <div className="divide-y divide-[#E4E7EC] dark:divide-[#252B33]">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-3 hover:bg-[#F9FAFB] dark:hover:bg-[#18202A]/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#111827] dark:text-[#F2F4F7] text-sm tracking-tight">
                          {order.orderNumber}
                        </span>
                        <Badge status={order.status} />
                        <Badge variant="outline" className="text-xs">
                          {order.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#344054] dark:text-[#D0D5DD] font-medium">
                        {order.title}
                      </p>
                      <p className="text-xs text-[#667085] dark:text-[#98A2B3]">
                        Customer: {order.customerName} • Due: {order.dueDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-32 space-y-1">
                        <div className="flex justify-between text-xs font-medium text-[#667085] dark:text-[#98A2B3]">
                          <span>Progress</span>
                          <span>{order.progressPercent}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[#E4E7EC] dark:bg-[#252B33] overflow-hidden">
                          <div
                            className="h-full bg-[#155EEF] rounded-full transition-all duration-300"
                            style={{ width: `${order.progressPercent}%` }}
                          />
                        </div>
                      </div>
                      <span className="font-bold text-[#111827] dark:text-[#F2F4F7] text-sm tabular-nums min-w-[80px] text-right">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#155EEF]" /> Activity Timeline
            </CardTitle>
            <CardDescription>System events & telemetry</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {MOCK_ACTIVITIES.map((act) => (
              <div key={act.id} className="flex gap-3 items-start text-xs">
                <div className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-[#155EEF]" />
                <div className="flex-1 space-y-0.5">
                  <p className="text-[#111827] dark:text-[#F2F4F7] font-medium leading-tight">
                    {act.action}
                  </p>
                  <div className="flex items-center justify-between text-xs text-[#667085] dark:text-[#98A2B3]">
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
        onAddOrder={(newOrder) => {
          setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id && o.orderNumber !== newOrder.orderNumber)]);
        }}
      />
      <CreateCustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onAddCustomer={() => {
          fetchDashboardData();
        }}
      />
    </div>
  );
}
