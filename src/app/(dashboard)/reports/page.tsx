'use client';

import React from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { MetricCard } from '@/components/shared/metric-card';
import { RevenueChart } from '@/components/charts/revenue-chart';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { BarChart3, Download, TrendingUp, Layers, Zap, Scale } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Manufacturing Intelligence Reports"
        description="Comprehensive analytics covering OEE equipment telemetry, scrap rate percentage, and gross margins."
        breadcrumbs={[{ label: 'Reports' }]}
        actions={
          <Button variant="outline">
            <Download className="h-4 w-4 mr-1" /> Export Executive PDF
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Overall Equipment Effectiveness"
          value="94.2%"
          trendPercent={3.4}
          icon={<Zap className="h-4 w-4 text-brand-500" />}
          subtitle="Target: 92.0%"
        />
        <MetricCard
          title="Material Scrap Waste Rate"
          value="3.1%"
          trendPercent={-1.8}
          icon={<Scale className="h-4 w-4 text-emerald-500" />}
          subtitle="Sheet metal optimization high"
        />
        <MetricCard
          title="Average Quote Conversion"
          value="68.5%"
          trendPercent={5.1}
          icon={<TrendingUp className="h-4 w-4 text-purple-500" />}
          subtitle="RFQ turnaround 3.8 hrs"
        />
        <MetricCard
          title="On-Time Delivery Rate"
          value="98.2%"
          trendPercent={2.1}
          icon={<Layers className="h-4 w-4 text-brand-500" />}
          subtitle="148 orders completed"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gross Margin & Cost Breakdown Telemetry</CardTitle>
          <CardDescription>Monthly revenue vs material cost of goods sold</CardDescription>
        </CardHeader>
        <CardContent>
          <RevenueChart />
        </CardContent>
      </Card>
    </div>
  );
}
