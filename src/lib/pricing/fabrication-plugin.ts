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
    const qty = item.quantity || 1;
    const weightKg = item.estimatedWeightKg?.value || 2.5;
    const laserMins = item.estimatedLaserRuntimeMins?.value || 12;
    const bendsCount = item.estimatedBendsCount?.value || 4;
    const laborHrs = item.estimatedLaborHours?.value || 0.5;
    const scrapPct = item.estimatedScrapPercent?.value || rules.scrapAllowancePercent;
    const complexity = item.complexityFactor?.value || 1.1;

    // 1. Material Cost ($)
    const matRatePerKg = rules.materialRates[item.materialGrade || '304 Stainless Steel'] || 4.5;
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
      id: item.id || `li-${Date.now()}`,
      partName: item.partName || 'Custom Metal Component',
      material: item.material || 'Stainless Steel',
      materialGrade: item.materialGrade || '304 Stainless Steel',
      thickness: item.thickness || '3mm',
      dimensions: item.dimensions || '300mm x 400mm',
      quantity: qty,
      estimatedWeightKg: item.estimatedWeightKg || { value: weightKg, confidence: 92 },
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
