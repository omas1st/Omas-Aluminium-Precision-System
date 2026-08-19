import React, { useState, useEffect } from 'react';
import {
  FabricationItemInput,
  CombinedProjectCalculation,
  ConstantProfilesConfig,
  MaterialPricesConfig,
  SavedProject,
} from './types';
import {
  getStoredConstants,
  getStoredPrices,
  saveStoredPrices,
  getSavedProjects,
  saveProject,
} from './utils/storage';
import { calculateEntireProject } from './utils/calculator';
import { checkAndRunDailyBackgroundSync } from './utils/cloudSync';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { MeasurementInput } from './components/MeasurementInput';
import { OutputDashboard } from './components/OutputDashboard';
import { SavedDataPage } from './components/SavedDataPage';
import { AdminPanel } from './components/AdminPanel';
import { RestoreDataModal } from './components/RestoreDataModal';
import { CloudSyncBanner } from './components/CloudSyncBanner';

export default function App() {
  const [constants, setConstants] = useState<ConstantProfilesConfig>(getStoredConstants());
  const [prices, setPrices] = useState<MaterialPricesConfig>(getStoredPrices());
  const [currentView, setCurrentView] = useState<'home' | 'input' | 'output' | 'saved' | 'admin'>('home');
  const [outputInitialTab, setOutputInitialTab] = useState<'preview' | 'profiles' | 'frames' | 'quotation'>('preview');
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState<boolean>(false);

  // Active Project Data
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeProjectName, setActiveProjectName] = useState<string>('Villa Windows & Doors Project');
  const [activeItems, setActiveItems] = useState<FabricationItemInput[]>([
    {
      id: 'init-1',
      tag: 'W1 - Living Room Slider',
      type: 'window',
      kind: 'sliding_2_panel',
      width: 1200,
      height: 1500,
      quantity: 2,
    },
    {
      id: 'init-2',
      tag: 'W2 - Bedroom Slider',
      type: 'window',
      kind: 'sliding_2_panel',
      width: 1000,
      height: 1200,
      quantity: 1,
    },
    {
      id: 'init-3',
      tag: 'W3 - Kitchen Fixed Glass',
      type: 'window',
      kind: 'fixed_window',
      width: 800,
      height: 600,
      quantity: 1,
    },
  ]);

  const [activeCalculation, setActiveCalculation] = useState<CombinedProjectCalculation | null>(null);
  const [savedProjectsList, setSavedProjectsList] = useState<SavedProject[]>(getSavedProjects());

  // Background 24-hour daily cloud sync checker
  useEffect(() => {
    checkAndRunDailyBackgroundSync();

    // Check periodically every hour
    const syncInterval = setInterval(() => {
      checkAndRunDailyBackgroundSync();
    }, 60 * 60 * 1000);

    // Event listener for cloud data restoration
    const handleDataRestored = () => {
      const updatedConstants = getStoredConstants();
      const updatedPrices = getStoredPrices();
      const updatedProjects = getSavedProjects();

      setConstants(updatedConstants);
      setPrices(updatedPrices);
      setSavedProjectsList(updatedProjects);

      if (activeItems.length > 0) {
        const calc = calculateEntireProject(activeProjectName, activeItems, updatedConstants);
        setActiveCalculation(calc);
      }
    };

    window.addEventListener('omas_cloud_data_restored', handleDataRestored);
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('omas_cloud_data_restored', handleDataRestored);
    };
  }, [activeItems, activeProjectName]);

  const navigateTo = (view: 'home' | 'input' | 'output' | 'saved' | 'admin') => {
    try {
      if (view === 'admin') {
        window.location.hash = '/admin';
      } else if (view === 'saved') {
        window.location.hash = '/saved';
      } else if (view === 'input') {
        window.location.hash = '/input';
      } else if (view === 'output') {
        window.location.hash = '/output';
      } else {
        window.location.hash = '';
      }
    } catch {
      // safe fallback if sandbox limits hash
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check URL pathname & hash for routing
  useEffect(() => {
    const handleUrlRoute = () => {
      try {
        const path = window.location.pathname.toLowerCase();
        const hash = window.location.hash.toLowerCase();
        if (path === '/admin' || hash === '#admin' || hash === '#/admin') {
          setCurrentView('admin');
        } else if (path === '/saved' || hash === '#saved' || hash === '#/saved') {
          setCurrentView('saved');
        } else if (path === '/input' || hash === '#input' || hash === '#/input') {
          setCurrentView('input');
        } else if (path === '/output' || hash === '#output' || hash === '#/output') {
          setCurrentView('output');
        } else if (path === '/' || hash === '' || hash === '#/' || hash === '#') {
          setCurrentView('home');
        }
      } catch (e) {
        console.error('Route error:', e);
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    window.addEventListener('hashchange', handleUrlRoute);
    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('hashchange', handleUrlRoute);
    };
  }, []);

  // Recalculate if active calculation exists and constants change
  useEffect(() => {
    if (activeItems.length > 0) {
      const calc = calculateEntireProject(activeProjectName, activeItems, constants);
      setActiveCalculation(calc);
    }
  }, [constants]);

  const handleStartNewCalculation = () => {
    setActiveProjectId(null);
    setActiveProjectName(`Fabrication Job #${Math.floor(1000 + Math.random() * 9000)}`);
    setActiveItems([]);
    navigateTo('input');
  };

  const handleContinueFromInput = (projectName: string, items: FabricationItemInput[]) => {
    const cleanProjectName = projectName.trim();
    setActiveProjectName(cleanProjectName);
    setActiveItems(items);

    // Auto-save the job to local storage immediately
    const currentProjects = getSavedProjects();
    const existingProject = activeProjectId
      ? currentProjects.find((p) => p.id === activeProjectId)
      : currentProjects.find((p) => p.name.trim().toLowerCase() === cleanProjectName.toLowerCase());

    const targetId = activeProjectId || existingProject?.id || `proj-${Date.now()}`;
    const projectToSave: SavedProject = {
      id: targetId,
      name: cleanProjectName,
      dateCreated: existingProject?.dateCreated || new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
      items: items,
      constantsSnapshot: constants,
    };

    saveProject(projectToSave);
    setActiveProjectId(targetId);
    setSavedProjectsList(getSavedProjects());

    const calc = calculateEntireProject(cleanProjectName, items, constants);
    setActiveCalculation(calc);
    setOutputInitialTab('preview');
    navigateTo('output');
  };

  const handleOpenSavedProject = (
    project: SavedProject,
    initialTab: 'preview' | 'profiles' | 'frames' | 'quotation' = 'preview'
  ) => {
    setActiveProjectId(project.id);
    setActiveProjectName(project.name);
    setActiveItems(project.items);
    const calc = calculateEntireProject(
      project.name,
      project.items,
      project.constantsSnapshot || constants
    );
    setActiveCalculation(calc);
    setOutputInitialTab(initialTab);
    navigateTo('output');
  };

  const handleEditSavedProject = (project: SavedProject) => {
    setActiveProjectId(project.id);
    setActiveProjectName(project.name);
    setActiveItems(project.items);
    navigateTo('input');
  };

  const handleUpdateConstants = (newConstants: ConstantProfilesConfig) => {
    setConstants(newConstants);
    if (activeItems.length > 0) {
      const calc = calculateEntireProject(activeProjectName, activeItems, newConstants);
      setActiveCalculation(calc);
    }
  };

  const handleUpdatePrices = (newPrices: MaterialPricesConfig) => {
    setPrices(newPrices);
    saveStoredPrices(newPrices);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        hasActiveCalculation={!!activeCalculation}
        onOpenRestoreModal={() => setIsRestoreModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Global Fast Local Storage + Daily MongoDB Cloud Backup Banner */}
        <CloudSyncBanner
          onOpenRestoreModal={() => setIsRestoreModalOpen(true)}
          onSyncComplete={() => {
            setSavedProjectsList(getSavedProjects());
          }}
        />

        {currentView === 'home' && (
          <HomePage
            onStartCalculation={handleStartNewCalculation}
            onOpenSavedData={() => navigateTo('saved')}
            onOpenAdmin={() => navigateTo('admin')}
            savedProjectsCount={savedProjectsList.length}
            recentProjects={savedProjectsList}
            onOpenProject={(proj) => handleOpenSavedProject(proj, 'preview')}
          />
        )}

        {currentView === 'input' && (
          <MeasurementInput
            initialProjectName={activeProjectName}
            initialItems={activeItems}
            constants={constants}
            onContinue={handleContinueFromInput}
            onBackToHome={() => navigateTo('home')}
          />
        )}

        {currentView === 'output' && activeCalculation && (
          <OutputDashboard
            calculation={activeCalculation}
            constants={constants}
            prices={prices}
            initialTab={outputInitialTab}
            rawItems={activeItems}
            onBackToEdit={() => navigateTo('input')}
            onGoToSaved={() => {
              setSavedProjectsList(getSavedProjects());
              navigateTo('saved');
            }}
            onOpenAdminPrices={() => navigateTo('admin')}
          />
        )}

        {currentView === 'saved' && (
          <SavedDataPage
            onOpenProject={handleOpenSavedProject}
            onEditProjectItems={handleEditSavedProject}
            onNewCalculation={handleStartNewCalculation}
          />
        )}

        {currentView === 'admin' && (
          <AdminPanel
            constants={constants}
            prices={prices}
            onUpdateConstants={handleUpdateConstants}
            onUpdatePrices={handleUpdatePrices}
            onBackToHome={() => navigateTo('home')}
          />
        )}
      </main>

      {/* 5-Digit Gmail OTP Data Restore Modal */}
      <RestoreDataModal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        onRestoreSuccess={() => {
          setSavedProjectsList(getSavedProjects());
          setConstants(getStoredConstants());
          setPrices(getStoredPrices());
        }}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-6 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-slate-300">Aluminum Fabrication System</span> — Professional Profile Stock & Cutting Optimizer
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Standard Stock: {constants.stockProfileLength}mm</span>
            <span>•</span>
            <span>Currency: {prices.currency}</span>
            <span>•</span>
            <button
              onClick={() => navigateTo('admin')}
              className="text-indigo-400 hover:underline"
            >
              Admin Config & Material Prices (/admin)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
