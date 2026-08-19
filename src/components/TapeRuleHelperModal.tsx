import React, { useState } from 'react';
import { Ruler, X, ArrowRight, Check, Info } from 'lucide-react';
import './TapeRuleHelperModal.css';

interface TapeRuleHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyMm?: (widthMm: number, heightMm: number) => void;
}

export const TapeRuleHelperModal: React.FC<TapeRuleHelperModalProps> = ({
  isOpen,
  onClose,
  onApplyMm,
}) => {
  const [tapeWidthInput, setTapeWidthInput] = useState('120.7');
  const [tapeHeightInput, setTapeHeightInput] = useState('150.0');
  const [conversionMode, setConversionMode] = useState<'tape_scale_10' | 'metric_meters' | 'direct_mm'>('tape_scale_10');

  if (!isOpen) return null;

  const parseTapeValue = (val: string, mode: string): number => {
    const num = parseFloat(val.trim());
    if (isNaN(num)) return 0;

    if (mode === 'tape_scale_10') {
      // Tape rule notation where whole units are scaled (e.g. 120.7 -> 120*10 + 7 = 1207mm, or 120.7 * 10 = 1207mm)
      // If integer part and fractional part: 120 and .7 => 1200 + 70 = 1270mm or 120.7 * 10 = 1207mm
      // In workshop rule: 120.7 -> 120*10 + 7*10 = 1270mm (as described: 120*10 + 7*10 = 1270mm, 30.3 = 30*10 + 3*10 = 330mm, 5.5 = 55mm)
      const parts = val.trim().split('.');
      if (parts.length === 2) {
        const whole = parseFloat(parts[0]) || 0;
        const frac = parseFloat(parts[1]) || 0;
        return whole * 10 + frac * 10;
      }
      return num * 10;
    } else if (mode === 'metric_meters') {
      // Standard metric tape: 1.20m = 1200mm
      return Math.round(num * 1000);
    }
    return Math.round(num);
  };

  const calculatedWMm = parseTapeValue(tapeWidthInput, conversionMode);
  const calculatedHMm = parseTapeValue(tapeHeightInput, conversionMode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600 text-white">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">Tape Rule & Unit Converter Guide</h3>
              <p className="text-xs text-slate-500">How workshop tape measurements convert to exact millimeters (mm)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Explanation Box */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-4 text-xs text-blue-900 leading-relaxed">
            <div className="flex items-start gap-2 mb-2 font-medium text-blue-950">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>Workshop Tape Rule Conversion Logic:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-700">
              <li>
                <strong>Workshop Tape Scale (×10 rule)</strong>: Fabricators reading tape marks like <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-800 font-mono">120.7</code> compute <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-800 font-mono">(120 × 10) + (7 × 10) = 1270 mm</code>.
              </li>
              <li>
                <strong>Example 30.3</strong>: <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-800 font-mono">(30 × 10) + (3 × 10) = 330 mm</code>.
              </li>
              <li>
                <strong>Standard Millimeters (mm)</strong>: Standard entry (e.g., <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-800 font-mono">1200 × 1500 mm</code>).
              </li>
            </ul>
          </div>

          {/* Interactive Mode Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Select Measurement Input Mode:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConversionMode('tape_scale_10')}
                className={`px-3 py-2.5 rounded-lg text-xs font-medium border text-left transition-all ${
                  conversionMode === 'tape_scale_10'
                    ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-semibold">Tape Notation (×10 Rule)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">e.g., 120.7 &rarr; 1270 mm</div>
              </button>
              <button
                type="button"
                onClick={() => setConversionMode('direct_mm')}
                className={`px-3 py-2.5 rounded-lg text-xs font-medium border text-left transition-all ${
                  conversionMode === 'direct_mm'
                    ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-semibold">Direct Millimeters (mm)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">e.g., 1200 × 1500 mm</div>
              </button>
            </div>
          </div>

          {/* Live Quick Calculator Test */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Live Converter Tester:
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Width Input ({conversionMode === 'tape_scale_10' ? 'Tape Value' : 'mm'}):
                </label>
                <input
                  type="text"
                  value={tapeWidthInput}
                  onChange={(e) => setTapeWidthInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="e.g. 120.7"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Height Input ({conversionMode === 'tape_scale_10' ? 'Tape Value' : 'mm'}):
                </label>
                <input
                  type="text"
                  value={tapeHeightInput}
                  onChange={(e) => setTapeHeightInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="e.g. 150.0"
                />
              </div>
            </div>

            {/* Converted Output Display */}
            <div className="mt-2 pt-3 border-t border-slate-200 flex items-center justify-between">
              <div className="text-xs text-slate-600">Calculated Dimension in mm:</div>
              <div className="text-sm font-bold text-blue-700 font-mono bg-blue-100/60 px-3 py-1 rounded-md">
                {calculatedWMm} mm (W) × {calculatedHMm} mm (H)
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            Close
          </button>
          {onApplyMm && (
            <button
              onClick={() => {
                onApplyMm(calculatedWMm, calculatedHMm);
                onClose();
              }}
              disabled={calculatedWMm <= 0 || calculatedHMm <= 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              Apply Dimensions ({calculatedWMm} × {calculatedHMm} mm)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
