import { PricingPlugin, pricingRegistry } from './base-plugin';
import {
  IndustryType,
  PricingRules,
  QuotationLineItemDetail,
  CostBreakdown,
} from '@/types/quotation-engine';

export class FabricationPricingPlugin implements PricingPlugin {
  industry: IndustryType = 'Fabrication';

  calculateLineItem(
    item: Partial<QuotationLineItemDetail>,
    rules: PricingRules
  ): QuotationLineItemDetail {
    const qty = Math.max(1, item.quantity || 1);

    // Density adjustment on material override
    const densityMap: Record<string, number> = {
      'Mild Steel': 7850,
      '304 Stainless Steel': 8000,
      '316 Stainless Steel': 8000,
      'Stainless Steel': 8000,
      '6061-T6 Aluminum': 2700,
      '5052-H32 Aluminum': 2700,
      'Aluminum': 2700,
      'A36 Carbon Steel': 7850,
      'Carbon Steel': 7850,
      'Galvanized Sheet': 7850,
    };

    const currentGrade = item.materialGrade || 'Mild Steel';
    const originalGrade = item.cadMetrics?.originalMaterial || 'Mild Steel';
    const isOverridden = item.isMaterialOverridden || (item.sourceCadAnalysisId ? currentGrade !== originalGrade : false);

    let weightKg = item.estimatedWeightKg?.value || 2.5;
    if (item.cadMetrics?.netWeightKg && isOverridden) {
      const origDensity = densityMap[originalGrade] || 7850;
      const newDensity = densityMap[currentGrade] || 7850;
      weightKg = Number((item.cadMetrics.netWeightKg * (newDensity / origDensity)).toFixed(2));
    } else if (item.cadMetrics?.netWeightKg) {
      weightKg = item.cadMetrics.netWeightKg;
    }

    const laserMins = item.estimatedLaserRuntimeMins?.value || 12;
    const bendsCount = item.estimatedBendsCount?.value || 4;
    const laborHrs = item.estimatedLaborHours?.value || 0.5;
    const scrapPct = item.estimatedScrapPercent?.value || rules.scrapAllowancePercent;
    const complexity = item.complexityFactor?.value || 1.1;

    // 1. Material Cost ($)
    const matRatePerKg = rules.materialRates[currentGrade] || rules.materialRates['Mild Steel'] || 140;
    const rawMaterialCost = weightKg * matRatePerKg * (1 + scrapPct / 100);

    // 2. Machine Runtime Cost ($)
    const laserCost = (laserMins / 60) * rules.machineRates.laserCutterHourly;
    const benderCost = ((bendsCount * 1.5) / 60) * rules.machineRates.pressBrakeHourly;
    const totalMachineCost = (laserCost + benderCost) * complexity;

    // 3. Labor Cost ($)
    const setupCostPerPart = (0.5 * rules.laborRates.setupTechHourly) / qty;
    const operatorCost = laborHrs * rules.laborRates.operatorHourly;
    const totalLaborCost = setupCostPerPart + operatorCost;

    // 4. Finishing Cost ($)
    const finishingCost = 0.5 * 4.0 * rules.finishingRates.powderCoatPerSqFt;

    // 5. Total Unit & Extended Price
    const subtotalPerUnit = rawMaterialCost + totalMachineCost + totalLaborCost + finishingCost;
    const unitPrice = subtotalPerUnit * (1 + (rules.overheadPercent + rules.profitMarginPercent) / 100);
    const totalPrice = unitPrice * qty;

    return {
      id: item.id || `li-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      partName: item.partName || 'Custom Metal Component',
      material: item.material || currentGrade,
      materialGrade: currentGrade,
      thickness: item.thickness || '3mm',
      dimensions: item.dimensions || '300mm x 400mm',
      quantity: qty,
      sourceCadAnalysisId: item.sourceCadAnalysisId,
      sourceCadFileName: item.sourceCadFileName,
      isMaterialOverridden: isOverridden,
      materialSource: isOverridden ? 'User Override' : (item.sourceCadAnalysisId ? 'CAD Source' : 'Standard'),
      cadMetrics: item.cadMetrics,
      estimatedWeightKg: {
        value: weightKg,
        confidence: item.estimatedWeightKg?.confidence || 95,
        aiAssumptionNotes: isOverridden
          ? `Density adjusted for ${currentGrade} (${densityMap[currentGrade] || 7850} kg/m³)`
          : item.estimatedWeightKg?.aiAssumptionNotes,
      },
      estimatedLaserRuntimeMins: item.estimatedLaserRuntimeMins || { value: laserMins, confidence: 88 },
      estimatedBendsCount: item.estimatedBendsCount || { value: bendsCount, confidence: 95 },
      estimatedLaborHours: item.estimatedLaborHours || { value: laborHrs, confidence: 85 },
      estimatedScrapPercent: item.estimatedScrapPercent || { value: scrapPct, confidence: 90 },
      complexityFactor: item.complexityFactor || { value: complexity, confidence: 94 },
      materialCost: Number(rawMaterialCost.toFixed(2)),
      machineCost: Number(totalMachineCost.toFixed(2)),
      laborCost: Number(totalLaborCost.toFixed(2)),
      finishingCost: Number(finishingCost.toFixed(2)),
      unitPrice: Number(unitPrice.toFixed(2)),
      totalPrice: Number(totalPrice.toFixed(2)),
    };
  }

  calculateQuotation(
    items: QuotationLineItemDetail[],
    rules: PricingRules
  ): CostBreakdown {
    let matSum = 0;
    let machSum = 0;
    let labSum = 0;
    let finSum = 0;
    let totalWeight = 0;

    items.forEach((item) => {
      matSum += item.materialCost * item.quantity;
      machSum += item.machineCost * item.quantity;
      labSum += item.laborCost * item.quantity;
      finSum += item.finishingCost * item.quantity;
      totalWeight += item.estimatedWeightKg.value * item.quantity;
    });

    const logistics = rules.basePackagingFee + totalWeight * rules.shippingPerKgRate;
    const baseSubtotal = matSum + machSum + labSum + finSum + logistics;
    const overhead = baseSubtotal * (rules.overheadPercent / 100);
    const profitMargin = baseSubtotal * (rules.profitMarginPercent / 100);
    const subtotalWithMargin = baseSubtotal + overhead + profitMargin;
    const taxGst = subtotalWithMargin * (rules.gstTaxPercent / 100);
    const grandTotal = subtotalWithMargin + taxGst;

    return {
      materialTotal: Number(matSum.toFixed(2)),
      machineTotal: Number(machSum.toFixed(2)),
      laborTotal: Number(labSum.toFixed(2)),
      finishingTotal: Number(finSum.toFixed(2)),
      packagingAndLogistics: Number(logistics.toFixed(2)),
      subtotal: Number(baseSubtotal.toFixed(2)),
      overheadAmount: Number(overhead.toFixed(2)),
      profitMarginAmount: Number(profitMargin.toFixed(2)),
      taxGstAmount: Number(taxGst.toFixed(2)),
      grandTotal: Number(grandTotal.toFixed(2)),
    };
  }
}

// Register default fabrication pricing plugin
pricingRegistry.register(new FabricationPricingPlugin());
