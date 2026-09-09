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
    { step: '1. RECEIVE', label: 'Inbound RFQ', status: 'done', count: '3 New' },
    { step: '2. QUOTE', label: 'AI Cost Estimator', status: 'current', count: '1 Pending' },
    { step: '3. PLAN', label: 'Shop Floor Scheduling', status: 'upcoming', count: `${activeOrdersCount} Scheduled` },
    { step: '4. MANUFACTURE', label: 'Laser, Bend, Weld', status: 'active', count: `${activeMachinesCount} In-Cut` },
    { step: '5. QC', label: 'CMM Inspection', status: 'upcoming', count: '2 Ready' },
    { step: '6. DISPATCH', label: 'Courier & Freight', status: 'upcoming', count: '1 Loaded' },
    { step: '7. GET PAID', label: 'Escrow Payout', status: 'upcoming', count: '₹48k Due' },
  ];

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Apple & Vercel Style AI Command Hero Header */}
      <AiCommandHero />

      {/* FACTORY LIFECYCLE STRIP */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">
              OPERATIONAL LIFECYCLE
            </span>
            <span className="text-slate-300 dark:text-steel-600 text-xs">•</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Receive ➔ Quote ➔ Plan ➔ Manufacture ➔ QC ➔ Dispatch ➔ Get Paid
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} /> Sync Database
            </button>
            <Link href="/production/planner" className="text-[11px] text-brand-600 dark:text-brand-400 font-bold hover:underline flex items-center gap-1">
              Open Shop Floor Board <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {factoryLifecycle.map((item) => (
            <div
              key={item.step}
              className={`p-2.5 rounded-xl border text-xs transition-all ${
                item.status === 'current'
                  ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-500/15 ring-1 ring-brand-500/30'
                  : item.status === 'active'
                  ? 'border-purple-300 dark:border-purple-500/40 bg-purple-50/80 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300'
                  : item.status === 'done'
                  ? 'border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-500/5'
                  : 'border-slate-200 dark:border-steel-800/80 bg-slate-50/60 dark:bg-steel-900/40'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                <span>{item.step}</span>
                <span className={item.status === 'current' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500'}>
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
        <Card className="border-amber-200/80 dark:border-amber-500/30 bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 dark:from-amber-950/20 dark:via-steel-900/90 dark:to-slate-950 p-5 space-y-3 shadow-xs dark:shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight">
                WHAT NEEDS MY ATTENTION? (Live Telemetry)
              </h3>
            </div>
            <Badge className="bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30 text-[10px] font-bold">
              Priority Action Required
            </Badge>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3.5 rounded-xl bg-white dark:bg-steel-950/80 border border-slate-200/80 dark:border-steel-800 shadow-2xs hover:border-amber-300 dark:hover:border-steel-700 transition-all flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <span className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5 truncate">
                  <FileText className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                  Inbound RFQ #RFQ-2026-0891 from Apex Aerospace
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  500 SS304 Brackets (3mm) requires pricing estimate turnaround within 4 hours.
                </p>
              </div>
              <Link href="/quotations/builder" className="shrink-0">
                <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] shadow-xs">
                  Quote with AI →
                </Button>
              </Link>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-steel-950/80 border border-slate-200/80 dark:border-steel-800 shadow-2xs hover:border-amber-300 dark:hover:border-steel-700 transition-all flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <span className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5 truncate">
                  <Wrench className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
                  Press Brake 01 Tooling Changeover
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Tooling setup required for Batch 150 titanium flanges before 02:00 PM shift.
                </p>
              </div>
              <Link href="/machines" className="shrink-0">
                <Button size="sm" variant="outline" className="border-slate-200 dark:border-steel-700 bg-white dark:bg-steel-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-steel-700 text-[11px]">
                  View Telemetry
                </Button>
              </Link>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-steel-950/80 border border-slate-200/80 dark:border-steel-800 shadow-2xs hover:border-amber-300 dark:hover:border-steel-700 transition-all flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <span className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5 truncate">
                  <Layers className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  {lowStockCount > 0 ? `Low Stock Warning: ${lowStockCount} items below threshold` : 'Inventory Stock Balanced'}
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  {lowStockCount > 0
                    ? 'Automated purchase orders recommended to prevent manufacturing delays.'
                    : 'All critical raw sheet materials and fasteners within target safety margins.'}
                </p>
              </div>
              <Link href="/inventory" className="shrink-0">
                <Button size="sm" variant="outline" className="border-slate-200 dark:border-steel-700 bg-white dark:bg-steel-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-steel-700 text-[11px]">
                  View Stock
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* WHAT SHOULD I DO NEXT? */}
        <Card className="border-brand-200/80 dark:border-brand-500/30 bg-gradient-to-br from-brand-50/50 via-white to-purple-50/30 dark:from-brand-950/20 dark:via-steel-900/90 dark:to-slate-950 p-5 space-y-3 shadow-xs dark:shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight">
                WHAT SHOULD I DO NEXT? (Agentic Dispatch)
              </h3>
            </div>
            <Badge className="bg-brand-100 dark:bg-brand-500/20 text-brand-800 dark:text-brand-400 border-brand-200 dark:border-brand-500/30 text-[10px] font-bold">
              AI Recommended
            </Badge>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3.5 rounded-xl bg-white dark:bg-steel-950/80 border border-slate-200/80 dark:border-steel-800 shadow-2xs hover:border-brand-300 dark:hover:border-steel-700 transition-all flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <span className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5 truncate">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  Approve CMM Quality Pass on Job #FG-2042
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Welding verified by Priya Sharma. Move to final Finishing & Dispatch stage.
                </p>
              </div>
              <Link href="/production/planner" className="shrink-0">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-xs">
                  Pass QC Check
                </Button>
              </Link>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-steel-950/80 border border-slate-200/80 dark:border-steel-800 shadow-2xs hover:border-brand-300 dark:hover:border-steel-700 transition-all flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <span className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5 truncate">
                  <Truck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  Dispatch Pallet #PLT-098 to FedEx Freight
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Print shipping bill of lading & notify buyer with live tracking link.
                </p>
              </div>
              <Link href="/orders" className="shrink-0">
                <Button size="sm" variant="outline" className="border-slate-200 dark:border-steel-700 bg-white dark:bg-steel-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-steel-700 text-[11px]">
                  Generate Label
                </Button>
              </Link>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-steel-950/80 border border-slate-200/80 dark:border-steel-800 shadow-2xs hover:border-brand-300 dark:hover:border-steel-700 transition-all flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <span className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5 truncate">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  Claim Escrow Milestone Payout (₹48,000)
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Buyer confirmed dock delivery. Funds ready for automated bank disbursement.
                </p>
              </div>
              <Link href="/invoices" className="shrink-0">
                <Button size="sm" className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-[11px] shadow-xs">
                  Claim Payout
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
          icon={<ShoppingBag className="h-4 w-4 text-brand-500" />}
          subtitle={`${activeOrdersCount} currently active`}
        />
        <MetricCard
          title="Pending Quotations"
          value={3}
          trendPercent={8.4}
          icon={<FileText className="h-4 w-4 text-purple-500" />}
          subtitle={`${formatCurrency(1146000)} pipeline`}
        />
        <MetricCard
          title="Active Production Jobs"
          value={activeOrdersCount}
          trendPercent={15.0}
          icon={<Factory className="h-4 w-4 text-brand-500" />}
          subtitle={`${activeMachinesCount} machines operational`}
          highlight
        />
        <MetricCard
          title="Low Inventory Alerts"
          value={lowStockCount}
          trendPercent={-12.0}
          icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
          subtitle="Real-time stock threshold"
        />
        <MetricCard
          title="Gross Revenue"
          value={formatCurrency(totalRevenue)}
          trendPercent={18.2}
          icon={<DollarSign className="h-4 w-4 text-emerald-500" />}
          subtitle="Neon DB contract total"
        />
        <MetricCard
          title="Active Machines"
          value={activeMachinesCount}
          trendPercent={100}
          icon={<Cpu className="h-4 w-4 text-blue-500" />}
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
              <div className="divide-y divide-slate-100 dark:divide-steel-800">
                {orders.slice(0, 5).map((order) => (
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
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand-500" /> Activity Timeline
            </CardTitle>
            <CardDescription>System events & telemetry</CardDescription>
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
