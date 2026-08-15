import React, { useState } from 'react';
import { ConstantProfilesConfig, MaterialPricesConfig } from '../types';
import {
  saveStoredConstants,
  resetStoredConstants,
  saveStoredPrices,
  resetStoredPrices,
} from '../utils/storage';
import { POPULAR_CURRENCIES } from '../constants/defaultPrices';
import {
  Sliders,
  Save,
  RotateCcw,
  Check,
  ArrowLeft,
  Home,
  ChevronRight,
  DollarSign,
  Layers,
  Sparkles,
  Boxes,
  Maximize,
  Info,
  ShieldCheck,
  Tag,
  Hammer,
  Truck,
  Percent,
} from 'lucide-react';

interface AdminPanelProps {
  constants: ConstantProfilesConfig;
  prices: MaterialPricesConfig;
  onUpdateConstants: (newConstants: ConstantProfilesConfig) => void;
  onUpdatePrices: (newPrices: MaterialPricesConfig) => void;
  onBackToHome: () => void;
  initialMainTab?: 'prices' | 'constants';
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  constants,
  prices,
  onUpdateConstants,
  onUpdatePrices,
  onBackToHome,
  initialMainTab = 'prices',
}) => {
  const [mainMode, setMainMode] = useState<'prices' | 'constants'>(initialMainTab);
  const [constantFormData, setConstantFormData] = useState<ConstantProfilesConfig>(constants);
  const [priceFormData, setPriceFormData] = useState<MaterialPricesConfig>(prices);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [constantActiveTab, setConstantActiveTab] = useState<'sliding' | 'casement' | 'transom' | 'fixed_doors' | 'general'>('sliding');
  const [priceActiveTab, setPriceActiveTab] = useState<'profiles' | 'glass' | 'accessories' | 'labor_rates'>('profiles');

  // Constant Profile Field Change
  const handleConstantFieldChange = (path: string[], value: any) => {
    setConstantFormData((prev) => {
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

  // Price Field Change
  const handlePriceFieldChange = (category: keyof MaterialPricesConfig, key: string, value: any) => {
    setPriceFormData((prev) => {
      if (category === 'profileBarPrices' || category === 'accessoryPrices') {
        return {
          ...prev,
          [category]: {
            ...prev[category],
            [key]: value,
          },
        };
      }
      return {
        ...prev,
        [key]: value,
      };
    });
    setSaveSuccess(false);
  };

  const handleSaveAll = () => {
    if (mainMode === 'prices') {
      saveStoredPrices(priceFormData);
      onUpdatePrices(priceFormData);
    } else {
      saveStoredConstants(constantFormData);
      onUpdateConstants(constantFormData);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetPrices = () => {
    if (window.confirm('Reset all material prices to standard defaults?')) {
      const defaults = resetStoredPrices();
      setPriceFormData(defaults);
      onUpdatePrices(defaults);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleResetConstants = () => {
    if (window.confirm('Reset all constant measurements to factory standard values?')) {
      const defaults = resetStoredConstants();
      setConstantFormData(defaults);
      onUpdateConstants(defaults);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const sym = priceFormData.currencySymbol;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Breadcrumb & Return to Home Bar */}
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

      {/* Main Admin Section Mode Selector (Prices vs Constants) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 border-l-4 border-l-blue-600 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
            {mainMode === 'prices' ? <DollarSign className="w-6 h-6" /> : <Sliders className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-mono border border-blue-100">
                System Administration
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                {mainMode === 'prices' ? 'Materials & Items Pricing Management' : 'Constant Measurements & Profiles Calibration'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {mainMode === 'prices'
                ? 'Manage market purchase prices for 5.8m aluminum profile bars, glass m², hardware items, and labor rates.'
                : 'Configure profile face widths, pocket rebate depths, standard 5800mm market stock lengths, and saw blade kerf.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={mainMode === 'prices' ? handleResetPrices : handleResetConstants}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
            title="Reset to standard defaults"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">
            Configuration successfully saved! All quotation bills and workshop calculations will now use these updated values.
          </span>
        </div>
      )}

      {/* Primary Admin Mode Tabs (Material Prices vs Constant Measurements) */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-2 shadow-xs">
        <button
          onClick={() => setMainMode('prices')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            mainMode === 'prices'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>1. Material & Item Prices (Quotation Rates)</span>
        </button>

        <button
          onClick={() => setMainMode('constants')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            mainMode === 'constants'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>2. Constant Measurements & Profiles (Engineering)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: MATERIAL & ITEM PRICES (QUOTATION SECTION) */}
      {/* ========================================================================= */}
      {mainMode === 'prices' && (
        <div className="space-y-6">
          {/* Sub-tabs for Material Prices */}
          <div className="flex flex-wrap gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setPriceActiveTab('profiles')}
              className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                priceActiveTab === 'profiles'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Aluminum Profiles (5.8m)</span>
            </button>

            <button
              onClick={() => setPriceActiveTab('glass')}
              className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                priceActiveTab === 'glass'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <Maximize className="w-3.5 h-3.5" />
              <span>Glass Glazing (m²)</span>
            </button>

            <button
              onClick={() => setPriceActiveTab('accessories')}
              className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                priceActiveTab === 'accessories'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Hardware & Accessories</span>
            </button>

            <button
              onClick={() => setPriceActiveTab('labor_rates')}
              className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                priceActiveTab === 'labor_rates'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <Hammer className="w-3.5 h-3.5" />
              <span>Labor, Installation & Currency</span>
            </button>
          </div>

          {/* 1. Profile Bars Pricing Tab */}
          {priceActiveTab === 'profiles' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Aluminum Extrusion Bar Purchase Rates (per 5.8m Standard Length)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Set the exact purchase cost per full 5800mm factory extrusion bar for each profile type.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded border border-blue-200">
                  Currency: {priceFormData.currency} ({sym})
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Sliding Profiles */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Sliding Profiles</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Top / Bottom Track Profile (5.8m)
                    </label>
                    <div className="flex items-center">
                      <span className="px-2.5 py-2 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-bold text-slate-700">
                        {sym}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={priceFormData.profileBarPrices.topBottomTrack}
                        onChange={(e) =>
                          handlePriceFieldChange('profileBarPrices', 'topBottomTrack', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-lg text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Side Jamb Frame Profile (5.8m)
                    </label>
                    <div className="flex items-center">
                      <span className="px-2.5 py-2 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-bold text-slate-700">
                        {sym}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={priceFormData.profileBarPrices.sideJambs}
                        onChange={(e) =>
                          handlePriceFieldChange('profileBarPrices', 'sideJambs', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-lg text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Bottom Sash Roller Rail (5.8m)
                    </label>
                    <div className="flex items-center">
                      <span className="px-2.5 py-2 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-bold text-slate-700">
                        {sym}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={priceFormData.profileBarPrices.bottomSashRail}
                        onChange={(e) =>
                          handlePriceFieldChange('profileBarPrices', 'bottomSashRail', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-lg text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Top Sash Rail Profile (5.8m)
                    </label>
                    <div className="flex items-center">
                      <span className="px-2.5 py-2 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-bold text-slate-700">
                        {sym}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={priceFormData.profileBarPrices.topSashRail}
                        onChange={(e) =>
                          handlePriceFieldChange('profileBarPrices', 'topSashRail', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-lg text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Lock Frame Stile / Handle Side (5.8m)
                    </label>
                    <div className="flex items-center">
                      <span className="px-2.5 py-2 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-bold text-slate-700">
                        {sym}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={priceFormData.profileBarPrices.lockFrameStile}
                        onChange={(e) =>
                          handlePriceFieldChange('profileBarPrices', 'lockFrameStile', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-lg text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Interlock Frame Stile / Center (5.8m)
                    </label>
                    <div className="flex items-center">
                      <span className="px-2.5 py-2 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-bold text-slate-700">
                        {sym}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={priceFormData.profileBarPrices.interlockFrameStile}
                        onChange={(e) =>
                          handlePriceFieldChange('profileBarPrices', 'interlockFrameStile', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-lg text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Casement Profiles */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <span>Casement Window Profiles</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Casement Outer Frame (5.8m)
                    </label>
                    <div className="flex items-center">
                      <span className="px-2.5 py-2 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-bold text-slate-700">
                        {sym}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={priceFormData.profileBarPrices.casementOuterFrame ?? 52}
                        onChange={(e) =>
                          handlePriceFieldChange('profileBarPrices', 'casementOuterFrame', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-lg text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Casement Mullion T-Bar (5.8m)
                    </label>
                    <div className="flex items-center">
                      <span className="px-2.5 py-2 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-bold text-slate-700">
                        {sym}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={priceFormData.profileBarPrices.casementMullion ?? 56}
                        onChange={(e) =>
                          handlePriceFieldChange('profileBarPrices', 'casementMullion', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-lg text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      De-Curve Sash / Vent Leaf (5.8m)
                    </label>
                    <div className="flex items-center">
                      <span className="px-2.5 py-2 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-bold text-slate-700">
                        {sym}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={priceFormData.profileBarPrices.casementDeCurveSash ?? 48}
                        onChange={(e) =>
                          handlePriceFieldChange('profileBarPrices', 'casementDeCurveSash', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-lg text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Casement Snap Glazing Bead (5.8m)
                    </label>
                    <div className="flex items-center">
                      <span className="px-2.5 py-2 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-bold text-slate-700">
                        {sym}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={priceFormData.profileBarPrices.casementGlazingBead ?? 18}
                        onChange={(e) =>
                          handlePriceFieldChange('profileBarPrices', 'casementGlazingBead', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-lg text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Transom Profiles (Separated Card) */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>Transom Window Profiles</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Transom Outer Frame (5.8m)
                    </label>
                    <div className="flex items-center">
                      <span className="px-2.5 py-2 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-bold text-slate-700">
                        {sym}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={priceFormData.profileBarPrices.transomOuterFrame ?? 50}
                        onChange={(e) =>
                          handlePriceFieldChange('profileBarPrices', 'transomOuterFrame', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-lg text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Transom Dividing Mullion (5.8m)
                    </label>
                    <div className="flex items-center">
                      <span className="px-2.5 py-2 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-bold text-slate-700">
                        {sym}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={priceFormData.profileBarPrices.transomMullion ?? 54}
                        onChange={(e) =>
                          handlePriceFieldChange('profileBarPrices', 'transomMullion', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-lg text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Transom Top-Hung Sash (5.8m)
                    </label>
                    <div className="flex items-center">
                      <span className="px-2.5 py-2 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-bold text-slate-700">
                        {sym}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={priceFormData.profileBarPrices.transomTopHungSash ?? 46}
                        onChange={(e) =>
                          handlePriceFieldChange('profileBarPrices', 'transomTopHungSash', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-lg text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Transom Glazing Bead (5.8m)
                    </label>
                    <div className="flex items-center">
                      <span className="px-2.5 py-2 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-bold text-slate-700">
                        {sym}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={priceFormData.profileBarPrices.transomGlazingBead ?? 18}
                        onChange={(e) =>
                          handlePriceFieldChange('profileBarPrices', 'transomGlazingBead', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-lg text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Fixed & Door Profiles */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Fixed & Hinged Door Profiles</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Fixed Picture Frame Profile (5.8m)
                    </label>
                    <div className="flex items-center">
                      <span className="px-2.5 py-2 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-bold text-slate-700">
                        {sym}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={priceFormData.profileBarPrices.fixedFrame ?? 42}
                        onChange={(e) =>
                          handlePriceFieldChange('profileBarPrices', 'fixedFrame', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-lg text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Snap-In Glazing Bead Profile (5.8m)
                    </label>
                    <div className="flex items-center">
                      <span className="px-2.5 py-2 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-bold text-slate-700">
                        {sym}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={priceFormData.profileBarPrices.snapInGlassBead ?? 18}
                        onChange={(e) =>
                          handlePriceFieldChange('profileBarPrices', 'snapInGlassBead', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-lg text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Door Outer Frame Profile (5.8m)
                    </label>
                    <div className="flex items-center">
                      <span className="px-2.5 py-2 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-bold text-slate-700">
                        {sym}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={priceFormData.profileBarPrices.doorOuterFrame ?? 58}
                        onChange={(e) =>
                          handlePriceFieldChange('profileBarPrices', 'doorOuterFrame', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-lg text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Heavy-Duty Door Stile (5.8m)
                    </label>
                    <div className="flex items-center">
                      <span className="px-2.5 py-2 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-bold text-slate-700">
                        {sym}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={priceFormData.profileBarPrices.doorStile ?? 72}
                        onChange={(e) =>
                          handlePriceFieldChange('profileBarPrices', 'doorStile', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-lg text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Door Top Rail Profile (5.8m)
                    </label>
                    <div className="flex items-center">
                      <span className="px-2.5 py-2 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-bold text-slate-700">
                        {sym}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={priceFormData.profileBarPrices.doorTopRail ?? 68}
                        onChange={(e) =>
                          handlePriceFieldChange('profileBarPrices', 'doorTopRail', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-lg text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Door Bottom Kick Rail (5.8m)
                    </label>
                    <div className="flex items-center">
                      <span className="px-2.5 py-2 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-bold text-slate-700">
                        {sym}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={priceFormData.profileBarPrices.doorBottomRail ?? 78}
                        onChange={(e) =>
                          handlePriceFieldChange('profileBarPrices', 'doorBottomRail', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-lg text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Glass Glazing Pricing Tab */}
          {priceActiveTab === 'glass' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Glass Glazing & Panes Pricing
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set the market rate per square meter (m²) for supply and precision cut glass.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Glass Price per Square Meter (m²)
                    </label>
                    <div className="flex items-center">
                      <span className="px-3 py-2 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-bold text-slate-700">
                        {sym}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={priceFormData.glassPricePerM2}
                        onChange={(e) =>
                          setPriceFormData({ ...priceFormData, glassPricePerM2: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-lg text-sm font-mono font-bold text-slate-900"
                      />
                      <span className="ml-2 text-xs font-semibold text-slate-500">/ m²</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Default Glass Specification Label
                    </label>
                    <input
                      type="text"
                      value={priceFormData.glassTypeName}
                      onChange={(e) =>
                        setPriceFormData({ ...priceFormData, glassTypeName: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                      placeholder="e.g. 5mm Clear / Tinted Float Glass"
                    />
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-sky-50/60 border border-sky-200 text-xs space-y-2">
                  <div className="font-bold text-sky-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-sky-700" />
                    <span>Automatic Glass Area Calculations</span>
                  </div>
                  <p className="text-slate-600">
                    The quotation engine automatically aggregates the exact net cut width × cut height of every 1-pane glass opening in the project, converts the sum to m², and applies this unit rate.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. Hardware & Accessories Pricing Tab */}
          {priceActiveTab === 'accessories' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Hardware, Gaskets, Fasteners & Consumables Unit Prices
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set unit replacement/purchase costs for rollers, locking handles, seals, friction stays, screws, and silicone.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Sliding Roller Pair (2 pcs)
                  </label>
                  <div className="flex items-center">
                    <span className="px-2.5 py-1.5 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-bold text-slate-700">
                      {sym}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={priceFormData.accessoryPrices.slidingRollerPair}
                      onChange={(e) =>
                        handlePriceFieldChange('accessoryPrices', 'slidingRollerPair', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-r-lg text-xs font-mono font-bold text-slate-900"
                    />
                    <span className="ml-1.5 text-[10px] text-slate-500">/pair</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Crescent Hook Lock / Flush Latch
                  </label>
                  <div className="flex items-center">
                    <span className="px-2.5 py-1.5 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-bold text-slate-700">
                      {sym}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={priceFormData.accessoryPrices.crescentHookLock}
                      onChange={(e) =>
                        handlePriceFieldChange('accessoryPrices', 'crescentHookLock', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-r-lg text-xs font-mono font-bold text-slate-900"
                    />
                    <span className="ml-1.5 text-[10px] text-slate-500">/pc</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Weatherseal Woolpile (per meter)
                  </label>
                  <div className="flex items-center">
                    <span className="px-2.5 py-1.5 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-bold text-slate-700">
                      {sym}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.05"
                      value={priceFormData.accessoryPrices.woolpilePerMeter}
                      onChange={(e) =>
                        handlePriceFieldChange('accessoryPrices', 'woolpilePerMeter', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-r-lg text-xs font-mono font-bold text-slate-900"
                    />
                    <span className="ml-1.5 text-[10px] text-slate-500">/m</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    EPDM Rubber Gasket (per meter)
                  </label>
                  <div className="flex items-center">
                    <span className="px-2.5 py-1.5 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-bold text-slate-700">
                      {sym}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.05"
                      value={priceFormData.accessoryPrices.rubberGasketPerMeter}
                      onChange={(e) =>
                        handlePriceFieldChange('accessoryPrices', 'rubberGasketPerMeter', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-r-lg text-xs font-mono font-bold text-slate-900"
                    />
                    <span className="ml-1.5 text-[10px] text-slate-500">/m</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Friction Stays Heavy Duty (Pair)
                  </label>
                  <div className="flex items-center">
                    <span className="px-2.5 py-1.5 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-bold text-slate-700">
                      {sym}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={priceFormData.accessoryPrices.frictionStayPair}
                      onChange={(e) =>
                        handlePriceFieldChange('accessoryPrices', 'frictionStayPair', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-r-lg text-xs font-mono font-bold text-slate-900"
                    />
                    <span className="ml-1.5 text-[10px] text-slate-500">/pair</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Casement Cam / Cockspur Handle
                  </label>
                  <div className="flex items-center">
                    <span className="px-2.5 py-1.5 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-bold text-slate-700">
                      {sym}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={priceFormData.accessoryPrices.casementCamHandle}
                      onChange={(e) =>
                        handlePriceFieldChange('accessoryPrices', 'casementCamHandle', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-r-lg text-xs font-mono font-bold text-slate-900"
                    />
                    <span className="ml-1.5 text-[10px] text-slate-500">/pc</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Cast Corner Cleats (per piece)
                  </label>
                  <div className="flex items-center">
                    <span className="px-2.5 py-1.5 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-bold text-slate-700">
                      {sym}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.05"
                      value={priceFormData.accessoryPrices.cornerCleatPiece}
                      onChange={(e) =>
                        handlePriceFieldChange('accessoryPrices', 'cornerCleatPiece', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-r-lg text-xs font-mono font-bold text-slate-900"
                    />
                    <span className="ml-1.5 text-[10px] text-slate-500">/pc</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Silicone Sealant Tube (300ml)
                  </label>
                  <div className="flex items-center">
                    <span className="px-2.5 py-1.5 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-bold text-slate-700">
                      {sym}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.2"
                      value={priceFormData.accessoryPrices.siliconeSealantTube}
                      onChange={(e) =>
                        handlePriceFieldChange('accessoryPrices', 'siliconeSealantTube', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-r-lg text-xs font-mono font-bold text-slate-900"
                    />
                    <span className="ml-1.5 text-[10px] text-slate-500">/tube</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Door Mortise Lockset (Heavy Duty)
                  </label>
                  <div className="flex items-center">
                    <span className="px-2.5 py-1.5 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-bold text-slate-700">
                      {sym}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={priceFormData.accessoryPrices.doorMortiseLockset}
                      onChange={(e) =>
                        handlePriceFieldChange('accessoryPrices', 'doorMortiseLockset', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-r-lg text-xs font-mono font-bold text-slate-900"
                    />
                    <span className="ml-1.5 text-[10px] text-slate-500">/set</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Door Butt Hinges Pair
                  </label>
                  <div className="flex items-center">
                    <span className="px-2.5 py-1.5 bg-slate-200 border border-r-0 border-slate-300 rounded-l-lg text-xs font-bold text-slate-700">
                      {sym}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={priceFormData.accessoryPrices.doorHingePair}
                      onChange={(e) =>
                        handlePriceFieldChange('accessoryPrices', 'doorHingePair', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-r-lg text-xs font-mono font-bold text-slate-900"
                    />
                    <span className="ml-1.5 text-[10px] text-slate-500">/pair</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. Labor Rates, Currency & Commercial Parameters */}
          {priceActiveTab === 'labor_rates' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Labor, Installation, Currency & Commercial Parameters
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure currency symbols, labor estimation formulas, and profit/tax baseline percentages.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Currency Selection */}
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-blue-600" />
                    <span>Currency & Valuation Unit</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Select Project Currency
                    </label>
                    <select
                      value={priceFormData.currency}
                      onChange={(e) => {
                        const cur = POPULAR_CURRENCIES.find((c) => c.code === e.target.value);
                        if (cur) {
                          setPriceFormData({
                            ...priceFormData,
                            currency: cur.code,
                            currencySymbol: cur.symbol,
                          });
                        }
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                    >
                      {POPULAR_CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Currency Code</label>
                      <input
                        type="text"
                        value={priceFormData.currency}
                        onChange={(e) => setPriceFormData({ ...priceFormData, currency: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Currency Symbol</label>
                      <input
                        type="text"
                        value={priceFormData.currencySymbol}
                        onChange={(e) => setPriceFormData({ ...priceFormData, currencySymbol: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Labor & Fabrication Method */}
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Hammer className="w-3.5 h-3.5 text-blue-600" />
                    <span>Workshop Labor Rate</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Labor Calculation Method
                    </label>
                    <select
                      value={priceFormData.laborRateType}
                      onChange={(e) =>
                        setPriceFormData({
                          ...priceFormData,
                          laborRateType: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                    >
                      <option value="per_unit">Per Window/Door Unit Fabricated</option>
                      <option value="per_sqm">Per Opening Area (m²)</option>
                      <option value="percentage">Percentage of Total Material Expenses (%)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Labor Rate Value ({priceFormData.laborRateType === 'percentage' ? '%' : sym})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={priceFormData.laborRateValue}
                      onChange={(e) =>
                        setPriceFormData({ ...priceFormData, laborRateValue: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                {/* Site Installation & Logistics */}
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Installation & Logistics</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Site Installation Rate ({sym} / unit)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={priceFormData.installationRatePerUnit}
                      onChange={(e) =>
                        setPriceFormData({ ...priceFormData, installationRatePerUnit: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Flat Transport & Trucking Fee ({sym})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={priceFormData.transportationFlat}
                      onChange={(e) =>
                        setPriceFormData({ ...priceFormData, transportationFlat: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                {/* Commercial Margins */}
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-blue-600" />
                    <span>Default Commercial Margins</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Default Profit Margin (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={priceFormData.profitMarginPercent}
                      onChange={(e) =>
                        setPriceFormData({ ...priceFormData, profitMarginPercent: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Default VAT / Sales Tax (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      step="0.1"
                      value={priceFormData.taxVatPercent}
                      onChange={(e) =>
                        setPriceFormData({ ...priceFormData, taxVatPercent: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: CONSTANT MEASUREMENTS (ENGINEERING & SIZES) */}
      {/* ========================================================================= */}
      {mainMode === 'constants' && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setConstantActiveTab('sliding')}
              className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                constantActiveTab === 'sliding'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Sliding Windows & Doors</span>
            </button>

            <button
              onClick={() => setConstantActiveTab('casement')}
              className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                constantActiveTab === 'casement'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <Maximize className="w-3.5 h-3.5" />
              <span>Casement Windows</span>
            </button>

            <button
              onClick={() => setConstantActiveTab('transom')}
              className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                constantActiveTab === 'transom'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Transom Windows</span>
            </button>

            <button
              onClick={() => setConstantActiveTab('fixed_doors')}
              className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                constantActiveTab === 'fixed_doors'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Fixed & Heavy Doors</span>
            </button>

            <button
              onClick={() => setConstantActiveTab('general')}
              className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                constantActiveTab === 'general'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Extrusion & Blade Kerf</span>
            </button>
          </div>

          {/* Sliding Section */}
          {constantActiveTab === 'sliding' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase">Top / Bottom Track Profile</div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Face Width (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.topBottomTrack?.faceWidth ?? 30}
                      onChange={(e) =>
                        handleConstantFieldChange(['topBottomTrack', 'faceWidth'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Track Channel Depth (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.topBottomTrack?.pocketDepth ?? 26}
                      onChange={(e) =>
                        handleConstantFieldChange(['topBottomTrack', 'pocketDepth'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase">Side Jamb Outer Frame</div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Face Width (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.sideJambs?.faceWidth ?? 30}
                      onChange={(e) =>
                        handleConstantFieldChange(['sideJambs', 'faceWidth'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Pocket Depth (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.sideJambs?.pocketDepth ?? 18}
                      onChange={(e) =>
                        handleConstantFieldChange(['sideJambs', 'pocketDepth'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase">Bottom Sash Rail (Roller)</div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Face Width (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.bottomSashRail?.faceWidth ?? 50}
                      onChange={(e) =>
                        handleConstantFieldChange(['bottomSashRail', 'faceWidth'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Glass Pocket Rebate (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.bottomSashRail?.pocketDepth ?? 15}
                      onChange={(e) =>
                        handleConstantFieldChange(['bottomSashRail', 'pocketDepth'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase">Top Sash Rail Profile</div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Face Width (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.topSashRail?.faceWidth ?? 50}
                      onChange={(e) =>
                        handleConstantFieldChange(['topSashRail', 'faceWidth'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Glass Pocket Rebate (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.topSashRail?.pocketDepth ?? 15}
                      onChange={(e) =>
                        handleConstantFieldChange(['topSashRail', 'pocketDepth'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase">Lock Frame Stile (Handle)</div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Face Width (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.lockFrameStile?.faceWidth ?? 53}
                      onChange={(e) =>
                        handleConstantFieldChange(['lockFrameStile', 'faceWidth'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Glass Pocket Rebate (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.lockFrameStile?.pocketDepth ?? 15}
                      onChange={(e) =>
                        handleConstantFieldChange(['lockFrameStile', 'pocketDepth'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase">Interlock Hook Stile</div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Face Width (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.interlockFrameStile?.faceWidth ?? 35}
                      onChange={(e) =>
                        handleConstantFieldChange(['interlockFrameStile', 'faceWidth'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Glass Pocket Rebate (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.interlockFrameStile?.pocketDepth ?? 15}
                      onChange={(e) =>
                        handleConstantFieldChange(['interlockFrameStile', 'pocketDepth'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Casement Tab */}
          {constantActiveTab === 'casement' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase">Casement Outer Frame</div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Face Width (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.casementOuterFrame?.faceWidth ?? 45}
                      onChange={(e) =>
                        handleConstantFieldChange(['casementOuterFrame', 'faceWidth'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Edge Overlap (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.casementOuterFrame?.edgeOverlap ?? 8}
                      onChange={(e) =>
                        handleConstantFieldChange(['casementOuterFrame', 'edgeOverlap'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase">Casement Mullion (T-Bar)</div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Face Width (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.casementMullion?.faceWidth ?? 45}
                      onChange={(e) =>
                        handleConstantFieldChange(['casementMullion', 'faceWidth'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Edge Overlap (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.casementMullion?.edgeOverlap ?? 8}
                      onChange={(e) =>
                        handleConstantFieldChange(['casementMullion', 'edgeOverlap'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase">De-Curve Sash / Vent Leaf</div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Face Width (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.casementDeCurveSash?.faceWidth ?? 60}
                      onChange={(e) =>
                        handleConstantFieldChange(['casementDeCurveSash', 'faceWidth'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Glass Pocket Rebate (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.casementDeCurveSash?.pocketDepth ?? 14}
                      onChange={(e) =>
                        handleConstantFieldChange(['casementDeCurveSash', 'pocketDepth'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase">Casement Glazing Bead</div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Face Width (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.casementGlazingBead?.faceWidth ?? 16}
                      onChange={(e) =>
                        handleConstantFieldChange(['casementGlazingBead', 'faceWidth'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Snap Depth (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.casementGlazingBead?.pocketDepth ?? 10}
                      onChange={(e) =>
                        handleConstantFieldChange(['casementGlazingBead', 'pocketDepth'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transom Tab (Separated) */}
          {constantActiveTab === 'transom' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase">Transom Outer Frame</div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Face Width (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.transomOuterFrame?.faceWidth ?? 45}
                      onChange={(e) =>
                        handleConstantFieldChange(['transomOuterFrame', 'faceWidth'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Edge Overlap (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.transomOuterFrame?.edgeOverlap ?? 8}
                      onChange={(e) =>
                        handleConstantFieldChange(['transomOuterFrame', 'edgeOverlap'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase">Transom Dividing Mullion</div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Face Width (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.transomMullion?.faceWidth ?? 45}
                      onChange={(e) =>
                        handleConstantFieldChange(['transomMullion', 'faceWidth'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Edge Overlap (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.transomMullion?.edgeOverlap ?? 8}
                      onChange={(e) =>
                        handleConstantFieldChange(['transomMullion', 'edgeOverlap'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase">Transom Top-Hung Sash</div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Face Width (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.transomTopHungSash?.faceWidth ?? 52}
                      onChange={(e) =>
                        handleConstantFieldChange(['transomTopHungSash', 'faceWidth'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Glass Pocket Rebate (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.transomTopHungSash?.pocketDepth ?? 14}
                      onChange={(e) =>
                        handleConstantFieldChange(['transomTopHungSash', 'pocketDepth'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase">Transom Glazing Bead</div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Face Width (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.transomGlazingBead?.faceWidth ?? 16}
                      onChange={(e) =>
                        handleConstantFieldChange(['transomGlazingBead', 'faceWidth'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Snap Depth (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.transomGlazingBead?.pocketDepth ?? 10}
                      onChange={(e) =>
                        handleConstantFieldChange(['transomGlazingBead', 'pocketDepth'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fixed & Doors Tab */}
          {constantActiveTab === 'fixed_doors' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase">Fixed Picture Frame Profile</div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Face Width (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.fixedFrame.faceWidth}
                      onChange={(e) =>
                        handleConstantFieldChange(['fixedFrame', 'faceWidth'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Pocket Rebate Depth (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.fixedFrame.pocketDepth}
                      onChange={(e) =>
                        handleConstantFieldChange(['fixedFrame', 'pocketDepth'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase">Door Heavy Stile Profile</div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Face Width (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.doorStile.faceWidth}
                      onChange={(e) =>
                        handleConstantFieldChange(['doorStile', 'faceWidth'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Pocket Rebate (mm)</label>
                    <input
                      type="number"
                      value={constantFormData.doorStile.pocketDepth}
                      onChange={(e) =>
                        handleConstantFieldChange(['doorStile', 'pocketDepth'], parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* General Tab */}
          {constantActiveTab === 'general' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase">Standard Extrusion Bar Length (mm)</div>
                  <input
                    type="number"
                    value={constantFormData.stockProfileLength ?? 5800}
                    onChange={(e) =>
                      handleConstantFieldChange(['stockProfileLength'], parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500">Standard market profile extrusion is 5800mm (5.8m)</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase">Saw Blade Kerf Cut Loss (mm)</div>
                  <input
                    type="number"
                    value={constantFormData.bladeKerf ?? 4}
                    onChange={(e) =>
                      handleConstantFieldChange(['bladeKerf'], parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500">Deduction loss per chopsaw cut (typically 4mm)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
