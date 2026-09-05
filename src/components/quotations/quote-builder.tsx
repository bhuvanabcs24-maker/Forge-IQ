'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
} from '@/types/quotation-engine';
import { DEFAULT_FABRICATION_PRICING_RULES } from '@/lib/pricing/default-rules';
import { FabricationPricingPlugin } from '@/lib/pricing/fabrication-plugin';
import { aiEstimatePartItem } from '@/lib/ai/quote-estimator';
import { ExplainPriceModal } from './explain-price-modal';
import { QuotePdfModal } from './quote-pdf-modal';
import { RevisionHistoryDialog } from './revision-history-dialog';
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
} from 'lucide-react';

export function QuoteBuilder() {
  const router = useRouter();

  const [customerName, setCustomerName] = useState('Apex Aerospace Solutions');
  const [quoteTitle, setQuoteTitle] = useState('Batch 500 Avionics Heat Sink Flanges');
  const [revisionNumber, setRevisionNumber] = useState('v1.0');
  const [status, setStatus] = useState<'Draft' | 'Sent' | 'Approved' | 'Rejected' | 'Expired'>('Draft');

  const [rules] = useState(DEFAULT_FABRICATION_PRICING_RULES);

  const [lineItems, setLineItems] = useState<QuotationLineItemDetail[]>([
    aiEstimatePartItem(
      {
        partName: 'Avionics Heat Sink Base Plate',
        material: 'Stainless Steel',
        materialGrade: '304 Stainless Steel',
        thickness: '6mm',
        dimensions: '400mm x 400mm',
        quantity: 150,
      },
      rules
    ),
    aiEstimatePartItem(
      {
        partName: 'Mounting Support Flange',
        material: 'Aluminum',
        materialGrade: '6061-T6 Aluminum',
        thickness: '3mm',
        dimensions: '200mm x 300mm',
        quantity: 150,
      },
      rules
    ),
  ]);

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
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                RFQ-2026-0891
              </h2>
              <Badge variant="outline" className="font-mono text-xs">
                {revisionNumber}
              </Badge>
              <Badge status={status} />
            </div>
            <p className="text-xs text-slate-500 dark:text-steel-400">
              AI Intelligent Quotation Builder • {customerName}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

          <Button size="sm" onClick={handleSaveRevision}>
            <Save className="h-3.5 w-3.5 mr-1" /> Save Revision
          </Button>
        </div>
      </div>

      {/* Quote Scope & Customer Info */}
      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Customer Account</label>
            <Select
              options={[
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
                {lineItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-steel-800/40">
                    <td className="p-3 font-semibold">
                      <Input
                        value={item.partName}
                        onChange={(e) => handleUpdateItem(item.id, 'partName', e.target.value)}
                        className="text-xs h-7"
                      />
                    </td>
                    <td className="p-3">
                      <Select
                        options={[
                          { label: '304 Stainless Steel', value: '304 Stainless Steel' },
                          { label: '316 Stainless Steel', value: '316 Stainless Steel' },
                          { label: '6061-T6 Aluminum', value: '6061-T6 Aluminum' },
                          { label: 'A36 Carbon Steel', value: 'A36 Carbon Steel' },
                        ]}
                        value={item.materialGrade}
                        onChange={(e) => handleUpdateItem(item.id, 'materialGrade', e.target.value)}
                        className="text-xs h-7"
                      />
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
          <CardHeader>
            <CardTitle className="text-base">Administrative Pricing Telemetry</CardTitle>
            <CardDescription>Active rules used in calculation</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-steel-800/50 border border-slate-200 dark:border-steel-700">
              <span className="text-slate-500 block">Laser Rate</span>
              <span className="font-bold">${rules.machineRates.laserCutterHourly}/hr</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-steel-800/50 border border-slate-200 dark:border-steel-700">
              <span className="text-slate-500 block">Press Brake Rate</span>
              <span className="font-bold">${rules.machineRates.pressBrakeHourly}/hr</span>
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
        <Card className="w-full lg:w-80 border-brand-500/30">
          <CardContent className="p-5 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-steel-300">
              <span>Material Subtotal:</span>
              <span className="font-medium">{formatCurrency(costBreakdown.materialTotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-steel-300">
              <span>Machine Runtime:</span>
              <span className="font-medium">{formatCurrency(costBreakdown.machineTotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-steel-300">
              <span>Direct Labor & Setup:</span>
              <span className="font-medium">{formatCurrency(costBreakdown.laborTotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-steel-300">
              <span>Surface Powder Coat:</span>
              <span className="font-medium">{formatCurrency(costBreakdown.finishingTotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-steel-300">
              <span>Packaging & Shipping:</span>
              <span className="font-medium">{formatCurrency(costBreakdown.packagingAndLogistics)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-steel-300">
              <span>Factory Overhead ({rules.overheadPercent}%):</span>
              <span className="font-medium">{formatCurrency(costBreakdown.overheadAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-steel-300">
              <span>Profit Margin ({rules.profitMarginPercent}%):</span>
              <span className="font-medium">{formatCurrency(costBreakdown.profitMarginAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-steel-300 pt-1 border-t border-slate-200 dark:border-steel-800">
              <span>GST Tax ({rules.gstTaxPercent}%):</span>
              <span className="font-medium">{formatCurrency(costBreakdown.taxGstAmount)}</span>
            </div>

            <div className="flex justify-between text-slate-900 dark:text-slate-100 font-extrabold text-base pt-2 border-t-2 border-brand-500">
              <span>Grand Total:</span>
              <span className="text-brand-600 dark:text-brand-400">
                {formatCurrency(costBreakdown.grandTotal)}
              </span>
            </div>

            <Button
              size="lg"
              className="w-full mt-4"
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
    </div>
  );
}
