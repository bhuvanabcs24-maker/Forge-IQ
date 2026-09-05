import {
  QuotationLineItemDetail,
  CostBreakdown,
  PricingRules,
} from '@/types/quotation-engine';
import { formatCurrency } from '@/lib/utils';

export function generatePriceExplanation(
  items: QuotationLineItemDetail[],
  breakdown: CostBreakdown,
  rules: PricingRules
): string {
  const partsSummary = items
    .map(
      (item) =>
        `• ${item.partName} (${item.quantity} pcs @ ${formatCurrency(item.unitPrice)}/ea): Material ${item.materialGrade} (${item.thickness}), Weight ${item.estimatedWeightKg.value}kg/part, Laser runtime ${item.estimatedLaserRuntimeMins.value} mins, Bends ${item.estimatedBendsCount.value}.`
    )
    .join('\n');

  return `### Natural-Language Pricing Explanation & Cost Telemetry

**1. Raw Material Component Cost (${formatCurrency(breakdown.materialTotal)})**
Calculated using base raw material rates (₹/kg) plus a ${rules.scrapAllowancePercent}% laser cutting nesting scrap allowance. Sheet density and part volume yield a total raw material baseline of ${formatCurrency(breakdown.materialTotal)}.

**2. Machine & Tooling Telemetry (${formatCurrency(breakdown.machineTotal)})**
Includes TRUMPF 6kW Fiber Laser cutting runtime @ ${formatCurrency(rules.machineRates.laserCutterHourly)}/hr and Bystronic CNC Press Brake bending setups @ ${formatCurrency(rules.machineRates.pressBrakeHourly)}/hr. Complexity multipliers were applied based on geometric pierces and corner radii.

**3. Direct Labor & Setup (${formatCurrency(breakdown.laborTotal)})**
Covers setup technician prep (${formatCurrency(rules.laborRates.setupTechHourly)}/hr) and shop floor press operator handling (${formatCurrency(rules.laborRates.operatorHourly)}/hr).

**4. Surface Finishing & Powder Coating (${formatCurrency(breakdown.finishingTotal)})**
Applied surface area calculations @ ${formatCurrency(rules.finishingRates.powderCoatPerSqFt)}/sq.ft for surface deburring and protective powder coat finish.

**5. Logistics, Overhead & Margin Structure**
• Packaging & Shipping: ${formatCurrency(breakdown.packagingAndLogistics)}
• Factory Overhead (${rules.overheadPercent}%): ${formatCurrency(breakdown.overheadAmount)}
• Target Profit Margin (${rules.profitMarginPercent}%): ${formatCurrency(breakdown.profitMarginAmount)}
• Applicable GST Tax (${rules.gstTaxPercent}%): ${formatCurrency(breakdown.taxGstAmount)}

**Grand Total Quote Value: ${formatCurrency(breakdown.grandTotal)}**

---
*Assumptions & AI Confidence:*
${items
  .map(
    (item) =>
      `• ${item.partName}: Weight Confidence ${item.estimatedWeightKg.confidence}%, Laser Runtime Confidence ${item.estimatedLaserRuntimeMins.confidence}%, Scrap Allowance Confidence ${item.estimatedScrapPercent.confidence}%.`
  )
  .join('\n')}`;
}
