'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DEFAULT_FABRICATION_PRICING_RULES } from '@/lib/pricing/default-rules';
import { PricingRules } from '@/types/quotation-engine';
import { Save, Check, Cpu, UserCheck, Boxes, Percent, RotateCcw } from 'lucide-react';

export default function PricingRulesAdminPage() {
  const [rules, setRules] = useState<PricingRules>(DEFAULT_FABRICATION_PRICING_RULES);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('FORGEIQ_PRICING_RULES');
      if (saved) {
        setRules(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading saved pricing rules:', e);
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem('FORGEIQ_PRICING_RULES', JSON.stringify(rules));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error('Error saving pricing rules:', e);
    }
  };

  const handleResetDefaults = () => {
    setRules(DEFAULT_FABRICATION_PRICING_RULES);
    localStorage.removeItem('FORGEIQ_PRICING_RULES');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administrative Pricing Rules & Rate Catalogs"
        description="Configure machine hourly rates (₹/hr), labor rates (₹/hr), raw material ₹/kg catalog, and GST tax parameters for quotation calculations."
        breadcrumbs={[
          { label: 'Settings', href: '/settings' },
          { label: 'Pricing Rules' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleResetDefaults} className="text-xs">
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset Defaults
            </Button>
            <Button onClick={handleSave}>
              {savedSuccess ? (
                <span className="flex items-center gap-1 text-emerald-400">
                  <Check className="h-4 w-4" /> Pricing Rules Saved
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Save className="h-4 w-4" /> Save Pricing Rules
                </span>
              )}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Machine Telemetry Hourly Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Cpu className="h-4 w-4 text-brand-500" /> Machine Fleet Hourly Rates (₹/hr)
            </CardTitle>
            <CardDescription>Target rates for fiber laser, press brake, and welding runtime in INR</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold mb-1">TRUMPF 6kW Fiber Laser Rate (₹/hr)</label>
              <Input
                type="number"
                value={rules.machineRates.laserCutterHourly}
                onChange={(e) =>
                  setRules({
                    ...rules,
                    machineRates: { ...rules.machineRates, laserCutterHourly: Number(e.target.value) },
                  })
                }
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Bystronic CNC Press Brake Rate (₹/hr)</label>
              <Input
                type="number"
                value={rules.machineRates.pressBrakeHourly}
                onChange={(e) =>
                  setRules({
                    ...rules,
                    machineRates: { ...rules.machineRates, pressBrakeHourly: Number(e.target.value) },
                  })
                }
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Robotic Welding Cell Rate (₹/hr)</label>
              <Input
                type="number"
                value={rules.machineRates.roboticWelderHourly}
                onChange={(e) =>
                  setRules({
                    ...rules,
                    machineRates: { ...rules.machineRates, roboticWelderHourly: Number(e.target.value) },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Labor Hourly Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCheck className="h-4 w-4 text-emerald-500" /> Labor & Setup Rates (₹/hr)
            </CardTitle>
            <CardDescription>Setup technician and operator labor rates in INR</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold mb-1">Setup Technician Rate (₹/hr)</label>
              <Input
                type="number"
                value={rules.laborRates.setupTechHourly}
                onChange={(e) =>
                  setRules({
                    ...rules,
                    laborRates: { ...rules.laborRates, setupTechHourly: Number(e.target.value) },
                  })
                }
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Machine Operator Labor (₹/hr)</label>
              <Input
                type="number"
                value={rules.laborRates.operatorHourly}
                onChange={(e) =>
                  setRules({
                    ...rules,
                    laborRates: { ...rules.laborRates, operatorHourly: Number(e.target.value) },
                  })
                }
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Quality Assurance Inspector (₹/hr)</label>
              <Input
                type="number"
                value={rules.laborRates.qaInspectorHourly}
                onChange={(e) =>
                  setRules({
                    ...rules,
                    laborRates: { ...rules.laborRates, qaInspectorHourly: Number(e.target.value) },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Raw Material Catalog (₹/kg) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Boxes className="h-4 w-4 text-amber-500" /> Raw Material Base Catalog (₹/kg)
            </CardTitle>
            <CardDescription>Sheet metal alloy ₹/kg baseline cost in INR</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {Object.entries(rules.materialRates).map(([material, rate]) => (
              <div key={material}>
                <label className="block font-semibold mb-1">{material} (₹/kg)</label>
                <Input
                  type="number"
                  step="1"
                  value={rate}
                  onChange={(e) =>
                    setRules({
                      ...rules,
                      materialRates: { ...rules.materialRates, [material]: Number(e.target.value) },
                    })
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Multipliers & Taxes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Percent className="h-4 w-4 text-purple-500" /> Financial Multipliers & Taxes (%)
            </CardTitle>
            <CardDescription>Overhead, margin, and GST tax settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold mb-1">Factory Overhead Allowance (%)</label>
              <Input
                type="number"
                value={rules.overheadPercent}
                onChange={(e) => setRules({ ...rules, overheadPercent: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Target Profit Margin (%)</label>
              <Input
                type="number"
                value={rules.profitMarginPercent}
                onChange={(e) => setRules({ ...rules, profitMarginPercent: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">GST / Sales Tax (%)</label>
              <Input
                type="number"
                value={rules.gstTaxPercent}
                onChange={(e) => setRules({ ...rules, gstTaxPercent: Number(e.target.value) })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

