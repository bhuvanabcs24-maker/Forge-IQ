'use client';

import React, { useState } from 'react';
import { ExtractedCadGeometry } from '@/types/cad';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut } from 'lucide-react';

export function CadViewer({ geometry }: { geometry: ExtractedCadGeometry }) {
  const [showCuts, setShowCuts] = useState(true);
  const [showBends, setShowBends] = useState(true);
  const [showHoles, setShowHoles] = useState(true);
  const [showWelds, setShowWelds] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Derive bounding box and dynamic viewBox from analyzed geometry
  const partWidth = geometry.dimensions?.lengthMm || 400;
  const partHeight = geometry.dimensions?.widthMm || 300;
  const padding = 25;
  const viewBoxStr = `-${padding} -${padding} ${partWidth + padding * 2} ${partHeight + padding * 2}`;

  const vectorEntities = geometry.vectorEntities || [];
  const outerCutEntities = vectorEntities.filter((e) => e.type === 'outer_cut');
  const internalCutEntities = vectorEntities.filter((e) => e.type === 'internal_cut');
  const holeEntities = vectorEntities.filter((e) => e.type === 'hole');
  const bendEntities = vectorEntities.filter((e) => e.type === 'bend');
  const weldEntities = vectorEntities.filter((e) => e.type === 'weld');

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

        {/* Geometry Layer Toggles - strictly synchronized with telemetry counts */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCuts(!showCuts)}
            className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
              showCuts ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'text-steel-500 border-steel-800'
            }`}
          >
            Outer Cut ({geometry.cutLengthMm}mm)
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
            Welds ({geometry.weldCount || weldEntities.length})
          </button>

          <div className="flex items-center gap-1 pl-2 border-l border-steel-800">
            <button
              onClick={() => setZoomLevel(Math.min(1.6, zoomLevel + 0.1))}
              className="p-1 text-steel-400 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(Math.max(0.6, zoomLevel - 0.1))}
              className="p-1 text-steel-400 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Synchronized Vector Canvas */}
      <div className="relative h-80 w-full overflow-hidden rounded-xl bg-steel-900 border border-steel-800 flex items-center justify-center industrial-grid">
        <svg
          viewBox={viewBoxStr}
          className="w-full h-full max-w-lg transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* 1. Outer Cut Boundary (Render exact polygon points if available) */}
          {showCuts && outerCutEntities.length > 0 && outerCutEntities.map((cut) => {
            if (cut.geometry_type === 'polygon' && cut.points) {
              const ptsStr = cut.points.map((p) => `${p[0]},${p[1]}`).join(' ');
              return (
                <polygon
                  key={cut.id}
                  points={ptsStr}
                  fill="rgba(37, 99, 235, 0.08)"
                  stroke="#3B82F6"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
              );
            }
            return null;
          })}

          {/* Fallback Outer Cut if no polygon vector */}
          {showCuts && outerCutEntities.length === 0 && (
            <rect
              x="0"
              y="0"
              width={partWidth}
              height={partHeight}
              rx="10"
              fill="rgba(37, 99, 235, 0.08)"
              stroke="#3B82F6"
              strokeWidth="2.5"
            />
          )}
 
          {/* Internal Cutouts & Slots */}
          {showCuts && internalCutEntities.map((cut) => {
            if (cut.geometry_type === 'polygon' && cut.points) {
              const ptsStr = cut.points.map((p) => `${p[0]},${p[1]}`).join(' ');
              return (
                <polygon
                  key={cut.id}
                  points={ptsStr}
                  fill="rgba(245, 158, 11, 0.15)"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeDasharray="4,2"
                  strokeLinejoin="round"
                />
              );
            }
            return null;
          })}

          {/* 2. Press Brake Bend Lines (Render exact start/end coordinates) */}
          {showBends && bendEntities.map((bend, idx) => {
            const start = bend.start || [0, 0];
            const end = bend.end || [0, partHeight];
            const midX = (start[0] + end[0]) / 2;
            const midY = (start[1] + end[1]) / 2;

            return (
              <g key={bend.id}>
                <line
                  x1={start[0]}
                  y1={start[1]}
                  x2={end[0]}
                  y2={end[1]}
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeDasharray="6,4"
                />
                <text
                  x={midX + 4}
                  y={midY}
                  fill="#F59E0B"
                  fontSize="8"
                  fontWeight="bold"
                >
                  Bend #{idx + 1} ({bend.angle_deg || 90}°)
                </text>
              </g>
            );
          })}

          {/* 3. Cutout Holes (Render exact circle coordinates matching telemetry count) */}
          {showHoles && holeEntities.map((h, idx) => {
            const center = h.center || [0, 0];
            const radius = h.radius || 6;
            return (
              <g key={h.id}>
                <circle
                  cx={center[0]}
                  cy={center[1]}
                  r={radius}
                  fill="rgba(239, 68, 68, 0.25)"
                  stroke="#EF4444"
                  strokeWidth="1.8"
                />
                {/* Subtle center marker */}
                <line x1={center[0] - 2} y1={center[1]} x2={center[0] + 2} y2={center[1]} stroke="#EF4444" strokeWidth="0.8" />
                <line x1={center[0]} y1={center[1] - 2} x2={center[0]} y2={center[1] + 2} stroke="#EF4444" strokeWidth="0.8" />
              </g>
            );
          })}

          {/* 4. Robotic Weld Seams (Render exact weld lines) */}
          {showWelds && weldEntities.map((weld) => {
            const start = weld.start || [0, 0];
            const end = weld.end || [100, 0];
            return (
              <g key={weld.id}>
                <line
                  x1={start[0]}
                  y1={start[1]}
                  x2={end[0]}
                  y2={end[1]}
                  stroke="#8B5CF6"
                  strokeWidth="3"
                  strokeDasharray="3,3"
                />
                <text
                  x={(start[0] + end[0]) / 2}
                  y={start[1] - 4}
                  fill="#8B5CF6"
                  fontSize="7"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  Weld Seam
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend Overlay */}
        <div className="absolute bottom-2 left-2 flex items-center gap-3 bg-steel-950/80 px-3 py-1.5 rounded-lg border border-steel-800 text-[10px]">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Outer Cut ({geometry.cutLengthMm}mm)</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Bends ({geometry.bendCount})</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> Cutout Holes ({geometry.holeCount})</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-purple-500" /> Weld Seams ({geometry.weldCount || weldEntities.length})</span>
        </div>
      </div>
    </div>
  );
}
