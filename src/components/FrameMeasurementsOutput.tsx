import React, { useState } from 'react';
import {
  CombinedProjectCalculation,
  ConstantProfilesConfig,
} from '../types';
import { downloadFrameMeasurementsPdf } from '../utils/pdfGenerator';
import {
  Ruler,
  Download,
  Search,
  Maximize2,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface FrameMeasurementsOutputProps {
  calculation: CombinedProjectCalculation;
  constants: ConstantProfilesConfig;
}

export const FrameMeasurementsOutput: React.FC<FrameMeasurementsOutputProps> = ({
  calculation,
  constants,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterComponent, setFilterComponent] = useState<'all' | 'outer_frame' | 'sash' | 'mullion' | 'bead' | 'door_frame'>('all');
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPdf = () => {
    setIsExporting(true);
    try {
      downloadFrameMeasurementsPdf(calculation, constants);
    } catch (e) {
      console.error('PDF export failed:', e);
    } finally {
      setTimeout(() => setIsExporting(false), 800);
    }
  };

  const filteredCuts = calculation.allCuts.filter((c) => {
    const matchSearch =
      c.itemTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.profileName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchComponent = filterComponent === 'all' || c.componentType === filterComponent;
    return matchSearch && matchComponent;
  });

  const filteredGlasses = calculation.allGlasses.filter((g) => {
    return (
      g.itemTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.paneDescription.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & PDF Download */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <Ruler className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              Workshop Frame & Glass Cutting Schedule
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Exact cutting sizes (mm), miters (90°/45°), quantities, and 1-pane glass dimensions for{' '}
            <strong className="text-slate-700">{calculation.projectName}</strong>
          </p>
        </div>

        <button
          onClick={handleDownloadPdf}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Generating PDF...' : 'Download Frame & Glass Cut Sheet PDF'}
        </button>
      </div>

      {/* Metric Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Frame Cuts</div>
          <div className="text-2xl font-extrabold text-slate-800 mt-1 font-mono">
            {calculation.totalCutPiecesCount} <span className="text-xs font-normal text-slate-600">pieces</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across {calculation.items.length} units</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Glass Panes Count</div>
          <div className="text-2xl font-extrabold text-sky-700 mt-1 font-mono">
            {calculation.allGlasses.length} <span className="text-xs font-normal text-slate-600">panes</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Total: {calculation.totalGlassAreaM2} m²</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">90° Butt Cuts</div>
          <div className="text-2xl font-extrabold text-slate-700 mt-1 font-mono">
            {calculation.allCuts.filter((c) => c.cutAngle === '90°').reduce((s, c) => s + c.quantity, 0)}{' '}
            <span className="text-xs font-normal text-slate-500">pcs</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Straight chopsaw cuts</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">45° Miter Cuts</div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1 font-mono">
            {calculation.allCuts.filter((c) => c.cutAngle === '45°').reduce((s, c) => s + c.quantity, 0)}{' '}
            <span className="text-xs font-normal text-slate-500">pcs</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Miter joint corners</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by unit tag, profile name, or component..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { id: 'all', label: 'All Cuts' },
              { id: 'outer_frame', label: 'Outer Frames' },
              { id: 'sash', label: 'Sashes / Rails' },
              { id: 'mullion', label: 'Mullions' },
              { id: 'bead', label: 'Glass Beads' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterComponent(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filterComponent === tab.id
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: WORKSHOP PROFILE CUT LIST TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <h4 className="font-semibold text-slate-800 text-sm">
              1. Aluminum Frame Profile Cut Schedule ({filteredCuts.length} line items)
            </h4>
          </div>
          <span className="text-xs text-slate-500">
            Cut Tolerance: <strong className="font-mono text-slate-700">±0.5 mm</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Unit / Tag</th>
                <th className="px-4 py-3">Component Purpose</th>
                <th className="px-4 py-3">Profile Section</th>
                <th className="px-4 py-3 text-center">Cut Angle</th>
                <th className="px-4 py-3 text-right">Exact Cut Length</th>
                <th className="px-4 py-3 text-center">Qty to Cut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCuts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-xs">
                    No cut pieces matching filter.
                  </td>
                </tr>
              ) : (
                filteredCuts.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/75 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {c.itemTag}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{c.purpose}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium">{c.profileName}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          c.cutAngle === '45°'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {c.cutAngle}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 text-sm">
                      {c.length} <span className="text-[11px] font-normal text-slate-500">mm</span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-emerald-700">
                      <span className="bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                        {c.quantity} pcs
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: 1-PANE GLASS CUTTING SIZES TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-sky-600" />
            <h4 className="font-semibold text-slate-800 text-sm">
              2. Workshop 1-Pane Glass Cut Sizes ({filteredGlasses.length} glass items)
            </h4>
          </div>
          <span className="text-xs text-sky-700 font-medium">
            Total Area: <strong className="font-mono font-bold">{calculation.totalGlassAreaM2} m²</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Unit / Tag</th>
                <th className="px-4 py-3">Glass Description</th>
                <th className="px-4 py-3 text-center">Cut Width</th>
                <th className="px-4 py-3 text-center">Cut Height</th>
                <th className="px-4 py-3 text-right">Cut Dimension (W × H)</th>
                <th className="px-4 py-3 text-center">Panes Qty</th>
                <th className="px-4 py-3 text-right">Glass Area</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredGlasses.map((g, idx) => (
                <tr key={idx} className="hover:bg-slate-50/75 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-400">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                      {g.itemTag}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">{g.paneDescription}</td>
                  <td className="px-4 py-3 text-center font-mono font-medium text-slate-700">
                    {g.width} mm
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-medium text-slate-700">
                    {g.height} mm
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-sky-900 text-sm">
                    {g.width} × {g.height} <span className="text-[11px] font-normal text-slate-500">mm</span>
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-bold text-slate-800">
                    {g.quantity} pcs
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-600 font-medium">
                    {g.areaM2} m²
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
