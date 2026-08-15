import React, { useState } from 'react';
import {
  CombinedProjectCalculation,
  ConstantProfilesConfig,
  MaterialPricesConfig,
  SavedProject,
  FabricationItemInput,
} from '../types';
import { PreviewSkeleton } from './PreviewSkeleton';
import { ProfilesOutput } from './ProfilesOutput';
import { FrameMeasurementsOutput } from './FrameMeasurementsOutput';
import { QuotationOutput } from './QuotationOutput';
import { saveProject } from '../utils/storage';
import {
  Eye,
  PackageCheck,
  Ruler,
  Download,
  Save,
  ArrowLeft,
  Check,
  DollarSign,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface OutputDashboardProps {
  calculation: CombinedProjectCalculation;
  constants: ConstantProfilesConfig;
  prices: MaterialPricesConfig;
  initialTab?: 'preview' | 'profiles' | 'frames' | 'quotation';
  rawItems: FabricationItemInput[];
  onBackToEdit: () => void;
  onGoToSaved: () => void;
  onOpenAdminPrices?: () => void;
}

export const OutputDashboard: React.FC<OutputDashboardProps> = ({
  calculation,
  constants,
  prices,
  initialTab = 'preview',
  rawItems,
  onBackToEdit,
  onGoToSaved,
  onOpenAdminPrices,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'profiles' | 'frames' | 'quotation'>(initialTab);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProject = () => {
    const project: SavedProject = {
      id: `proj-${Date.now()}`,
      name: calculation.projectName,
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
      items: rawItems,
      constantsSnapshot: constants,
    };
    saveProject(project);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Project Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-blue-600 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToEdit}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              title="Back to edit measurements"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-mono">
                  Calculation Run
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">{calculation.projectName}</h2>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(calculation.dateCalculated).toLocaleDateString()}
                </span>
                <span>•</span>
                <span className="font-semibold text-slate-700">{calculation.items.length} Units Scheduled</span>
                <span>•</span>
                <span className="font-mono font-bold text-blue-600">{calculation.totalBarsCount} Market Bars (5.8m)</span>
                <span>•</span>
                <span className="font-mono font-bold text-emerald-700">{calculation.totalGlassAreaM2} m² Glass</span>
              </div>
            </div>
          </div>
        </div>

        {/* Save & Quick Nav */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSaveProject}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{savedSuccess ? 'Saved to Records!' : 'Save This Job'}</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 font-medium animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Job project saved successfully! You can access it anytime from "Saved Data / Measurements".</span>
          </div>
          <button
            onClick={onGoToSaved}
            className="font-bold underline hover:text-emerald-950"
          >
            View Saved List &rarr;
          </button>
        </div>
      )}

      {/* THE 4 OUTPUT TABS (PREVIEW, PROFILES, FRAMES, QUOTATION) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Tab 1: Preview Wireframe */}
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 ${
            activeTab === 'preview'
              ? 'bg-white border-blue-500 border-l-4 border-l-blue-600 shadow-md ring-1 ring-blue-500/20'
              : 'bg-white border-slate-200 border-l-4 border-l-slate-300 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div
            className={`p-2 rounded-lg shrink-0 ${
              activeTab === 'preview' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[10px] uppercase tracking-wider text-slate-500">Module 1</div>
            <div className="font-bold text-xs text-slate-900 mt-0.5">Wireframe Preview</div>
            <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              Proportional architectural SVG diagrams & dimensions.
            </div>
          </div>
        </button>

        {/* Tab 2: Profiles Output */}
        <button
          type="button"
          onClick={() => setActiveTab('profiles')}
          className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 ${
            activeTab === 'profiles'
              ? 'bg-white border-blue-500 border-l-4 border-l-blue-600 shadow-md ring-1 ring-blue-500/20'
              : 'bg-white border-slate-200 border-l-4 border-l-slate-300 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div
            className={`p-2 rounded-lg shrink-0 ${
              activeTab === 'profiles' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[10px] uppercase tracking-wider text-slate-500">Module 2</div>
            <div className="font-bold text-xs text-slate-900 mt-0.5">Profiles & Materials</div>
            <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              5.8m market bar count, 1D bin-packing cuts & BOQ.
            </div>
          </div>
        </button>

        {/* Tab 3: Frame / Cut Measurements */}
        <button
          type="button"
          onClick={() => setActiveTab('frames')}
          className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 ${
            activeTab === 'frames'
              ? 'bg-white border-blue-500 border-l-4 border-l-blue-600 shadow-md ring-1 ring-blue-500/20'
              : 'bg-white border-slate-200 border-l-4 border-l-slate-300 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div
            className={`p-2 rounded-lg shrink-0 ${
              activeTab === 'frames' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Ruler className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[10px] uppercase tracking-wider text-slate-500">Module 3</div>
            <div className="font-bold text-xs text-slate-900 mt-0.5">Cut Measurements</div>
            <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              Workshop cut lengths (mm), 45°/90° miters & glass sizes.
            </div>
          </div>
        </button>

        {/* Tab 4: Expense Quotation Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('quotation')}
          className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 ${
            activeTab === 'quotation'
              ? 'bg-white border-emerald-500 border-l-4 border-l-emerald-600 shadow-md ring-1 ring-emerald-500/20'
              : 'bg-white border-slate-200 border-l-4 border-l-slate-300 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div
            className={`p-2 rounded-lg shrink-0 ${
              activeTab === 'quotation' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[10px] uppercase tracking-wider text-emerald-700">Module 4</div>
            <div className="font-bold text-xs text-slate-900 mt-0.5 flex items-center gap-1">
              <span>Expenses Quotation</span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">NEW</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              Bill of expenses, materials pricing, labor & official PDF.
            </div>
          </div>
        </button>
      </div>

      {/* RENDER ACTIVE TAB CONTENT */}
      {activeTab === 'preview' && (
        <PreviewSkeleton calculation={calculation} constants={constants} />
      )}

      {activeTab === 'profiles' && (
        <ProfilesOutput calculation={calculation} constants={constants} />
      )}

      {activeTab === 'frames' && (
        <FrameMeasurementsOutput calculation={calculation} constants={constants} />
      )}

      {activeTab === 'quotation' && (
        <QuotationOutput
          calc={calculation}
          prices={prices}
          onOpenAdminPrices={onOpenAdminPrices}
        />
      )}
    </div>
  );
};
