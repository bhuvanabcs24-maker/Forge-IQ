'use client';

import React, { useState } from 'react';
import { ExtractedCadGeometry } from '@/types/cad';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Layers, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export function CadViewer({ geometry }: { geometry: ExtractedCadGeometry }) {
  const [showCuts, setShowCuts] = useState(true);
  const [showBends, setShowBends] = useState(true);
  const [showHoles, setShowHoles] = useState(true);
  const [showWelds, setShowWelds] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-steel-800 bg-slate-950 p-4 space-y-3 text-xs">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-steel-800 pb-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30 font-mono">
            {geometry.fileType.toUpperCase()} Vector Engine
          </Badge>
          <span className="text-slate-200 font-bold text-xs">{geometry.partName}</span>
        </div>

        {/* Geometry Layer Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCuts(!showCuts)}
            className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
              showCuts ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'text-steel-500 border-steel-800'
            }`}
          >
            Outer Cut
          </button>
          <button
            onClick={() => setShowBends(!showBends)}
            className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
              showBends ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'text-steel-500 border-steel-800'
            }`}
          >
            Bends ({geometry.bendCount})
          </button>
          <button
            onClick={() => setShowHoles(!showHoles)}
            className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
              showHoles ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'text-steel-500 border-steel-800'
            }`}
          >
            Holes ({geometry.holeCount})
          </button>
          <button
            onClick={() => setShowWelds(!showWelds)}
            className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
              showWelds ? 'bg-purple-500/20 text-purple-400 border-purple-500/40' : 'text-steel-500 border-steel-800'
            }`}
          >
            Welds
          </button>

          <div className="flex items-center gap-1 pl-2 border-l border-steel-800">
            <button
              onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.1))}
              className="p-1 text-steel-400 hover:text-white"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(Math.max(0.7, zoomLevel - 0.1))}
              className="p-1 text-steel-400 hover:text-white"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Vector Canvas */}
      <div className="relative h-80 w-full overflow-hidden rounded-xl bg-steel-900 border border-steel-800 flex items-center justify-center industrial-grid">
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full max-w-lg transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Outer Boundary Cut Line */}
          {showCuts && (
            <rect
              x="30"
              y="30"
              width="340"
              height="240"
              rx="8"
              fill="rgba(37, 99, 235, 0.08)"
              stroke="#3B82F6"
              strokeWidth="2.5"
            />
          )}

          {/* Press Brake Bend Lines (Amber Dashed) */}
          {showBends && (
            <>
              <line x1="120" y1="30" x2="120" y2="270" stroke="#F59E0B" strokeWidth="2" strokeDasharray="6,4" />
              <line x1="280" y1="30" x2="280" y2="270" stroke="#F59E0B" strokeWidth="2" strokeDasharray="6,4" />
              <text x="125" y="45" fill="#F59E0B" fontSize="10" fontWeight="bold">Bend Line #1 (90°)</text>
              <text x="285" y="45" fill="#F59E0B" fontSize="10" fontWeight="bold">Bend Line #2 (90°)</text>
            </>
          )}

          {/* Cutout Holes (Red Circles) */}
          {showHoles && (
            <>
              <circle cx="70" cy="70" r="14" fill="rgba(239, 68, 68, 0.2)" stroke="#EF4444" strokeWidth="2" />
              <circle cx="70" cy="230" r="14" fill="rgba(239, 68, 68, 0.2)" stroke="#EF4444" strokeWidth="2" />
              <circle cx="330" cy="70" r="14" fill="rgba(239, 68, 68, 0.2)" stroke="#EF4444" strokeWidth="2" />
              <circle cx="330" cy="230" r="14" fill="rgba(239, 68, 68, 0.2)" stroke="#EF4444" strokeWidth="2" />
              <circle cx="200" cy="150" r="28" fill="rgba(239, 68, 68, 0.2)" stroke="#EF4444" strokeWidth="2" />
            </>
          )}

          {/* Weld Seams (Purple Hash Lines) */}
          {showWelds && (
            <line x1="30" y1="270" x2="370" y2="270" stroke="#8B5CF6" strokeWidth="3" strokeDasharray="3,3" />
          )}
        </svg>

        {/* Legend Overlay */}
        <div className="absolute bottom-2 left-2 flex items-center gap-3 bg-steel-950/80 px-3 py-1.5 rounded-lg border border-steel-800 text-[10px]">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Cut Perimeter</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Bends</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> Cutout Holes</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-purple-500" /> Weld Seam</span>
        </div>
      </div>
    </div>
  );
}
