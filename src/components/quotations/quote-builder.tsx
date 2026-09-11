'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  QuotationLineItemDetail,
  CostBreakdown,
  ExtendedQuotation,
  QuotationRevision,
  PricingRules,
} from '@/types/quotation-engine';
import { DEFAULT_FABRICATION_PRICING_RULES } from '@/lib/pricing/default-rules';
import { FabricationPricingPlugin } from '@/lib/pricing/fabrication-plugin';
import { aiEstimatePartItem } from '@/lib/ai/quote-estimator';
import { ExplainPriceModal } from './explain-price-modal';
import { QuotePdfModal } from './quote-pdf-modal';
import { RevisionHistoryDialog } from './revision-history-dialog';
import { RazorpayPaymentModal } from '@/components/billing/razorpay-payment-modal';
import { formatCurrency } from '@/lib/utils';
import {
  Sparkles,
  Plus,
  Trash2,
  FileText,
  Save,
  Eye,
  History,
  ShoppingBag,
  Zap,
  CreditCard,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';

export function QuoteBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [customerName, setCustomerName] = useState('Apex Precision Manufacturing');
  const [quoteTitle, setQuoteTitle] = useState('ForgeIQ Sheet Metal Fabrication Quote');
  const [sourceCadAnalysisId, setSourceCadAnalysisId] = useState<string | null>(null);
  const [sourceCadFileName, setSourceCadFileName] = useState<string | null>(null);
  const [revisionNumber, setRevisionNumber] = useState('v1.0');
  const [status, setStatus] = useState<'Draft' | 'Sent' | 'Approved' | 'Rejected' | 'Expired'>('Draft');

  const [rules, setRules] = useState<PricingRules>(DEFAULT_FABRICATION_PRICING_RULES);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<{
    paymentId: string;
    orderId: string;
  } | null>(null);

  const [lineItems, setLineItems] = useState<QuotationLineItemDetail[]>([]);

  // Load active CAD analysis or owner pricing rules
  useEffect(() => {
    try {
      const savedRules = localStorage.getItem('FORGEIQ_PRICING_RULES');
      let currentRules = DEFAULT_FABRICATION_PRICING_RULES;
      if (savedRules) {
        currentRules = JSON.parse(savedRules);
        setRules(currentRules);
      }

      // Check for active CAD analysis in sessionStorage or localStorage
      const activeCadRaw = sessionStorage.getItem('FORGEIQ_ACTIVE_CAD_ANALYSIS') ||
                           localStorage.getItem('FORGEIQ_LATEST_CAD_ANALYSIS');

      if (activeCadRaw) {
        const cad = JSON.parse(activeCadRaw);
        const analysisId = cad.analysis_id || cad.analysisId || searchParams?.get('analysisId') || 'cad-analysis-1';
        const rawFileName = cad.file_name || cad.fileName || 'ForgeIQ_Test_02_Internal_Cutouts.dxf';
        const cleanTitle = rawFileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');

        setSourceCadAnalysisId(analysisId);
        setSourceCadFileName(rawFileName);
        setQuoteTitle(cleanTitle);

        const width = cad.dimensions?.width_mm || cad.dimensions?.lengthMm || 500;
        const height = cad.dimensions?.height_mm || cad.dimensions?.widthMm || 300;
        const thk = cad.dimensions?.thickness_mm || cad.dimensions?.thicknessMm || 6;
        const mat = cad.material?.name || cad.materialGrade || 'Mild Steel';
        const weight = cad.net_weight_kg || cad.estimatedWeightKg || 6.68;
        const outerCut = cad.outer_perimeter_mm || cad.cutLengthMm || 1582.43;
        const holes = cad.holes?.count !== undefined ? cad.holes.count : (cad.holeCount ?? 6);
        const bends = cad.bends?.count !== undefined ? cad.bends.count : (cad.bendCount ?? 3);
        const welds = cad.welds?.count !== undefined ? cad.welds.count : (cad.weldCount ?? 2);
        const cutouts = cad.internal_cutouts?.count !== undefined ? cad.internal_cutouts.count : (cad.internalCutoutCount ?? 2);
        const slots = cad.slots?.count !== undefined ? cad.slots.count : (cad.slotCount ?? 1);

        const singleCadItem = aiEstimatePartItem(
          {
            id: `li-${analysisId}`,
            partName: cleanTitle,
            material: mat,
            materialGrade: mat,
            thickness: `${thk}mm`,
            dimensions: `${width}mm x ${height}mm`,
            quantity: 1, // Default quantity: 1, NOT 150!
            sourceCadAnalysisId: analysisId,
            sourceCadFileName: rawFileName,
            cadMetrics: {
              outerCutPerimeterMm: outerCut,
              holeCount: holes,
              bendCount: bends,
              weldCount: welds,
              internalCutoutCount: cutouts,
              slotCount: slots,
              netWeightKg: weight,
              originalMaterial: mat,
            },
          },
          currentRules
        );

        setLineItems([singleCadItem]);
      } else {
        // Default single item when no CAD is loaded (neutral precision part)
        const defaultItem = aiEstimatePartItem(
          {
            id: 'li-part-initial',
            partName: 'Precision Laser Cut Bracket',
            material: 'Mild Steel',
            materialGrade: 'Mild Steel',
            thickness: '6mm',
            dimensions: '500mm x 300mm',
            quantity: 1,
          },
          currentRules
        );
        setLineItems([defaultItem]);
      }
    } catch (e) {
      console.error('Error loading CAD quotation data:', e);
    }
  }, [searchParams]);

  const [revisions, setRevisions] = useState<QuotationRevision[]>([]);
  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isRevisionDialogOpen, setIsRevisionDialogOpen] = useState(false);

  // Compute live cost breakdown
  const costBreakdown: CostBreakdown = useMemo(() => {
    const plugin = new FabricationPricingPlugin();
    return plugin.calculateQuotation(lineItems, rules);
  }, [lineItems, rules]);

  const handleAddPart = () => {
    const newItem = aiEstimatePartItem(
      {
        partName: 'New Laser Cut Part',
        material: 'Stainless Steel',
        materialGrade: '304 Stainless Steel',
        thickness: '3mm',
        dimensions: '300mm x 300mm',
        quantity: 50,
      },
      rules
    );
    setLineItems([...lineItems, newItem]);
  };

  const handleRemovePart = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, key: string, val: any) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [key]: val };
          if (key === 'materialGrade') {
            const orig = item.cadMetrics?.originalMaterial || 'Mild Steel';
            if (val !== orig) {
              updated.isMaterialOverridden = true;
              updated.materialSource = 'User Override';
            } else {
              updated.isMaterialOverridden = false;
              updated.materialSource = item.sourceCadAnalysisId ? 'CAD Source' : 'Standard';
            }
          }
          const plugin = new FabricationPricingPlugin();
          return plugin.calculateLineItem(updated, rules);
        }
        return item;
      })
    );
  };

  const handleSaveRevision = () => {
    const nextVer = `v1.${revisions.length + 1}`;
    setRevisionNumber(nextVer);

    const newRev: QuotationRevision = {
      revisionNumber: nextVer,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: 'Sarah Jenkins',
      changeSummary: `Updated quantities and line items (Total ${formatCurrency(costBreakdown.grandTotal)})`,
      lineItems: [...lineItems],
      costBreakdown: { ...costBreakdown },
      validUntil: '2026-08-30',
    };

    setRevisions([newRev, ...revisions]);
  };

  const handleQuotationPaymentSuccess = (payment: { paymentId: string; orderId: string }) => {
    setStatus('Approved');
    setPaymentSuccessData(payment);
    const nextVer = `v1.${revisions.length + 1}`;
    setRevisionNumber(nextVer);
    const newRev: QuotationRevision = {
      revisionNumber: nextVer,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: 'Razorpay Payment Gateway',
      changeSummary: `Quotation amount ${formatCurrency(costBreakdown.grandTotal)} settled via Razorpay (Payment ID: ${payment.paymentId}). Quote Approved.`,
      lineItems: [...lineItems],
      costBreakdown: { ...costBreakdown },
      validUntil: '2026-08-30',
    };
    setRevisions([newRev, ...revisions]);
  };

  const currentQuotationPayload: ExtendedQuotation = {
    id: 'qt-2026-991',
    quotationNumber: 'RFQ-2026-0891',
    customerId: 'cust-1',
    customerName,
    title: quoteTitle,
    status,
    totalAmount: costBreakdown.grandTotal,
    lineItems: lineItems.map((l) => ({
      id: l.id,
      partName: l.partName,
      material: l.materialGrade,
      thickness: l.thickness,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      totalPrice: l.totalPrice,
    })),
    validUntil: '2026-08-30',
    createdAt: new Date().toISOString().split('T')[0],
    revisionNumber,
    industry: 'Fabrication',
    detailedLineItems: lineItems,
    costBreakdown,
    pricingRulesSnapshot: rules,
    revisionHistory: revisions,
    paymentTerms: 'Net 30 Days. 50% advance upon PO issue for material procurement.',
    notes: 'Laser cutting tolerances +/- 0.2mm. Includes surface deburring and protective packaging.',
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900/90 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 font-bold">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                RFQ-2026-0891
              </h2>
              <Badge variant="outline" className="font-mono text-xs">
                {revisionNumber}
              </Badge>
              <Badge status={status} />
              {paymentSuccessData && (
                <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Paid via Razorpay ({paymentSuccessData.paymentId})
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-steel-400">
              AI Intelligent Quotation Builder • {customerName}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            className="bg-gradient-to-r from-sky-600 to-brand-600 hover:from-sky-700 hover:to-brand-700 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-sky-900/20"
            onClick={() => setIsRazorpayModalOpen(true)}
          >
            <CreditCard className="h-3.5 w-3.5" /> Send to Razorpay ({formatCurrency(costBreakdown.grandTotal)})
          </Button>

          <Button variant="outline" size="sm" onClick={() => setIsExplainModalOpen(true)}>
            <Sparkles className="h-3.5 w-3.5 mr-1 text-purple-500" /> Explain Price
          </Button>

          {revisions.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setIsRevisionDialogOpen(true)}>
              <History className="h-3.5 w-3.5 mr-1" /> Revisions ({revisions.length})
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={() => setIsPdfModalOpen(true)}>
            <Eye className="h-3.5 w-3.5 mr-1" /> Preview Branded PDF
          </Button>

          <Button size="sm" variant="outline" onClick={handleSaveRevision}>
            <Save className="h-3.5 w-3.5 mr-1" /> Save Revision
          </Button>
        </div>
      </div>


      {/* CAD Data Lineage & Traceability Badge */}
      {sourceCadAnalysisId && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <div>
              <span className="text-slate-600 dark:text-slate-400">Quote generated from: </span>
              <strong className="font-mono text-emerald-700 dark:text-emerald-300">{sourceCadFileName || 'CAD Drawing'}</strong>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-slate-500">
            <span>Analysis ID:</span>
            <Badge variant="outline" className="font-mono bg-white dark:bg-steel-900 border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
              {sourceCadAnalysisId}
            </Badge>
          </div>
        </div>
      )}

      {/* Quote Scope & Customer Info */}
      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Customer Account</label>
            <Select
              options={[
                { label: 'Apex Precision Manufacturing', value: 'Apex Precision Manufacturing' },
                { label: 'Apex Aerospace Solutions', value: 'Apex Aerospace Solutions' },
                { label: 'Titan Heavy Machinery', value: 'Titan Heavy Machinery' },
                { label: 'Vanguard Enclosures Inc.', value: 'Vanguard Enclosures Inc.' },
              ]}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Quotation Scope Title</label>
            <Input value={quoteTitle} onChange={(e) => setQuoteTitle(e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Quote Status</label>
            <Select
              options={[
                { label: 'Draft', value: 'Draft' },
                { label: 'Sent', value: 'Sent' },
                { label: 'Approved', value: 'Approved' },
                { label: 'Rejected', value: 'Rejected' },
              ]}
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Itemized Line Items Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Line Items & Part Cost Breakdown</CardTitle>
            <CardDescription>AI runtime estimates and materials calculation</CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={handleAddPart}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Line Item
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-steel-800/60 border-y border-slate-200 dark:border-steel-800 font-semibold text-slate-600 dark:text-steel-300">
                <tr>
                  <th className="p-3">Part Name</th>
                  <th className="p-3">Material Grade</th>
                  <th className="p-3">Thickness & Dims</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Weight (kg)</th>
                  <th className="p-3 text-right">Laser Runtime</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Line Total</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-steel-800/60">
                {lineItems.map((item, idx) => (
                  <tr key={item.id ? `${item.id}-${idx}` : `li-${idx}`} className="hover:bg-slate-50/50 dark:hover:bg-steel-800/40">
                    <td className="p-3 font-semibold">
                      <Input
                        value={item.partName}
                        onChange={(e) => handleUpdateItem(item.id, 'partName', e.target.value)}
                        className="text-xs h-7"
                      />
                      {item.cadMetrics && (
                        <div className="flex flex-wrap gap-1 mt-1 font-mono text-[9px]">
                          <span className="px-1 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {item.cadMetrics.outerCutPerimeterMm}mm Cut
                          </span>
                          <span className="px-1 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            {item.cadMetrics.holeCount} Holes
                          </span>
                          <span className="px-1 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {item.cadMetrics.bendCount} Bends
                          </span>
                          <span className="px-1 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            {item.cadMetrics.weldCount} Welds
                          </span>
                          <span className="px-1 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {item.cadMetrics.internalCutoutCount} Cutouts
                          </span>
                          <span className="px-1 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            {item.cadMetrics.slotCount} Slot
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <Select
                        options={[
                          { label: 'Mild Steel', value: 'Mild Steel' },
                          { label: '304 Stainless Steel', value: '304 Stainless Steel' },
                          { label: '316 Stainless Steel', value: '316 Stainless Steel' },
                          { label: '6061-T6 Aluminum', value: '6061-T6 Aluminum' },
                          { label: 'A36 Carbon Steel', value: 'A36 Carbon Steel' },
                        ]}
                        value={item.materialGrade}
                        onChange={(e) => handleUpdateItem(item.id, 'materialGrade', e.target.value)}
                        className="text-xs h-7"
                      />
                      {item.isMaterialOverridden || item.materialSource === 'User Override' ? (
                        <span className="text-[9px] text-amber-500 font-bold block mt-1">
                          Source: User Override
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-400 block mt-1">
                          Source: CAD ({item.cadMetrics?.originalMaterial || 'Mild Steel'})
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <Input
                        value={item.dimensions}
                        onChange={(e) => handleUpdateItem(item.id, 'dimensions', e.target.value)}
                        className="text-xs h-7"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
                        className="text-xs h-7 w-16 text-center"
                      />
                    </td>
                    <td className="p-3 text-right font-medium">
                      {item.estimatedWeightKg.value} kg
                      <span className="block text-[9px] text-emerald-500 font-bold">
                        {item.estimatedWeightKg.confidence}% AI Conf
                      </span>
                    </td>
                    <td className="p-3 text-right font-medium">
                      {item.estimatedLaserRuntimeMins.value} mins
                      <span className="block text-[9px] text-emerald-500 font-bold">
                        {item.estimatedLaserRuntimeMins.confidence}% AI Conf
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-slate-800 dark:text-steel-200">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="p-3 text-right font-extrabold text-slate-900 dark:text-slate-100">
                      {formatCurrency(item.totalPrice)}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleRemovePart(item.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary Card */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
        <Card className="flex-1 w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Administrative Pricing Telemetry</CardTitle>
              <CardDescription>Active rules used in AI calculation (configured by owner)</CardDescription>
            </div>
            <Link
              href="/settings/pricing-rules"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 hover:bg-brand-500/20 transition-colors"
            >
              <SlidersHorizontal className="h-3 w-3" /> Edit Owner Calculation Rules
            </Link>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-steel-800/50 border border-slate-200 dark:border-steel-700">
              <span className="text-slate-500 block">Laser Rate</span>
              <span className="font-bold">{formatCurrency(rules.machineRates.laserCutterHourly)}/hr</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-steel-800/50 border border-slate-200 dark:border-steel-700">
              <span className="text-slate-500 block">Press Brake Rate</span>
              <span className="font-bold">{formatCurrency(rules.machineRates.pressBrakeHourly)}/hr</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-steel-800/50 border border-slate-200 dark:border-steel-700">
              <span className="text-slate-500 block">Factory Overhead</span>
              <span className="font-bold">{rules.overheadPercent}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-steel-800/50 border border-slate-200 dark:border-steel-700">
              <span className="text-slate-500 block">Profit Margin</span>
              <span className="font-bold">{rules.profitMarginPercent}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Cost Summary Breakdown Box */}
        <Card className="w-full lg:w-80 border border-[#E4E7EC] dark:border-[#252B33] bg-white dark:bg-[#11161D] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <CardContent className="p-5 space-y-2 text-xs">
            <div className="flex justify-between text-[#667085] dark:text-[#98A2B3]">
              <span>Material Subtotal:</span>
              <span className="font-medium text-[#111827] dark:text-[#F2F4F7] tabular-nums">{formatCurrency(costBreakdown.materialTotal)}</span>
            </div>
            <div className="flex justify-between text-[#667085] dark:text-[#98A2B3]">
              <span>Machine Runtime:</span>
              <span className="font-medium text-[#111827] dark:text-[#F2F4F7] tabular-nums">{formatCurrency(costBreakdown.machineTotal)}</span>
            </div>
            <div className="flex justify-between text-[#667085] dark:text-[#98A2B3]">
              <span>Direct Labor & Setup:</span>
              <span className="font-medium text-[#111827] dark:text-[#F2F4F7] tabular-nums">{formatCurrency(costBreakdown.laborTotal)}</span>
            </div>
            <div className="flex justify-between text-[#667085] dark:text-[#98A2B3]">
              <span>Surface Powder Coat:</span>
              <span className="font-medium text-[#111827] dark:text-[#F2F4F7] tabular-nums">{formatCurrency(costBreakdown.finishingTotal)}</span>
            </div>
            <div className="flex justify-between text-[#667085] dark:text-[#98A2B3]">
              <span>Packaging & Shipping:</span>
              <span className="font-medium text-[#111827] dark:text-[#F2F4F7] tabular-nums">{formatCurrency(costBreakdown.packagingAndLogistics)}</span>
            </div>
            <div className="flex justify-between text-[#667085] dark:text-[#98A2B3]">
              <span>Factory Overhead ({rules.overheadPercent}%):</span>
              <span className="font-medium text-[#111827] dark:text-[#F2F4F7] tabular-nums">{formatCurrency(costBreakdown.overheadAmount)}</span>
            </div>
            <div className="flex justify-between text-[#667085] dark:text-[#98A2B3]">
              <span>Profit Margin ({rules.profitMarginPercent}%):</span>
              <span className="font-medium text-[#111827] dark:text-[#F2F4F7] tabular-nums">{formatCurrency(costBreakdown.profitMarginAmount)}</span>
            </div>
            <div className="flex justify-between text-[#667085] dark:text-[#98A2B3] pt-2 border-t border-[#E4E7EC] dark:border-[#252B33]">
              <span>GST Tax ({rules.gstTaxPercent}%):</span>
              <span className="font-medium text-[#111827] dark:text-[#F2F4F7] tabular-nums">{formatCurrency(costBreakdown.taxGstAmount)}</span>
            </div>

            <div className="flex justify-between items-baseline text-[#111827] dark:text-[#F2F4F7] font-bold text-base pt-3 border-t border-[#E4E7EC] dark:border-[#252B33]">
              <span>Grand Total:</span>
              <span className="text-[20px] font-bold text-[#155EEF] tabular-nums">
                {formatCurrency(costBreakdown.grandTotal)}
              </span>
            </div>

            <Button
              size="lg"
              variant="primary"
              className="w-full mt-4 h-10 font-semibold flex items-center justify-center gap-2 rounded-lg"
              onClick={() => setIsRazorpayModalOpen(true)}
            >
              <CreditCard className="h-4 w-4" /> Collect via Razorpay ({formatCurrency(costBreakdown.grandTotal)})
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full mt-2 h-10 font-medium rounded-lg"
              onClick={() => setIsPdfModalOpen(true)}
            >
              Generate Branded PDF Quote
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <ExplainPriceModal
        isOpen={isExplainModalOpen}
        onClose={() => setIsExplainModalOpen(false)}
        items={lineItems}
        breakdown={costBreakdown}
        rules={rules}
      />

      <QuotePdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        quotation={currentQuotationPayload}
      />

      <RevisionHistoryDialog
        isOpen={isRevisionDialogOpen}
        onClose={() => setIsRevisionDialogOpen(false)}
        revisions={revisions}
        currentRevision={revisionNumber}
      />

      {/* Razorpay Instant Checkout Modal for Quotation */}
      <RazorpayPaymentModal
        isOpen={isRazorpayModalOpen}
        onClose={() => setIsRazorpayModalOpen(false)}
        title="Collect Quotation Payment via Razorpay"
        description={`Direct Razorpay settlement for ${quoteTitle}`}
        itemTitle={`Quote: ${quoteTitle}`}
        itemSubtitle={`Customer: ${customerName} • RFQ-2026-0891 (${revisionNumber})`}
        amount={costBreakdown.grandTotal}
        metadata={{
          quoteTitle,
          customerName,
          quotationNumber: 'RFQ-2026-0891',
          revisionNumber,
          totalINR: String(costBreakdown.grandTotal),
        }}
        onPaymentSuccess={handleQuotationPaymentSuccess}
      />
    </div>

  );
}
