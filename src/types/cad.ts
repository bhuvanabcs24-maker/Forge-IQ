export type CadFileType = 'dxf' | 'dwg' | 'step' | 'svg' | 'pdf';

export interface CadAnnotation {
  id: string;
  type: 'cut_outer' | 'bend_line' | 'hole_circle' | 'weld_seam';
  label: string;
  coordinates: { x: number; y: number; width?: number; height?: number; radius?: number };
  color: string;
}

export interface VectorEntity {
  id: string;
  type: 'outer_cut' | 'internal_cut' | 'hole' | 'bend' | 'weld' | 'annotation';
  geometry_type: 'polygon' | 'circle' | 'line';
  points?: number[][];
  center?: number[];
  radius?: number;
  diameter?: number;
  start?: number[];
  end?: number[];
  angle_deg?: number;
  color: string;
  perimeter_mm?: number;
}

export interface AnalysisDetails {
  totalEntities: number;
  cut_entities: number;
  hole_entities: number;
  bend_entities: number;
  weld_entities: number;
  annotation_entities: number;
  ignored_entities: number;
  units: string;
  material: string;
  thickness: string;
  warnings: string[];
  densityUsed: string;
  orientedBoundingBox?: {
    trueLength: number;
    trueWidth: number;
    rotationDeg: number;
    aabbLength: number;
    aabbWidth: number;
  };
}

export interface ExtractedCadGeometry {
  partName: string;
  drawingNumber: string;
  fileType: CadFileType;
  fileSizeMb: number;
  dimensions: {
    lengthMm: number;
    widthMm: number;
    thicknessMm: number;
    trueLengthMm?: number;
    trueWidthMm?: number;
    aabbLengthMm?: number;
    aabbWidthMm?: number;
    rotationDeg?: number;
  };
  analysisId?: string;
  materialGrade: string;
  holeCount: number;
  holeDiameters?: Record<string, number>;
  holeSizeDistribution?: Record<string, number>;
  bendCount: number;
  bendAngles?: number[];
  bendAngleText?: string;
  weldCount: number;
  cutLengthMm: number;
  outerPerimeterMm?: number;
  internalCutoutCount?: number;
  internalCutoutPerimeterMm?: number;
  slotCount?: number;
  slotPerimeterMm?: number;
  holeCutPerimeterMm?: number;
  totalInternalCutPerimeterMm?: number;
  totalCuttingPathMm?: number;
  outer_perimeter_mm?: number;
  internal_cut_perimeter_mm?: number;
  hole_cut_perimeter_mm?: number;
  slot_cut_perimeter_mm?: number;
  total_cutting_path_mm?: number;
  weldLengthMm: number;
  surfaceAreaSqFt: number;
  grossAreaMm2?: number;
  netAreaMm2?: number;
  estimatedWeightKg: number;
  grossWeightKg?: number;
  complexityScore: 'Low' | 'Medium' | 'High' | 'Extreme';
  confidenceScores: {
    dimensions: number;
    thickness: number;
    holeCount: number;
    bendCount: number;
    cutLength: number;
    weight?: number;
  };
  annotations: CadAnnotation[];
  vectorEntities?: VectorEntity[];
  analysisDetails?: AnalysisDetails;
  featureConfidenceDetails?: Record<string, any>;
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
