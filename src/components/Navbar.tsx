import React from 'react';
import {
  Ruler,
  FolderOpen,
  Sliders,
  Plus,
  Home,
  Layers,
  Wrench,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'input' | 'output' | 'saved' | 'admin';
  onNavigate: (view: 'home' | 'input' | 'output' | 'saved' | 'admin') => void;
  hasActiveCalculation: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  hasActiveCalculation,
}) => {
  return (
    <header className="h-16 flex-none bg-[#1E293B] text-white flex items-center justify-between px-4 sm:px-8 border-b border-slate-700 shadow-md select-none sticky top-0 z-50">
      {/* Brand Logo & Monogram */}
      <div
        onClick={() => onNavigate('home')}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center font-extrabold text-base text-white shadow-xs group-hover:bg-blue-400 transition-colors">
          O
        </div>
        <div>
          <h1 className="text-sm sm:text-base font-bold tracking-tight uppercase text-white flex items-center gap-2">
            <span>OMAS ALUMINIUM PRECISION SYSTEM</span>
            <span className="hidden md:inline-block text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
              PRO
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Architectural Fabrication & Stock Optimization
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center h-full gap-1">
        <button
          onClick={() => onNavigate('home')}
          className={`h-full px-3 sm:px-5 flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-colors ${
            currentView === 'home'
              ? 'bg-slate-800 text-white border-b-4 border-blue-400'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="hidden md:inline">Home</span>
        </button>

        <button
          onClick={() => onNavigate('input')}
          className={`h-full px-3 sm:px-5 flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-colors ${
            currentView === 'input'
              ? 'bg-blue-600 text-white border-b-4 border-blue-300 shadow-xs'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Calculator</span>
        </button>

        {hasActiveCalculation && (
          <button
            onClick={() => onNavigate('output')}
            className={`h-full px-3 sm:px-5 flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-colors ${
              currentView === 'output'
                ? 'bg-blue-600 text-white border-b-4 border-blue-300 shadow-xs'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Output</span>
          </button>
        )}

        <button
          onClick={() => onNavigate('saved')}
          className={`h-full px-3 sm:px-5 flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-colors ${
            currentView === 'saved'
              ? 'bg-slate-800 text-white border-b-4 border-blue-400'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          <span className="hidden sm:inline">Saved Data</span>
        </button>

        <button
          onClick={() => onNavigate('admin')}
          className={`h-full px-3 sm:px-5 flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-colors border-l border-slate-700/80 ${
            currentView === 'admin'
              ? 'bg-slate-800 text-indigo-300 border-b-4 border-indigo-400'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-indigo-300'
          }`}
          title="Admin Panel (/admin)"
        >
          <Sliders className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline">Admin Panel</span>
        </button>
      </nav>
    </header>
  );
};
