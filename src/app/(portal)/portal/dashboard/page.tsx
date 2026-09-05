'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCustomerPortal } from '@/context/customer-portal-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LiveOrderTracker } from '@/components/portal/live-order-tracker';
import { CustomerOrderView } from '@/types/customer-portal';
import { formatCurrency } from '@/lib/utils';
import { parseBuyerRequirement, ParsedManufacturingRequirement } from '@/lib/ai/buyer-requirement-parser';
import { globalFactoryMatchingEngine, MatchedFactoryCandidate } from '@/lib/marketplace/matching-engine';
import { BuyerPreference } from '@/types/marketplace';
import {
  Sparkles,
  Search,
  UploadCloud,
  ArrowRight,
  ShoppingBag,
  Clock,
  Truck,
  Receipt,
  CheckCircle2,
  Lock,
  Star,
  ShieldCheck,
  ChevronRight,
  Filter,
  FileText,
} from 'lucide-react';

export default function CustomerDashboardPage() {
  const { currentCustomer } = useCustomerPortal();

  // Natural language query input
  const [requirementText, setRequirementText] = useState('500 stainless steel brackets, 3 mm thickness, delivery within 7 days');
  const [isAiMatchingOpen, setIsAiMatchingOpen] = useState(false);
  const [parsedReq, setParsedReq] = useState<ParsedManufacturingRequirement | null>(null);
  const [preference, setPreference] = useState<BuyerPreference>('balanced');
  const [recommendations, setRecommendations] = useState<MatchedFactoryCandidate[]>([]);
  const [selectedFactoryId, setSelectedFactoryId] = useState<string | null>(null);
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<string | null>(null);

  // Active orders list
  const [showOrderTracker, setShowOrderTracker] = useState(true);

  const activeOrder: CustomerOrderView = {
    id: 'ord-fg2042',
    orderNumber: 'FG-2042',
    title: '500 Stainless Steel Brackets (3mm SS304)',
    status: 'In Production',
    currentStageId: 'welding',
    currentStageName: 'Welding',
    progressPercent: 78,
    dueDate: 'Tomorrow',
    estimatedDeliveryDate: 'Tomorrow · 3:00 PM',
    aiCompletionConfidence: 96,
    trackingNumber: 'TRK-2026-8919',
    milestones: [],
  };

  const handleStartAiDiscovery = () => {
    if (!requirementText.trim()) return;

    const parsed = parseBuyerRequirement(requirementText);
    setParsedReq(parsed);

    const matches = globalFactoryMatchingEngine.matchFactoriesForRfq(
      {
        id: `rfq-${Date.now()}`,
        buyerOrgId: currentCustomer.id,
        buyerOrgName: currentCustomer.companyName,
        title: parsed.partTitle,
        materialGrade: parsed.materialGrade,
        quantity: parsed.quantity,
        targetPrice: parsed.estimatedTargetPrice,
        deliveryDueDate: 'Within 7 Days',
        status: 'Open',
        createdAt: new Date().toISOString(),
      },
      preference
    );

    setRecommendations(matches);
    setIsAiMatchingOpen(true);
  };

  const handlePreferenceChange = (newPref: BuyerPreference) => {
    setPreference(newPref);
    if (!parsedReq) return;

    const matches = globalFactoryMatchingEngine.matchFactoriesForRfq(
      {
        id: `rfq-preview`,
        buyerOrgId: currentCustomer.id,
        buyerOrgName: currentCustomer.companyName,
        title: parsedReq.partTitle,
        materialGrade: parsedReq.materialGrade,
        quantity: parsedReq.quantity,
        targetPrice: parsedReq.estimatedTargetPrice,
        deliveryDueDate: 'Within 7 Days',
        status: 'Open',
        createdAt: new Date().toISOString(),
      },
      newPref
    );
    setRecommendations(matches);
  };

  const handleChooseFactory = (cand: MatchedFactoryCandidate) => {
    setSelectedFactoryId(cand.factory.id);
    setDepositSuccessMsg(`Quotation accepted with ${cand.factory.factoryName} (₹${cand.estimatedPrice.toLocaleString()}). ₹${Math.round(cand.estimatedPrice * 0.3).toLocaleString()} deposited into 4-stage milestone escrow.`);
    setTimeout(() => {
      setIsAiMatchingOpen(false);
      setShowOrderTracker(true);
    }, 2500);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 font-sans">
      {/* Consumer Commerce Hero Greeting */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Good Morning, {currentCustomer.contactName || 'John'} 👋
            </h1>
            <p className="text-sm text-slate-500 dark:text-steel-400 font-medium">
              What manufacturing parts are you looking to produce today?
            </p>
          </div>

          <Link href="/portal/quotations">
            <Button variant="outline" size="sm" className="hidden sm:flex border-purple-500/30 text-purple-400">
              <FileText className="h-3.5 w-3.5 mr-1" /> View Saved Quotes (1)
            </Button>
          </Link>
        </div>

        {/* Amazon + Swiggy Style Natural Language Search Bar */}
        <div className="p-3 rounded-2xl bg-white dark:bg-steel-900 border border-slate-200 dark:border-steel-800 shadow-lg space-y-3">
          <div className="relative flex items-center">
            <Search className="h-4 w-4 text-purple-400 absolute left-3.5 pointer-events-none" />
            <Input
              value={requirementText}
              onChange={(e) => setRequirementText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStartAiDiscovery()}
              placeholder="Describe what you need... e.g. 500 stainless steel brackets, 3 mm thickness, delivery within 7 days"
              className="pl-10 pr-28 h-12 bg-slate-50 dark:bg-steel-950 border-slate-200 dark:border-steel-800 text-xs text-slate-900 dark:text-slate-100 rounded-xl font-medium focus-visible:ring-purple-500"
            />
            <Button
              onClick={handleStartAiDiscovery}
              size="sm"
              className="absolute right-2 bg-gradient-to-r from-purple-600 to-brand-600 hover:from-purple-500 hover:to-brand-500 text-white font-bold text-xs shadow-md"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1" /> AI Find Factory
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-500 dark:text-steel-400">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-400">Popular:</span>
              <button
                onClick={() => setRequirementText('500 stainless steel brackets, 3 mm thickness, delivery within 7 days')}
                className="hover:text-purple-400 underline underline-offset-2 transition-colors"
              >
                SS304 Brackets (500 pcs)
              </button>
              <span>•</span>
              <button
                onClick={() => setRequirementText('200 aluminum laser cut flanges, 6mm 6061-T6, delivery in 4 days')}
                className="hover:text-purple-400 underline underline-offset-2 transition-colors"
              >
                Al6061 Flanges (200 pcs)
              </button>
            </div>

            <Link href="/marketplace" className="flex items-center gap-1 text-purple-400 font-semibold hover:underline">
              <UploadCloud className="h-3.5 w-3.5" /> Upload CAD / Drawing PDF
            </Link>
          </div>
        </div>
      </div>

      {/* 4-Metric Commerce Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-steel-400">Active Orders</span>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">4</div>
          <span className="text-[10px] text-slate-400 block mt-0.5">1 in CNC bending, 1 in welding</span>
        </Card>

        <Card className="border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-steel-400">Awaiting Approval</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">1</div>
          <Link href="/portal/quotations" className="text-[10px] text-purple-400 font-semibold hover:underline block mt-0.5">
            RFQ-2026-0891 ready for signoff →
          </Link>
        </Card>

        <Card className="border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-steel-400">Deliveries Today</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">2</div>
          <span className="text-[10px] text-blue-400 font-semibold block mt-0.5">Courier 2 km away (FedEx Freight)</span>
        </Card>

        <Card className="border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-steel-400">Invoices Due</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">₹48,000</div>
          <Link href="/portal/invoices" className="text-[10px] text-emerald-400 font-semibold hover:underline block mt-0.5">
            INV-2026-0775 due in 12 days →
          </Link>
        </Card>
      </div>

      {/* AI DISCOVERY & DECISION DRAWER (When search is triggered) */}
      {isAiMatchingOpen && parsedReq && (
        <Card className="border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-steel-900 to-slate-950 p-6 space-y-6 shadow-2xl text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-500/20">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 font-bold">
                  STEP 1: DISCOVER & UNDERSTAND
                </Badge>
                <span className="text-slate-300 font-bold text-sm">AI Requirement Extracted</span>
              </div>
              <p className="text-slate-400 text-xs mt-1">{parsedReq.naturalSummary}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px] font-semibold">Prioritize:</span>
              <div className="flex rounded-lg bg-steel-950 p-0.5 border border-steel-800">
                {(['balanced', 'lowest_price', 'fastest_delivery', 'highest_quality'] as BuyerPreference[]).map((pref) => (
                  <button
                    key={pref}
                    onClick={() => handlePreferenceChange(pref)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                      preference === pref
                        ? 'bg-purple-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {pref === 'balanced' ? 'Balanced' : pref === 'lowest_price' ? 'Lowest Price' : pref === 'fastest_delivery' ? 'Fastest' : 'Top Quality'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Extracted Specifications Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-steel-950/80 border border-steel-800">
              <span className="text-slate-500 block text-[10px]">Material</span>
              <strong className="text-slate-100 text-xs">{parsedReq.materialGrade}</strong>
            </div>
            <div className="p-3 rounded-xl bg-steel-950/80 border border-steel-800">
              <span className="text-slate-500 block text-[10px]">Thickness</span>
              <strong className="text-slate-100 text-xs">{parsedReq.thickness}</strong>
            </div>
            <div className="p-3 rounded-xl bg-steel-950/80 border border-steel-800">
              <span className="text-slate-500 block text-[10px]">Quantity</span>
              <strong className="text-slate-100 text-xs">{parsedReq.quantity} pcs</strong>
            </div>
            <div className="p-3 rounded-xl bg-steel-950/80 border border-steel-800">
              <span className="text-slate-500 block text-[10px]">Turnaround</span>
              <strong className="text-slate-100 text-xs">{parsedReq.requiredDeliveryDays} Days</strong>
            </div>
          </div>

          {/* Recommendations with Transparent Reasoning */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider">
                STEP 2: DECIDE — Verified Matching Factories & AI Explanations
              </h4>
              <span className="text-slate-400 text-[11px]">Ranked by {preference.replace('_', ' ')}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.slice(0, 3).map((cand) => (
                <div
                  key={cand.factory.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                    cand.recommendationTag
                      ? 'border-purple-500/40 bg-steel-900 ring-1 ring-purple-500/20'
                      : 'border-steel-800 bg-steel-900/60'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      {cand.recommendationTag && (
                        <Badge className="bg-purple-500/20 text-purple-300 font-bold border-purple-500/30 text-[10px]">
                          ★ {cand.recommendationTag}
                        </Badge>
                      )}
                      <span className="font-extrabold text-brand-400 text-xs ml-auto">
                        {cand.matchScore}/100 Match
                      </span>
                    </div>

                    <div>
                      <h5 className="font-bold text-sm text-white">{cand.factory.factoryName}</h5>
                      <span className="text-slate-400 text-[11px] block">{cand.factory.location}</span>
                    </div>

                    <div className="p-2 rounded-lg bg-steel-950/80 border border-steel-800/80 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Quotation</span>
                        <strong className="text-emerald-400 text-sm">₹{cand.estimatedPrice.toLocaleString()}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[9px] uppercase">Lead Time</span>
                        <strong className="text-white text-sm">{cand.estimatedDeliveryDays} Days</strong>
                      </div>
                    </div>

                    {/* Transparent AI Reasoning */}
                    <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-[11px] leading-relaxed">
                      <strong>Why Recommended:</strong> {cand.reasoning}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleChooseFactory(cand)}
                    size="sm"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md mt-2"
                  >
                    <Lock className="h-3 w-3 mr-1" /> Choose & Lock Escrow
                  </Button>
                </div>
              ))}
            </div>

            {depositSuccessMsg && (
              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{depositSuccessMsg}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Your Active Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Your Active Orders
            </h2>
            <p className="text-xs text-slate-500 dark:text-steel-400">
              Live manufacturing tracking & real-time delivery telemetry
            </p>
          </div>

          <Link href="/portal/orders">
            <Button variant="outline" size="sm">
              All Orders (4) <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Consumer Card for Order FG-2042 */}
        <Card className="border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900/90 shadow-md">
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 font-black text-sm shrink-0">
                FG
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-base text-slate-900 dark:text-slate-100">
                    Order #FG-2042
                  </span>
                  <Badge className="bg-brand-500/20 text-brand-400 border-brand-500/30 font-bold">
                    Manufacturing 78%
                  </Badge>
                </div>
                <h4 className="font-semibold text-slate-800 dark:text-steel-200 text-xs mt-0.5">
                  500 Stainless Steel Brackets (3mm SS304)
                </h4>
                <div className="text-[11px] text-slate-500 dark:text-steel-400 mt-0.5 flex items-center gap-2">
                  <span>Current: <strong>KUKA Robotic TIG Welding</strong></span>
                  <span>•</span>
                  <span>Estimated Delivery: <strong className="text-brand-500">Tomorrow · 3:00 PM</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={() => setShowOrderTracker(!showOrderTracker)}
                className="bg-brand-600 hover:bg-brand-500 text-white font-bold"
              >
                {showOrderTracker ? 'Hide Progress Journey' : 'Track Order'} <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Embedded Live Order Tracker (Swiggy/Zepto Journey) */}
      {showOrderTracker && (
        <div className="space-y-2">
          <LiveOrderTracker order={activeOrder} />
        </div>
      )}
    </div>
  );
}
