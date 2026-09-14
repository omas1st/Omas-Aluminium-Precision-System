import React, { useState, useEffect, useRef } from 'react';
import {
  FabricationItemInput,
  CombinedProjectCalculation,
  ConstantProfilesConfig,
  MaterialPricesConfig,
  SavedProject,
  FabricationKind,
  FabricationType,
} from '../types';
import { calculateEntireProject } from '../utils/calculator';
import { getMaterialDisplayName } from '../utils/materialNamesStorage';
import {
  downloadSimpleOutputPdf,
  downloadClientBillPdf,
  ClientBillItemForPdf,
} from '../utils/pdfGenerator';
import {
  getStoredPricingRules,
  getStoredCompanyProfile,
  calculateItemClientPrice,
} from '../utils/workPricingCalculator';
import { getSavedProjects, saveProject } from '../utils/storage';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Calculator,
  Plus,
  Menu,
  X,
  FolderOpen,
  Download,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Trash2,
  RotateCcw,
  Check,
  Shield,
  Layers,
  Sparkles,
  Smartphone,
  Sliders,
  FileText,
  Boxes,
  Eye,
  Palette,
} from 'lucide-react';
import { SIMPLE_THEMES, SimpleCalcTheme } from '../utils/simpleThemes';

interface SimpleCalculatorViewProps {
  constants: ConstantProfilesConfig;
  prices: MaterialPricesConfig;
  initialItems?: FabricationItemInput[];
  initialProjectName?: string;
  onSwitchToProfessional: (items: FabricationItemInput[], projectName: string) => void;
  onUpdateItems?: (items: FabricationItemInput[], projectName: string) => void;
}

const getCleanSubtypeLabel = (st: FabricationKind): string => {
  const map: Record<string, string> = {
    casement_2_panel: 'Casement 2-Panel',
    casement_3_panel: 'Casement 3-Panel',
    casement_1_fixed_1_open: 'Casement 1-Fixed + 1-Open',
    casement_fixed_window: 'Casement Fixed Picture',
    sliding_2_panel: 'Sliding 2-Panel',
    sliding_3_panel: 'Sliding 3-Panel',
    sliding_4_panel: 'Sliding 4-Panel',
    transom_window: 'Transom 1-Panel',
    transom_2_panel: 'Transom 2-Panel',
    casement_door_single: 'Casement Single Door',
    casement_door_double: 'Casement Double Door',
    sliding_door_2_panel: 'Sliding Door 2-Panel',
    sliding_door_3_panel: 'Sliding Door 3-Panel',
    sliding_door_4_panel: 'Sliding Door 4-Panel',
  };
  return map[st] || st.replace(/_/g, ' ');
};

