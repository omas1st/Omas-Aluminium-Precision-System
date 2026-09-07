import React, { useState, useEffect } from 'react';
import {
  SystemRestorePoint,
  getRestorePoints,
  restoreToPoint,
  restoreToAdminDefault,
  getAdminBaseline,
} from '../utils/systemRestoreManager';
import {
  History,
  RotateCcw,
  Check,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ArrowRight,
  Filter,
  Search,
  Sparkles,
  Calendar,
  Layers,
  Database,
  Building2,
  Tag,
  DollarSign,
} from 'lucide-react';

interface SystemRestoreHistoryProps {
  onRestored?: () => void;
}

export const SystemRestoreHistory: React.FC<SystemRestoreHistoryProps> = ({ onRestored }) => {
  const [restorePoints, setRestorePoints] = useState<SystemRestorePoint[]>(() => getRestorePoints());
  const [selectedPoint, setSelectedPoint] = useState<SystemRestorePoint | null>(null);
  const [isAdminConfirmOpen, setIsAdminConfirmOpen] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const adminBaseline = getAdminBaseline();

  const refreshHistory = () => {
    setRestorePoints(getRestorePoints());
  };

  useEffect(() => {
    const handleSync = () => refreshHistory();
    window.addEventListener('alu_fab_system_restored', handleSync);
    window.addEventListener('alu_fab_material_names_updated', handleSync);
    return () => {
      window.removeEventListener('alu_fab_system_restored', handleSync);
      window.removeEventListener('alu_fab_material_names_updated', handleSync);
    };
  }, []);

  const handleConfirmRestorePoint = () => {
    if (!selectedPoint) return;
    const res = restoreToPoint(selectedPoint.id);
    if (res.success) {
      setSuccessMessage(res.message);
      setSelectedPoint(null);
      refreshHistory();
      onRestored?.();
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      setErrorMessage(res.message);
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleConfirmAdminRestore = () => {
    const res = restoreToAdminDefault();
    if (res.success) {
      setSuccessMessage(res.message);
      setIsAdminConfirmOpen(false);
      refreshHistory();
      onRestored?.();
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      setErrorMessage(res.message);
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  // The last update (index 1 if index 0 is current or index 0 if only 1 exists)
  const lastUpdatePoint = restorePoints.length > 1 ? restorePoints[1] : restorePoints[0];

  // Filtering
  const filteredPoints = restorePoints.filter((pt) => {
    const matchesCat = filterCategory === 'all' || pt.category === filterCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      pt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pt.formattedDate.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getCategoryBadge = (cat: SystemRestorePoint['category']) => {
    switch (cat) {
      case 'names':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">
            <Tag className="w-3 h-3" />
            <span>Material Names</span>
          </span>
        );
      case 'prices':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
            <DollarSign className="w-3 h-3" />
            <span>Material Prices</span>
          </span>
        );
      case 'profile':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
            <Building2 className="w-3 h-3" />
            <span>Company Profile</span>
          </span>
        );
      case 'rules':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800">
            <Layers className="w-3 h-3" />
            <span>Pricing Rules</span>
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800">
            <ShieldCheck className="w-3 h-3" />
            <span>Admin Baseline</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800">
            <Database className="w-3 h-3" />
            <span>System Snapshot</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Notification Messages */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-2.5 shadow-xs animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-semibold flex items-center gap-2.5 shadow-xs animate-fadeIn">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Overview & Quick Restore Actions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quick Action 1: Restore Last Update */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Rollback Feature
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Restore Last Update</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Quickly revert the most recent configuration changes you made to return your system to its previous state.
            </p>

            {lastUpdatePoint ? (
              <div className="mt-3.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-800">{lastUpdatePoint.formattedDate}</span>
                </div>
                <div className="font-medium text-slate-900 line-clamp-1">{lastUpdatePoint.title}</div>
              </div>
            ) : (
              <div className="mt-3.5 p-3 bg-slate-50 rounded-xl text-xs text-slate-400 italic">
                No previous update found in this session.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
            <button
              type="button"
              disabled={!lastUpdatePoint}
              onClick={() => setSelectedPoint(lastUpdatePoint)}
              className="px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Last Update</span>
            </button>
          </div>
        </div>

        {/* Quick Action 2: Restore to Admin Default Update */}
        <div className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-white/10 text-purple-200 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
                Admin Panel Baseline
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">Restore to Default Update</h3>
            <p className="text-xs text-purple-200/90 mt-1 leading-relaxed">
              Restore the entire system to the default baseline parameters set by the administrator from the Admin Panel
              (/admin). Resets custom overrides back to official company standards.
            </p>

            <div className="mt-3.5 p-3 bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl text-xs text-purple-100 space-y-1">
              <div className="text-[11px] text-purple-300">Default Baseline Source:</div>
              <div className="font-semibold text-white">
                {adminBaseline ? 'Admin Panel Configuration (/admin)' : 'Standard Factory Defaults'}
              </div>
              {adminBaseline?.timestamp && (
                <div className="text-[10px] text-purple-300">
                  Last Admin Baseline Saved: {adminBaseline.formattedDate || adminBaseline.timestamp}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-end">
            <button
              type="button"
              onClick={() => setIsAdminConfirmOpen(true)}
              className="px-4 py-2 text-xs font-bold text-slate-900 bg-white hover:bg-purple-50 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-purple-700" />
              <span>Restore Admin Defaults</span>
            </button>
          </div>
        </div>
      </div>

      {/* Update History List Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header with Search and Filter */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <span>All System Updates with Date & Time</span>
              <span className="px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full">
                {filteredPoints.length} updates logged
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click "Restore This Update" on any point below to roll your system back to that exact date and time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            {/* Search */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search updates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="names">Material Names</option>
                <option value="prices">Raw Material Prices</option>
                <option value="profile">Company Profile</option>
                <option value="rules">Pricing Rules</option>
                <option value="admin">Admin Baseline</option>
                <option value="full">System Snapshots</option>
              </select>
            </div>
          </div>
        </div>

        {/* Updates Timeline List */}
        <div className="divide-y divide-slate-100">
          {filteredPoints.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No system updates match your search filter.
            </div>
          ) : (
            filteredPoints.map((point, index) => {
              const isCurrent = index === 0;

              return (
                <div
                  key={point.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-slate-50/70 ${
                    isCurrent ? 'bg-blue-50/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Timestamp / Status Indicator */}
                    <div
                      className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                        isCurrent
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{point.title}</span>
                        {getCategoryBadge(point.category)}
                        {isCurrent && (
                          <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-blue-600 text-white rounded-md tracking-wider">
                            Current Active State
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{point.description}</p>

                      <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{point.formattedDate}</span>
                        </span>
                        <span>•</span>
                        <span className="text-slate-400 font-mono text-[10px]">ID: {point.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      disabled={isCurrent}
                      onClick={() => setSelectedPoint(point)}
                      className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                        isCurrent
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 hover:border-blue-300 shadow-2xs'
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isCurrent ? 'Active Now' : 'Restore This Update'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Confirmation Modal: Restore Specific Point */}
      {selectedPoint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 animate-scaleUp">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirm System Restoration</h3>
                <p className="text-xs text-slate-500">Roll back settings to a saved historical point</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Update Title:</span>
                <span className="font-bold text-slate-900 text-right">{selectedPoint.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-semibold text-slate-800">{selectedPoint.formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <div>{getCategoryBadge(selectedPoint.category)}</div>
              </div>
              <div className="pt-2 border-t border-slate-200 text-slate-600 leading-relaxed">
                {selectedPoint.description}
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Are you sure you want to restore this update? Your current settings will be replaced with this snapshot. A
              new restore point of your current state will also be captured automatically so you never lose any data.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedPoint(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRestorePoint}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Yes, Restore System</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Restore Admin Defaults */}
      {isAdminConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 animate-scaleUp">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Restore Admin Panel Defaults</h3>
                <p className="text-xs text-slate-500">Reset configurations to official admin baseline</p>
              </div>
            </div>

            <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-xl text-xs text-purple-950 space-y-2 mb-4 leading-relaxed">
              <p className="font-semibold">This action will:</p>
              <ul className="list-disc pl-4 space-y-1 text-purple-900">
                <li>Restore profile dimensions and constants configured by the Admin in /admin.</li>
                <li>Restore raw material purchase prices set in the Admin Panel.</li>
                <li>Reset all user-customized material names back to standard default names.</li>
                <li>Reset pricing rules and financial terms to admin standards.</li>
              </ul>
            </div>

            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Are you sure you want to restore the default update set by the admin?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAdminConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAdminRestore}
                className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Confirm Restore Admin Defaults</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
