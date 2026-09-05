import { CadParserProvider, CadParserOptions } from '../base-parser';
import { CadParsingResult, CadFileType, ExtractedCadGeometry } from '@/types/cad';
import { calculateCadEstimates } from '../cad-feature-extractor';

export class MockCadParser implements CadParserProvider {
  name = 'ForgeIQ Vector Geometry & CAD Feature Engine';
  supportedFormats: CadFileType[] = ['dxf', 'dwg', 'step', 'svg', 'pdf'];

  async parseDrawing(options: CadParserOptions): Promise<CadParsingResult> {
    const isStep = options.fileType === 'step';

    const geometry: ExtractedCadGeometry = {
      partName: options.fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
      drawingNumber: `DWG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      fileType: options.fileType,
      fileSizeMb: Number((options.fileSizeBytes / (1024 * 1024)).toFixed(2)) || 1.85,
      dimensions: {
        lengthMm: isStep ? 450 : 400,
        widthMm: isStep ? 350 : 300,
        thicknessMm: 6,
      },
      materialGrade: '304 Stainless Steel',
      holeCount: isStep ? 12 : 8,
      bendCount: isStep ? 6 : 4,
      cutLengthMm: isStep ? 2450 : 1850,
      weldLengthMm: isStep ? 650 : 400,
      surfaceAreaSqFt: isStep ? 5.8 : 4.2,
      estimatedWeightKg: isStep ? 8.4 : 5.8,
      complexityScore: isStep ? 'High' : 'Medium',
      confidenceScores: {
        dimensions: 96,
        thickness: 92,
        holeCount: 98,
        bendCount: 88,
        cutLength: 94,
      },
      annotations: [
        { id: 'ann-1', type: 'cut_outer', label: 'Outer Cut Perimeter (1850mm)', coordinates: { x: 20, y: 20, width: 360, height: 260 }, color: '#2563EB' },
        { id: 'ann-2', type: 'bend_line', label: 'CNC Press Brake Bend #1', coordinates: { x: 100, y: 20, width: 0, height: 260 }, color: '#F59E0B' },
        { id: 'ann-3', type: 'bend_line', label: 'CNC Press Brake Bend #2', coordinates: { x: 300, y: 20, width: 0, height: 260 }, color: '#F59E0B' },
        { id: 'ann-4', type: 'hole_circle', label: 'M8 Mounting Cutout (4x)', coordinates: { x: 50, y: 50, radius: 12 }, color: '#EF4444' },
        { id: 'ann-5', type: 'weld_seam', label: 'Robotic Weld Seam (400mm)', coordinates: { x: 20, y: 280, width: 360, height: 0 }, color: '#8B5CF6' },
      ],
    };

    const estimates = calculateCadEstimates(geometry);

    return {
      id: `cad-${Date.now()}`,
      fileName: options.fileName,
      geometry,
      estimates,
      parsedAt: new Date().toISOString(),
    };
  }
}
