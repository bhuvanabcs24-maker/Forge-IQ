'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CadFileType } from '@/types/cad';
import { UploadCloud, FileCode, CheckCircle2, Sparkles, FileText, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CadUploaderProps {
  onFileSelect: (fileName: string, fileType: CadFileType, fileSize: number) => void;
}

export function CadUploader({ onFileSelect }: CadUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<string>('Avionics_HeatSink_Flange.dxf');
  const [isDragging, setIsDragging] = useState(false);
  const [fileSizeText, setFileSizeText] = useState<string>('480 KB');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presets = [
    { name: 'Avionics_HeatSink_Flange.dxf', type: 'dxf' as CadFileType, size: 1024 * 480 },
    { name: 'NEMA_4X_Enclosure_Bracket.step', type: 'step' as CadFileType, size: 1024 * 1850 },
    { name: 'Excavator_Bucket_Liner.dwg', type: 'dwg' as CadFileType, size: 1024 * 920 },
  ];

  const detectFileType = (fileName: string): CadFileType => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (ext === 'step' || ext === 'stp') return 'step';
    if (ext === 'dwg') return 'dwg';
    if (ext === 'svg') return 'svg';
    if (ext === 'pdf') return 'pdf';
    return 'dxf';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processFile = (file: File) => {
    const fileType = detectFileType(file.name);
    setSelectedFile(file.name);
    setFileSizeText(formatFileSize(file.size));
    onFileSelect(file.name, fileType, file.size);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const handlePresetSelect = (name: string, type: CadFileType, size: number) => {
    setSelectedFile(name);
    setFileSizeText(formatFileSize(size));
    onFileSelect(name, type, size);
  };

  return (
    <div className="space-y-3">
      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".dxf,.dwg,.step,.stp,.svg,.pdf"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Interactive Drag & Drop Area */}
      <Card
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'border-dashed border-2 transition-all cursor-pointer select-none',
          isDragging
            ? 'border-purple-500 bg-purple-500/15 ring-4 ring-purple-500/20 scale-[1.008]'
            : 'border-slate-300 dark:border-steel-700 bg-slate-50/50 dark:bg-steel-900/40 hover:border-purple-500/60 hover:bg-slate-100/50 dark:hover:bg-steel-900/70'
        )}
      >
        <CardContent className="p-8 text-center space-y-4">
          <div
            className={cn(
              'mx-auto flex h-14 w-14 items-center justify-center rounded-2xl transition-all shadow-md',
              isDragging
                ? 'bg-purple-600 text-white scale-110 animate-bounce'
                : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
            )}
          >
            <UploadCloud className="h-7 w-7" />
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center justify-center gap-2">
              {isDragging ? (
                <span className="text-purple-400 font-extrabold animate-pulse">
                  Drop CAD drawing here to analyze...
                </span>
              ) : (
                <span>Drag & Drop CAD Drawings or Engineering Specs</span>
              )}
            </h4>
            <p className="text-xs text-slate-500 dark:text-steel-400 mt-1.5 max-w-md mx-auto">
              Supports <strong className="text-slate-300">DXF, DWG, STEP (.step/.stp), SVG</strong>, and <strong className="text-slate-300">Vector PDF</strong> engineering prints up to 50MB
            </p>
          </div>

          {/* Click to Browse Helper Button */}
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 text-xs font-semibold"
            >
              <FileCode className="h-3.5 w-3.5 mr-1.5" />
              Browse Local CAD File
            </Button>
          </div>

          {/* Active / Loaded File Feedback Strip */}
          {selectedFile && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-steel-700 text-xs text-slate-200 shadow-inner">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-mono font-medium">{selectedFile}</span>
              <span className="text-[10px] text-slate-400">({fileSizeText})</span>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[9px] uppercase px-1.5 py-0">
                {detectFileType(selectedFile)}
              </Badge>
            </div>
          )}

          {/* Sample Drawing Presets */}
          <div className="pt-2 border-t border-slate-200 dark:border-steel-800/80">
            <span className="text-[11px] text-slate-400 font-semibold block mb-2">
              Or Try One of Our CAD Presets:
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePresetSelect(preset.name, preset.type, preset.size);
                  }}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all',
                    selectedFile === preset.name
                      ? 'border-brand-500 bg-brand-500/15 text-brand-400 shadow-sm'
                      : 'border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900 text-slate-700 dark:text-steel-300 hover:border-slate-400 dark:hover:border-steel-600'
                  )}
                >
                  <FileCode className="h-3.5 w-3.5" />
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
