import React from 'react';
import {
  Calculator,
  FolderOpen,
  Sliders,
  Ruler,
  Layers,
  Sparkles,
  ArrowRight,
  FileCheck,
  PackageCheck,
  CheckCircle2,
  Maximize,
  ShieldCheck,
  Boxes,
} from 'lucide-react';
import { SavedProject } from '../types';

interface HomePageProps {
  onStartCalculation: () => void;
  onOpenSavedData: () => void;
  onOpenAdmin: () => void;
  savedProjectsCount: number;
  recentProjects: SavedProject[];
  onOpenProject: (project: SavedProject) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartCalculation,
  onOpenSavedData,
  onOpenAdmin,
  savedProjectsCount,
  recentProjects,
  onOpenProject,
}) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Welcome Header */}
      <div className="bg-[#1E293B] rounded-xl p-6 sm:p-8 text-white shadow-lg border border-slate-700 relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Industrial Aluminum Fabrication Suite</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">
            Alu-Fab Precision System
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Automated calculations for window and door profile stock bars (5800mm), 1D cutting plans with kerf waste analysis, 1-pane glass sizing schedules, and accessories bills of quantities.
          </p>
        </div>
      </div>

      {/* THE 3 PRIMARY HOMEPAGE BUTTONS (AS REQUIRED BY PROMPT) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="font-bold text-xs uppercase tracking-widest text-slate-500">
            Primary Launchpad Modules
          </h2>
          <span className="text-[11px] font-mono text-slate-400">Select an action</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Button 1: Aluminum Materials and Measurements */}
          <button
            type="button"
            onClick={onStartCalculation}
            className="group bg-white rounded-xl border border-slate-200 border-l-4 border-l-blue-500 hover:border-blue-400 p-6 text-left shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Calculator className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Core Module
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-4 group-hover:text-blue-700 transition-colors uppercase tracking-tight">
                1. Aluminum Materials & Measurements
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Input job name, select fabrication type (Sliding, Casement, Fixed, Doors), enter width × height (mm), and calculate output.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Start Calculation</span>
              <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Button 2: Saved Data / Measurements */}
          <button
            type="button"
            onClick={onOpenSavedData}
            className="group bg-white rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 hover:border-emerald-400 p-6 text-left shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                  {savedProjectsCount} Records
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-4 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">
                2. Saved Data / Measurements
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Browse stored project measurements, access cut sheets, search past jobs, and re-export workshop PDFs.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">View Database</span>
              <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Button 3: Admin Panel (Edit Constant Measurements Values) */}
          <button
            type="button"
            onClick={onOpenAdmin}
            className="group bg-white rounded-xl border border-slate-200 border-l-4 border-l-indigo-500 hover:border-indigo-400 p-6 text-left shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Sliders className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  /admin
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-4 group-hover:text-indigo-700 transition-colors uppercase tracking-tight">
                3. Admin Panel & Constant Values
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Edit constant face widths, rebate pocket depths, standard 5800mm bar lengths, and saw kerf loss allowances.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Edit Constants</span>
              <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* RECENT PROJECTS QUICK ACCESS */}
      {recentProjects.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <span>Recent Fabrication Projects</span>
            </h3>
            <button
              onClick={onOpenSavedData}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
            >
              View All &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentProjects.slice(0, 4).map((p) => (
              <button
                key={p.id}
                onClick={() => onOpenProject(p)}
                className="text-left p-3.5 rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-xs text-slate-800 group-hover:text-blue-700">
                    {p.name}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {p.items.length} units • {new Date(p.dateCreated).toLocaleDateString()}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SYSTEM CAPABILITY SPECS OVERVIEW */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
          System Fabrication Profiles & Standards Supported:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Sliding Systems
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              2, 3, and 4-panel sliding windows & doors. Outer top/bottom tracks, side jambs, roller bottom rails, lock stiles, and interlocks.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Casement Systems
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              1 to 4 panel projected operable sashes (De Curve), outer frames with 45° miters, vertical mullion T-bars, and friction stay hardware.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Fixed, Transom & Doors
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Picture windows, top-hung transom highlights, and heavy-duty swing doors with kick plates and glass snap beads.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
