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

  const loadDrawing = async (fileName: string, fileType: CadFileType, fileSize: number) => {
    const parser = getCadParser();
    const res = await parser.parseDrawing({ fileName, fileType, fileSizeBytes: fileSize });
    setParsingResult(res);
  };

  useEffect(() => {
    loadDrawing('Avionics_HeatSink_Flange.dxf', 'dxf', 1024 * 480);
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

      <CadUploader onFileSelect={(name, type, size) => loadDrawing(name, type, size)} />

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
