import React, { useState } from 'react';
import {
  ItemCalculationResult,
  CombinedProjectCalculation,
  ConstantProfilesConfig,
} from '../types';
import { Architectural3DViewer } from './Architectural3DViewer';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Tag,
  Info,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Box,
  LayoutGrid,
  Columns,
  Sparkles,
} from 'lucide-react';

interface PreviewSkeletonProps {
  calculation: CombinedProjectCalculation;
  constants: ConstantProfilesConfig;
}

export const PreviewSkeleton: React.FC<PreviewSkeletonProps> = ({
  calculation,
  constants,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'3d' | '2d' | 'split'>('3d');
  const [showLabels, setShowLabels] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!calculation.items || calculation.items.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
        No fabrication items found for preview.
      </div>
    );
  }

  const currentItem = calculation.items[selectedIndex];
  const { item, cuts, glasses } = currentItem;
  const { width: W, height: H, kind, tag, quantity } = item;

  // ViewBox sizing with padding for dimension lines and labels
  const padX = 140;
  const padY = 120;
  const svgWidth = W + padX * 2;
  const svgHeight = H + padY * 2;

  // Outer frame origin
  const originX = padX;
  const originY = padY;

  return (
    <div className="space-y-6">
      {/* Top Header & Controller Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800 text-base">
                Interactive Architectural Preview
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                2D & 3D Studio
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Photorealistic 3D architectural simulation, opening mechanisms, and 2D CAD blueprint wireframes
            </p>
          </div>
        </div>

        {/* View Mode Tabs (3D, 2D, Dual Split) */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode('3d')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === '3d'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Architectural</span>
          </button>

          <button
            onClick={() => setViewMode('2d')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === '2d'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>2D CAD Blueprint</span>
          </button>

          <button
            onClick={() => setViewMode('split')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'split'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Side-by-side 2D & 3D CAD workspace"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Dual 2D + 3D</span>
          </button>
        </div>

        {/* Item Selector Tabs / Carousel */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setSelectedIndex((prev) => Math.max(0, prev - 1))}
            disabled={selectedIndex === 0}
            className="p-1.5 rounded-md hover:bg-white text-slate-600 disabled:opacity-40 transition-colors"
            title="Previous item"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate-700 px-2 font-mono">
            Unit {selectedIndex + 1} of {calculation.items.length}
          </span>
          <button
            onClick={() =>
              setSelectedIndex((prev) => Math.min(calculation.items.length - 1, prev + 1))
            }
            disabled={selectedIndex === calculation.items.length - 1}
            className="p-1.5 rounded-md hover:bg-white text-slate-600 disabled:opacity-40 transition-colors"
            title="Next item"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 2D Zoom & View Toggles (if 2D or split mode is active) */}
        {viewMode !== '3d' && (
          <div className="flex items-center gap-2 animate-in fade-in">
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                showLabels
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              Labels: {showLabels ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={() => setShowDimensions(!showDimensions)}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                showDimensions
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Dimensions: {showDimensions ? 'ON' : 'OFF'}
            </button>

            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
              <button
                onClick={() => setZoomLevel((prev) => Math.max(0.6, Number((prev - 0.15).toFixed(2))))}
                className="p-1.5 text-slate-600 hover:bg-slate-100"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono font-medium text-slate-700 px-2">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((prev) => Math.min(1.8, Number((prev + 0.15).toFixed(2))))}
                className="p-1.5 text-slate-600 hover:bg-slate-100"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Item Quick Carousel Selector Cards */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {calculation.items.map((it, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <button
              key={it.item.id}
              onClick={() => setSelectedIndex(idx)}
              className={`shrink-0 text-left px-3.5 py-2.5 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  #{idx + 1}
                </span>
                <span className="text-xs font-semibold truncate max-w-[150px]">
                  {it.item.tag || `Unit #${idx + 1}`}
                </span>
              </div>
              <div
                className={`text-[11px] mt-1 font-mono ${
                  isSelected ? 'text-blue-100' : 'text-slate-500'
                }`}
              >
                {it.item.width} × {it.item.height} mm (Qty: {it.item.quantity})
              </div>
            </button>
          );
        })}
      </div>

      {/* VIEWPORT MODE RENDERING */}

      {/* 1. PURE 3D ARCHITECTURAL STUDIO MODE */}
      {viewMode === '3d' && (
        <div className="space-y-6">
          <Architectural3DViewer
            key={`3d-view-${currentItem.item.id}-${selectedIndex}`}
            itemResult={currentItem}
            constants={constants}
          />

          {/* Quick specs bar under 3D */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Unit Identification</span>
                <div className="font-bold text-sm text-slate-800 capitalize mt-0.5">
                  {currentItem.item.tag} &bull; {currentItem.item.kind.replace(/_/g, ' ')}
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200">
                Qty: {currentItem.item.quantity}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Overall Fabrication Size</span>
                <div className="font-mono font-bold text-sm text-slate-800 mt-0.5">
                  {W} mm (W) × {H} mm (H)
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Area: {((W * H) / 1000000).toFixed(2)} m²
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Glass Panes & Cuts</span>
                <div className="font-bold text-sm text-slate-800 mt-0.5">
                  {glasses.length} Glass Pane(s) &bull; {cuts.length} Aluminium Cuts
                </div>
              </div>
              <button
                onClick={() => setViewMode('2d')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 underline"
              >
                View 2D Cuts &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. DUAL SPLIT VIEW (2D CAD WIREFRAME + 3D STUDIO SIDE-BY-SIDE) */}
      {viewMode === 'split' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* 3D Viewer Side */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-blue-600" />
                  <span>3D Architectural View</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Orbit / Zoom Enabled</span>
              </div>
              <Architectural3DViewer
                key={`split-3d-${currentItem.item.id}-${selectedIndex}`}
                itemResult={currentItem}
                constants={constants}
              />
            </div>

            {/* 2D CAD Blueprint Side */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <LayoutGrid className="w-3.5 h-3.5 text-sky-600" />
                  <span>2D CAD Blueprint & Dimensions</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Drafting Layout</span>
              </div>
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-inner flex flex-col items-center justify-center min-h-[500px] sm:min-h-[560px] overflow-hidden relative">
                <div className="w-full h-full flex items-center justify-center overflow-auto">
                  <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="max-h-[460px] max-w-full drop-shadow-md select-none"
                    style={{ minWidth: '280px' }}
                  >
                    <defs>
                      <linearGradient id="glassGradSplit" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                        <stop offset="50%" stopColor="#0284c7" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#0369a1" stopOpacity="0.28" />
                      </linearGradient>
                      <marker id="dimArrowStartSplit" markerWidth="6" markerHeight="6" refX="2" refY="3" orient="auto">
                        <path d="M6,0 L0,3 L6,6 L4,3 Z" fill="#94a3b8" />
                      </marker>
                      <marker id="dimArrowEndSplit" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
                        <path d="M0,0 L6,3 L0,6 L2,3 Z" fill="#94a3b8" />
                      </marker>
                    </defs>

                    <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="#0f172a" />
                    <rect x={originX} y={originY} width={W} height={H} fill="#1e293b" stroke="#94a3b8" strokeWidth="4" rx="2" />

                    {renderSkeletonLayout(item, constants, originX, originY, W, H, glasses, showLabels)}

                    {showDimensions && (
                      <g className="dimension-lines">
                        <line x1={originX} y1={originY - 35} x2={originX + W} y2={originY - 35} stroke="#94a3b8" strokeWidth="1.5" markerStart="url(#dimArrowStartSplit)" markerEnd="url(#dimArrowEndSplit)" />
                        <line x1={originX} y1={originY - 5} x2={originX} y2={originY - 45} stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1={originX + W} y1={originY - 5} x2={originX + W} y2={originY - 45} stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
                        <rect x={originX + W / 2 - 50} y={originY - 48} width="100" height="24" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
                        <text x={originX + W / 2} y={originY - 32} fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                          W: {W} mm
                        </text>

                        <line x1={originX - 35} y1={originY} x2={originX - 35} y2={originY + H} stroke="#94a3b8" strokeWidth="1.5" markerStart="url(#dimArrowStartSplit)" markerEnd="url(#dimArrowEndSplit)" />
                        <line x1={originX - 5} y1={originY} x2={originX - 45} y2={originY} stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1={originX - 5} y1={originY + H} x2={originX - 45} y2={originY + H} stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
                        <rect x={originX - 95} y={originY + H / 2 - 12} width="100" height="24" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
                        <text x={originX - 45} y={originY + H / 2 + 4} fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                          H: {H} mm
                        </text>
                      </g>
                    )}
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Cuts & Glass Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Glass Sizes */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
                <span>Glass Cut Sizes ({glasses.length} Panes)</span>
                <span className="text-[11px] text-blue-600 font-mono">{((W * H) / 1000000).toFixed(2)} m² Total Area</span>
              </h4>
              <div className="space-y-2.5">
                {glasses.map((g, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-sky-50/60 border border-sky-200/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-sky-950">{g.paneDescription}</div>
                      <div className="text-[11px] text-sky-700 font-mono mt-0.5">
                        {g.width} mm (W) × {g.height} mm (H)
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-sky-900">{g.areaM2} m²</div>
                      <div className="text-[10px] text-sky-600">Qty: {g.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Frame Cuts */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
                <span>Aluminium Profile Cuts Required ({cuts.length} Pieces)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                {cuts.map((c) => (
                  <div key={c.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div className="truncate pr-1">
                      <div className="font-medium text-slate-800 truncate">{c.purpose}</div>
                      <div className="text-[10px] text-slate-500 truncate">{c.profileName}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-slate-800">{c.length} mm</div>
                      <div className="text-[10px] text-slate-500">{c.quantity} pcs ({c.cutAngle})</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. PURE 2D BLUEPRINT CAD WIREFRAME MODE */}
      {viewMode === '2d' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* SVG Drawing Canvas Area */}
          <div className="lg:col-span-8 bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-inner flex flex-col items-center justify-center min-h-[480px] overflow-hidden relative">
            <div className="absolute top-3 left-4 text-xs font-mono text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-slate-200">{tag}</span>
              <span className="text-slate-600">|</span>
              <span className="capitalize text-slate-300">{kind.replace(/_/g, ' ')}</span>
            </div>

            <div
              className="w-full h-full flex items-center justify-center transition-transform duration-200 overflow-auto p-4"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
            >
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="max-h-[420px] max-w-full drop-shadow-md select-none"
                style={{ minWidth: '320px' }}
              >
                <defs>
                  {/* Glass Gradient */}
                  <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                    <stop offset="50%" stopColor="#0284c7" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#0369a1" stopOpacity="0.28" />
                  </linearGradient>
                  {/* Aluminum Profile Pattern */}
                  <pattern id="aluHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="8" stroke="#64748b" strokeWidth="1" opacity="0.3" />
                  </pattern>
                  {/* Arrow markers for dimensions */}
                  <marker id="dimArrowStart" markerWidth="6" markerHeight="6" refX="2" refY="3" orient="auto">
                    <path d="M6,0 L0,3 L6,6 L4,3 Z" fill="#94a3b8" />
                  </marker>
                  <marker id="dimArrowEnd" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 L2,3 Z" fill="#94a3b8" />
                  </marker>
                </defs>

                {/* Background blueprint grid subtle lines */}
                <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="#0f172a" />

                {/* 1. OUTER MAIN FRAME RECTANGLE */}
                <rect
                  x={originX}
                  y={originY}
                  width={W}
                  height={H}
                  fill="#1e293b"
                  stroke="#94a3b8"
                  strokeWidth="4"
                  rx="2"
                />

                {/* Render Type-Specific Elements */}
                {renderSkeletonLayout(item, constants, originX, originY, W, H, glasses, showLabels)}

                {/* 2. DIMENSION LINES */}
                {showDimensions && (
                  <g className="dimension-lines">
                    {/* Top Width Dimension Line */}
                    <line
                      x1={originX}
                      y1={originY - 35}
                      x2={originX + W}
                      y2={originY - 35}
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                      markerStart="url(#dimArrowStart)"
                      markerEnd="url(#dimArrowEnd)"
                    />
                    {/* Extension lines */}
                    <line x1={originX} y1={originY - 5} x2={originX} y2={originY - 45} stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1={originX + W} y1={originY - 5} x2={originX + W} y2={originY - 45} stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
                    {/* Text Badge */}
                    <rect
                      x={originX + W / 2 - 50}
                      y={originY - 48}
                      width="100"
                      height="24"
                      rx="4"
                      fill="#0f172a"
                      stroke="#38bdf8"
                      strokeWidth="1"
                    />
                    <text
                      x={originX + W / 2}
                      y={originY - 32}
                      fill="#38bdf8"
                      fontSize="13"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      W: {W} mm
                    </text>

                    {/* Left Height Dimension Line */}
                    <line
                      x1={originX - 35}
                      y1={originY}
                      x2={originX - 35}
                      y2={originY + H}
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                      markerStart="url(#dimArrowStart)"
                      markerEnd="url(#dimArrowEnd)"
                    />
                    {/* Extension lines */}
                    <line x1={originX - 5} y1={originY} x2={originX - 45} y2={originY} stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1={originX - 5} y1={originY + H} x2={originX - 45} y2={originY + H} stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
                    {/* Text Badge */}
                    <rect
                      x={originX - 95}
                      y={originY + H / 2 - 12}
                      width="100"
                      height="24"
                      rx="4"
                      fill="#0f172a"
                      stroke="#38bdf8"
                      strokeWidth="1"
                    />
                    <text
                      x={originX - 45}
                      y={originY + H / 2 + 4}
                      fill="#38bdf8"
                      fontSize="13"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      H: {H} mm
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {/* Blueprint Legend bar */}
            <div className="w-full mt-4 flex flex-wrap gap-4 text-[10px] uppercase font-bold text-slate-400 border-t border-slate-800 pt-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-slate-400 rounded-sm"></span> Main Outer Frame
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></span> Operable Sash
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-sky-400 rounded-sm"></span> Glass Infill
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-amber-400 rounded-full"></span> Rollers / Handles
              </span>
            </div>
          </div>

          {/* Right Details Panel: Components, Cut Specifications & Glass Sizes */}
          <div className="lg:col-span-4 space-y-4">
            {/* Unit Card Header */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                  #{selectedIndex + 1} | {item.tag}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  Qty: <strong className="text-slate-800 font-semibold">{quantity} unit(s)</strong>
                </span>
              </div>
              <div className="text-sm font-semibold text-slate-800 capitalize">
                {kind.replace(/_/g, ' ')}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Overall Size: <span className="font-mono font-medium text-slate-700">{W} × {H} mm</span>
              </div>
            </div>

            {/* Glass Sizes for this unit */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
                <span>1-Pane Glass Cut Sizes</span>
                <span className="text-[11px] text-blue-600 font-normal">{glasses.length} pane(s)</span>
              </h4>
              <div className="space-y-2.5">
                {glasses.map((g, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-sky-50/60 border border-sky-200/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-sky-950">{g.paneDescription}</div>
                      <div className="text-[11px] text-sky-700 font-mono mt-0.5">
                        {g.width} mm (W) × {g.height} mm (H)
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-sky-900">{g.areaM2} m²</div>
                      <div className="text-[10px] text-sky-600">Qty: {g.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Frame Cuts for this unit */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
                <span>Frame Cuts Required</span>
                <span className="text-[11px] text-slate-500 font-normal">{cuts.length} pieces</span>
              </h4>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {cuts.map((c) => (
                  <div
                    key={c.id}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-medium text-slate-800">{c.purpose}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[170px]">
                        {c.profileName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-800">{c.length} mm</div>
                      <div className="text-[10px] text-slate-500">
                        {c.quantity} pcs ({c.cutAngle})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper SVG Generator for Different Window / Door Types
function renderSkeletonLayout(
  item: any,
  constants: ConstantProfilesConfig,
  x: number,
  y: number,
  w: number,
  h: number,
  glasses: any[],
  showLabels: boolean
) {
  const kind = item.kind;
  const frameThickness = 30; // visual representation in px

  // 1. Fixed Window in Sliding Outer Frame
  if (kind === 'sliding_fixed_window') {
    const glassX = x + frameThickness + 10;
    const glassY = y + frameThickness + 10;
    const glassW = Math.max(10, w - (frameThickness + 10) * 2);
    const glassH = Math.max(10, h - (frameThickness + 10) * 2);
    const glassItem = glasses[0];

    return (
      <g>
        {/* Top Track */}
        <rect x={x} y={y} width={w} height={frameThickness} fill="#334155" stroke="#64748b" strokeWidth="1" />
        {/* Bottom Track */}
        <rect x={x} y={y + h - frameThickness} width={w} height={frameThickness} fill="#334155" stroke="#64748b" strokeWidth="1" />
        {/* Left Jamb */}
        <rect x={x} y={y + frameThickness} width={frameThickness} height={h - frameThickness * 2} fill="#334155" stroke="#64748b" strokeWidth="1" />
        {/* Right Jamb */}
        <rect x={x + w - frameThickness} y={y + frameThickness} width={frameThickness} height={h - frameThickness * 2} fill="#334155" stroke="#64748b" strokeWidth="1" />

        {/* Fixed Glass Infill */}
        <rect x={glassX} y={glassY} width={glassW} height={glassH} fill="url(#glassGrad)" stroke="#38bdf8" strokeWidth="2" />
        <line x1={glassX + 20} y1={glassY + 20} x2={glassX + glassW - 20} y2={glassY + glassH - 20} stroke="#ffffff" strokeWidth="1" strokeOpacity="0.2" />

        {showLabels && (
          <g>
            <text x={x + w / 2} y={y + 19} fill="#cbd5e1" fontSize="10" fontWeight="bold" textAnchor="middle">
              Sliding Head Track [{w}mm] (Fixed Pane System)
            </text>
            {glassItem && (
              <g transform={`translate(${glassX + glassW / 2}, ${glassY + glassH / 2})`}>
                <rect x="-85" y="-16" width="170" height="32" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                <text x="0" y="-1" fill="#93c5fd" fontSize="10" fontWeight="bold" textAnchor="middle">
                  Sliding Fixed Glass Pane
                </text>
                <text x="0" y="11" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  {glassItem.width} × {glassItem.height} mm
                </text>
              </g>
            )}
          </g>
        )}
      </g>
    );
  }

  // 2. Sliding 2-Panel with 1 Fixed Panel + 1 Sliding Sash ("OX")
  if (kind === 'sliding_1_fixed_1_sliding') {
    const bayW = (w - frameThickness * 2) / 2;
    const sashBorder = 25;

    // Left Fixed Pane
    const fixedGlassX = x + frameThickness + 10;
    const fixedGlassY = y + frameThickness + 10;
    const fixedGlassW = bayW - 15;
    const fixedGlassH = h - frameThickness * 2 - 20;

    // Right Operable Sliding Sash
    const sashX = x + frameThickness + bayW - 10;
    const sashY = y + frameThickness + 5;
    const sashW = bayW + 10;
    const sashH = h - frameThickness * 2 - 10;

    const opGlassX = sashX + sashBorder;
    const opGlassY = sashY + sashBorder;
    const opGlassW = Math.max(10, sashW - sashBorder * 2);
    const opGlassH = Math.max(10, sashH - sashBorder * 2);

    return (
      <g>
        {/* Outer Frame */}
        <rect x={x} y={y} width={w} height={frameThickness} fill="#334155" stroke="#64748b" strokeWidth="1" />
        <rect x={x} y={y + h - frameThickness} width={w} height={frameThickness} fill="#334155" stroke="#64748b" strokeWidth="1" />
        <rect x={x} y={y + frameThickness} width={frameThickness} height={h - frameThickness * 2} fill="#334155" stroke="#64748b" strokeWidth="1" />
        <rect x={x + w - frameThickness} y={y + frameThickness} width={frameThickness} height={h - frameThickness * 2} fill="#334155" stroke="#64748b" strokeWidth="1" />

        {/* Panel 1: Fixed Glass */}
        <rect x={fixedGlassX} y={fixedGlassY} width={fixedGlassW} height={fixedGlassH} fill="url(#glassGrad)" stroke="#64748b" strokeWidth="1.5" />
        <g transform={`translate(${fixedGlassX + fixedGlassW / 2}, ${fixedGlassY + 25})`}>
          <rect x="-35" y="-10" width="70" height="20" rx="3" fill="#334155" />
          <text x="0" y="4" fill="#cbd5e1" fontSize="9.5" fontWeight="bold" textAnchor="middle">
            FIXED (O)
          </text>
        </g>

        {/* Panel 2: Operable Sliding Sash */}
        <rect x={sashX} y={sashY} width={sashW} height={sashH} fill="#1e293b" stroke="#60a5fa" strokeWidth="2.5" rx="2" />
        <rect x={opGlassX} y={opGlassY} width={opGlassW} height={opGlassH} fill="url(#glassGrad)" stroke="#38bdf8" strokeWidth="1.5" />

        {/* Sliding Arrow */}
        <g transform={`translate(${sashX + sashW / 2}, ${sashY + sashH / 2})`}>
          <line x1="25" y1="0" x2="-25" y2="0" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" markerEnd="url(#dimArrowEnd)" />
          <circle cx="0" cy="0" r="14" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
          <text x="0" y="4" fill="#e2e8f0" fontSize="9.5" fontWeight="bold" textAnchor="middle">
            SLIDE (X)
          </text>
        </g>

        {/* Rollers */}
        <circle cx={sashX + 25} cy={sashY + sashH - 4} r="3" fill="#f59e0b" />
        <circle cx={sashX + sashW - 25} cy={sashY + sashH - 4} r="3" fill="#f59e0b" />

        {showLabels && (
          <g>
            {glasses[0] && (
              <g transform={`translate(${fixedGlassX + fixedGlassW / 2}, ${fixedGlassY + fixedGlassH - 25})`}>
                <rect x="-60" y="-10" width="120" height="20" rx="3" fill="#0f172a" stroke="#64748b" strokeWidth="0.8" />
                <text x="0" y="3.5" fill="#e2e8f0" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  Fixed: {glasses[0].width}×{glasses[0].height}mm
                </text>
              </g>
            )}
            {glasses[1] && (
              <g transform={`translate(${opGlassX + opGlassW / 2}, ${opGlassY + opGlassH - 25})`}>
                <rect x="-60" y="-10" width="120" height="20" rx="3" fill="#0369a1" stroke="#7dd3fc" strokeWidth="0.8" />
                <text x="0" y="3.5" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  Sash: {glasses[1].width}×{glasses[1].height}mm
                </text>
              </g>
            )}
          </g>
        )}
      </g>
    );
  }

  // 3. Sliding Standard 2, 3, 4 Panel
  if (kind.startsWith('sliding_')) {
    let panels = 2;
    if (kind.includes('3_panel')) panels = 3;
    if (kind.includes('4_panel')) panels = 4;

    const panelW = (w - frameThickness * 2) / panels + 15; // overlap
    const panelH = h - frameThickness * 2;
    const sashBorder = 25;

    return (
      <g>
        {/* Outer Frame Sections */}
        {/* Top Track */}
        <rect x={x} y={y} width={w} height={frameThickness} fill="#334155" stroke="#64748b" strokeWidth="1" />
        {/* Bottom Track */}
        <rect x={x} y={y + h - frameThickness} width={w} height={frameThickness} fill="#334155" stroke="#64748b" strokeWidth="1" />
        {/* Left Jamb */}
        <rect x={x} y={y + frameThickness} width={frameThickness} height={h - frameThickness * 2} fill="#334155" stroke="#64748b" strokeWidth="1" />
        {/* Right Jamb */}
        <rect x={x + w - frameThickness} y={y + frameThickness} width={frameThickness} height={h - frameThickness * 2} fill="#334155" stroke="#64748b" strokeWidth="1" />

        {/* Sliding Sashes */}
        {Array.from({ length: panels }).map((_, idx) => {
          const sashX = x + frameThickness + idx * ((w - frameThickness * 2 - 20) / panels);
          const sashY = y + frameThickness + 5;
          const actualSashW = (w - frameThickness * 2) / panels + (panels > 1 ? 12 : 0);
          const actualSashH = panelH - 10;

          const glassX = sashX + sashBorder;
          const glassY = sashY + sashBorder;
          const glassW = Math.max(10, actualSashW - sashBorder * 2);
          const glassH = Math.max(10, actualSashH - sashBorder * 2);

          const glassItem = glasses[idx] || glasses[0];

          return (
            <g key={idx}>
              {/* Sash Outer Box */}
              <rect
                x={sashX}
                y={sashY}
                width={actualSashW}
                height={actualSashH}
                fill="#1e293b"
                stroke="#60a5fa"
                strokeWidth="2.5"
                rx="2"
              />
              {/* Glass Infill */}
              <rect
                x={glassX}
                y={glassY}
                width={glassW}
                height={glassH}
                fill="url(#glassGrad)"
                stroke="#38bdf8"
                strokeWidth="1.5"
              />
              {/* Glass Diagonal Reflection */}
              <line
                x1={glassX + 15}
                y1={glassY + 15}
                x2={glassX + glassW - 15}
                y2={glassY + glassH - 15}
                stroke="#ffffff"
                strokeWidth="1"
                strokeOpacity="0.25"
              />

              {/* Sliding Direction Arrows */}
              <g transform={`translate(${sashX + actualSashW / 2}, ${sashY + actualSashH / 2})`}>
                <line
                  x1={idx % 2 === 0 ? -25 : 25}
                  y1="0"
                  x2={idx % 2 === 0 ? 25 : -25}
                  y2="0"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                  markerEnd="url(#dimArrowEnd)"
                />
                <circle cx="0" cy="0" r="14" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
                <text
                  x="0"
                  y="4"
                  fill="#e2e8f0"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  S{idx + 1}
                </text>
              </g>

              {/* Rollers marker on bottom */}
              <circle cx={sashX + 25} cy={sashY + actualSashH - 4} r="3" fill="#f59e0b" />
              <circle cx={sashX + actualSashW - 25} cy={sashY + actualSashH - 4} r="3" fill="#f59e0b" />

              {/* Component Labels */}
              {showLabels && (
                <g>
                  {/* Glass Cut Size Label Badge */}
                  {glassItem && (
                    <g transform={`translate(${glassX + glassW / 2}, ${glassY + glassH - 30})`}>
                      <rect
                        x="-70"
                        y="-12"
                        width="140"
                        height="22"
                        rx="3"
                        fill="#0369a1"
                        fillOpacity="0.9"
                        stroke="#7dd3fc"
                        strokeWidth="0.8"
                      />
                      <text
                        x="0"
                        y="3"
                        fill="#ffffff"
                        fontSize="9.5"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        Glass: {glassItem.width}×{glassItem.height}mm
                      </text>
                    </g>
                  )}
                </g>
              )}
            </g>
          );
        })}

        {/* Global Component Callouts if Labels ON */}
        {showLabels && (
          <g>
            <text x={x + w / 2} y={y + 19} fill="#cbd5e1" fontSize="10" fontWeight="bold" textAnchor="middle">
              Top Track (Head) [{w}mm]
            </text>
            <text x={x + w / 2} y={y + h - 11} fill="#cbd5e1" fontSize="10" fontWeight="bold" textAnchor="middle">
              Bottom Track (Sill) [{w}mm]
            </text>
            <text
              x={x + 16}
              y={y + h / 2}
              fill="#cbd5e1"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
              transform={`rotate(-90 ${x + 16} ${y + h / 2})`}
            >
              Side Jamb
            </text>
          </g>
        )}
      </g>
    );
  }

  // 4. Casement Fixed Window (Picture Light with Casement Frame + Snap Bead)
  if (kind === 'casement_fixed_window') {
    const beadBorder = 20;
    const glassX = x + frameThickness + beadBorder;
    const glassY = y + frameThickness + beadBorder;
    const glassW = Math.max(10, w - (frameThickness + beadBorder) * 2);
    const glassH = Math.max(10, h - (frameThickness + beadBorder) * 2);
    const glassItem = glasses[0];

    return (
      <g>
        {/* Casement Outer Frame (Mitered 45°) */}
        <rect x={x} y={y} width={w} height={h} fill="#1e293b" stroke="#64748b" strokeWidth="4" />
        {/* Snap-in Glazing Bead Frame */}
        <rect
          x={x + frameThickness}
          y={y + frameThickness}
          width={w - frameThickness * 2}
          height={h - frameThickness * 2}
          fill="#0f172a"
          stroke="#475569"
          strokeWidth="2"
        />
        {/* Fixed Glass Infill */}
        <rect x={glassX} y={glassY} width={glassW} height={glassH} fill="url(#glassGrad)" stroke="#38bdf8" strokeWidth="2" />
        <line x1={glassX + 20} y1={glassY + 20} x2={glassX + glassW - 20} y2={glassY + glassH - 20} stroke="#ffffff" strokeWidth="1" strokeOpacity="0.2" />

        {showLabels && (
          <g>
            <text x={x + w / 2} y={y + 19} fill="#cbd5e1" fontSize="9.5" fontWeight="bold" textAnchor="middle">
              Casement Outer Frame (Fixed Picture)
            </text>
            {glassItem && (
              <g transform={`translate(${glassX + glassW / 2}, ${glassY + glassH / 2})`}>
                <rect x="-85" y="-16" width="170" height="32" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                <text x="0" y="-1" fill="#93c5fd" fontSize="10" fontWeight="bold" textAnchor="middle">
                  Casement Fixed Glass
                </text>
                <text x="0" y="11" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  {glassItem.width} × {glassItem.height} mm
                </text>
              </g>
            )}
          </g>
        )}
      </g>
    );
  }

  // 5. Casement 2-Bay (1 Fixed Light + 1 Openable De-Curve Sash)
  if (kind === 'casement_1_fixed_1_open') {
    const mullionWidth = 20;
    const bayW = (w - frameThickness * 2 - mullionWidth) / 2;
    const bayH = h - frameThickness * 2;
    const mx = x + frameThickness + bayW;
    const sashBorder = 22;

    // Left Bay = Fixed Light
    const fixedGlassX = x + frameThickness + 15;
    const fixedGlassY = y + frameThickness + 15;
    const fixedGlassW = bayW - 30;
    const fixedGlassH = bayH - 30;

    // Right Bay = Openable De-Curve Sash
    const sx = mx + mullionWidth + 5;
    const sy = y + frameThickness + 5;
    const sw = bayW - 10;
    const sh = bayH - 10;

    const opGlassX = sx + sashBorder;
    const opGlassY = sy + sashBorder;
    const opGlassW = Math.max(10, sw - sashBorder * 2);
    const opGlassH = Math.max(10, sh - sashBorder * 2);

    return (
      <g>
        {/* Outer Frame */}
        <rect x={x} y={y} width={w} height={h} fill="#1e293b" stroke="#64748b" strokeWidth="4" />

        {/* Central Dividing Mullion T-Bar */}
        <rect x={mx} y={y + frameThickness} width={mullionWidth} height={bayH} fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />

        {/* Bay 1: Fixed Light Glass with Snap-in Bead */}
        <rect x={x + frameThickness + 5} y={y + frameThickness + 5} width={bayW - 10} height={bayH - 10} fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
        <rect x={fixedGlassX} y={fixedGlassY} width={fixedGlassW} height={fixedGlassH} fill="url(#glassGrad)" stroke="#38bdf8" strokeWidth="1.5" />
        <g transform={`translate(${fixedGlassX + fixedGlassW / 2}, ${fixedGlassY + 25})`}>
          <rect x="-35" y="-10" width="70" height="20" rx="3" fill="#334155" />
          <text x="0" y="4" fill="#cbd5e1" fontSize="9.5" fontWeight="bold" textAnchor="middle">
            FIXED
          </text>
        </g>

        {/* Bay 2: Openable De-Curve Sash */}
        <rect x={sx} y={sy} width={sw} height={sh} fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
        <rect x={opGlassX} y={opGlassY} width={opGlassW} height={opGlassH} fill="url(#glassGrad)" stroke="#0284c7" strokeWidth="1.5" />

        {/* Casement Swing Lines */}
        <line x1={opGlassX} y1={opGlassY} x2={opGlassX + opGlassW} y2={opGlassY + opGlassH / 2} stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="5 4" />
        <line x1={opGlassX} y1={opGlassY + opGlassH} x2={opGlassX + opGlassW} y2={opGlassY + opGlassH / 2} stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="5 4" />
        {/* Handle */}
        <circle cx={opGlassX + opGlassW - 8} cy={opGlassY + opGlassH / 2} r="4" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />

        {showLabels && (
          <g>
            <text x={mx + mullionWidth / 2} y={y + h - 12} fill="#fbbf24" fontSize="8.5" fontWeight="bold" textAnchor="middle">
              Casement Mullion
            </text>
            {glasses[0] && (
              <g transform={`translate(${fixedGlassX + fixedGlassW / 2}, ${fixedGlassY + fixedGlassH - 25})`}>
                <rect x="-55" y="-10" width="110" height="20" rx="3" fill="#0f172a" stroke="#64748b" strokeWidth="0.8" />
                <text x="0" y="3.5" fill="#e2e8f0" fontSize="8.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  Fixed: {glasses[0].width}×{glasses[0].height}mm
                </text>
              </g>
            )}
            {glasses[1] && (
              <g transform={`translate(${opGlassX + opGlassW / 2}, ${opGlassY + opGlassH - 25})`}>
                <rect x="-55" y="-10" width="110" height="20" rx="3" fill="#0369a1" stroke="#7dd3fc" strokeWidth="0.8" />
                <text x="0" y="3.5" fill="#ffffff" fontSize="8.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  Open: {glasses[1].width}×{glasses[1].height}mm
                </text>
              </g>
            )}
          </g>
        )}
      </g>
    );
  }

  if (kind === 'transom_2_panel') {
    const panels = 2;
    const mullionsCount = 1;
    const mullionWidth = 20;
    const bayW = (w - frameThickness * 2 - mullionWidth) / 2;
    const bayH = h - frameThickness * 2;
    const sashBorder = 22;

    const mx = x + frameThickness + bayW;

    return (
      <g>
        {/* Outer Frame (Mitered) */}
        <rect x={x} y={y} width={w} height={h} fill="#1e293b" stroke="#64748b" strokeWidth="4" />

        {/* Central Dividing Mullion T-Bar */}
        <rect
          x={mx}
          y={y + frameThickness}
          width={mullionWidth}
          height={bayH}
          fill="#334155"
          stroke="#94a3b8"
          strokeWidth="1.5"
        />

        {/* 2 Top-Hung Operable Transom Sashes */}
        {Array.from({ length: 2 }).map((_, pIdx) => {
          const sx = x + frameThickness + pIdx * (bayW + mullionWidth) + 5;
          const sy = y + frameThickness + 5;
          const sw = bayW - 10;
          const sh = bayH - 10;

          const gx = sx + sashBorder;
          const gy = sy + sashBorder;
          const gw = Math.max(10, sw - sashBorder * 2);
          const gh = Math.max(10, sh - sashBorder * 2);

          const glassItem = glasses[pIdx] || glasses[0];

          return (
            <g key={pIdx}>
              {/* De Curve Sash Frame */}
              <rect x={sx} y={sy} width={sw} height={sh} fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
              {/* Glass Infill */}
              <rect x={gx} y={gy} width={gw} height={gh} fill="url(#glassGrad)" stroke="#0284c7" strokeWidth="1.5" />

              {/* Top-Hung Projection Lines (Dashed V-shape from top center to bottom corners) */}
              <line x1={gx + gw / 2} y1={gy} x2={gx} y2={gy + gh} stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="5 4" />
              <line x1={gx + gw / 2} y1={gy} x2={gx + gw} y2={gy + gh} stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="5 4" />

              {/* Bottom Cockspur Locking Handle */}
              <rect x={gx + gw / 2 - 8} y={gy + gh - 10} width="16" height="6" rx="2" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />

              {showLabels && glassItem && (
                <g transform={`translate(${gx + gw / 2}, ${gy + gh / 2})`}>
                  <rect x="-68" y="-12" width="136" height="24" rx="3" fill="#0369a1" fillOpacity="0.9" />
                  <text x="0" y="4" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    Glass: {glassItem.width}×{glassItem.height}mm
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Global Component Callouts if Labels ON */}
        {showLabels && (
          <g>
            <text x={x + w / 2} y={y + 19} fill="#cbd5e1" fontSize="9.5" fontWeight="bold" textAnchor="middle">
              Transom Outer Frame (Head)
            </text>
            <text x={mx + mullionWidth / 2} y={y + h - 12} fill="#fbbf24" fontSize="8.5" fontWeight="bold" textAnchor="middle">
              Center Mullion
            </text>
          </g>
        )}
      </g>
    );
  }

  if (kind.startsWith('casement_')) {
    let panels = 1;
    if (kind.includes('2_panel')) panels = 2;
    if (kind.includes('3_panel')) panels = 3;
    if (kind.includes('4_panel')) panels = 4;

    const mullionsCount = panels - 1;
    const mullionWidth = 20;
    const bayW = (w - frameThickness * 2 - mullionsCount * mullionWidth) / panels;
    const bayH = h - frameThickness * 2;
    const sashBorder = 25;

    return (
      <g>
        {/* Casement Outer Frame (Mitered) */}
        <rect x={x} y={y} width={w} height={h} fill="#1e293b" stroke="#64748b" strokeWidth="4" />

        {/* Mullions */}
        {Array.from({ length: mullionsCount }).map((_, mIdx) => {
          const mx = x + frameThickness + (mIdx + 1) * bayW + mIdx * mullionWidth;
          return (
            <rect
              key={mIdx}
              x={mx}
              y={y + frameThickness}
              width={mullionWidth}
              height={bayH}
              fill="#334155"
              stroke="#94a3b8"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Casement Operable Sashes */}
        {Array.from({ length: panels }).map((_, pIdx) => {
          const sx = x + frameThickness + pIdx * (bayW + mullionWidth) + 6;
          const sy = y + frameThickness + 6;
          const sw = bayW - 12;
          const sh = bayH - 12;

          const gx = sx + sashBorder;
          const gy = sy + sashBorder;
          const gw = Math.max(10, sw - sashBorder * 2);
          const gh = Math.max(10, sh - sashBorder * 2);

          const glassItem = glasses[pIdx] || glasses[0];

          return (
            <g key={pIdx}>
              {/* De Curve Sash Frame */}
              <rect x={sx} y={sy} width={sw} height={sh} fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
              {/* Glass Infill */}
              <rect x={gx} y={gy} width={gw} height={gh} fill="url(#glassGrad)" stroke="#0284c7" strokeWidth="1.5" />

              {/* Casement Swing Projected Dashed Lines (Side Hung / Top Hung symbol) */}
              <line x1={gx} y1={gy} x2={gx + gw} y2={gy + gh / 2} stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="5 4" />
              <line x1={gx} y1={gy + gh} x2={gx + gw} y2={gy + gh / 2} stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="5 4" />

              {/* Handle Marker */}
              <circle cx={gx + gw - 8} cy={gy + gh / 2} r="4" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />

              {showLabels && glassItem && (
                <g transform={`translate(${gx + gw / 2}, ${gy + gh - 24})`}>
                  <rect x="-65" y="-10" width="130" height="20" rx="3" fill="#0369a1" fillOpacity="0.9" />
                  <text x="0" y="4" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    Glass: {glassItem.width}×{glassItem.height}mm
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </g>
    );
  }

  // Fixed / Transom / Door default rendering
  const beadW = 20;
  const glassX = x + frameThickness + beadW;
  const glassY = y + frameThickness + beadW;
  const glassW = Math.max(10, w - (frameThickness + beadW) * 2);
  const glassH = Math.max(10, h - (frameThickness + beadW) * 2);
  const singleGlass = glasses[0];

  return (
    <g>
      {/* Outer frame */}
      <rect x={x} y={y} width={w} height={h} fill="#1e293b" stroke="#94a3b8" strokeWidth="4" />
      {/* Glass Bead Frame */}
      <rect
        x={x + frameThickness}
        y={y + frameThickness}
        width={w - frameThickness * 2}
        height={h - frameThickness * 2}
        fill="#0f172a"
        stroke="#475569"
        strokeWidth="2"
      />
      {/* 1-Pane Glass */}
      <rect x={glassX} y={glassY} width={glassW} height={glassH} fill="url(#glassGrad)" stroke="#38bdf8" strokeWidth="2" />

      {/* Glass Cross Lines */}
      <line x1={glassX + 20} y1={glassY + 20} x2={glassX + glassW - 20} y2={glassY + glassH - 20} stroke="#ffffff" strokeWidth="1" strokeOpacity="0.2" />

      {showLabels && singleGlass && (
        <g transform={`translate(${glassX + glassW / 2}, ${glassY + glassH / 2})`}>
          <rect x="-80" y="-16" width="160" height="32" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="0" y="-1" fill="#93c5fd" fontSize="10" fontWeight="bold" textAnchor="middle">
            {kind === 'transom_window' ? 'Transom 1-Pane Glass' : 'Fixed Picture Glass'}
          </text>
          <text x="0" y="11" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            {singleGlass.width} × {singleGlass.height} mm
          </text>
        </g>
      )}
    </g>
  );
}
