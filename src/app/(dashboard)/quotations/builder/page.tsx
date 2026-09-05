'use client';

import React from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { QuoteBuilder } from '@/components/quotations/quote-builder';

export default function QuoteBuilderPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Interactive Quotation Builder"
        description="Estimate raw material weights, fiber laser runtimes, CNC bender setups, and generate revision-controlled quotes."
        breadcrumbs={[
          { label: 'Quotations', href: '/quotations' },
          { label: 'Quote Builder' },
        ]}
      />

      <QuoteBuilder />
    </div>
  );
}