export const SimpleCalculatorView: React.FC<SimpleCalculatorViewProps> = ({
  constants,
  prices,
  initialItems = [],
  initialProjectName = 'Workshop Job #1',
  onSwitchToProfessional,
  onUpdateItems,
}) => {
  // Project identification
  const [projectName, setProjectName] = useState<string>(initialProjectName);

  // List of input items
  const [items, setItems] = useState<FabricationItemInput[]>(() => {
    if (initialItems.length > 0) return initialItems;
    return [];
  });

  // Active numeric inputs for width and height (1200 by 1200 by default)
  const [widthInput, setWidthInput] = useState<string>('1200');
  const [heightInput, setHeightInput] = useState<string>('1200');
  const [quantityInput, setQuantityInput] = useState<string>('1');

  // Features dropdown state
  const [isFeaturesOpen, setIsFeaturesOpen] = useState<boolean>(false);
  const [category, setCategory] = useState<FabricationType>('window');
  const [subtype, setSubtype] = useState<FabricationKind>('casement_2_panel');
  const [hasBurglary, setHasBurglary] = useState<boolean>(true);
  const [hasNet, setHasNet] = useState<boolean>(true);
  const [dividerCount, setDividerCount] = useState<number>(1);

  // Calculated Output & Modes
  const [calculation, setCalculation] = useState<CombinedProjectCalculation | null>(() => {
    if (initialItems.length > 0) {
      return calculateEntireProject(initialProjectName, initialItems, constants);
    }
    return null;
  });

  // Display View Tab: 'inputs' or 'output'
  const [displayTab, setDisplayTab] = useState<'inputs' | 'output'>(
    initialItems.length > 0 ? 'output' : 'inputs'
  );

  // Pop-up modal for simplified output
  const [isOutputPopupOpen, setIsOutputPopupOpen] = useState<boolean>(false);
  const [popupCalculation, setPopupCalculation] = useState<CombinedProjectCalculation | null>(null);

  // Menu dropdown state
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Saved Data modal state
  const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [selectedSavedProject, setSelectedSavedProject] = useState<SavedProject | null>(null);

  // PWA install hook
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [installPromptMsg, setInstallPromptMsg] = useState<string | null>(null);

  // 10 Themes state
  const [themeId, setThemeId] = useState<string>(() => {
    try {
      return localStorage.getItem('omas_simple_calc_theme') || 'dark_titanium';
    } catch {
      return 'dark_titanium';
    }
  });
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [clearSuccessToast, setClearSuccessToast] = useState<string | null>(null);

  const activeTheme: SimpleCalcTheme =
    SIMPLE_THEMES.find((t) => t.id === themeId) || SIMPLE_THEMES[0];

  const handleSelectTheme = (newThemeId: string) => {
    setThemeId(newThemeId);
    try {
      localStorage.setItem('omas_simple_calc_theme', newThemeId);
    } catch {}
    setIsThemeModalOpen(false);
  };

  // Clear button at the bottom of the simple view screen: Empty the input list on screen and reset to defaults
  const handleClearInputList = () => {
    if (items.length === 0 && widthInput === '1200' && heightInput === '1200') {
      return;
    }
    setItems([]);
    setWidthInput('1200');
    setHeightInput('1200');
    setQuantityInput('1');
    setCalculation(null);
    setDisplayTab('inputs');
    onUpdateItems?.([], projectName);
    setClearSuccessToast('Input list cleared');
    setTimeout(() => setClearSuccessToast(null), 2500);
  };

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update parent when items change
  useEffect(() => {
    onUpdateItems?.(items, projectName);
  }, [items, projectName]);

  // Load saved projects when saved modal opens
  const handleOpenSavedModal = () => {
    setSavedProjects(getSavedProjects());
    setIsSavedModalOpen(true);
    setIsMenuOpen(false);
  };

  // Plus button: Add item to the list of input data
  const handleAddMeasurement = () => {
    const w = parseInt(widthInput, 10);
    const h = parseInt(heightInput, 10);
    const qty = parseInt(quantityInput, 10) || 1;

    if (isNaN(w) || w <= 0 || isNaN(h) || h <= 0) {
      alert('Please enter valid dimensions for Width and Height in millimeters (mm).');
      return;
    }

    const itemTag = `${category === 'window' ? 'W' : 'D'}${items.length + 1}`;
    const newItem: FabricationItemInput = {
      id: `simple-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tag: itemTag,
      type: category,
      kind: subtype,
      width: w,
      height: h,
      quantity: qty,
      hasBurglary,
      hasNet,
      dividerCount,
    };

    const nextItems = [...items, newItem];
    setItems(nextItems);
    setDisplayTab('inputs');

    // Empty width and height inputs so the user will not make a mistake
    setWidthInput('');
    setHeightInput('');
    setQuantityInput('1');

    // Auto-calculate in background so result is ready
    const calc = calculateEntireProject(projectName, nextItems, constants);
    setCalculation(calc);
  };

  // Remove single item from list
  const handleRemoveItem = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const nextItems = items.filter((item) => item.id !== id);
    setItems(nextItems);
    if (nextItems.length === 0) {
      setCalculation(null);
      setDisplayTab('inputs');
    } else {
      const calc = calculateEntireProject(projectName, nextItems, constants);
      setCalculation(calc);
    }
  };

  // Clear all items
  const handleClearAll = () => {
    if (items.length === 0) return;
    if (window.confirm('Clear all added window & door measurements?')) {
      setItems([]);
      setCalculation(null);
      setDisplayTab('inputs');
    }
  };

  // Calculate Button
  const handleCalculate = () => {
    if (items.length === 0) {
      // If user typed numbers but didn't tap plus yet, automatically add current numbers
      const w = parseInt(widthInput, 10);
      const h = parseInt(heightInput, 10);
      const qty = parseInt(quantityInput, 10) || 1;
      if (!isNaN(w) && w > 0 && !isNaN(h) && h > 0) {
        const itemTag = `${category === 'window' ? 'W' : 'D'}1`;
        const newItem: FabricationItemInput = {
          id: `simple-${Date.now()}`,
          tag: itemTag,
          type: category,
          kind: subtype,
          width: w,
          height: h,
          quantity: qty,
          hasBurglary,
          hasNet,
          dividerCount,
        };
        const nextItems = [newItem];
        setItems(nextItems);
        setWidthInput('');
        setHeightInput('');
        setQuantityInput('1');
        const calc = calculateEntireProject(projectName, nextItems, constants);
        setCalculation(calc);
        setDisplayTab('output');
        return;
      }
      alert('Please add at least one measurement using the (+) button before calculating.');
      return;
    }

    const calc = calculateEntireProject(projectName, items, constants);
    setCalculation(calc);
    setDisplayTab('output');

    // Save project automatically
    const projectToSave: SavedProject = {
      id: `proj-${Date.now()}`,
      name: projectName.trim() || 'Simple Workshop Job',
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
      items: items,
      constantsSnapshot: constants,
    };
    saveProject(projectToSave);
  };

  // Open pop-up mode for current calculation
  const handleOpenCurrentPopup = () => {
    if (!calculation && items.length > 0) {
      const calc = calculateEntireProject(projectName, items, constants);
      setCalculation(calc);
      setPopupCalculation(calc);
    } else {
      setPopupCalculation(calculation);
    }
    setIsOutputPopupOpen(true);
  };

  // Open saved project in simple pop-up mode
  const handleSelectSavedProject = (proj: SavedProject) => {
    const calc = calculateEntireProject(
      proj.name,
      proj.items,
      proj.constantsSnapshot || constants
    );
    setSelectedSavedProject(proj);
    setPopupCalculation(calc);
    setIsSavedModalOpen(false);
    setIsOutputPopupOpen(true);
  };

  // 1. Download Simple Output PDF (Extrusions + Materials Needed ONLY, strictly NO price/amount)
  const handleDownloadSimpleOutput = (targetCalc: CombinedProjectCalculation) => {
    try {
      const company = getStoredCompanyProfile();
      downloadSimpleOutputPdf(targetCalc, company?.companyName);
    } catch (e) {
      console.error('Failed to download output PDF:', e);
      alert('Could not generate output PDF. Please check data and try again.');
    }
  };

  // 2. Download Customer Quotation PDF (Customer-facing bill, Naira ₦ by default, not company internal quotation)
  const handleDownloadCustomerQuotation = (targetCalc: CombinedProjectCalculation) => {
    try {
      const companyProfile = getStoredCompanyProfile();
      const pricingRules = getStoredPricingRules();

      const itemsForPdf: ClientBillItemForPdf[] = (targetCalc.items || []).map((itemRes, idx) => {
        const rawItem = itemRes.item;
        const itemPricing = calculateItemClientPrice(rawItem, pricingRules);
        return {
          category: itemPricing.categoryName,
          label: rawItem.tag || `Unit #${idx + 1}`,
          widthMm: rawItem.width || 0,
          heightMm: rawItem.height || 0,
          extraOptionLabel: itemPricing.extraOptionLabel,
          hasExtra: itemPricing.hasExtraOption,
          unitPrice: itemPricing.unitPrice,
          quantity: rawItem.quantity || 1,
          totalPrice: itemPricing.totalPrice,
        };
      });

      const worksSubtotal = itemsForPdf.reduce((sum, it) => sum + (it.totalPrice || 0), 0);
      const totalUnits = itemsForPdf.reduce((sum, it) => sum + (it.quantity || 1), 0);
      const laborAmount = (companyProfile.defaultLaborPerWork || 10000) * totalUnits;
      const transportAmount = companyProfile.defaultTransport || 0;
      const vatPercent = companyProfile.defaultVatPercent || 0;
      const preVatTotal = worksSubtotal + laborAmount + transportAmount;
      const vatAmount = (preVatTotal * vatPercent) / 100;
      const grandTotal = preVatTotal + vatAmount;

      const currencySymbol = companyProfile.defaultCurrencySymbol || '₦';
      const currencyCode = companyProfile.defaultCurrency || 'NGN';

      downloadClientBillPdf(
        targetCalc.projectName || 'Project Quotation',
        targetCalc.dateCalculated || new Date().toISOString(),
        {
          clientName: 'Valued Client',
          quoteRefNumber: `OMAS-${Math.floor(1000 + Math.random() * 9000)}`,
          validityDays: 30,
          projectSiteAddress: 'Client Project Site',
        },
        companyProfile.companyName,
        companyProfile.phoneNumber,
        companyProfile.email,
        companyProfile.address,
        itemsForPdf,
        {
          currencySymbol,
          currencyCode,
          worksSubtotal,
          laborAmount,
          transportAmount,
          taxPercent: vatPercent,
          taxAmount: vatAmount,
          grandTotal,
        }
      );
    } catch (e) {
      console.error('Failed to download customer quotation PDF:', e);
      alert('Could not generate customer quotation PDF. Please check data and try again.');
    }
  };

  // Handle Install App action
  const handleInstallApp = async () => {
    setIsMenuOpen(false);
    if (isInstalled) {
      setInstallPromptMsg('The app is already installed on your device!');
      setTimeout(() => setInstallPromptMsg(null), 4000);
      return;
    }
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallPromptMsg('App installed successfully!');
      }
      setTimeout(() => setInstallPromptMsg(null), 4000);
    } else if (isIOS) {
      setInstallPromptMsg(
        'To install on iOS: Tap the Share button in Safari and select "Add to Home Screen".'
      );
      setTimeout(() => setInstallPromptMsg(null), 6000);
    } else {
      setInstallPromptMsg(
        'To install: Open browser menu (⋮) and tap "Install App" or "Add to Home Screen".'
      );
      setTimeout(() => setInstallPromptMsg(null), 5000);
    }
  };

  return (
    <div className={`h-screen max-h-[100dvh] w-full flex flex-col ${activeTheme.appBg} ${activeTheme.textPrimary} font-sans select-none overflow-hidden transition-colors`}>
      {/* 1. TOP BAR (Header & Menu) */}
      <header className={`h-14 ${activeTheme.headerBg} border-b ${activeTheme.headerBorder} px-3 sm:px-4 flex items-center justify-between shrink-0 z-30 transition-colors`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black tracking-wider text-xs sm:text-sm text-white">
                OMAS PRECISION
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                Simple
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono truncate max-w-[120px] sm:max-w-xs">
              {projectName || 'Workshop Job'}
            </p>
          </div>
        </div>

        {/* Right Action Controls & Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme Selector Button (10 Styles) */}
          <button
            type="button"
            onClick={() => setIsThemeModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition-all cursor-pointer shadow-xs"
            title="Change Theme (10 Beautiful Themes)"
          >
            <Palette className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden xs:inline">Theme</span>
            <span
              className="w-2.5 h-2.5 rounded-full ring-1 ring-white/40 shadow-xs shrink-0"
              style={{ backgroundColor: activeTheme.swatch }}
            />
          </button>

          {/* Quick Switch to Professional View (Desktop/Tablet) */}
          <button
            type="button"
            onClick={() => onSwitchToProfessional(items, projectName)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition-all cursor-pointer shadow-xs"
            title="Switch to Complete Professional View"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span>Professional View</span>
          </button>

          {/* Quick Saved Data Button (Desktop/Tablet) */}
          <button
            type="button"
            onClick={handleOpenSavedModal}
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition-all cursor-pointer shadow-xs"
            title="View Saved Projects"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Saved Data</span>
          </button>

          {/* Top Menu Dropdown Button */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-all cursor-pointer flex items-center justify-center focus:ring-2 focus:ring-blue-500"
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Menu Dropdown Card */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-fadeIn">
                <div className="px-3 py-2 border-b border-slate-800">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Calculator Options
                  </div>
                  <div className="text-xs font-semibold text-slate-200 truncate mt-0.5">
                    {projectName}
                  </div>
                </div>

                {/* 1. Professional View Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onSwitchToProfessional(items, projectName);
                  }}
                  className="w-full px-3 py-2.5 text-left text-xs font-medium text-slate-200 hover:text-white hover:bg-blue-600/20 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                    <Sliders className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Professional View</div>
                    <div className="text-[10px] text-slate-400">3D Simulation, Blueprints & Bills</div>
                  </div>
                </button>

                {/* 2. Saved Data Button */}
                <button
                  type="button"
                  onClick={handleOpenSavedModal}
                  className="w-full px-3 py-2.5 text-left text-xs font-medium text-slate-200 hover:text-white hover:bg-amber-600/20 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <FolderOpen className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Saved Data</div>
                    <div className="text-[10px] text-slate-400">View Saved Jobs & Quotations</div>
                  </div>
                </button>

                {/* 3. Change Theme Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsThemeModalOpen(true);
                  }}
                  className="w-full px-3 py-2.5 text-left text-xs font-medium text-slate-200 hover:text-white hover:bg-purple-600/20 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <div
                    className="w-7 h-7 rounded-lg border border-white/20 flex items-center justify-center text-white"
                    style={{ backgroundColor: activeTheme.swatch }}
                  >
                    <Palette className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Themes (10 Styles)</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Active: {activeTheme.name}</div>
                  </div>
                </button>

                {/* 4. Install App Button */}
                <button
                  type="button"
                  onClick={handleInstallApp}
                  className="w-full px-3 py-2.5 text-left text-xs font-medium text-slate-200 hover:text-white hover:bg-emerald-600/20 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Smartphone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Install App</div>
                    <div className="text-[10px] text-slate-400">Add to Phone / Desktop Home Screen</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Clear Success Toast */}
      {clearSuccessToast && (
        <div className="bg-rose-950 border-b border-rose-800 px-4 py-2 text-xs text-rose-200 flex items-center justify-between shrink-0 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>{clearSuccessToast}</span>
          </div>
          <button onClick={() => setClearSuccessToast(null)} className="text-rose-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* PWA Toast Notice */}
      {installPromptMsg && (
        <div className="bg-emerald-900 border-b border-emerald-700 px-4 py-2 text-xs text-emerald-100 flex items-center justify-between shrink-0 animate-fadeIn">
          <span>{installPromptMsg}</span>
          <button onClick={() => setInstallPromptMsg(null)} className="text-emerald-300 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. FEATURES DROPDOWN BAR */}
      <div className="bg-slate-900/90 border-b border-slate-800 shrink-0 z-20">
        <button
          type="button"
          onClick={() => setIsFeaturesOpen((prev) => !prev)}
          className="w-full px-3 py-2 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 overflow-hidden text-left">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              Features:
            </span>
            <span className="truncate text-slate-200">
              {category === 'window' ? 'Window' : 'Door'} • {getCleanSubtypeLabel(subtype)}
              {hasBurglary ? ' • Burglary' : ''}
              {hasNet ? ' • Net' : ''}
              {dividerCount > 0 ? ` • ${dividerCount} Div` : ''}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0 text-slate-400">
            <span className="text-[10px]">{isFeaturesOpen ? 'Hide' : 'Configure'}</span>
            {isFeaturesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {/* Collapsible Features & Add-ons Tray */}
        {isFeaturesOpen && (
          <div className="p-3 bg-slate-900 border-t border-slate-800 text-xs space-y-3 animate-fadeIn max-h-56 overflow-y-auto">
            {/* Project Identification */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Project Identification / Job Tag
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Master Bedroom Windows"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Category & Subtype */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Fabrication Category
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    const nextCat = e.target.value as FabricationType;
                    setCategory(nextCat);
                    if (nextCat === 'window') setSubtype('casement_2_panel');
                    else setSubtype('casement_door_single');
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="window">Window</option>
                  <option value="door">Door</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Subtype & Configuration
                </label>
                <select
                  value={subtype}
                  onChange={(e) => setSubtype(e.target.value as FabricationKind)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {category === 'window' ? (
                    <>
                      <option value="casement_2_panel">Casement 2-Panel (2-Mullion / Standard)</option>
                      <option value="casement_3_panel">Casement 3-Panel (3-Mullion +6mm extra)</option>
                      <option value="casement_1_fixed_1_open">Casement 1-Fixed + 1-Open</option>
                      <option value="casement_fixed_window">Casement Fixed Picture Window</option>
                      <option value="sliding_2_panel">Sliding Window (2-Track / 2-Panel)</option>
                      <option value="sliding_3_panel">Sliding Window (3-Track / 3-Panel)</option>
                      <option value="sliding_4_panel">Sliding Window (4-Panel Center Open)</option>
                      <option value="transom_window">Transom 1-Panel Window (Side-Opening)</option>
                      <option value="transom_2_panel">Transom 2-Panel Window (Side-Opening with Center Mullion)</option>
                    </>
                  ) : (
                    <>
                      <option value="casement_door_single">Casement Single Hinged Door</option>
                      <option value="casement_door_double">Casement Double French Door</option>
                      <option value="sliding_door_2_panel">Sliding Door (2-Panel / 2-Track)</option>
                      <option value="sliding_door_3_panel">Sliding Door (3-Panel / 3-Track)</option>
                      <option value="sliding_door_4_panel">Sliding Door (4-Panel Center Open)</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Features & Add-ons Checkboxes */}
            <div className="pt-1 border-t border-slate-800/80">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                Features & Add-Ons
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <label className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={hasBurglary}
                    onChange={(e) => setHasBurglary(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span className="text-[11px] text-slate-200 font-medium">Burglary Frame / Iron Rods</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={hasNet}
                    onChange={(e) => setHasNet(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span className="text-[11px] text-slate-200 font-medium">Insect / Mosquito Net Frame</span>
                </label>

                <div className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="text-[11px] text-slate-200 font-medium">Glazing Dividers:</span>
                  <select
                    value={dividerCount}
                    onChange={(e) => setDividerCount(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 text-white text-[11px] rounded px-1.5 py-0.5"
                  >
                    <option value={0}>None (0)</option>
                    <option value={1}>1 Bar (Default)</option>
                    <option value={2}>2 Bars</option>
                    <option value={3}>3 Bars</option>
                    <option value={4}>4 Bars</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. DISPLAY WINDOW (Calculator Screen & Output Tape) */}
      <div className="flex-1 min-h-0 flex flex-col p-2.5 sm:p-4 bg-slate-950 overflow-hidden">
        <div
          onClick={calculation ? handleOpenCurrentPopup : undefined}
          className="flex-1 min-h-0 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col shadow-inner overflow-hidden cursor-pointer group hover:border-slate-700 transition-all relative"
        >
          {/* Display Header Tabs */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 shrink-0">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDisplayTab('inputs');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  displayTab === 'inputs'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
                }`}
              >
                Input List ({items.length})
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!calculation && items.length > 0) {
                    setCalculation(calculateEntireProject(projectName, items, constants));
                  }
                  setDisplayTab('output');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  displayTab === 'output'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
                }`}
              >
                Calculated Output
              </button>
            </div>

            <div className="flex items-center gap-2">
              {calculation && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenCurrentPopup();
                  }}
                  className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-950/60 border border-blue-800/60 px-2 py-0.5 rounded-md cursor-pointer"
                  title="Click to expand pop-up view"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Pop-up View</span>
                </button>
              )}
            </div>
          </div>

          {/* Display Body: View 1 - Input List */}
          {displayTab === 'inputs' && (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 select-text">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
                  <Calculator className="w-8 h-8 mb-2 opacity-40 text-blue-400" />
                  <p className="text-xs font-semibold text-slate-400">No measurements added yet</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                    Enter Width (mm) and Height (mm) below, then tap <strong className="text-blue-400">(+)</strong> to add.
                  </p>
                </div>
              ) : (
                items.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center justify-between p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-blue-950 text-blue-300 font-mono font-bold flex items-center justify-center text-[10px] border border-blue-800/60">
                        {item.tag || `#${idx + 1}`}
                      </span>
                      <div>
                        <div className="font-bold text-white font-mono flex items-center gap-1.5">
                          <span>{item.width} × {item.height} mm</span>
                          <span className="text-[10px] font-normal text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">
                            {item.quantity} {item.quantity === 1 ? 'unit' : 'units'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="capitalize">{getCleanSubtypeLabel(item.kind)}</span>
                          {item.hasBurglary && <span className="text-amber-400">• Burglary</span>}
                          {item.hasNet && <span className="text-emerald-400">• Net</span>}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleRemoveItem(item.id, e)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Remove measurement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Display Body: View 2 - Calculated Simple Output */}
          {displayTab === 'output' && (
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs select-text">
              {!calculation ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
                  <p className="text-xs font-semibold text-slate-400">Ready to calculate</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Tap the green <strong>Calculate</strong> button below to compute required profiles & accessories.
                  </p>
                </div>
              ) : (
                <>
                  {/* Click hint */}
                  <div className="text-[10px] text-blue-400 bg-blue-950/40 border border-blue-800/40 px-2 py-1 rounded-lg flex items-center justify-between">
                    <span>💡 Tap display window to open full Pop-up Mode</span>
                    <span className="font-bold">Click to Expand ⛶</span>
                  </div>

                  {/* Section A: Aluminum Extrusion Profiles sections ONLY */}
                  <div className="space-y-1.5">
                    <div className="font-bold text-[11px] text-blue-400 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        <span>Aluminum Extrusion Profiles (5800mm Bars)</span>
                      </span>
                      <span className="text-slate-400 font-mono font-normal">
                        Total: {calculation.totalBarsCount} bars
                      </span>
                    </div>

                    <div className="space-y-1">
                      {calculation.profileOptimizations.map((prof, pIdx) => (
                        <div
                          key={pIdx}
                          className={`p-2 ${activeTheme.outputCardBg} border ${activeTheme.outputCardBorder} rounded-lg flex items-center justify-between text-xs transition-colors`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-semibold text-slate-100 truncate">
                              {getMaterialDisplayName(prof.profileName)}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                              <span>Cut Pcs: <strong className="text-slate-200">{prof.totalPieces}</strong></span>
                              <span>Net: <strong className="text-slate-200">{prof.totalLengthRequired.toLocaleString()} mm</strong></span>
                              <span>Offcut: <strong className="text-amber-400">{prof.totalWasteLength.toLocaleString()} mm ({prof.wastePercentage}%)</strong></span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs ${activeTheme.profileBarBadge} border`}>
                              {prof.barsNeeded} bars
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section B: Glass Panes Needed (Cutting Schedule) - Always before Materials */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <div className="font-bold text-[11px] text-teal-300 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Maximize2 className="w-3.5 h-3.5 text-teal-400" />
                        <span>Glass Needed (Cut Sizes)</span>
                      </span>
                      <span className="text-teal-400 font-mono font-normal text-[10px] bg-teal-950/60 px-1.5 py-0.2 rounded border border-teal-800/40">
                        {calculation.totalGlassAreaM2} m² • {calculation.allGlasses.length} panes
                      </span>
                    </div>

                    {calculation.allGlasses.length === 0 ? (
                      <div className="p-2 text-center text-[11px] text-slate-500 bg-slate-950/40 rounded-lg">
                        No glazed units requiring glass panes
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {calculation.allGlasses.map((g, gIdx) => (
                          <div
                            key={gIdx}
                            className={`p-2 ${activeTheme.outputCardBg} border ${activeTheme.outputCardBorder} rounded-lg flex items-center justify-between text-xs transition-colors`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="font-semibold text-slate-100 truncate flex items-center gap-1.5">
                                <span className="font-mono text-teal-400 font-bold">[{g.itemTag}]</span>
                                <span>{g.paneDescription}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                                <span>Cut: <strong className="text-teal-300">{g.width} × {g.height} mm</strong></span>
                                <span>Area: <strong className="text-slate-300">{g.areaM2} m²</strong></span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs ${activeTheme.glassBadge} border`}>
                                {g.quantity} {g.quantity > 1 ? 'panes' : 'pane'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section C: Materials & Hardware Needed */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <div className="font-bold text-[11px] text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Boxes className="w-3.5 h-3.5 text-amber-400" />
                      <span>Materials & Hardware Needed</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {calculation.allAccessories.map((acc, aIdx) => (
                        <div
                          key={aIdx}
                          className={`p-2 ${activeTheme.outputCardBg} border ${activeTheme.outputCardBorder} rounded-lg flex items-center justify-between text-xs transition-colors`}
                        >
                          <span className="text-slate-200 truncate pr-2">
                            {getMaterialDisplayName(acc.name)}
                          </span>
                          <span className={`font-mono font-bold text-xs shrink-0 ${activeTheme.materialsBadge} px-1.5 py-0.5 rounded border`}>
                            {acc.quantity} {acc.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. INPUT CONTROLS & CALCULATOR BUTTONS (Bottom Half - Non-scrolling) */}
      <div className={`${activeTheme.controlsBg} border-t ${activeTheme.controlsBorder} p-2.5 sm:p-4 shrink-0 space-y-2.5 transition-colors`}>
        {/* Input Fields Row: Width, Height, Quantity */}
        <div className="grid grid-cols-3 gap-2">
          {/* Width Input */}
          <div className={`${activeTheme.inputBg} p-2 rounded-xl border ${activeTheme.inputBorder} transition-colors`}>
            <label className="block text-[10px] uppercase font-bold text-slate-400">
              Width (mm)
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={widthInput}
              onChange={(e) => setWidthInput(e.target.value)}
              placeholder="0"
              className={`w-full bg-transparent font-mono font-bold text-sm sm:text-base ${activeTheme.inputText} focus:outline-hidden placeholder:text-slate-500`}
            />
          </div>

          {/* Height Input */}
          <div className={`${activeTheme.inputBg} p-2 rounded-xl border ${activeTheme.inputBorder} transition-colors`}>
            <label className="block text-[10px] uppercase font-bold text-slate-400">
              Height (mm)
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={heightInput}
              onChange={(e) => setHeightInput(e.target.value)}
              placeholder="0"
              className={`w-full bg-transparent font-mono font-bold text-sm sm:text-base ${activeTheme.inputText} focus:outline-hidden placeholder:text-slate-500`}
            />
          </div>

          {/* Quantity Input */}
          <div className={`${activeTheme.inputBg} p-2 rounded-xl border ${activeTheme.inputBorder} transition-colors`}>
            <label className="block text-[10px] uppercase font-bold text-slate-400">
              Units (Qty)
            </label>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              value={quantityInput}
              onChange={(e) => setQuantityInput(e.target.value)}
              placeholder="1"
              className={`w-full bg-transparent font-mono font-bold text-sm sm:text-base ${activeTheme.inputText} focus:outline-hidden`}
            />
          </div>
        </div>

        {/* Action Buttons Row: [Clear], [+] Add More, and [Calculate] */}
        <div className="grid grid-cols-12 gap-2">
          {/* Clear Button: empty input list and reset */}
          <button
            type="button"
            onClick={handleClearInputList}
            className={`col-span-3 sm:col-span-3 py-3 rounded-xl font-bold text-xs sm:text-sm border transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 active:scale-[0.98] shadow-sm ${
              items.length > 0 || widthInput || heightInput
                ? 'bg-rose-950/80 hover:bg-rose-900 border-rose-800 text-rose-200'
                : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-400'
            }`}
            title="Clear list & reset inputs"
          >
            <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Clear</span>
          </button>

          {/* Plus button to add measurement */}
          <button
            type="button"
            onClick={handleAddMeasurement}
            className={`col-span-4 sm:col-span-4 py-3 ${activeTheme.addBtnBg} active:scale-[0.98] font-bold text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer`}
            title="Add measurement to list (+)"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5] shrink-0" />
            <span>Add More</span>
          </button>

          {/* Calculate Button */}
          <button
            type="button"
            onClick={handleCalculate}
            className={`col-span-5 sm:col-span-5 py-3 ${activeTheme.calcBtnBg} active:scale-[0.98] font-bold text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center gap-1 sm:gap-2 transition-all cursor-pointer`}
            title="Calculate required materials"
          >
            <Calculator className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2] shrink-0" />
            <span className="truncate">Calculate</span>
          </button>
        </div>
      </div>

      {/* 5. SIMPLE OUTPUT POP-UP MODAL */}
      {isOutputPopupOpen && popupCalculation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Simple Output Specification
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    {popupCalculation.totalBarsCount} Total Bars
                  </span>
                </div>
                <h3 className="text-base font-black text-white mt-0.5">
                  {popupCalculation.projectName}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsOutputPopupOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content (Only Extrusion Profiles & Materials Needed as requested) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs select-text">
              {/* Table 1: Aluminum Extrusion Profiles sections ONLY */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-blue-300 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    <span>1. Aluminum Extrusion Profiles (5800mm Stock)</span>
                  </h4>
                  <span className="text-xs font-mono text-slate-400">
                    5800mm standard length
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                        <th className="p-2.5">Profile Name</th>
                        <th className="p-2.5 text-center">Bars Needed</th>
                        <th className="p-2.5 text-center">Cut Pcs</th>
                        <th className="p-2.5 text-right">Net Length (mm)</th>
                        <th className="p-2.5 text-right">Offcut (mm)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {popupCalculation.profileOptimizations.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-2.5 font-bold text-white">
                            {getMaterialDisplayName(p.profileName)}
                          </td>
                          <td className="p-2.5 text-center">
                            <span className="font-mono font-bold text-blue-300 bg-blue-950 px-2 py-0.5 rounded border border-blue-800/60">
                              {p.barsNeeded} bars
                            </span>
                          </td>
                          <td className="p-2.5 text-center font-mono text-slate-300">
                            {p.totalPieces} pcs
                          </td>
                          <td className="p-2.5 text-right font-mono text-slate-300">
                            {p.totalLengthRequired.toLocaleString()} mm
                          </td>
                          <td className="p-2.5 text-right font-mono text-amber-400">
                            {p.totalWasteLength.toLocaleString()} mm ({p.wastePercentage}%)
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 2: Glass Panes Needed (Cutting Schedule) - Always before Materials */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-teal-300 uppercase tracking-wider flex items-center gap-2">
                    <Maximize2 className="w-4 h-4 text-teal-400" />
                    <span>2. Glass Panes Needed (Cutting Schedule)</span>
                  </h4>
                  <span className="text-xs font-mono text-teal-400">
                    Total: {popupCalculation.totalGlassAreaM2} m² ({popupCalculation.allGlasses.length} Panes)
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  {popupCalculation.allGlasses.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500 bg-slate-950">
                      No glazed units requiring glass cutting
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                          <th className="p-2.5">Tag</th>
                          <th className="p-2.5">Description</th>
                          <th className="p-2.5 text-center">Cut Width (mm)</th>
                          <th className="p-2.5 text-center">Cut Height (mm)</th>
                          <th className="p-2.5 text-center">Qty (Panes)</th>
                          <th className="p-2.5 text-right">Area (m²)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {popupCalculation.allGlasses.map((glass, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-2.5 font-mono font-bold text-teal-400">
                              {glass.itemTag}
                            </td>
                            <td className="p-2.5 font-medium text-slate-200">
                              {glass.paneDescription}
                            </td>
                            <td className="p-2.5 text-center font-mono font-bold text-white">
                              {glass.width} mm
                            </td>
                            <td className="p-2.5 text-center font-mono font-bold text-white">
                              {glass.height} mm
                            </td>
                            <td className="p-2.5 text-center font-mono font-bold text-teal-300">
                              <span className="bg-teal-950 px-2 py-0.5 rounded border border-teal-800/60">
                                {glass.quantity}
                              </span>
                            </td>
                            <td className="p-2.5 text-right font-mono text-slate-300">
                              {glass.areaM2} m²
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Table 3: Materials Needed (Accessories) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-amber-300 uppercase tracking-wider flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-amber-400" />
                    <span>3. Materials & Hardware Needed</span>
                  </h4>
                  <span className="text-xs font-mono text-slate-400">
                    Workshop count
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                        <th className="p-2.5">Material / Accessory Name</th>
                        <th className="p-2.5 text-right">Required Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {popupCalculation.allAccessories.map((acc, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-2.5 font-semibold text-slate-200">
                            {getMaterialDisplayName(acc.name)}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-amber-300">
                            {acc.quantity} {acc.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer (with Download Output & Download Quotation buttons) */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-[11px] text-slate-400">
                Simple Workshop Output • No financial amounts on output
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                {/* 1. Download Output Button (Output only, NO price/amount) */}
                <button
                  type="button"
                  onClick={() => handleDownloadSimpleOutput(popupCalculation)}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  title="Download Output Specification PDF (Extrusion profiles & materials needed only, no price/amount)"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Output</span>
                </button>

                {/* 2. Download Quotation Button (Customer Quotation, default Naira ₦) */}
                <button
                  type="button"
                  onClick={() => handleDownloadCustomerQuotation(popupCalculation)}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  title="Download Customer Quotation Bill PDF (Customer-facing, default Naira ₦)"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download Quotation</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsOutputPopupOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. SAVED DATA MODAL (Simple View) */}
      {isSavedModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">Saved Projects & Calculations</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSavedModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 select-text">
              {savedProjects.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p className="text-xs font-semibold text-slate-400">No saved projects found</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Calculate a job to automatically save it here.
                  </p>
                </div>
              ) : (
                savedProjects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => handleSelectSavedProject(proj)}
                    className="p-3 bg-slate-950 border border-slate-800 hover:border-blue-500/70 rounded-xl flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div>
                      <div className="font-bold text-white text-xs group-hover:text-blue-400 transition-colors">
                        {proj.name}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{proj.items.length} measurement(s)</span>
                        <span>•</span>
                        <span>{new Date(proj.dateUpdated || proj.dateCreated).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => {
                          const calc = calculateEntireProject(proj.name, proj.items, proj.constantsSnapshot || constants);
                          handleDownloadSimpleOutput(calc);
                        }}
                        className="px-2 py-1 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Download Output Specification (No price/amount)"
                      >
                        <Download className="w-3 h-3" />
                        <span>Output</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const calc = calculateEntireProject(proj.name, proj.items, proj.constantsSnapshot || constants);
                          handleDownloadCustomerQuotation(calc);
                        }}
                        className="px-2 py-1 bg-blue-950/70 hover:bg-blue-900 border border-blue-800/60 text-blue-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Download Customer Quotation (Naira ₦ by default)"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Quotation</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectSavedProject(proj)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="View Simple Pop-up"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsSavedModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. THEME SELECTION MODAL (10 Beautiful Themes) */}
      {isThemeModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Calculator Themes</h3>
                  <p className="text-[11px] text-slate-400">
                    Choose from 10 handcrafted visual themes for your workshop calculator
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsThemeModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Themes Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 select-none">
              {SIMPLE_THEMES.map((theme) => {
                const isCurrent = theme.id === themeId;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleSelectTheme(theme.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isCurrent
                        ? 'border-blue-500 bg-blue-950/40 shadow-md ring-2 ring-blue-500/40'
                        : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-5 h-5 rounded-full ring-2 ring-white/30 shrink-0 shadow-xs"
                          style={{ backgroundColor: theme.swatch }}
                        />
                        <div>
                          <div className="font-bold text-xs text-white flex items-center gap-1.5">
                            <span>{theme.name}</span>
                            {isCurrent && (
                              <span className="text-[9px] uppercase tracking-wider px-1 py-0.2 rounded bg-blue-500 text-white font-black">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                            {theme.subtitle}
                          </div>
                        </div>
                      </div>

                      {isCurrent && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Preview swatch bar */}
                    <div className="w-full h-2 rounded-full overflow-hidden flex ring-1 ring-white/10 mt-1">
                      <div className="w-1/3 h-full" style={{ backgroundColor: theme.swatch }} />
                      <div className="w-1/3 h-full bg-slate-800" />
                      <div className="w-1/3 h-full bg-slate-700" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400">
                Selected theme is saved to your browser preferences
              </span>
              <button
                type="button"
                onClick={() => setIsThemeModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
