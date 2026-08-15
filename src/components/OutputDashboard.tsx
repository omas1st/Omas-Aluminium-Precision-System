import React, { useState } from 'react';
import {
  CombinedProjectCalculation,
  ConstantProfilesConfig,
  SavedProject,
  FabricationItemInput,
} from '../types';
import { PreviewSkeleton } from './PreviewSkeleton';
import { ProfilesOutput } from './ProfilesOutput';
import { FrameMeasurementsOutput } from './FrameMeasurementsOutput';
import { saveProject } from '../utils/storage';
import {
  Eye,
  PackageCheck,
  Ruler,
  Download,
  Save,
  ArrowLeft,
  Check,
  Share2,
  Calendar,
} from 'lucide-react';

interface OutputDashboardProps {
  calculation: CombinedProjectCalculation;
  constants: ConstantProfilesConfig;
  initialTab?: 'preview' | 'profiles' | 'frames';
  rawItems: FabricationItemInput[];
  onBackToEdit: () => void;
  onGoToSaved: () => void;
}

export const OutputDashboard: React.FC<OutputDashboardProps> = ({
  calculation,
  constants,
  initialTab = 'preview',
  rawItems,
  onBackToEdit,
  onGoToSaved,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'profiles' | 'frames'>(initialTab);
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
    <div className="space-y-6 max-w-6xl mx-auto">
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

      {/* THE 3 PRIMARY OUTPUT BUTTONS (AS REQUESTED) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Button 1: Preview Button */}
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`p-5 rounded-xl border text-left transition-all flex items-start gap-4 ${
            activeTab === 'preview'
              ? 'bg-white border-blue-500 border-l-4 border-l-blue-600 shadow-md ring-1 ring-blue-500/20'
              : 'bg-white border-slate-200 border-l-4 border-l-slate-300 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div
            className={`p-2.5 rounded-lg shrink-0 ${
              activeTab === 'preview' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs uppercase tracking-wider text-slate-500">View Module 1</div>
            <div className="font-bold text-sm text-slate-900 mt-0.5">1. Skeleton Wireframe Preview</div>
            <div className="text-xs text-slate-500 mt-1 leading-relaxed">
              Proportional architectural SVG diagrams with structural component labels and dimensions.
            </div>
          </div>
        </button>

        {/* Button 2: Profiles & Materials Output Button */}
        <button
          type="button"
          onClick={() => setActiveTab('profiles')}
          className={`p-5 rounded-xl border text-left transition-all flex items-start gap-4 ${
            activeTab === 'profiles'
              ? 'bg-white border-blue-500 border-l-4 border-l-blue-600 shadow-md ring-1 ring-blue-500/20'
              : 'bg-white border-slate-200 border-l-4 border-l-slate-300 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div
            className={`p-2.5 rounded-lg shrink-0 ${
              activeTab === 'profiles' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs uppercase tracking-wider text-slate-500">View Module 2</div>
            <div className="font-bold text-sm text-slate-900 mt-0.5">2. Profiles & Materials Output</div>
            <div className="text-xs text-slate-500 mt-1 leading-relaxed">
              5.8m market bar count, 1D bin-packing linear cut schedule, kerf waste & accessories BOQ.
            </div>
          </div>
        </button>

        {/* Button 3: Frame / Materials Measurements Output Button */}
        <button
          type="button"
          onClick={() => setActiveTab('frames')}
          className={`p-5 rounded-xl border text-left transition-all flex items-start gap-4 ${
            activeTab === 'frames'
              ? 'bg-white border-blue-500 border-l-4 border-l-blue-600 shadow-md ring-1 ring-blue-500/20'
              : 'bg-white border-slate-200 border-l-4 border-l-slate-300 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div
            className={`p-2.5 rounded-lg shrink-0 ${
              activeTab === 'frames' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs uppercase tracking-wider text-slate-500">View Module 3</div>
            <div className="font-bold text-sm text-slate-900 mt-0.5">3. Frame & Glass Cut Measurements</div>
            <div className="text-xs text-slate-500 mt-1 leading-relaxed">
              Workshop cutting lists (mm), 90°/45° miter angles, and single-pane glass schedules.
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
    </div>
  );
};
