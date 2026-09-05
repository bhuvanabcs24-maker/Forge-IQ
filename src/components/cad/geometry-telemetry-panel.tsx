'use client';

import React from 'react';
import { ExtractedCadGeometry, CadFeatureEstimate } from '@/types/cad';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Boxes, Zap, Cpu, AlertCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function GeometryTelemetryPanel({
  geometry,
  estimates,
  onUpdateGeometry,
}: {
  geometry: ExtractedCadGeometry;
  estimates: CadFeatureEstimate;
  onUpdateGeometry: (updated: ExtractedCadGeometry) => void;
}) {
  const router = useRouter();

  return (
    <div className="space-y-4 text-xs">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Boxes className="h-4 w-4 text-brand-500" /> Extracted Geometry Telemetry & Confidence
          </CardTitle>
          <CardDescription>AI Extracted manufacturing specs with confidence scoring</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-500 mb-1">Part Dimensions ($L \times W \times T$)</label>
              <div className="flex items-center gap-1">
                <Input
                  value={`${geometry.dimensions.lengthMm} x ${geometry.dimensions.widthMm} x ${geometry.dimensions.thicknessMm}mm`}
                  onChange={(e) => {}}
                  className="h-8 text-xs font-bold"
                />
              </div>
              <span className="text-[10px] text-emerald-500 font-bold block mt-0.5">
                {geometry.confidenceScores.dimensions}% AI Conf
              </span>
            </div>

            <div>
              <label className="block text-slate-500 mb-1">Hole Cutout Count</label>
              <Input
                type="number"
                value={geometry.holeCount}
                onChange={(e) => onUpdateGeometry({ ...geometry, holeCount: Number(e.target.value) })}
                className="h-8 text-xs font-bold"
              />
              <span className="text-[10px] text-emerald-500 font-bold block mt-0.5">
                {geometry.confidenceScores.holeCount}% AI Conf
              </span>
            </div>

            <div>
              <label className="block text-slate-500 mb-1">Press Brake Bend Count</label>
              <Input
                type="number"
                value={geometry.bendCount}
                onChange={(e) => onUpdateGeometry({ ...geometry, bendCount: Number(e.target.value) })}
                className="h-8 text-xs font-bold"
              />
              <span className="text-[10px] text-amber-500 font-bold block mt-0.5">
                {geometry.confidenceScores.bendCount}% AI Conf (Review Suggested)
              </span>
            </div>

            <div>
              <label className="block text-slate-500 mb-1">Cut Perimeter (mm)</label>
              <Input
                type="number"
                value={geometry.cutLengthMm}
                onChange={(e) => onUpdateGeometry({ ...geometry, cutLengthMm: Number(e.target.value) })}
                className="h-8 text-xs font-bold"
              />
              <span className="text-[10px] text-emerald-500 font-bold block mt-0.5">
                {geometry.confidenceScores.cutLength}% AI Conf
              </span>
            </div>

            <div>
              <label className="block text-slate-500 mb-1">Estimated Weight (kg)</label>
              <Input
                type="number"
                value={geometry.estimatedWeightKg}
                onChange={(e) => onUpdateGeometry({ ...geometry, estimatedWeightKg: Number(e.target.value) })}
                className="h-8 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1">Manufacturing Complexity</label>
              <Badge variant={geometry.complexityScore === 'High' ? 'warning' : 'secondary'} className="mt-1">
                {geometry.complexityScore} Complexity
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Runtime Estimates Summary Card */}
      <Card className="border-purple-500/30 bg-purple-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-500" /> AI Manufacturing Estimates
            </span>
            <Button size="sm" onClick={() => router.push('/quotations/builder')}>
              1-Click Generate AI Quotation <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-white dark:bg-steel-900 border border-slate-200 dark:border-steel-800">
            <span className="text-slate-500 block">Laser Cut Time</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{estimates.estimatedLaserCutTimeMins} mins</span>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-steel-900 border border-slate-200 dark:border-steel-800">
            <span className="text-slate-500 block">Bending Setup Time</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{estimates.estimatedBendingTimeMins} mins</span>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-steel-900 border border-slate-200 dark:border-steel-800">
            <span className="text-slate-500 block">Estimated Scrap</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{estimates.estimatedScrapPercent}%</span>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-steel-900 border border-slate-200 dark:border-steel-800">
            <span className="text-slate-500 block">Lead Time Forecast</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{estimates.recommendedLeadTimeDays} days</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
