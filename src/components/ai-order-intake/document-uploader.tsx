'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, Image as ImageIcon, CheckCircle, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SAMPLE_PRESETS } from '@/lib/ai/providers/mock-provider';
import { SampleDocumentPreset } from '@/types/ai-order-intake';
import { cn } from '@/lib/utils';

interface DocumentUploaderProps {
  onFileSelected: (file: { name: string; type: string; size: number }, presetId?: string) => void;
  isProcessing: boolean;
  uploadProgress: number;
}

export function DocumentUploader({
  onFileSelected,
  isProcessing,
  uploadProgress,
}: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFileName(file.name);
      onFileSelected({ name: file.name, type: file.type, size: file.size });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      onFileSelected({ name: file.name, type: file.type, size: file.size });
    }
  };

  const handlePresetSelect = (preset: SampleDocumentPreset) => {
    setSelectedFileName(preset.fileName);
    onFileSelected({ name: preset.fileName, type: 'application/pdf', size: 1024 * 450 }, preset.id);
  };

  return (
    <div className="space-y-4">
      {/* Drag and Drop Container */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden',
          isDragging
            ? 'border-brand-500 bg-brand-500/10 scale-[1.01]'
            : 'border-slate-300 dark:border-steel-700 bg-slate-50/50 dark:bg-steel-900/50 hover:border-brand-500/60 dark:hover:border-brand-500/60',
          isProcessing && 'pointer-events-none opacity-80'
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,.pdf,.webp,.png,.jpg"
          className="hidden"
        />

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 mb-3 shadow-inner">
          <Upload className="h-7 w-7" />
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
          {selectedFileName || 'Drag & Drop Order Document'}
        </h3>

        <p className="text-xs text-slate-500 dark:text-steel-400 text-center max-w-md mb-4 leading-relaxed">
          Upload <strong>WhatsApp screenshots</strong>, <strong>PDF Purchase Orders</strong>, <strong>scanned paper quotes</strong>, or <strong>blueprint photos</strong> for automated OCR & AI extraction.
        </p>

        {/* Upload Format Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-semibold text-slate-500 dark:text-steel-400">
          <span className="flex items-center gap-1 rounded-full bg-slate-200/80 dark:bg-steel-800 px-2.5 py-1">
            <ImageIcon className="h-3 w-3 text-emerald-500" /> WhatsApp Chat Screenshots
          </span>
          <span className="flex items-center gap-1 rounded-full bg-slate-200/80 dark:bg-steel-800 px-2.5 py-1">
            <FileText className="h-3 w-3 text-brand-500" /> PDF Purchase Orders
          </span>
          <span className="flex items-center gap-1 rounded-full bg-slate-200/80 dark:bg-steel-800 px-2.5 py-1">
            <Sparkles className="h-3 w-3 text-purple-500" /> Scanned Drawings & Sketches
          </span>
        </div>

        {/* Uploading Progress Bar */}
        {isProcessing && (
          <div className="absolute inset-0 bg-white/90 dark:bg-steel-900/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 z-10 animate-in fade-in duration-150">
            <div className="w-full max-w-xs space-y-2 text-center">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-steel-200">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-brand-500 animate-spin" /> Ingesting & OCR Processing...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-steel-800 overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pre-loaded Sample Presets for Quick Demonstration */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-steel-400 font-semibold px-1">
          <span>Or test instant demo document presets:</span>
          <span className="text-[10px] text-brand-500 font-bold">Try Sample Dataset</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset)}
              disabled={isProcessing}
              className="flex flex-col text-left p-3 rounded-xl border border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900/80 hover:border-brand-500 dark:hover:border-brand-500 transition-all hover:shadow-sm disabled:opacity-50"
            >
              <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                {preset.title}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-steel-400 line-clamp-1 mt-0.5">
                {preset.description}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
