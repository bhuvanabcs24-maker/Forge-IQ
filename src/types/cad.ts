export type CadFileType = 'dxf' | 'dwg' | 'step' | 'svg' | 'pdf';

export interface CadAnnotation {
  id: string;
  type: 'cut_outer' | 'bend_line' | 'hole_circle' | 'weld_seam';
  label: string;
  coordinates: { x: number; y: number; width?: number; height?: number; radius?: number };
  color: string;
}

export interface ExtractedCadGeometry {
  partName: string;
  drawingNumber: string;
  fileType: CadFileType;
  fileSizeMb: number;
  dimensions: { lengthMm: number; widthMm: number; thicknessMm: number };
  materialGrade: string;
  holeCount: number;
  bendCount: number;
  cutLengthMm: number;
  weldLengthMm: number;
  surfaceAreaSqFt: number;
  estimatedWeightKg: number;
  complexityScore: 'Low' | 'Medium' | 'High' | 'Extreme';
  confidenceScores: {
    dimensions: number;
    thickness: number;
    holeCount: number;
    bendCount: number;
    cutLength: number;
  };
  annotations: CadAnnotation[];
}

export interface CadFeatureEstimate {
  estimatedLaserCutTimeMins: number;
  estimatedBendingTimeMins: number;
  estimatedWeldingHours: number;
  estimatedScrapPercent: number;
  estimatedMaterialCost: number;
  estimatedTotalLaborCost: number;
  recommendedLeadTimeDays: number;
}

export interface CadParsingResult {
  id: string;
  fileName: string;
  geometry: ExtractedCadGeometry;
  estimates: CadFeatureEstimate;
  parsedAt: string;
}
