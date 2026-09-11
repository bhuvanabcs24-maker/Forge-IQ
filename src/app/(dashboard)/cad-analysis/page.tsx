'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { CadUploader } from '@/components/cad/cad-uploader';
import { CadViewer } from '@/components/cad/cad-viewer';
import { GeometryTelemetryPanel } from '@/components/cad/geometry-telemetry-panel';
import { getCadParser } from '@/lib/cad/base-parser';
import { CadParsingResult, CadFileType, ExtractedCadGeometry } from '@/types/cad';
import { calculateCadEstimates } from '@/lib/cad/cad-feature-extractor';

export default function CadAnalysisPage() {
  const [parsingResult, setParsingResult] = useState<CadParsingResult | null>(null);

  const loadDrawing = async (fileName: string, fileType: CadFileType, fileSize: number, fileContent?: string) => {
    const parser = getCadParser();
    const res = await (parser as any).parseDrawing({ fileName, fileType, fileSizeBytes: fileSize, fileContent });
    setParsingResult(res);
  };

  useEffect(() => {
    loadDrawing('ForgeIQ_Sample_SheetMetal_Part.dxf', 'dxf', 1162);
  }, []);

  const handleUpdateGeometry = (updated: ExtractedCadGeometry) => {
    if (!parsingResult) return;
    const newEstimates = calculateCadEstimates(updated);
    setParsingResult({
      ...parsingResult,
      geometry: updated,
      estimates: newEstimates,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="CAD & Engineering Intelligence Engine"
        description="Extract sheet metal cut perimeters, hole counts, bend lines, surface area, and material weight from DXF, DWG, STEP, and PDF drawings."
        breadcrumbs={[{ label: 'CAD Intelligence' }]}
      />

      <CadUploader onFileSelect={(name, type, size, content) => loadDrawing(name, type, size, content)} />

      {parsingResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CadViewer geometry={parsingResult.geometry} />
          <GeometryTelemetryPanel
            geometry={parsingResult.geometry}
            estimates={parsingResult.estimates}
            onUpdateGeometry={handleUpdateGeometry}
          />
        </div>
      )}
    </div>
  );
}
