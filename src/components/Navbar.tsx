import React, { useState, useEffect, useRef } from 'react';
import {
  FolderOpen,
  Sliders,
  Plus,
  Home,
  Layers,
  CloudDownload,
  CloudUpload,
  Menu,
  X,
  Database,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Mail,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Settings,
} from 'lucide-react';
import {
  getLastSyncedAt,
  getSavedSyncEmail,
  setSavedSyncEmail,
  syncLocalDataToCloud,
  checkAndRunDailyBackgroundSync,
} from '../utils/cloudSync';
import { PWAInstallButton } from './PWAInstallButton';
import './Navbar.css';

interface NavbarProps {
  currentView: 'home' | 'input' | 'output' | 'saved' | 'admin' | 'settings';
  onNavigate: (view: 'home' | 'input' | 'output' | 'saved' | 'admin' | 'settings') => void;
  hasActiveCalculation: boolean;
  onOpenRestoreModal?: () => void;
  onSyncComplete?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  hasActiveCalculation,
  onOpenRestoreModal,
  onSyncComplete,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopSyncOpen, setIsDesktopSyncOpen] = useState(false);

  // Sync state
  const [email, setEmail] = useState<string>(getSavedSyncEmail());
  const [isEditingEmail, setIsEditingEmail] = useState<boolean>(!getSavedSyncEmail());
  const [lastSynced, setLastSynced] = useState<string | null>(getLastSyncedAt());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const desktopSyncRef = useRef<HTMLDivElement>(null);

  // Close desktop dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (desktopSyncRef.current && !desktopSyncRef.current.contains(e.target as Node)) {
        setIsDesktopSyncOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for sync events
  useEffect(() => {
    const handleSyncEvent = (e: any) => {
      setLastSynced(e.detail?.lastSyncedAt || getLastSyncedAt());
    };
    window.addEventListener('omas_cloud_synced', handleSyncEvent);
    return () => window.removeEventListener('omas_cloud_synced', handleSyncEvent);
  }, []);

  const handleManualSync = async () => {
    if (!email.trim() || !email.includes('@')) {
      setIsEditingEmail(true);
      setSyncStatus({
        type: 'error',
        message: 'Please enter a valid Gmail / email address to backup data.',
      });
      return;
    }

    setIsSyncing(true);
    setSyncStatus(null);

    try {
      setSavedSyncEmail(email.trim());
      const res = await syncLocalDataToCloud(email.trim());
      setLastSynced(res.lastSyncedAt);
      setIsEditingEmail(false);
      setSyncStatus({
        type: 'success',
        message: 'Data backed up to MongoDB successfully!',
      });
      if (onSyncComplete) onSyncComplete();

      setTimeout(() => {
        setSyncStatus(null);
      }, 4000);
    } catch (err: any) {
      setSyncStatus({
        type: 'error',
        message: err.message || 'Failed to sync to cloud database.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const formatLastSyncTime = (timestamp: string | null): string => {
    if (!timestamp) return 'Never synced yet';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timestamp;
    }
  };

  const handleNavClick = (view: 'home' | 'input' | 'output' | 'saved' | 'admin' | 'settings') => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="omas-navbar-header">
      <div className="omas-navbar-container">
        {/* Brand Logo & Monogram */}
        <div
          onClick={() => handleNavClick('home')}
          className="omas-nav-brand group"
          role="button"
          tabIndex={0}
        >
          <div className="omas-nav-logo-box group-hover:bg-blue-400 transition-colors">
            O
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-base font-bold tracking-tight uppercase text-white truncate">
                OMAS ALUMINIUM
              </span>
              <span className="text-[10px] font-mono font-bold px-1 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 shrink-0">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block truncate">
              Architectural Fabrication & Stock Optimizer
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links (md and up) */}
        <div className="hidden md:flex items-center h-full gap-1 lg:gap-2">
          <nav className="omas-nav-tabs-wrapper">
            <button
              onClick={() => handleNavClick('home')}
              className={`omas-nav-tab-btn ${
                currentView === 'home' ? 'active-slate' : ''
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => handleNavClick('input')}
              className={`omas-nav-tab-btn ${
                currentView === 'input' ? 'active-primary' : ''
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Calculator</span>
            </button>

            {hasActiveCalculation && (
              <button
                onClick={() => handleNavClick('output')}
                className={`omas-nav-tab-btn ${
                  currentView === 'output' ? 'active-primary' : ''
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Output</span>
              </button>
            )}

            <button
              onClick={() => handleNavClick('saved')}
              className={`omas-nav-tab-btn ${
                currentView === 'saved' ? 'active-slate' : ''
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span>Saved Data</span>
            </button>

            <button
              onClick={() => handleNavClick('settings')}
              className={`omas-nav-tab-btn border-l border-slate-700/80 ${
                currentView === 'settings' ? 'active-slate text-blue-300' : 'text-slate-300'
              }`}
              title="Settings: Company, Prices & Ranges (/settings)"
            >
              <Settings className="w-4 h-4 text-blue-400" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => handleNavClick('admin')}
              className={`omas-nav-tab-btn border-l border-slate-700/80 ${
                currentView === 'admin' ? 'active-slate text-indigo-300' : 'text-slate-300'
              }`}
              title="Admin Panel (/admin)"
            >
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Admin</span>
            </button>
          </nav>

          {/* Desktop Direct Settings Icon Button */}
          <button
            type="button"
            onClick={() => handleNavClick('settings')}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
              currentView === 'settings'
                ? 'bg-blue-600/30 border-blue-500 text-blue-300 shadow-sm'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title="System & Company Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Desktop Cloud Sync & Backup Popover */}
          <div className="relative ml-2" ref={desktopSyncRef}>
            <button
              onClick={() => setIsDesktopSyncOpen((prev) => !prev)}
              className={`omas-nav-cloud-btn ${isDesktopSyncOpen ? 'active' : ''}`}
              title="Cloud Sync, Backup & Restore Data"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <CloudUpload className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">Sync & Backup</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isDesktopSyncOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDesktopSyncOpen && (
              <div className="omas-desktop-sync-popover">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      MongoDB Cloud Backup
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Auto-Sync Active
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-2 mb-3">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Last synced: <strong className="text-slate-200">{formatLastSyncTime(lastSynced)}</strong></span>
                  </div>

                  {/* Email Section */}
                  <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Backup Gmail:</span>
                      {email && !isEditingEmail && (
                        <button
                          type="button"
                          onClick={() => setIsEditingEmail(true)}
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          Change
                        </button>
                      )}
                    </div>
                    {isEditingEmail ? (
                      <div className="flex gap-1">
                        <input
                          type="email"
                          placeholder="Enter your Gmail address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    ) : (
                      <div className="font-mono text-xs text-blue-300 truncate">
                        {email || 'No email configured'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Popover Action Buttons */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    {isSyncing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Backing up to Cloud...</span>
                      </>
                    ) : (
                      <>
                        <CloudUpload className="w-3.5 h-3.5" />
                        <span>Backup Now to MongoDB</span>
                      </>
                    )}
                  </button>

                  {onOpenRestoreModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsDesktopSyncOpen(false);
                        onOpenRestoreModal();
                      }}
                      className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <CloudDownload className="w-3.5 h-3.5 text-blue-400" />
                      <span>Restore Data via 5-Digit OTP</span>
                    </button>
                  )}
                </div>

                {/* Status Messages */}
                {syncStatus && (
                  <div
                    className={`mt-2 p-2 rounded text-xs flex items-center gap-1.5 ${
                      syncStatus.type === 'success'
                        ? 'bg-emerald-950 text-emerald-200 border border-emerald-800'
                        : 'bg-red-950 text-red-200 border border-red-800'
                    }`}
                  >
                    {syncStatus.type === 'success' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    )}
                    <span className="truncate">{syncStatus.message}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop PWA Install Button */}
          <PWAInstallButton variant="header" className="ml-2" />
        </div>

        {/* Mobile Hamburger / Menu Toggle Button */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile Install Button */}
          <PWAInstallButton variant="compact" />

          {/* Subtle Live Sync Pulse Indicator */}
          <div className="flex items-center gap-1 px-2 py-1 bg-slate-800/80 rounded-md border border-slate-700 text-[10px] text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Cloud</span>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-red-400" />
            ) : (
              <Menu className="w-5 h-5 text-blue-400" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {isMobileMenuOpen && (
        <div className="omas-mobile-menu-drawer animate-fadeIn">
          {/* Section 1: Navigation Links */}
          <div className="p-3 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
              Navigation Menu
            </div>

            <button
              onClick={() => handleNavClick('home')}
              className={`omas-mobile-nav-item ${
                currentView === 'home' ? 'active-slate' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded bg-slate-800 text-blue-400">
                  <Home className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm">Home</div>
                  <div className="text-[11px] text-slate-400">Overview & launchpad</div>
                </div>
              </div>
              {currentView === 'home' && (
                <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">Active</span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('input')}
              className={`omas-mobile-nav-item ${
                currentView === 'input' ? 'active-primary' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded bg-blue-600/30 text-blue-300">
                  <Plus className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm">Calculator / Measurements</div>
                  <div className="text-[11px] text-slate-400">Input dimensions & calculate jobs</div>
                </div>
              </div>
              {currentView === 'input' && (
                <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded">Active</span>
              )}
            </button>

            {hasActiveCalculation && (
              <button
                onClick={() => handleNavClick('output')}
                className={`omas-mobile-nav-item ${
                  currentView === 'output' ? 'active-primary' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded bg-indigo-600/30 text-indigo-300">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm">Output Dashboard</div>
                    <div className="text-[11px] text-slate-400">3D Models, Stock Cuts, Glass & BOQ</div>
                  </div>
                </div>
                {currentView === 'output' && (
                  <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded">Active</span>
                )}
              </button>
            )}

            <button
              onClick={() => handleNavClick('saved')}
              className={`omas-mobile-nav-item ${
                currentView === 'saved' ? 'active-slate' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded bg-emerald-600/30 text-emerald-300">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm">Saved Data / Projects</div>
                  <div className="text-[11px] text-slate-400">View and manage saved cutting projects</div>
                </div>
              </div>
              {currentView === 'saved' && (
                <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">Active</span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('settings')}
              className={`omas-mobile-nav-item ${
                currentView === 'settings' ? 'active-slate' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded bg-blue-600/30 text-blue-300">
                  <Settings className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm">Company & Pricing Settings</div>
                  <div className="text-[11px] text-slate-400">Company info, prices, and size ranges</div>
                </div>
              </div>
              {currentView === 'settings' && (
                <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">Active</span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('admin')}
              className={`omas-mobile-nav-item ${
                currentView === 'admin' ? 'active-slate' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded bg-purple-600/30 text-purple-300">
                  <Sliders className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm">Admin & Prices Panel</div>
                  <div className="text-[11px] text-slate-400">Profile lengths, deductions & material prices</div>
                </div>
              </div>
              {currentView === 'admin' && (
                <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">Active</span>
              )}
            </button>
          </div>

          {/* Section 2: Sync / Backup / Restore Data in Header Menu */}
          <div className="p-3 pt-2 border-t border-slate-700/80 bg-slate-900/90">
            <div className="bg-slate-800/90 rounded-xl p-3.5 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Cloud Sync & Backup
                  </span>
                </div>
                <span className="text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Daily Auto-Sync
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Last synced: <strong className="text-white">{formatLastSyncTime(lastSynced)}</strong></span>
              </div>

              {/* Email configuration */}
              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-700/70 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Backup Gmail Account:</span>
                  {email && !isEditingEmail && (
                    <button
                      type="button"
                      onClick={() => setIsEditingEmail(true)}
                      className="text-blue-400 hover:text-blue-300 text-[11px] underline"
                    >
                      Change Email
                    </button>
                  )}
                </div>

                {isEditingEmail ? (
                  <input
                    type="email"
                    placeholder="Enter your Gmail for backup"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <div className="font-mono text-xs text-blue-300 truncate">
                    {email || 'No email configured yet'}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Backing up to MongoDB...</span>
                    </>
                  ) : (
                    <>
                      <CloudUpload className="w-4 h-4" />
                      <span>Backup Now to Cloud</span>
                    </>
                  )}
                </button>

                {onOpenRestoreModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenRestoreModal();
                    }}
                    className="w-full py-2 px-3 bg-slate-700/80 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <CloudDownload className="w-4 h-4 text-blue-300" />
                    <span>Restore Data on New Phone / Browser</span>
                  </button>
                )}
              </div>

              {/* Sync Status Alert */}
              {syncStatus && (
                <div
                  className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                    syncStatus.type === 'success'
                      ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-700'
                      : 'bg-red-950/80 text-red-200 border border-red-700'
                  }`}
                >
                  {syncStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{syncStatus.message}</span>
                </div>
              )}
            </div>

            {/* Offline PWA Install Prompt in Mobile Drawer */}
            <div className="mt-2.5">
              <PWAInstallButton variant="card" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
