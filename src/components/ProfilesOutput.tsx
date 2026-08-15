import React, { useState } from 'react';
import {
  CombinedProjectCalculation,
  ConstantProfilesConfig,
  ProfileOptimizationResult,
} from '../types';
import { downloadProfilesMaterialsPdf } from '../utils/pdfGenerator';
import {
  PackageCheck,
  Download,
  Scissors,
  Layers,
  Wrench,
  Percent,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface ProfilesOutputProps {
  calculation: CombinedProjectCalculation;
  constants: ConstantProfilesConfig;
}

export const ProfilesOutput: React.FC<ProfilesOutputProps> = ({
  calculation,
  constants,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'hardware' | 'seal' | 'fastener' | 'chemical'>('all');
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPdf = () => {
    setIsExporting(true);
    try {
      downloadProfilesMaterialsPdf(calculation, constants);
    } catch (e) {
      console.error('PDF export failed:', e);
    } finally {
      setTimeout(() => setIsExporting(false), 800);
    }
  };

  const filteredAccessories = calculation.allAccessories.filter((a) => {
    if (activeCategory === 'all') return true;
    return a.category === activeCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & PDF Action */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <PackageCheck className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              Profiles & Materials Procurement Bill
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Calculated number of 5800mm market extrusion bars, 1D cut plan, and hardware quantities for{' '}
            <strong className="text-slate-700">{calculation.projectName}</strong>
          </p>
        </div>

        <button
          onClick={handleDownloadPdf}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Generating PDF...' : 'Download Profiles & Materials PDF'}
        </button>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total 5.8m Bars Needed</div>
          <div className="text-2xl font-extrabold text-blue-700 mt-1 font-mono">
            {calculation.totalBarsCount} <span className="text-xs font-normal text-slate-600">bars</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Total Linear: {((calculation.totalBarsCount * constants.stockProfileLength) / 1000).toFixed(1)} m
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Profile Sections</div>
          <div className="text-2xl font-extrabold text-slate-800 mt-1 font-mono">
            {calculation.profileOptimizations.length} <span className="text-xs font-normal text-slate-600">types</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {calculation.totalCutPiecesCount} cut pieces total
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Glass Requirement</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1 font-mono">
            {calculation.totalGlassAreaM2} <span className="text-xs font-normal text-slate-600">m²</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Across {calculation.allGlasses.length} total panes
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Hardware & Fasteners</div>
          <div className="text-2xl font-extrabold text-purple-700 mt-1 font-mono">
            {calculation.allAccessories.length} <span className="text-xs font-normal text-slate-600">items</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Complete installation kit</div>
        </div>
      </div>

      {/* SECTION 1: PROFILES REQUIREMENT TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h4 className="font-semibold text-slate-800 text-sm">
              1. Aluminum Extrusion Profiles Required ({constants.stockProfileLength}mm Standard Length)
            </h4>
          </div>
          <span className="text-xs text-slate-500">
            Stock Bar Length: <strong className="font-mono text-slate-700">{constants.stockProfileLength} mm</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Profile Name & Extrusion Section</th>
                <th className="px-4 py-3 text-center">Cut Pcs</th>
                <th className="px-4 py-3 text-right">Net Length</th>
                <th className="px-4 py-3 text-center">Bars Needed (5.8m)</th>
                <th className="px-4 py-3 text-right">Offcut / Waste</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {calculation.profileOptimizations.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50/75 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-400">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">{p.profileName}</div>
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-medium text-slate-700">
                    {p.totalPieces} pcs
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-slate-700">
                    {(p.totalLengthRequired / 1000).toFixed(2)} m{' '}
                    <span className="text-slate-400 text-[10px]">({p.totalLengthRequired} mm)</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-blue-100 text-blue-800">
                      {p.barsNeeded} bars
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-600">
                    {(p.totalWasteLength / 1000).toFixed(2)} m{' '}
                    <span className="text-[11px] font-semibold text-amber-600">
                      ({p.wastePercentage}%)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: LINEAR CUTTING PLAN (VISUAL BARS OPTIMIZATION) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-emerald-600" />
            <h4 className="font-semibold text-slate-800 text-sm">
              2. Visual Linear Cut Plan & Stock Optimization (Saw Cut Layout)
            </h4>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-xs bg-blue-500 inline-block"></span> Used Cuts
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-xs bg-amber-400 inline-block"></span> Offcut Waste
            </span>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {calculation.profileOptimizations.map((profOpt, pIdx) => (
            <div key={pIdx} className="space-y-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-800 text-xs flex items-center gap-2">
                  <span>{profOpt.profileName}</span>
                  <span className="text-[11px] font-normal text-slate-500 font-mono">
                    ({profOpt.barsNeeded} bars, {profOpt.totalPieces} cuts)
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  Avg Waste: <strong className="text-amber-600 font-mono">{profOpt.wastePercentage}%</strong>
                </div>
              </div>

              {/* Bar List */}
              <div className="space-y-2">
                {profOpt.bars.map((bar, bIdx) => {
                  return (
                    <div
                      key={bIdx}
                      className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">
                          Bar #{bar.barNumber} (Stock 5800mm)
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">
                          Used: <strong className="text-slate-800">{bar.usedLength} mm</strong> | Offcut:{' '}
                          <strong className="text-amber-700">{bar.wasteLength} mm ({bar.wastePercentage}%)</strong>
                        </span>
                      </div>

                      {/* Visual Bar Packing Bar Chart */}
                      <div className="w-full h-7 bg-slate-200 rounded-md overflow-hidden flex border border-slate-300">
                        {bar.cuts.map((cut, cIdx) => {
                          const widthPct = (cut.cutLength / bar.stockLength) * 100;
                          return (
                            <div
                              key={cIdx}
                              style={{ width: `${widthPct}%` }}
                              className="h-full bg-blue-600 hover:bg-blue-700 border-r border-slate-900/40 text-[10px] text-white flex items-center justify-center font-mono font-bold px-1 truncate transition-colors cursor-default"
                              title={`${cut.purpose}: ${cut.cutLength}mm [${cut.itemTag}]`}
                            >
                              {cut.cutLength}mm
                            </div>
                          );
                        })}
                        {bar.wasteLength > 0 && (
                          <div
                            style={{ width: `${(bar.wasteLength / bar.stockLength) * 100}%` }}
                            className="h-full bg-amber-300/90 text-[10px] text-amber-900 flex items-center justify-center font-mono font-bold px-1 truncate"
                            title={`Waste Offcut: ${bar.wasteLength}mm`}
                          >
                            {bar.wasteLength >= 300 ? `Offcut ${bar.wasteLength}mm` : ''}
                          </div>
                        )}
                      </div>

                      {/* Cut Sequence Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {bar.cuts.map((c, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700"
                          >
                            <span className="font-bold text-blue-700">{c.cutLength}mm</span>
                            <span className="text-slate-400">({c.itemTag})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: ACCESSORIES & MATERIALS TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-purple-600" />
            <h4 className="font-semibold text-slate-800 text-sm">
              3. Materials, Hardware, Gaskets & Sealants Bill of Quantities
            </h4>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-lg">
            {(['all', 'hardware', 'seal', 'fastener', 'chemical'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition-all ${
                  activeCategory === cat
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Material / Accessory Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-center">Required Quantity</th>
                <th className="px-4 py-3">Usage Purpose & Specification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAccessories.map((acc, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-400">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">{acc.name}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        acc.category === 'hardware'
                          ? 'bg-amber-100 text-amber-800'
                          : acc.category === 'seal'
                          ? 'bg-emerald-100 text-emerald-800'
                          : acc.category === 'fastener'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {acc.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-mono font-bold text-slate-900 text-sm bg-slate-100 px-2.5 py-1 rounded-md">
                      {acc.quantity} {acc.unit}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{acc.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
