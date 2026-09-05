import { ExtractedCadGeometry, CadFeatureEstimate } from '@/types/cad';

export function calculateCadEstimates(geometry: ExtractedCadGeometry): CadFeatureEstimate {
  // Laser Cut Speed: ~2500 mm/min for 6mm Stainless Steel + 1.2 sec per pierce delay
  const laserSpeedMmPerMin = 2200;
  const pierceDelayMins = (geometry.holeCount * 1.5) / 60;
  const estimatedLaserCutTimeMins = Math.round(
    (geometry.cutLengthMm / laserSpeedMmPerMin) + pierceDelayMins
  );

  // CNC Bending Time: 3.5 mins setup per bend line
  const estimatedBendingTimeMins = geometry.bendCount * 3.5;

  // Welding Hours: 400mm per hour for MIG/TIG seam welding
  const estimatedWeldingHours = Number((geometry.weldLengthMm / 400).toFixed(1));

  // Scrap allowance: Base 5% + 0.5% per bend line + 0.2% per cutout
  const estimatedScrapPercent = Math.min(18, 5 + geometry.bendCount * 0.5 + geometry.holeCount * 0.2);

  // Material Cost ($5.50/kg for 304 SS * weight * scrap factor)
  const estimatedMaterialCost = Math.round(
    geometry.estimatedWeightKg * 5.5 * (1 + estimatedScrapPercent / 100)
  );

  // Labor Cost ($45/hr)
  const totalLaborHours = (estimatedLaserCutTimeMins + estimatedBendingTimeMins) / 60 + estimatedWeldingHours;
  const estimatedTotalLaborCost = Math.round(totalLaborHours * 45);

  const recommendedLeadTimeDays = Math.max(3, Math.ceil(totalLaborHours / 4) + 2);

  return {
    estimatedLaserCutTimeMins,
    estimatedBendingTimeMins,
    estimatedWeldingHours,
    estimatedScrapPercent,
    estimatedMaterialCost,
    estimatedTotalLaborCost,
    recommendedLeadTimeDays,
  };
}
