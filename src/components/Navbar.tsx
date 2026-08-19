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
  CloudDownload,
  CloudUpload,
} from 'lucide-react';
import './Navbar.css';

interface NavbarProps {
  currentView: 'home' | 'input' | 'output' | 'saved' | 'admin';
  onNavigate: (view: 'home' | 'input' | 'output' | 'saved' | 'admin') => void;
  hasActiveCalculation: boolean;
  onOpenRestoreModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  hasActiveCalculation,
  onOpenRestoreModal,
}) => {
  return (
    <header className="omas-navbar-header">
      {/* Brand Logo & Monogram */}
      <div
        onClick={() => onNavigate('home')}
        className="omas-nav-brand group"
      >
        <div className="omas-nav-logo-box group-hover:bg-blue-400 transition-colors">
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
      <div className="flex items-center h-full gap-2">
        <nav className="omas-nav-tabs-wrapper">
          <button
            onClick={() => onNavigate('home')}
            className={`omas-nav-tab-btn ${
              currentView === 'home' ? 'active-slate' : ''
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="hidden md:inline">Home</span>
          </button>

          <button
            onClick={() => onNavigate('input')}
            className={`omas-nav-tab-btn ${
              currentView === 'input' ? 'active-primary' : ''
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Calculator</span>
          </button>

          {hasActiveCalculation && (
            <button
              onClick={() => onNavigate('output')}
              className={`omas-nav-tab-btn ${
                currentView === 'output' ? 'active-primary' : ''
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Output</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('saved')}
            className={`omas-nav-tab-btn ${
              currentView === 'saved' ? 'active-slate' : ''
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Saved Data</span>
          </button>

          <button
            onClick={() => onNavigate('admin')}
            className={`omas-nav-tab-btn border-l border-slate-700/80 ${
              currentView === 'admin' ? 'active-slate text-indigo-300' : 'text-slate-300'
            }`}
            title="Admin Panel (/admin)"
          >
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </nav>

        {/* Restore Data Modal Action */}
        {onOpenRestoreModal && (
          <button
            onClick={onOpenRestoreModal}
            className="omas-nav-restore-btn"
            title="Restore Data on a new phone or browser via 5-Digit Gmail OTP"
          >
            <CloudDownload className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Restore Data</span>
          </button>
        )}
      </div>
    </header>
  );
};
