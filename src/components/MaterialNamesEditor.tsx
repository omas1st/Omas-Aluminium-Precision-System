import React, { useState, useEffect } from 'react';
import {
  DEFAULT_MATERIAL_CATALOG,
  getCustomMaterialNames,
  saveCustomMaterialNames,
  resetCustomMaterialNames,
} from '../utils/materialNamesStorage';
import {
  Tag,
  Search,
  Check,
  RotateCcw,
  Save,
  Info,
  Layers,
  Sparkles,
  Edit3,
} from 'lucide-react';

interface MaterialNamesEditorProps {
  onSaved?: () => void;
}

export const MaterialNamesEditor: React.FC<MaterialNamesEditorProps> = ({ onSaved }) => {
  const [customNames, setCustomNames] = useState<Record<string, string>>(() => getCustomMaterialNames());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [activeEditingKey, setActiveEditingKey] = useState<string | null>(null);

  // Sync if updated from elsewhere
  useEffect(() => {
    const handleUpdate = () => {
      setCustomNames(getCustomMaterialNames());
    };
    window.addEventListener('alu_fab_material_names_updated', handleUpdate);
    window.addEventListener('alu_fab_system_restored', handleUpdate);
    return () => {
      window.removeEventListener('alu_fab_material_names_updated', handleUpdate);
      window.removeEventListener('alu_fab_system_restored', handleUpdate);
    };
  }, []);

  const categories = [
    { id: 'all', label: 'All Materials' },
    { id: 'Sliding Systems', label: 'Sliding Window & Door Profiles' },
    { id: 'Casement Systems', label: 'Casement Window Profiles' },
    { id: 'Transom Systems', label: 'Transom & Vent Profiles' },
    { id: 'Hinged Doors', label: 'Swing Door Profiles' },
    { id: 'Insect Netting Systems', label: 'Insect Screen Netting' },
    { id: 'Security & Grills', label: 'Security & Burglary Rods' },
    { id: 'Glass & Glazing', label: 'Glass Specification' },
    { id: 'Sliding Hardware', label: 'Sliding Rollers & Locks' },
    { id: 'Casement Hardware', label: 'Casement Stays & Handles' },
    { id: 'Door Hardware', label: 'Door Hinges & Mortise Locks' },
    { id: 'Weatherstripping & Seals', label: 'Woolpile & Rubber Gaskets' },
    { id: 'Fasteners & Screws', label: 'Assembly Fasteners & Cleats' },
    { id: 'Chemicals & Sealants', label: 'Weatherproof Silicone' },
  ];

  const handleNameChange = (key: string, val: string) => {
    setCustomNames((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleResetSingle = (key: string) => {
    setCustomNames((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleSaveAll = () => {
    // Filter out any empty strings so they revert to defaults
    const cleaned: Record<string, string> = {};
    for (const [k, v] of Object.entries(customNames)) {
      if (v && v.trim() !== '') {
        cleaned[k] = v.trim();
      }
    }
    saveCustomMaterialNames(cleaned);
    setCustomNames(cleaned);
    setSaveSuccess(true);
    onSaved?.();
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleResetAll = () => {
    if (
      window.confirm(
        'Reset all material names back to standard industry default terminology? This will restore default names across all cutting lists, bills, and PDFs.'
      )
    ) {
      resetCustomMaterialNames();
      setCustomNames({});
      setSaveSuccess(true);
      onSaved?.();
      setTimeout(() => setSaveSuccess(false), 3500);
    }
  };

  // Filter items
  const filteredCatalog = DEFAULT_MATERIAL_CATALOG.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const currentName = customNames[item.key] || item.defaultName;
    const matchesSearch =
      searchTerm.trim() === '' ||
      item.defaultName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      currentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const customizedCount = Object.keys(customNames).filter(
    (k) => customNames[k] && customNames[k].trim() !== ''
  ).length;

  return (
    <div className="space-y-6">
      {/* Informational Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl shrink-0 mt-0.5">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Material Custom Display Names</span>
                {customizedCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                    {customizedCount} customized
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Rename profiles, accessories, glass, and hardware to your local workshop terminology or dialect for
                faster team understanding. Custom names automatically propagate across all cutting lists, procurement bills,
                quotations, and PDF exports.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {customizedCount > 0 && (
              <button
                type="button"
                onClick={handleResetAll}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                title="Reset all names to default"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Names</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Material Names</span>
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Custom material names saved successfully. All application pages, cutting lists, and quotations are now updated.</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search material by default name, custom name, or application..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <Layers className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4 w-1/3">Standard / Technical Name</th>
                <th className="py-3.5 px-4 w-1/2">Your Custom Display Name (Workshop Term)</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCatalog.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    No materials found matching "{searchTerm}".
                  </td>
                </tr>
              ) : (
                filteredCatalog.map((item, index) => {
                  const currentCustomName = customNames[item.key] || '';
                  const isCustomized = currentCustomName.trim() !== '' && currentCustomName.trim() !== item.defaultName;

                  return (
                    <tr
                      key={item.key}
                      className={`transition-colors hover:bg-slate-50/60 ${
                        isCustomized ? 'bg-blue-50/20' : ''
                      }`}
                    >
                      {/* Row Index */}
                      <td className="py-3.5 px-4 text-center text-slate-400 font-mono text-[11px]">
                        {index + 1}
                      </td>

                      {/* Default Industry Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{item.defaultName}</div>
                        {item.description && (
                          <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{item.description}</div>
                        )}
                        <div className="mt-1 flex items-center gap-2">
                          <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded-md">
                            {item.category}
                          </span>
                          <span className="text-[10px] text-slate-400">({item.unit})</span>
                        </div>
                      </td>

                      {/* Custom Name Input */}
                      <td className="py-3.5 px-4">
                        <div className="relative">
                          <input
                            type="text"
                            value={currentCustomName}
                            placeholder={item.defaultName}
                            onChange={(e) => handleNameChange(item.key, e.target.value)}
                            onFocus={() => setActiveEditingKey(item.key)}
                            onBlur={() => setActiveEditingKey(null)}
                            className={`w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                              isCustomized
                                ? 'bg-blue-50/50 border-blue-300 text-blue-950 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                                : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                            }`}
                          />
                          {isCustomized && (
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                              <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-blue-100 text-blue-700 rounded">
                                Custom
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {isCustomized ? (
                          <button
                            type="button"
                            onClick={() => handleResetSingle(item.key)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Reset to default industry name"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Default</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Showing {filteredCatalog.length} of {DEFAULT_MATERIAL_CATALOG.length} system materials.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
