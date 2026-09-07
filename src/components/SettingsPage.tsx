import React, { useState } from 'react';
import {
  CompanyProfileConfig,
  getStoredCompanyProfile,
  saveStoredCompanyProfile,
  DEFAULT_COMPANY_PROFILE,
  saveUserSelectedCurrency,
} from '../utils/workPricingCalculator';
import { PricingRulesEditor } from './PricingRulesEditor';
import { MaterialPricesEditor } from './MaterialPricesEditor';
import { MaterialNamesEditor } from './MaterialNamesEditor';
import { SystemRestoreHistory } from './SystemRestoreHistory';
import { getStoredPrices, saveStoredPrices } from '../utils/storage';
import { MaterialPricesConfig } from '../types';
import { createRestorePoint } from '../utils/systemRestoreManager';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Sliders,
  DollarSign,
  FileText,
  Save,
  Check,
  RotateCcw,
  ArrowLeft,
  Truck,
  Percent,
  Hammer,
  Boxes,
  Tag,
  History,
} from 'lucide-react';

interface SettingsPageProps {
  onBack: () => void;
  onProfileUpdated?: (profile: CompanyProfileConfig) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onBack, onProfileUpdated }) => {
  const [profile, setProfile] = useState<CompanyProfileConfig>(getStoredCompanyProfile());
  const [materialPrices, setMaterialPrices] = useState<MaterialPricesConfig>(getStoredPrices());
  const [activeTab, setActiveTab] = useState<'company' | 'pricing' | 'billing' | 'materials' | 'names' | 'history'>('company');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleFieldChange = (field: keyof CompanyProfileConfig, value: any) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveCompanyProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    saveStoredCompanyProfile(profile);
    saveUserSelectedCurrency({
      code: profile.defaultCurrency,
      symbol: profile.defaultCurrencySymbol,
      name: profile.defaultCurrency === 'NGN' ? 'Nigerian Naira' : 'US Dollar',
    });
    createRestorePoint(
      'Updated Company & Quotation Profile',
      'profile',
      `Saved company details for ${profile.companyName || 'aluminum workshop'}`,
      { companyProfile: profile }
    );
    onProfileUpdated?.(profile);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset company details and financial rates to standard defaults?')) {
      setProfile(DEFAULT_COMPANY_PROFILE);
      saveStoredCompanyProfile(DEFAULT_COMPANY_PROFILE);
      onProfileUpdated?.(DEFAULT_COMPANY_PROFILE);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 pb-20 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-900 text-white rounded-xl shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                System & Company Settings
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage company branding, window/door dimension pricing rules, and default quotation rates.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={() => handleSaveCompanyProfile()}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save All Changes</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-2.5 shadow-xs animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Settings saved successfully. All changes are active across your quotations and PDFs.</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('company')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'company'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Company Profile & Branding</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'pricing'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Window & Door Size Pricing Rules</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('billing')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'billing'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Financial Defaults & Quotation Terms</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('materials')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'materials'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Raw Material Local Prices</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('names')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'names'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Material Names & Terminology</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <History className="w-4 h-4" />
          <span>System Restore & Updates</span>
        </button>
      </div>

      {/* Tab 1: Company Profile */}
      {activeTab === 'company' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6 animate-fadeIn">
          <div>
            <h3 className="text-base font-bold text-slate-900">Company Information</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              These details appear on the header, footer, and signature blocks of all generated quotation bills and materials schedules.
            </p>
          </div>

          <form onSubmit={handleSaveCompanyProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Enterprise Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={profile.companyName}
                    onChange={(e) => handleFieldChange('companyName', e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tagline / Specialization</label>
                <input
                  type="text"
                  value={profile.tagline || ''}
                  onChange={(e) => handleFieldChange('tagline', e.target.value)}
                  placeholder="e.g. Precision Aluminium Windows & Architectural Glazing"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Phone / WhatsApp</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={profile.phoneNumber}
                    onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Secondary Phone (Optional)</label>
                <input
                  type="text"
                  value={profile.secondaryPhone || ''}
                  onChange={(e) => handleFieldChange('secondaryPhone', e.target.value)}
                  placeholder="e.g. +234 812 345 6789"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">CAC / RC Registration Number</label>
                <input
                  type="text"
                  value={profile.rcNumber || ''}
                  onChange={(e) => handleFieldChange('rcNumber', e.target.value)}
                  placeholder="e.g. RC-1928374"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Workshop / Office Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 pt-2.5 pointer-events-none text-slate-400">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <textarea
                  rows={2}
                  value={profile.address}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Company Profile</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Pricing Rules */}
      {activeTab === 'pricing' && (
        <div className="animate-fadeIn">
          <PricingRulesEditor
            isAdmin={false}
            currencySymbol={profile.defaultCurrencySymbol}
            onRulesChanged={() => setSaveSuccess(true)}
          />
        </div>
      )}

      {/* Tab 3: Billing & Financial Defaults */}
      {activeTab === 'billing' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6 animate-fadeIn">
          <div>
            <h3 className="text-base font-bold text-slate-900">Quotation Defaults & Financial Parameters</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Set the default values for labor per work, transportation, VAT/tax, and standard payment terms.
            </p>
          </div>

          <form onSubmit={handleSaveCompanyProfile} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Default Currency */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <span>Default Currency</span>
                </div>
                <select
                  value={profile.defaultCurrency}
                  onChange={(e) => {
                    const code = e.target.value;
                    const sym = code === 'NGN' ? '₦' : code === 'USD' ? '$' : code === 'GBP' ? '£' : '€';
                    setProfile((p) => ({ ...p, defaultCurrency: code, defaultCurrencySymbol: sym }));
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium"
                >
                  <option value="NGN">Nigerian Naira (₦)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="GBP">British Pound (£)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
                <p className="text-[11px] text-slate-400">Primary billing currency for client quotations</p>
              </div>

              {/* Labor per work */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <Hammer className="w-4 h-4 text-amber-600" />
                  <span>Labor per Work</span>
                </div>
                <div className="flex items-center">
                  <span className="px-2.5 py-2 bg-slate-200 text-slate-600 rounded-l-xl font-bold">
                    {profile.defaultCurrencySymbol}
                  </span>
                  <input
                    type="number"
                    value={profile.defaultLaborPerWork}
                    onChange={(e) => handleFieldChange('defaultLaborPerWork', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-xl font-mono font-bold"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Default rate is ₦10,000 per window/door unit</p>
              </div>

              {/* Transportation default */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <Truck className="w-4 h-4 text-indigo-600" />
                  <span>Default Transport</span>
                </div>
                <div className="flex items-center">
                  <span className="px-2.5 py-2 bg-slate-200 text-slate-600 rounded-l-xl font-bold">
                    {profile.defaultCurrencySymbol}
                  </span>
                  <input
                    type="number"
                    value={profile.defaultTransport}
                    onChange={(e) => handleFieldChange('defaultTransport', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-xl font-mono font-bold"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Default is 0. Editable on each client quotation</p>
              </div>

              {/* VAT/Tax default */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <Percent className="w-4 h-4 text-emerald-600" />
                  <span>Default VAT / Tax (%)</span>
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    step="0.1"
                    value={profile.defaultVatPercent}
                    onChange={(e) => handleFieldChange('defaultVatPercent', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-l-xl font-mono font-bold"
                  />
                  <span className="px-2.5 py-2 bg-slate-200 text-slate-600 rounded-r-xl font-bold">%</span>
                </div>
                <p className="text-[11px] text-slate-400">Default is 0.0%. Editable on client tab</p>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Standard Terms & Conditions (Quotation Contract Text)</span>
              </label>
              <textarea
                rows={5}
                value={profile.termsAndConditions}
                onChange={(e) => handleFieldChange('termsAndConditions', e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                This legal text is printed at the bottom of the Client Quotation PDF.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Financial Defaults</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Raw Material Local Prices */}
      {activeTab === 'materials' && (
        <div className="animate-fadeIn">
          <MaterialPricesEditor
            initialPrices={materialPrices}
            currencySymbol={profile.defaultCurrencySymbol || '$'}
            onSave={(newPrices) => {
              setMaterialPrices(newPrices);
              saveStoredPrices(newPrices);
              createRestorePoint(
                'Updated Raw Material Prices',
                'prices',
                'Updated workshop local material purchase and unit rates',
                { materialPrices: newPrices, companyProfile: profile }
              );
              setSaveSuccess(true);
              setTimeout(() => setSaveSuccess(false), 3000);
              onProfileUpdated?.(profile);
            }}
          />
        </div>
      )}

      {/* Tab 5: Material Custom Display Names (Workshop Terminology) */}
      {activeTab === 'names' && (
        <div className="animate-fadeIn">
          <MaterialNamesEditor
            onSaved={() => {
              setSaveSuccess(true);
              setTimeout(() => setSaveSuccess(false), 3000);
              onProfileUpdated?.(profile);
            }}
          />
        </div>
      )}

      {/* Tab 6: System Restore Points & Update History */}
      {activeTab === 'history' && (
        <div className="animate-fadeIn">
          <SystemRestoreHistory
            onRestored={() => {
              setProfile(getStoredCompanyProfile());
              setMaterialPrices(getStoredPrices());
              onProfileUpdated?.(getStoredCompanyProfile());
            }}
          />
        </div>
      )}
    </div>
  );
};
