'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CadFileType } from '@/types/cad';
import { UploadCloud, FileCode, CheckCircle2, Sparkles } from 'lucide-react';

interface CadUploaderProps {
  onFileSelect: (fileName: string, fileType: CadFileType, fileSize: number) => void;
}

export function CadUploader({ onFileSelect }: CadUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<string>('Avionics_HeatSink_Flange.dxf');

  const presets = [
    { name: 'Avionics_HeatSink_Flange.dxf', type: 'dxf' as CadFileType, size: 1024 * 480 },
    { name: 'NEMA_4X_Enclosure_Bracket.step', type: 'step' as CadFileType, size: 1024 * 1850 },
    { name: 'Excavator_Bucket_Liner.dwg', type: 'dwg' as CadFileType, size: 1024 * 920 },
  ];

  const handleSelect = (name: string, type: CadFileType, size: number) => {
    setSelectedFile(name);
    onFileSelect(name, type, size);
  };

  return (
    <Card className="border-dashed border-2 border-slate-300 dark:border-steel-700 bg-slate-50/50 dark:bg-steel-900/40">
      <CardContent className="p-6 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500">
          <UploadCloud className="h-6 w-6" />
        </div>

        <div>
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            Drag & Drop CAD Drawings or Engineering Specs
          </h4>
          <p className="text-xs text-slate-500 dark:text-steel-400 mt-1">
            Supports DXF, DWG, STEP, SVG, and Vector PDF drawings up to 50MB
          </p>
        </div>

        {/* Sample Drawing Presets */}
        <div className="pt-2">
          <span className="text-[11px] text-slate-400 font-semibold block mb-2">
            Try CAD Presets:
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleSelect(preset.name, preset.type, preset.size)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  selectedFile === preset.name
                    ? 'border-brand-500 bg-brand-500/10 text-brand-500'
                    : 'border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900 text-slate-700 dark:text-steel-300'
                }`}
              >
                <FileCode className="h-3.5 w-3.5" />
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
