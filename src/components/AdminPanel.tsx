import React, { useState } from 'react';
import { ConstantProfilesConfig } from '../types';
import { saveStoredConstants, resetStoredConstants } from '../utils/storage';
import {
  Sliders,
  Save,
  RotateCcw,
  Check,
  Sparkles,
  Info,
  ShieldCheck,
  Layers,
  Maximize,
  Boxes,
  ArrowLeft,
  Home,
  ChevronRight,
  Settings2,
} from 'lucide-react';

interface AdminPanelProps {
  constants: ConstantProfilesConfig;
  onUpdateConstants: (newConstants: ConstantProfilesConfig) => void;
  onBackToHome: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  constants,
  onUpdateConstants,
  onBackToHome,
}) => {
  const [formData, setFormData] = useState<ConstantProfilesConfig>(constants);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'sliding' | 'casement' | 'fixed_doors' | 'general'>('sliding');

  const handleFieldChange = (path: string[], value: any) => {
    setFormData((prev) => {
      const updated = { ...prev };
      let current: any = updated;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return updated;
    });
    setSaveSuccess(false);
  };

  const handleSave = () => {
    saveStoredConstants(formData);
    onUpdateConstants(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all constant measurements to original factory standard values?')) {
      const defaults = resetStoredConstants();
      setFormData(defaults);
      onUpdateConstants(defaults);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Breadcrumb & Back Navigation Bar */}
      <div className="flex items-center justify-between gap-3 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <button
            type="button"
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold hover:underline"
          >
            <Home className="w-4 h-4" />
            <span>Home Dashboard</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800">Admin Control Panel</span>
        </div>

        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors border border-slate-300"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>&larr; Return to Homepage</span>
        </button>
      </div>

      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 border-l-4 border-l-indigo-600 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-mono border border-indigo-100">
                System Administration
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Profile Constants & Calibration
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Configure profile face widths, pocket rebate depths, standard 5800mm market stock lengths, and 4mm saw blade kerf.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Back to Home</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
            title="Reset all fields to factory standard sizes"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Constants</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-800 text-xs font-medium animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Constant values successfully saved! All calculators and cutting plans will now use these exact values.</span>
          </div>
        </div>
      )}

      {/* Admin Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {(
          [
            { id: 'sliding', label: '1. Sliding Profiles & Sash', icon: Layers },
            { id: 'casement', label: '2. Casement & Mullion', icon: Maximize },
            { id: 'fixed_doors', label: '3. Fixed & Door Profiles', icon: Boxes },
            { id: 'general', label: '4. Stock & Kerf Defaults', icon: Sliders },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: SLIDING PROFILES */}
      {activeTab === 'sliding' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Main Outer Frame Section */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              A. Main Outer Frame Profiles (Tracks & Jambs)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top / Bottom Track */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="font-semibold text-slate-800 text-xs">Top Tracks & Bottom Tracks (Width)</div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Face Width (mm):</label>
                    <input
                      type="number"
                      value={formData.topBottomTrack.faceWidth}
                      onChange={(e) => handleFieldChange(['topBottomTrack', 'faceWidth'], Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Pocket Rebate Depth (mm):</label>
                    <input
                      type="number"
                      value={formData.topBottomTrack.pocketDepth}
                      onChange={(e) => handleFieldChange(['topBottomTrack', 'pocketDepth'], Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Market Stock Length (mm):</label>
                    <input
                      type="number"
                      value={formData.topBottomTrack.stockLength}
                      onChange={(e) => handleFieldChange(['topBottomTrack', 'stockLength'], Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Side Jambs */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="font-semibold text-slate-800 text-xs">Double Jambs / Side Jambs (Height)</div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Face Width (mm):</label>
                    <input
                      type="number"
                      value={formData.sideJambs.faceWidth}
                      onChange={(e) => handleFieldChange(['sideJambs', 'faceWidth'], Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Pocket Rebate Depth (mm):</label>
                    <input
                      type="number"
                      value={formData.sideJambs.pocketDepth}
                      onChange={(e) => handleFieldChange(['sideJambs', 'pocketDepth'], Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Market Stock Length (mm):</label>
                    <input
                      type="number"
                      value={formData.sideJambs.stockLength}
                      onChange={(e) => handleFieldChange(['sideJambs', 'stockLength'], Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sliding Sash Profiles */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              B. Sliding Window / Sash Profiles (Operable Panels)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Bottom Sash Rail */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-semibold text-slate-800 text-xs">Bottom Sash Rail (Roller)</div>
                <div>
                  <label className="block text-[10px] text-slate-500">Face Width (mm):</label>
                  <input
                    type="number"
                    value={formData.bottomSashRail.faceWidth}
                    onChange={(e) => handleFieldChange(['bottomSashRail', 'faceWidth'], Number(e.target.value))}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded-md text-xs font-mono font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500">Pocket Depth (mm):</label>
                  <input
                    type="number"
                    value={formData.bottomSashRail.pocketDepth}
                    onChange={(e) => handleFieldChange(['bottomSashRail', 'pocketDepth'], Number(e.target.value))}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded-md text-xs font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Top Sash Rail */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-semibold text-slate-800 text-xs">Top Sash Rail</div>
                <div>
                  <label className="block text-[10px] text-slate-500">Face Width (mm):</label>
                  <input
                    type="number"
                    value={formData.topSashRail.faceWidth}
                    onChange={(e) => handleFieldChange(['topSashRail', 'faceWidth'], Number(e.target.value))}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded-md text-xs font-mono font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500">Pocket Depth (mm):</label>
                  <input
                    type="number"
                    value={formData.topSashRail.pocketDepth}
                    onChange={(e) => handleFieldChange(['topSashRail', 'pocketDepth'], Number(e.target.value))}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded-md text-xs font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Lock Frame Stile */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-semibold text-slate-800 text-xs">Lock Frame / Sash Stile</div>
                <div>
                  <label className="block text-[10px] text-slate-500">Face Width (mm):</label>
                  <input
                    type="number"
                    value={formData.lockFrameStile.faceWidth}
                    onChange={(e) => handleFieldChange(['lockFrameStile', 'faceWidth'], Number(e.target.value))}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded-md text-xs font-mono font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500">Pocket Depth (mm):</label>
                  <input
                    type="number"
                    value={formData.lockFrameStile.pocketDepth}
                    onChange={(e) => handleFieldChange(['lockFrameStile', 'pocketDepth'], Number(e.target.value))}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded-md text-xs font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Interlock Frame Stile */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-semibold text-slate-800 text-xs">Interlock Profile (Hook)</div>
                <div>
                  <label className="block text-[10px] text-slate-500">Face Width (mm):</label>
                  <input
                    type="number"
                    value={formData.interlockFrameStile.faceWidth}
                    onChange={(e) => handleFieldChange(['interlockFrameStile', 'faceWidth'], Number(e.target.value))}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded-md text-xs font-mono font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500">Pocket Depth (mm):</label>
                  <input
                    type="number"
                    value={formData.interlockFrameStile.pocketDepth}
                    onChange={(e) => handleFieldChange(['interlockFrameStile', 'pocketDepth'], Number(e.target.value))}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded-md text-xs font-mono font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CASEMENT PROFILES */}
      {activeTab === 'casement' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-150">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            Casement Window Profiles Lengths & Parameters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Casement Outer Frame */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="font-semibold text-slate-800 text-xs">1. Casement Outer Frame</div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Face Width (mm):</label>
                <input
                  type="number"
                  value={formData.casementOuterFrame.faceWidth}
                  onChange={(e) => handleFieldChange(['casementOuterFrame', 'faceWidth'], Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Edge Overlap (mm):</label>
                <input
                  type="number"
                  value={formData.casementOuterFrame.edgeOverlap}
                  onChange={(e) => handleFieldChange(['casementOuterFrame', 'edgeOverlap'], Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800"
                />
              </div>
            </div>

            {/* Mullion */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="font-semibold text-slate-800 text-xs">2. Mullion Profile (T-Bar)</div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Face Width (mm):</label>
                <input
                  type="number"
                  value={formData.casementMullion.faceWidth}
                  onChange={(e) => handleFieldChange(['casementMullion', 'faceWidth'], Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Edge Overlap (mm):</label>
                <input
                  type="number"
                  value={formData.casementMullion.edgeOverlap}
                  onChange={(e) => handleFieldChange(['casementMullion', 'edgeOverlap'], Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800"
                />
              </div>
            </div>

            {/* Inner Frame (De Curve) */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="font-semibold text-slate-800 text-xs">3. Inner Frame (De Curve Sash)</div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Face Width (mm):</label>
                <input
                  type="number"
                  value={formData.casementDeCurveSash.faceWidth}
                  onChange={(e) => handleFieldChange(['casementDeCurveSash', 'faceWidth'], Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Edge Overlap (mm):</label>
                <input
                  type="number"
                  value={formData.casementDeCurveSash.edgeOverlap}
                  onChange={(e) => handleFieldChange(['casementDeCurveSash', 'edgeOverlap'], Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Pocket Depth (mm):</label>
                <input
                  type="number"
                  value={formData.casementDeCurveSash.pocketDepth}
                  onChange={(e) => handleFieldChange(['casementDeCurveSash', 'pocketDepth'], Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FIXED & DOORS */}
      {activeTab === 'fixed_doors' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-150">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            Fixed Window & Door Profile Parameters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fixed Frame */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="font-semibold text-slate-800 text-xs">Fixed Frame / Snap-in Bead</div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Face Width (mm):</label>
                <input
                  type="number"
                  value={formData.fixedFrame.faceWidth}
                  onChange={(e) => handleFieldChange(['fixedFrame', 'faceWidth'], Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Glass Pocket Depth (mm):</label>
                <input
                  type="number"
                  value={formData.fixedFrame.pocketDepth}
                  onChange={(e) => handleFieldChange(['fixedFrame', 'pocketDepth'], Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800"
                />
              </div>
            </div>

            {/* Door Sections */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="font-semibold text-slate-800 text-xs">Door Stile & Bottom Kick Rail</div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Door Stile Face Width (mm):</label>
                <input
                  type="number"
                  value={formData.doorStile.faceWidth}
                  onChange={(e) => handleFieldChange(['doorStile', 'faceWidth'], Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Door Bottom Rail (mm):</label>
                <input
                  type="number"
                  value={formData.doorBottomRail.faceWidth}
                  onChange={(e) => handleFieldChange(['doorBottomRail', 'faceWidth'], Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GENERAL DEFAULTS */}
      {activeTab === 'general' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-150">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            Stock Extrusion Length, Saw Kerf & Clearances
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-xs font-semibold text-slate-800">
                Standard Profile Stock Length (mm):
              </label>
              <input
                type="number"
                value={formData.stockProfileLength}
                onChange={(e) => handleFieldChange(['stockProfileLength'], Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold text-indigo-700"
              />
              <p className="text-[11px] text-slate-500">Standard market extrusion bar length (5800mm)</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-xs font-semibold text-slate-800">
                Saw Blade Kerf Loss (mm):
              </label>
              <input
                type="number"
                value={formData.bladeKerf}
                onChange={(e) => handleFieldChange(['bladeKerf'], Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold text-indigo-700"
              />
              <p className="text-[11px] text-slate-500">Chopsaw blade thickness deducted per cut (default 4mm)</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-xs font-semibold text-slate-800">
                Glass Fitting Clearance (mm):
              </label>
              <input
                type="number"
                value={formData.glassClearance}
                onChange={(e) => handleFieldChange(['glassClearance'], Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold text-indigo-700"
              />
              <p className="text-[11px] text-slate-500">Rubber gasket & expansion clearance (default 4mm)</p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="bg-slate-100 p-4 rounded-xl flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToHome}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          &larr; Back to Main Dashboard
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <Save className="w-4 h-4" />
          Save and Apply Changes
        </button>
      </div>
    </div>
  );
};
