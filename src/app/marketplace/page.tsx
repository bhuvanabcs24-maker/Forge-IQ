'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { globalFactoryMatchingEngine } from '@/lib/marketplace/matching-engine';
import { globalBiddingEngine } from '@/lib/marketplace/bidding-engine';
import { globalEscrowService } from '@/lib/marketplace/escrow-service';
import { MarketplaceRfq, FactoryBid, EscrowTransaction, BuyerPreference } from '@/types/marketplace';
import { formatCurrency } from '@/lib/utils';
import { parseBuyerRequirement } from '@/lib/ai/buyer-requirement-parser';
import {
  Sparkles,
  Building2,
  ShieldCheck,
  Award,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  Boxes,
  Lock,
  Star,
  Search,
  DollarSign,
  Percent,
  Truck,
  Check,
  SlidersHorizontal,
} from 'lucide-react';

import { RazorpayPaymentModal } from '@/components/billing/razorpay-payment-modal';

export default function MarketplacePage() {
  const [rfqPrompt, setRfqPrompt] = useState('500 stainless steel brackets, 3 mm thickness, delivery within 7 days');
  const [preference, setPreference] = useState<BuyerPreference>('balanced');
  const [activeTab, setActiveTab] = useState<'match' | 'bids' | 'escrow'>('match');
  const [marketplaceFeePercent, setMarketplaceFeePercent] = useState<number>(5.0);

  // Razorpay Escrow Modal State
  const [selectedBidForPayment, setSelectedBidForPayment] = useState<FactoryBid | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Parse prompt into structured RFQ
  const parsedSpecs = parseBuyerRequirement(rfqPrompt);

  const sampleRfq: MarketplaceRfq = {
    id: 'rfq-2026-0891',
    buyerOrgId: 'org-1',
    buyerOrgName: 'NexaSolar Energy Labs',
    title: parsedSpecs.partTitle || 'Precision Sheet Metal Mounts',
    materialGrade: parsedSpecs.materialGrade || 'Stainless Steel 304',
    thickness: parsedSpecs.thickness || '3 mm',
    quantity: parsedSpecs.quantity || 500,
    targetPrice: parsedSpecs.estimatedTargetPrice || 45000,
    deliveryDueDate: `${parsedSpecs.requiredDeliveryDays || 7} Days`,
    status: 'Open',
    createdAt: '2026-08-20',
  };

  const matches = globalFactoryMatchingEngine.matchFactoriesForRfq(sampleRfq, preference);
  const bids = globalBiddingEngine.getBidsForRfq(sampleRfq.id);
  const [acceptedResult, setAcceptedResult] = useState<{ acceptedBid: FactoryBid; escrow: EscrowTransaction } | null>(null);

  const handleAcceptBid = (bidId: string) => {
    const acceptedBid = bids.find((b) => b.id === bidId) || bids[0];
    setSelectedBidForPayment(acceptedBid);
    setIsPaymentModalOpen(true);
  };

  const handleEscrowPaymentSuccess = (payment: { paymentId: string; orderId: string }) => {
    if (!selectedBidForPayment) return;
    const escrow = globalEscrowService.createEscrowDeposit(
      sampleRfq.id,
      sampleRfq.buyerOrgId,
      selectedBidForPayment.factoryId,
      selectedBidForPayment.bidAmount,
      marketplaceFeePercent
    );

    setAcceptedResult({ acceptedBid: selectedBidForPayment, escrow });
    setIsPaymentModalOpen(false);
    setActiveTab('escrow');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Top Airbnb/Alibaba Style Marketplace Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-steel-800 bg-slate-950/80 backdrop-blur-xl px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-brand-600 to-indigo-600 font-black text-white text-base shadow-lg">
            M
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white block">
              ForgeIQ Marketplace <span className="text-[10px] text-purple-400 font-bold ml-1">AI FAB MATCH</span>
            </span>
            <span className="text-[10px] text-slate-400">Commerce Layer Connecting Buyers & Manufacturers</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="border-steel-700 text-slate-300">
              <Building2 className="h-3.5 w-3.5 mr-1" /> Factory ERP
            </Button>
          </Link>
          <Link href="/portal/orders">
            <Button variant="outline" size="sm" className="border-steel-700 text-slate-300">
              <Boxes className="h-3.5 w-3.5 mr-1" /> Buyer Portal
            </Button>
          </Link>
          <Link href="/portal/dashboard">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white font-bold">
              <Sparkles className="h-3.5 w-3.5 mr-1" /> Buyer Discovery
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Marketplace Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/60 via-slate-900 to-steel-950 p-8 space-y-4 shadow-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 font-mono">
              <Sparkles className="h-3 w-3 mr-1 text-purple-400" /> DISCOVER ➔ DECIDE ➔ BUY ➔ MANUFACTURE
            </Badge>
            <span className="text-slate-400 text-xs font-semibold">Over 1,200 Verified ISO-Certified Machine Shops</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Describe Your Part. AI Matches Verified Factories. Escrow Protects Your Funds.
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
            Upload engineering drawings or describe requirements naturally. ForgeIQ AI extracts material grades, tolerances, cut perimeters, and required machine processes to match verified manufacturers with transparent pricing.
          </p>

          {/* Natural Language Prompt & Drawing Upload Strip */}
          <div className="space-y-2 pt-2">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="h-4 w-4 text-purple-400 absolute left-3.5 pointer-events-none" />
                <Input
                  value={rfqPrompt}
                  onChange={(e) => setRfqPrompt(e.target.value)}
                  placeholder="e.g. 500 stainless steel brackets, 3 mm thickness, delivery within 7 days"
                  className="pl-10 h-11 bg-steel-900 border-steel-700 text-xs text-white rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link href="/cad-analysis">
                  <Button variant="outline" size="sm" className="border-steel-700 text-slate-300 text-xs h-11">
                    <UploadCloud className="h-3.5 w-3.5 mr-1" /> Upload DXF / STEP
                  </Button>
                </Link>
                <Button className="bg-gradient-to-r from-purple-600 to-brand-600 hover:from-purple-500 hover:to-brand-500 text-white font-bold text-xs h-11">
                  Analyze & Find Factories <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>

            {/* Extracted Specs Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400 font-mono">
              <span className="text-purple-400 font-bold">AI Extracted Specs:</span>
              <span className="bg-steel-900 px-2 py-0.5 rounded border border-steel-800 text-slate-200">
                Material: {parsedSpecs.materialGrade}
              </span>
              <span className="bg-steel-900 px-2 py-0.5 rounded border border-steel-800 text-slate-200">
                Thk: {parsedSpecs.thickness}
              </span>
              <span className="bg-steel-900 px-2 py-0.5 rounded border border-steel-800 text-slate-200">
                Qty: {parsedSpecs.quantity} pcs
              </span>
              <span className="bg-steel-900 px-2 py-0.5 rounded border border-steel-800 text-slate-200">
                Lead Time: {parsedSpecs.requiredDeliveryDays} Days
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selection Bar & Buyer Personalization Preference Toggles */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-steel-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('match')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                activeTab === 'match'
                  ? 'bg-purple-600 text-white'
                  : 'bg-steel-900 text-slate-400 hover:text-white'
              }`}
            >
              1. Matching Factories & AI Reasoning ({matches.length})
            </button>
            <button
              onClick={() => setActiveTab('bids')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                activeTab === 'bids'
                  ? 'bg-purple-600 text-white'
                  : 'bg-steel-900 text-slate-400 hover:text-white'
              }`}
            >
              2. Fixed-Price Bids ({bids.length})
            </button>
            <button
              onClick={() => setActiveTab('escrow')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                activeTab === 'escrow'
                  ? 'bg-purple-600 text-white'
                  : 'bg-steel-900 text-slate-400 hover:text-white'
              }`}
            >
              3. Escrow & Platform Fee Architecture {acceptedResult && '• (ACTIVE)'}
            </button>
          </div>

          {/* Personalization Toggle */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <SlidersHorizontal className="h-3.5 w-3.5 text-purple-400" /> Buyer Priority:
            </span>
            <div className="flex rounded-lg bg-steel-900 p-0.5 border border-steel-800">
              {(['balanced', 'lowest_price', 'fastest_delivery', 'highest_quality'] as BuyerPreference[]).map((pref) => (
                <button
                  key={pref}
                  onClick={() => setPreference(pref)}
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

        {/* Tab 1: AI-Matched Factories with Transparent Reasoning */}
        {activeTab === 'match' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {matches.map((item) => (
              <Card
                key={item.factory.id}
                className={`border text-white space-y-3 ${
                  item.recommendationTag
                    ? 'border-purple-500/50 bg-steel-900/95 ring-1 ring-purple-500/30'
                    : 'border-steel-800 bg-steel-900/80'
                }`}
              >
                <CardHeader className="pb-2 border-b border-steel-800">
                  <div className="flex items-center justify-between">
                    <Badge variant="success" className="font-bold flex items-center gap-1 text-[10px]">
                      <ShieldCheck className="h-3 w-3" /> {item.factory.verifiedStatus}
                    </Badge>
                    {item.recommendationTag ? (
                      <Badge className="bg-purple-500/20 text-purple-300 font-bold border-purple-500/30 text-[10px]">
                        ★ {item.recommendationTag}
                      </Badge>
                    ) : (
                      <span className="font-extrabold text-brand-400 text-xs">{item.matchScore}% Match</span>
                    )}
                  </div>
                  <CardTitle className="text-base font-bold mt-1 text-white">{item.factory.factoryName}</CardTitle>
                  <CardDescription className="text-slate-400 text-xs">{item.factory.location}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-steel-950 border border-steel-800 flex justify-between items-center">
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase">Est Quotation</span>
                      <strong className="text-emerald-400 text-sm">₹{item.estimatedPrice.toLocaleString()}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block uppercase">Delivery</span>
                      <strong className="text-white text-sm">{item.estimatedDeliveryDays} Days</strong>
                    </div>
                  </div>

                  {/* Transparent AI Explanation */}
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-[11px] leading-relaxed">
                    <strong>Why Recommended:</strong> {item.reasoning}
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 text-[11px] block">Machine Capabilities:</span>
                    <p className="text-slate-200 font-mono text-[10px]">{item.factory.machineCapabilities.join(' • ')}</p>
                  </div>

                  <div className="p-2 rounded-lg bg-steel-950/80 border border-steel-800 flex justify-between items-center text-[11px]">
                    <span>Quality: <strong className="text-amber-400">{item.factory.qualityScore}/5.0</strong></span>
                    <span>On-Time: <strong className="text-emerald-400">{item.factory.onTimeDeliveryRate}%</strong></span>
                  </div>

                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold"
                    onClick={() => setActiveTab('bids')}
                  >
                    View Fixed-Price Bids <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tab 2: Active Bids Comparison */}
        {activeTab === 'bids' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white">Active Verified Bids for {sampleRfq.title}</h3>
                <p className="text-slate-400 text-xs">Compare prices, lead times, and capacity declarations</p>
              </div>
              <Badge className="bg-purple-500/20 text-purple-300 font-mono">
                {bids.length} Qualified Bids Received
              </Badge>
            </div>

            <div className="space-y-3">
              {bids.map((bid) => (
                <div
                  key={bid.id}
                  className="p-5 rounded-2xl border border-steel-800 bg-steel-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{bid.factoryName}</h4>
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px]">
                        {bid.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-slate-400">{bid.capacityDeclaration}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Estimated Lead Time: <strong>{bid.estimatedLeadTimeDays} Days</strong> • Valid until: {bid.expirationDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block">Fixed-Price Bid</span>
                      <span className="text-xl font-extrabold text-emerald-400">{formatCurrency(bid.bidAmount)}</span>
                    </div>

                    <Button
                      onClick={() => handleAcceptBid(bid.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                    >
                      Accept & Deposit Escrow <Lock className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Milestone Escrow & Configurable Platform Fee Architecture */}
        {activeTab === 'escrow' && (
          <Card className="border-purple-500/30 bg-steel-900/90 text-white">
            <CardHeader className="border-b border-steel-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lock className="h-4 w-4 text-purple-400" /> Milestone Escrow & Payout Architecture
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Buyer payment is held securely in escrow and disbursed upon verified milestone quality checkpoints.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Platform Fee:</span>
                  <div className="flex items-center gap-1 bg-steel-950 px-2.5 py-1 rounded-lg border border-steel-800 font-mono font-bold text-purple-400">
                    <Percent className="h-3 w-3" />
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="15"
                      value={marketplaceFeePercent}
                      onChange={(e) => setMarketplaceFeePercent(Number(e.target.value))}
                      className="w-10 bg-transparent text-right outline-none text-purple-400 font-bold"
                    />
                    <span>%</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 text-xs pt-5">
              {/* Financial Breakdown Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                  <span className="text-slate-400 block text-[11px]">Total Buyer Escrow Deposit</span>
                  <span className="text-2xl font-black text-purple-300">
                    {acceptedResult ? formatCurrency(acceptedResult.escrow.totalAmount) : formatCurrency(42500)}
                  </span>
                  <span className="text-[10px] text-emerald-400 block mt-1">✓ Held in secure trust account</span>
                </div>

                <div className="p-4 rounded-xl bg-steel-950 border border-steel-800">
                  <span className="text-slate-400 block text-[11px]">ForgeIQ Platform Fee ({marketplaceFeePercent}%)</span>
                  <span className="text-2xl font-black text-slate-200">
                    {formatCurrency(Math.round(((acceptedResult?.escrow.totalAmount || 42500) * marketplaceFeePercent) / 100))}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">Deducted upon final order completion</span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-slate-400 block text-[11px]">Factory Net Payout</span>
                  <span className="text-2xl font-black text-emerald-400">
                    {formatCurrency(Math.round((acceptedResult?.escrow.totalAmount || 42500) * (1 - marketplaceFeePercent / 100)))}
                  </span>
                  <span className="text-[10px] text-emerald-500 block mt-1">Direct wire to manufacturer</span>
                </div>
              </div>

              {/* Complete Commerce Lifecycle Progression */}
              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                  Transaction Progression Lifecycle:
                </h4>

                <div className="space-y-2 font-sans">
                  <div className="p-3 rounded-xl border border-steel-800 bg-steel-950 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        ✓
                      </div>
                      <div>
                        <span className="font-bold text-white block">1. Material Procurement (30%)</span>
                        <span className="text-slate-400 text-[10px]">Released upon 304 SS sheet metal staging</span>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-400">{formatCurrency(Math.round((acceptedResult?.escrow.totalAmount || 42500) * 0.3))}</span>
                  </div>

                  <div className="p-3 rounded-xl border border-steel-800 bg-steel-950 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        ✓
                      </div>
                      <div>
                        <span className="font-bold text-white block">2. Machining & Fabrication Completion (40%)</span>
                        <span className="text-slate-400 text-[10px]">Released upon laser cutting & press brake bending</span>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-400">{formatCurrency(Math.round((acceptedResult?.escrow.totalAmount || 42500) * 0.4))}</span>
                  </div>

                  <div className="p-3 rounded-xl border border-steel-800 bg-steel-950 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xs">
                        3
                      </div>
                      <div>
                        <span className="font-bold text-white block">3. Delivery Confirmation & Quality Release (30%)</span>
                        <span className="text-slate-400 text-[10px]">Released upon dock delivery confirmation (less {marketplaceFeePercent}% marketplace fee)</span>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-400">{formatCurrency(Math.round((acceptedResult?.escrow.totalAmount || 42500) * 0.3))}</span>
                  </div>
                </div>
              </div>

              {/* Action Bridge to Buyer Live Tracker */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-steel-800">
                <span className="text-slate-400 text-[11px]">
                  Order is currently live on shop floor. Track production stages, photos, and courier telemetry.
                </span>

                <Link href="/portal/orders">
                  <Button className="bg-brand-600 hover:bg-brand-500 text-white font-bold">
                    Open Live Manufacturing Tracker <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedBidForPayment && (
          <RazorpayPaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            title="Deposit Milestone Escrow"
            description={`Fund manufacturing escrow for ${sampleRfq.title} with ${selectedBidForPayment.factoryName}`}
            itemTitle={`Milestone Escrow Deposit (${selectedBidForPayment.factoryName})`}
            itemSubtitle={`Estimated Delivery: ${selectedBidForPayment.estimatedLeadTimeDays} Days • Platform Fee: ${marketplaceFeePercent}%`}
            amount={selectedBidForPayment.bidAmount}
            metadata={{
              rfqId: sampleRfq.id,
              factoryId: selectedBidForPayment.factoryId,
              bidId: selectedBidForPayment.id,
              type: 'marketplace_escrow_deposit',
            }}
            onPaymentSuccess={handleEscrowPaymentSuccess}
          />
        )}
      </main>
    </div>
  );
}
