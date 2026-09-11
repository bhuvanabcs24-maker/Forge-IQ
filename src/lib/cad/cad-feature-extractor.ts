import { ExtractedCadGeometry, CadFeatureEstimate } from '@/types/cad';

export function calculateCadEstimates(geometry: ExtractedCadGeometry): CadFeatureEstimate {
  // 1. Total Laser Cutting Path (Outer Perimeter + Internal Cutouts + Slots + Holes)
  const totalCuttingPathMm =
    geometry.totalCuttingPathMm ||
    (geometry.cutLengthMm +
      (geometry.internalCutoutPerimeterMm || 0) +
      (geometry.slotPerimeterMm || 0) +
      (geometry.holeCutPerimeterMm || (geometry.holeCount * Math.PI * 14)));

  // Dynamic feed rate based on thickness and material
  const thk = geometry.dimensions?.thicknessMm || 6;
  const isAluminum = /aluminum|6061|5052/i.test(geometry.materialGrade || '');
  const isSS = /stainless|304|316/i.test(geometry.materialGrade || '');

  let baseCutSpeedMmPerMin = 2400;
  if (thk <= 2) baseCutSpeedMmPerMin = isAluminum ? 4200 : 3600;
  else if (thk <= 4) baseCutSpeedMmPerMin = isAluminum ? 3200 : 2800;
  else if (thk <= 6) baseCutSpeedMmPerMin = isSS ? 2000 : 2400;
  else baseCutSpeedMmPerMin = 1500;

  // Piercing count = 1 (outer) + holes + internal cutouts + slots
  const totalPierces = 1 + (geometry.holeCount || 0) + (geometry.internalCutoutCount || 0) + (geometry.slotCount || 0);
  const pierceTimeSec = thk > 4 ? 1.5 : 0.8;
  const totalPierceDelayMins = (totalPierces * pierceTimeSec) / 60;
  const traverseTimeMins = (totalPierces * 2.0) / 60; // G0 rapid repositioning
  const estimatedLaserCutTimeMins = Math.max(
    1,
    Math.round((totalCuttingPathMm / baseCutSpeedMmPerMin) + totalPierceDelayMins + traverseTimeMins)
  );

  // 2. Bending Time: 2.5 mins setup base + 1.2 mins per bend cycle
  const estimatedBendingTimeMins = geometry.bendCount > 0
    ? Math.round(3.0 + geometry.bendCount * 1.5)
    : 0;

  // 3. Welding Hours: 350 mm/hr for structural MIG/TIG joint seams
  const estimatedWeldingHours = geometry.weldLengthMm > 0
    ? Number((geometry.weldLengthMm / 350).toFixed(1))
    : (geometry.weldCount > 0 ? Number((geometry.weldCount * 0.25).toFixed(1)) : 0);

  // 4. Geometry-Derived Scrap Allowance:
  // Derived from: (Gross Bounding Box Area - Usable Net Area) / Gross Area + nesting edge buffer
  let estimatedScrapPercent = 5.0;
  if (geometry.grossAreaMm2 && geometry.netAreaMm2 && geometry.grossAreaMm2 > 0) {
    const rawScrap = ((geometry.grossAreaMm2 - geometry.netAreaMm2) / geometry.grossAreaMm2) * 100;
    estimatedScrapPercent = Math.min(25, Math.max(3.5, Number((rawScrap + 3.0).toFixed(1))));
  } else {
    estimatedScrapPercent = Math.min(18, 4.0 + (geometry.bendCount * 0.5) + ((geometry.holeCount || 0) * 0.2));
  }

  // 5. Material Cost based on density & thickness (rate in INR / kg)
  const unitRatePerKg = isSS ? 380 : (isAluminum ? 310 : 140);
  const estimatedMaterialCost = Math.round(
    geometry.estimatedWeightKg * unitRatePerKg * (1 + estimatedScrapPercent / 100)
  );

  // 6. Labor Cost
  const totalLaborHours = (estimatedLaserCutTimeMins + estimatedBendingTimeMins) / 60 + estimatedWeldingHours;
  const estimatedTotalLaborCost = Math.round(totalLaborHours * 450);

  // 7. Lead time: based on routing steps + setup
  let routingSteps = 1; // laser cut
  if (geometry.bendCount > 0) routingSteps++;
  if (geometry.weldCount > 0) routingSteps++;
  const recommendedLeadTimeDays = Math.max(2, Math.min(14, routingSteps + Math.ceil(totalLaborHours / 6)));

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
