'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { RazorpayPaymentModal } from '@/components/billing/razorpay-payment-modal';
import {
  Sparkles,
  ArrowRight,
  Boxes,
  ShoppingBag,
  Wrench,
  Bot,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  Building2,
  Layers,
  Star,
  HelpCircle,
  CreditCard,
} from 'lucide-react';

export default function MarketingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'factory' | 'buyer' | 'marketplace'>('factory');
  const [trialModalOpen, setTrialModalOpen] = useState(false);
  const [selectedTrialPlan, setSelectedTrialPlan] = useState<{
    name: string;
    price: number;
    description: string;
  } | null>(null);

  const pricingPlans = [
    {
      name: 'Starter',
      price: 2999,
      description: 'Ideal for small machine shops (1-5 users)',
      features: ['Basic Orders & Quotations', 'Inventory Stock Management', 'Max 5 Team Member Seats', '100 AI Requests / mo', 'Standard Support'],
      highlight: false,
    },
    {
      name: 'Professional',
      price: 7999,
      description: 'Built for growing fabrication plants (5-25 users)',
      features: ['AI Vector CAD Feature Extraction', 'AI Interactive Quote Builder', 'Shop Floor Kanban Board', 'WhatsApp Business Cloud API', 'Customer Self-Service Portal', 'Max 25 Team Member Seats', '2,500 AI Requests / mo'],
      highlight: true,
    },
    {
      name: 'Enterprise',
      price: 24999,
      description: 'For multi-plant enterprises requiring custom SLAs',
      features: ['ForgeIQ Copilot Multi-Agent Architecture', 'B2B Manufacturing Marketplace Matching', '4-Stage Milestone Escrow Payments', 'Unlimited Team Member Seats', 'Unlimited AI Requests', '24/7 Priority Support & Dedicated TAM'],
      highlight: false,
    },
  ];

  const handleStartTrialClick = (plan: (typeof pricingPlans)[0]) => {
    setSelectedTrialPlan(plan);
    setTrialModalOpen(true);
  };

  const handleTrialPaymentSuccess = (payment: { paymentId: string; orderId: string }) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('FORGEIQ_TRIAL_ACTIVE', 'true');
      if (selectedTrialPlan) {
        localStorage.setItem('FORGEIQ_ACTIVE_PLAN', selectedTrialPlan.name);
      }
      localStorage.setItem('FORGEIQ_TRIAL_PAYMENT_ID', payment.paymentId);
    }
    setTimeout(() => {
      setTrialModalOpen(false);
      router.push('/dashboard?trial=active');
    }, 1500);
  };


  const faqs = [
    {
      q: 'How does the AI CAD Feature Extractor process drawings?',
      a: 'ForgeIQ parses vector geometry from DXF, DWG, STEP, SVG, and engineering PDFs to calculate cut perimeter lengths, hole counts, press brake bend lines, surface area, and material weight.',
    },
    {
      q: 'Can administrators edit pricing calculation rules?',
      a: 'Yes! All material costs, machine hourly rates, labor rates, overhead multipliers, profit margins, and GST rates are 100% editable through the UI without writing code.',
    },
    {
      q: 'Is customer data isolated between organizations?',
      a: 'Absolutely. ForgeIQ enforces strict Row-Level Security (RLS) policies at the database layer with SOC 2 Type II and ISO 27001 compliance standards.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-steel-800 bg-slate-950/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 via-purple-600 to-indigo-600 text-white font-extrabold text-base shadow-lg">
            F
          </div>
          <span className="font-black text-lg tracking-tight text-white">
            ForgeIQ <span className="text-[10px] text-purple-400 font-bold ml-1">AI PLATFORM</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#ecosystem" className="hover:text-white transition-colors">3-App Ecosystem</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faqs" className="hover:text-white transition-colors">FAQ</a>
          <Link href="/help" className="hover:text-white transition-colors">Help Center</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="border-steel-700 text-slate-300">
              Sign In
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="bg-gradient-to-r from-brand-600 to-purple-600 text-white font-bold">
              Start Free Trial <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 px-6 text-center space-y-6 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 font-mono text-xs font-bold">
          <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-pulse" /> THE AI MANUFACTURING INTELLIGENCE PLATFORM
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Automate CAD Quotes, Shop Operations & Customer Order Journeys.
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-3xl mx-auto font-normal">
          ForgeIQ connects small & medium fabrication plants, buyers, and machine shops in a single intelligent ecosystem. Parse DXF drawings, calculate 1-click quotations, schedule shop floor jobs, and provide Swiggy-style order tracking.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link href="/dashboard">
            <Button size="lg" className="bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-600 text-white font-bold text-sm shadow-xl">
              Launch Factory ERP <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
          <Link href="/portal/orders">
            <Button size="lg" variant="outline" className="border-steel-700 text-slate-200 font-bold text-sm">
              Explore Buyer Live Tracker
            </Button>
          </Link>
          <Link href="/marketplace">
            <Button size="lg" variant="outline" className="border-purple-500/40 text-purple-300 font-bold text-sm">
              View B2B Marketplace
            </Button>
          </Link>
        </div>

        {/* Security & Compliance Badges */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-slate-400 text-xs font-semibold">
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-500" /> SOC 2 Type II Certified</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-500" /> ISO 27001 Compliant</span>
          <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-brand-500" /> 99.99% Uptime SLA</span>
          <span className="flex items-center gap-1.5"><Lock className="h-4 w-4 text-purple-400" /> Milestone Escrow Protection</span>
        </div>
      </section>

      {/* Ecosystem Showcase Section */}
      <section id="ecosystem" className="max-w-6xl mx-auto px-6 py-12 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Three Distinct Applications. One Shared Engine.</h2>
          <p className="text-xs sm:text-sm text-slate-400">Tailored experiences for factory operations, manufacturing buyers, and B2B marketplace matching.</p>
        </div>

        <div className="flex justify-center gap-2 border-b border-steel-800 pb-4">
          <button
            onClick={() => setActiveTab('factory')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
              activeTab === 'factory' ? 'bg-brand-600 text-white' : 'bg-steel-900 text-slate-400 hover:text-white'
            }`}
          >
            1. ForgeIQ Factory (ERP)
          </button>
          <button
            onClick={() => setActiveTab('buyer')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
              activeTab === 'buyer' ? 'bg-brand-600 text-white' : 'bg-steel-900 text-slate-400 hover:text-white'
            }`}
          >
            2. ForgeIQ Buyer (Live Journey)
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
              activeTab === 'marketplace' ? 'bg-brand-600 text-white' : 'bg-steel-900 text-slate-400 hover:text-white'
            }`}
          >
            3. ForgeIQ Marketplace (B2B Match)
          </button>
        </div>

        {activeTab === 'factory' && (
          <Card className="border-steel-800 bg-steel-900/90 text-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Badge className="bg-brand-500/20 text-brand-300 font-bold">LINEAR + STRIPE + VERCEL DESIGN</Badge>
              <Link href="/dashboard">
                <Button size="sm">Launch Demo ERP <ArrowRight className="h-3.5 w-3.5 ml-1" /></Button>
              </Link>
            </div>
            <h3 className="font-extrabold text-xl">ForgeIQ Factory: Manufacturing Intelligence ERP</h3>
            <p className="text-xs text-slate-400 max-w-2xl">
              Complete ERP suite featuring vector CAD parsing, AI interactive quote builder, shop floor Kanban board, machine telemetry, and ForgeIQ Copilot Multi-Agent Assistant.
            </p>
          </Card>
        )}

        {activeTab === 'buyer' && (
          <Card className="border-steel-800 bg-steel-900/90 text-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Badge className="bg-purple-500/20 text-purple-300 font-bold">AMAZON + SWIGGY + ZEPTO DESIGN</Badge>
              <Link href="/portal/orders">
                <Button size="sm">Launch Buyer Portal <ArrowRight className="h-3.5 w-3.5 ml-1" /></Button>
              </Link>
            </div>
            <h3 className="font-extrabold text-xl">ForgeIQ Buyer: Live Order Journey & Customer Portal</h3>
            <p className="text-xs text-slate-400 max-w-2xl">
              Swiggy-style visual manufacturing progress timeline, stage inspection photo gallery, digital quote signoffs, 1-click reorders, and 5-star product quality ratings.
            </p>
          </Card>
        )}

        {activeTab === 'marketplace' && (
          <Card className="border-steel-800 bg-steel-900/90 text-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Badge className="bg-emerald-500/20 text-emerald-300 font-bold">AIRBNB + ALIBABA DESIGN</Badge>
              <Link href="/marketplace">
                <Button size="sm">Launch B2B Marketplace <ArrowRight className="h-3.5 w-3.5 ml-1" /></Button>
              </Link>
            </div>
            <h3 className="font-extrabold text-xl">ForgeIQ Marketplace: B2B Matchmaking Platform</h3>
            <p className="text-xs text-slate-400 max-w-2xl">
              Public RFQ requirement posting, 100-point factory candidate matching engine, fixed-price bidding comparison, and 4-stage milestone escrow payment architecture.
            </p>
          </Card>
        )}
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Simple, Transparent SaaS Pricing</h2>
          <p className="text-xs sm:text-sm text-slate-400">Cancel or upgrade anytime. Includes 14-day free trial.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.name}
              className={`border text-white space-y-4 p-6 ${
                plan.highlight
                  ? 'border-brand-500 bg-gradient-to-b from-brand-950/40 to-steel-900 shadow-2xl ring-2 ring-brand-500/30'
                  : 'border-steel-800 bg-steel-900/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-lg text-white">{plan.name}</h3>
                  {plan.highlight && <Badge className="bg-brand-500 text-white font-bold">POPULAR</Badge>}
                </div>
                <p className="text-xs text-slate-400 mt-1">{plan.description}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">{formatCurrency(plan.price)}</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>

              <div className="space-y-2 pt-2 border-t border-steel-800 text-xs">
                {plan.features.map((feat) => (
                  <div key={feat} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-slate-300">{feat}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => handleStartTrialClick(plan)}
                  className={`w-full font-bold text-xs flex items-center justify-center gap-2 ${
                    plan.highlight
                      ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                      : 'bg-steel-800 hover:bg-steel-700 text-white'
                  }`}
                >
                  <CreditCard className="h-3.5 w-3.5" /> Start 14-Day Free Trial
                </Button>
                <div className="text-[10px] text-center text-slate-500 mt-1.5 flex items-center justify-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" /> ₹1 refundable Razorpay verification
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Free Trial Razorpay Authorization Modal */}
      {selectedTrialPlan && (
        <RazorpayPaymentModal
          isOpen={trialModalOpen}
          onClose={() => setTrialModalOpen(false)}
          title="Activate 14-Day Free Trial"
          description={`Verify your account to begin your 14-day free trial on the ${selectedTrialPlan.name} plan.`}
          itemTitle={`${selectedTrialPlan.name} Plan (14-Day Free Trial)`}
          itemSubtitle="₹1 nominal verification charge (refundable) to authorize your trial"
          amount={1}
          metadata={{
            plan: selectedTrialPlan.name,
            monthlyPriceINR: String(selectedTrialPlan.price),
            type: 'FREE_TRIAL_VERIFICATION',
          }}
          onPaymentSuccess={handleTrialPaymentSuccess}
        />
      )}


      {/* FAQ Section */}
      <section id="faqs" className="max-w-4xl mx-auto px-6 py-12 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Frequently Asked Questions</h2>
          <p className="text-xs sm:text-sm text-slate-400">Everything you need to know about ForgeIQ platform architecture.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <Card key={idx} className="border-steel-800 bg-steel-900/80 text-white p-5 space-y-2">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-purple-400 shrink-0" /> {faq.q}
              </h4>
              <p className="text-xs text-slate-400 pl-6">{faq.a}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-steel-800 py-8 text-center text-xs text-slate-500 space-y-2">
        <p>© 2026 ForgeIQ Inc. All rights reserved. Precision Sheet Metal & Fabrication Intelligence.</p>
        <div className="flex justify-center gap-4 text-slate-400">
          <Link href="/help" className="hover:text-white">Help Center</Link>
          <Link href="/settings/organization" className="hover:text-white">Security & RBAC</Link>
          <Link href="/settings/billing" className="hover:text-white">SaaS Billing</Link>
        </div>
      </footer>
    </div>
  );
}
