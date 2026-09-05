'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { Quotation } from '@/types';
import { MOCK_QUOTATIONS } from '@/lib/mock-data/manufacturing';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, FileText, Eye, Sparkles, Sliders, ShoppingBag } from 'lucide-react';
import { QuotePdfModal } from '@/components/quotations/quote-pdf-modal';
import { ExplainPriceModal } from '@/components/quotations/explain-price-modal';
import { DEFAULT_FABRICATION_PRICING_RULES } from '@/lib/pricing/default-rules';
import { FabricationPricingPlugin } from '@/lib/pricing/fabrication-plugin';
import { aiEstimatePartItem } from '@/lib/ai/quote-estimator';
import { ExtendedQuotation } from '@/types/quotation-engine';
import { useRouter } from 'next/navigation';

export default function QuotationsPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>(MOCK_QUOTATIONS);
  const [selectedQuote, setSelectedQuote] = useState<ExtendedQuotation | null>(null);
  const [explainQuote, setExplainQuote] = useState<ExtendedQuotation | null>(null);

  const rules = DEFAULT_FABRICATION_PRICING_RULES;

  const getExtendedPayload = (quote: Quotation): ExtendedQuotation => {
    const sampleItems = [
      aiEstimatePartItem(
        {
          partName: quote.title,
          material: 'Stainless Steel',
          materialGrade: '304 Stainless Steel',
          thickness: '6mm',
          dimensions: '400mm x 400mm',
          quantity: 100,
        },
        rules
      ),
    ];
    const plugin = new FabricationPricingPlugin();
    const breakdown = plugin.calculateQuotation(sampleItems, rules);

    return {
      ...quote,
      revisionNumber: 'v1.0',
      industry: 'Fabrication',
      detailedLineItems: sampleItems,
      costBreakdown: breakdown,
      pricingRulesSnapshot: rules,
      revisionHistory: [],
      paymentTerms: 'Net 30 Days. 50% advance upon PO confirmation.',
      notes: 'Tolerances +/- 0.2mm. Includes laser cutting, deburring, and protective packaging.',
    };
  };

  const columns: ColumnDef<Quotation>[] = [
    {
      accessorKey: 'quotationNumber',
      header: 'RFQ Quote #',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-purple-500/10 text-purple-600 font-bold text-xs">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {row.original.quotationNumber}
            </span>
            <div className="text-[11px] text-slate-400 dark:text-steel-400">
              Created {formatDate(row.original.createdAt)}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Quote Title',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-slate-800 dark:text-steel-200">
            {row.original.title}
          </div>
          <div className="text-xs text-slate-500 dark:text-steel-400">
            Customer: {row.original.customerName}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Quote Status',
      cell: ({ row }) => <Badge status={row.original.status} />,
    },
    {
      accessorKey: 'totalAmount',
      header: 'Estimated Total',
      cell: ({ row }) => (
        <span className="font-bold text-slate-900 dark:text-slate-100">
          {formatCurrency(row.original.totalAmount)}
        </span>
      ),
    },
    {
      accessorKey: 'validUntil',
      header: 'Valid Until',
      cell: ({ row }) => (
        <span className="text-xs text-slate-600 dark:text-steel-300 font-medium">
          {row.original.validUntil}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const payload = getExtendedPayload(row.original);
        return (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedQuote(payload)}
            >
              <Eye className="h-3.5 w-3.5 mr-1" /> PDF
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setExplainQuote(payload)}
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-500" />
            </Button>

            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                setQuotations((prev) =>
                  prev.map((q) => (q.id === row.original.id ? { ...q, status: 'Approved' } : q))
                );
                router.push('/orders');
              }}
              title="1-Click Convert to Work Order"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quotation & RFQ Management"
        description="Estimate part material cost, fiber laser runtime, CNC bender setups, and generate revision-controlled quotes."
        breadcrumbs={[{ label: 'Quotations' }]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/settings/pricing-rules">
              <Button variant="outline">
                <Sliders className="h-4 w-4 mr-1" /> Pricing Rules
              </Button>
            </Link>
            <Link href="/ai-order-intake">
              <Button variant="outline">
                <Sparkles className="h-4 w-4 mr-1 text-purple-500" /> AI Document Import
              </Button>
            </Link>
            <Link href="/quotations/builder">
              <Button>
                <Plus className="h-4 w-4 mr-1" /> Create AI Quotation
              </Button>
            </Link>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={quotations}
        searchKey="quotationNumber"
        searchPlaceholder="Search quotation #, customer, or title..."
      />

      {/* PDF Preview Modal */}
      {selectedQuote && (
        <QuotePdfModal
          isOpen={!!selectedQuote}
          onClose={() => setSelectedQuote(null)}
          quotation={selectedQuote}
        />
      )}

      {/* Explain Price Modal */}
      {explainQuote && (
        <ExplainPriceModal
          isOpen={!!explainQuote}
          onClose={() => setExplainQuote(null)}
          items={explainQuote.detailedLineItems}
          breakdown={explainQuote.costBreakdown}
          rules={explainQuote.pricingRulesSnapshot}
        />
      )}
    </div>
  );
}
