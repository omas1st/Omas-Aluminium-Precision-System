import React, { useState } from 'react';
import { MaterialPricesConfig } from '../types';
import { DEFAULT_MATERIAL_PRICES } from '../constants/defaultPrices';
import {
  Boxes,
  Search,
  RotateCcw,
  Save,
  Check,
  Layers,
  Wrench,
  Truck,
  Percent,
  Info,
  SlidersHorizontal,
} from 'lucide-react';

interface MaterialPricesEditorProps {
  initialPrices: MaterialPricesConfig;
  currencySymbol: string;
  onSave: (prices: MaterialPricesConfig) => void;
}

interface ProfileItemDef {
  key: keyof MaterialPricesConfig['profileBarPrices'];
  label: string;
  category: 'Sliding Systems' | 'Casement Systems' | 'Burglary & Net' | 'Transom Systems' | 'Door Systems';
  unit: string;
}

interface AccessoryItemDef {
  key: keyof MaterialPricesConfig['accessoryPrices'];
  label: string;
  unit: string;
  description: string;
}

const PROFILE_ITEMS: ProfileItemDef[] = [
  // Sliding
  { key: 'topBottomTrack', label: 'Top & Bottom Sliding Track Profile', category: 'Sliding Systems', unit: 'per 5.8m bar' },
  { key: 'sideJambs', label: 'Sliding Window Side Jamb Profile', category: 'Sliding Systems', unit: 'per 5.8m bar' },
  { key: 'bottomSashRail', label: 'Bottom Sash Rail (Roller Carrier)', category: 'Sliding Systems', unit: 'per 5.8m bar' },
  { key: 'topSashRail', label: 'Top Sash Rail Profile', category: 'Sliding Systems', unit: 'per 5.8m bar' },
  { key: 'lockFrameStile', label: 'Lock Sash Stile Profile (Interlock/Lock)', category: 'Sliding Systems', unit: 'per 5.8m bar' },
  { key: 'interlockFrameStile', label: 'Interlock Stile Profile', category: 'Sliding Systems', unit: 'per 5.8m bar' },

  // Casement
  { key: 'casementOuterWidth', label: 'Casement Outer Frame (Width Horizontal)', category: 'Casement Systems', unit: 'per 5.8m bar' },
  { key: 'casementOuterHeight', label: 'Casement Outer Frame (Height Vertical)', category: 'Casement Systems', unit: 'per 5.8m bar' },
  { key: 'casementOuterFrame', label: 'General Casement Outer Frame Section', category: 'Casement Systems', unit: 'per 5.8m bar' },
  { key: 'casement2Mullion', label: 'Casement 2-Track Heavy Mullion Section', category: 'Casement Systems', unit: 'per 5.8m bar' },
  { key: 'casement3Mullion', label: 'Casement 3-Track Heavy Mullion Section', category: 'Casement Systems', unit: 'per 5.8m bar' },
  { key: 'casementMullion', label: 'Standard Center Mullion Section', category: 'Casement Systems', unit: 'per 5.8m bar' },
  { key: 'casementDeCurveSash', label: 'Casement De-Curve Sash Extrusion', category: 'Casement Systems', unit: 'per 5.8m bar' },
  { key: 'casementGlazingBead', label: 'Casement Glazing Retaining Bead', category: 'Casement Systems', unit: 'per 5.8m bar' },

  // Burglary & Net
  { key: 'casementBurglaryTopSideFrame', label: 'Burglary Top & Side Frame Section', category: 'Burglary & Net', unit: 'per 5.8m bar' },
  { key: 'casementBurglaryBottomFrame', label: 'Burglary Bottom Frame Section', category: 'Burglary & Net', unit: 'per 5.8m bar' },
  { key: 'netFrame1125', label: 'Mosquito Net Frame Profile 1125', category: 'Burglary & Net', unit: 'per 5.8m bar' },
  { key: 'netFrame1126', label: 'Mosquito Net Frame Profile 1126', category: 'Burglary & Net', unit: 'per 5.8m bar' },
  { key: 'netFrame1132', label: 'Mosquito Net Frame Profile 1132', category: 'Burglary & Net', unit: 'per 5.8m bar' },
  { key: 'burglaryIronRod', label: 'Solid Burglary Security Iron Rod', category: 'Burglary & Net', unit: 'per 5.8m rod' },
  { key: 'casementIronAngle', label: 'Casement Angle Reinforcement Iron', category: 'Burglary & Net', unit: 'per 5.8m length' },
  { key: 'glazingDivider', label: 'Glazing Grid Architectural Divider', category: 'Burglary & Net', unit: 'per 5.8m bar' },

  // Transom
  { key: 'transomOuterFrame', label: 'Transom Window Outer Perimeter Frame', category: 'Transom Systems', unit: 'per 5.8m bar' },
  { key: 'transomMullion', label: 'Transom Dividing Mullion Profile', category: 'Transom Systems', unit: 'per 5.8m bar' },
  { key: 'transomTopHungSash', label: 'Top Hung / Awning Sash Profile', category: 'Transom Systems', unit: 'per 5.8m bar' },
  { key: 'transomGlazingBead', label: 'Transom Glazing Retaining Bead', category: 'Transom Systems', unit: 'per 5.8m bar' },

  // Door
  { key: 'doorOuterFrame', label: 'Heavy Architectural Door Outer Frame', category: 'Door Systems', unit: 'per 5.8m bar' },
  { key: 'doorStile', label: 'Heavy Door Vertical Sash Stile', category: 'Door Systems', unit: 'per 5.8m bar' },
  { key: 'doorTopRail', label: 'Hinged Door Top Horizontal Rail', category: 'Door Systems', unit: 'per 5.8m bar' },
  { key: 'doorBottomRail', label: 'Hinged Door Bottom Kick Rail', category: 'Door Systems', unit: 'per 5.8m bar' },
  { key: 'fixedFrame', label: 'Fixed Picture Window Outer Frame', category: 'Door Systems', unit: 'per 5.8m bar' },
];

const ACCESSORY_ITEMS: AccessoryItemDef[] = [
  { key: 'slidingRollerPair', label: 'Sliding Wheel Roller Pair (Heavy Duty Bearings)', unit: 'per pair', description: 'Dual nylon/brass ball bearing rollers for smooth sliding sash action' },
  { key: 'crescentHookLock', label: 'Sliding Sash Crescent Hook Lockset', unit: 'per piece', description: 'Sash safety crescent hook latch with catch plate' },
  { key: 'woolpilePerMeter', label: 'Weatherstripping Woolpile Mohair Seal', unit: 'per meter', description: 'Dense weatherpile inserted into profile channels for dust and draft seal' },
  { key: 'rubberGasketPerMeter', label: 'EPDM Glass Retaining Weather Gasket', unit: 'per meter', description: 'Heavy-duty weather-tight elastomeric rubber gasket for glazing compression' },
  { key: 'cornerCleatPiece', label: '90° Aluminum Corner Joint Cleats', unit: 'per piece', description: 'Corner joint alignment bracket crimped into mitred sash joints' },
  { key: 'frictionStayPair', label: 'Stainless Steel Heavy Friction Stays', unit: 'per pair', description: 'Top/side hung casement stainless steel friction window hinges' },
  { key: 'casementCamHandle', label: 'Casement Cockspur / Cam Multi-Point Handle', unit: 'per piece', description: 'Die-cast casement window locking handle' },
  { key: 'assemblyScrewPiece', label: 'Corrosion-Resistant Assembly Screws', unit: 'per piece', description: 'Self-tapping stainless/zinc fasteners for mechanical corners' },
  { key: 'siliconeSealantTube', label: 'Neutral Cure Structural Silicone Sealant', unit: 'per cartridge', description: '300ml structural silicone sealant tube for perimeter glazing joints' },
  { key: 'wallAnchorPlug', label: 'Wall Expansion Anchor Plug & Heavy Screws', unit: 'per piece', description: 'Nylon masonry rawl plug with zinc wall fixing screws' },
  { key: 'doorHingePair', label: 'Architectural Heavy Door Hinges', unit: 'per pair', description: 'Heavy 3-knuckle/4-inch aluminum door butt hinges' },
  { key: 'doorMortiseLockset', label: 'High Security Mortise Lockset & Cylinder', unit: 'per piece', description: 'Euro-profile cylinder mortise lock with dual handles and keys' },
  { key: 'flushBoltPiece', label: 'Concealed Double-Door Flush Bolt', unit: 'per piece', description: 'Top/bottom concealed brass/steel flush bolt mechanism' },
  { key: 'netRollPrice', label: 'Fiberglass Insect Mosquito Mesh Roll', unit: 'per roll', description: '30-meter roll of fine architectural charcoal mesh screen' },
  { key: 'netRubberRollPrice', label: 'Screen Retaining Spline Rubber Cord', unit: 'per roll', description: 'Hollow serrated rubber spline roll for tensioning mosquito net' },
  { key: 'steelStopperPiece', label: 'Sliding Sash Anti-Jump & Safety Stopper', unit: 'per piece', description: 'Rubberized steel bumper stopper for track travel limit' },
  { key: 'casementHingePiece', label: 'Heavy Duty Casement Butt Hinges', unit: 'per piece', description: 'Standard heavy duty aluminum pivot/butt hinge' },
];

export const MaterialPricesEditor: React.FC<MaterialPricesEditorProps> = ({
  initialPrices,
  currencySymbol,
  onSave,
}) => {
  const [prices, setPrices] = useState<MaterialPricesConfig>(initialPrices);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleProfilePriceChange = (key: keyof MaterialPricesConfig['profileBarPrices'], val: number) => {
    setPrices((prev) => ({
      ...prev,
      profileBarPrices: {
        ...prev.profileBarPrices,
        [key]: Math.max(0, val),
      },
    }));
  };

  const handleAccessoryPriceChange = (key: keyof MaterialPricesConfig['accessoryPrices'], val: number) => {
    setPrices((prev) => ({
      ...prev,
      accessoryPrices: {
        ...prev.accessoryPrices,
        [key]: Math.max(0, val),
      },
    }));
  };

  const handleSave = () => {
    onSave(prices);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset all material unit prices back to standard factory defaults?')) {
      setPrices(DEFAULT_MATERIAL_PRICES);
      onSave(DEFAULT_MATERIAL_PRICES);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  // Filter profiles
  const filteredProfiles = PROFILE_ITEMS.filter((p) => {
    const matchesSearch = p.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter accessories
  const filteredAccessories = ACCESSORY_ITEMS.filter((a) => {
    const matchesSearch = a.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || activeCategory === 'Accessories';
    return matchesSearch && matchesCategory;
  });

  const showGlass = (activeCategory === 'all' || activeCategory === 'Glass') &&
    ('glass'.includes(searchTerm.toLowerCase()) || prices.glassTypeName.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === '');

  const showServices = (activeCategory === 'all' || activeCategory === 'Labor') &&
    ('labor installation transport'.includes(searchTerm.toLowerCase()) || searchTerm === '');

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
                <Boxes className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Local Raw Material Price Catalog
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Active Currency: {currencySymbol} ({prices.currency || 'USD'})
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Update unit costs to match the current market supply prices in your region or local aluminium warehouse. 
              These unit rates are automatically applied to the cutting list optimizations and project material procurement bills.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="px-3 py-2 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Factory Defaults</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Material Prices</span>
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2 shadow-2xs animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Local market prices updated successfully! All new and recalculated materials bills will use these rates.</span>
          </div>
        )}

        {/* Filter bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by profile name, roller, lock, mullion, glass..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['all', 'Sliding Systems', 'Casement Systems', 'Burglary & Net', 'Transom Systems', 'Door Systems', 'Glass', 'Accessories', 'Labor'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat === 'all' ? 'All Materials' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Glass Glazing Section */}
      {showGlass && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-sky-50 text-sky-700 rounded-lg">
                <Layers className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Glass Supply & Glazing Rates</h3>
                <p className="text-xs text-slate-500">Rate per square meter for cut-to-size precision architectural glass.</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-sky-50 text-sky-700 rounded-md">
              Glass Area Pricing
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Glass Specification / Description
              </label>
              <input
                type="text"
                value={prices.glassTypeName}
                onChange={(e) => setPrices((prev) => ({ ...prev, glassTypeName: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">E.g., 5mm Clear / Tinted Bronze Float Glass or 6mm Reflective</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit Cost per Square Meter (m²)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-bold">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={prices.glassPricePerM2}
                  onChange={(e) => setPrices((prev) => ({ ...prev, glassPricePerM2: parseFloat(e.target.value) || 0 }))}
                  className="w-full pl-8 pr-3 py-2 text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Total glass pane area is multiplied directly by this rate.</p>
            </div>
          </div>
        </div>
      )}

      {/* Aluminum Profile Extrusions (per 5.8m bar) */}
      {filteredProfiles.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
                <Boxes className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Aluminum Profile Extrusions (Per 5.8-Meter Standard Stock Bar)
                </h3>
                <p className="text-xs text-slate-500">
                  Purchase price per standard 5.8m commercial extrusion bar from your local aluminum dealer.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md">
              {filteredProfiles.length} Profiles
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-y border-slate-200">
                  <th className="py-2.5 px-3">Profile Section</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Length Unit</th>
                  <th className="py-2.5 px-3 text-right">Price ({currencySymbol})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProfiles.map((p) => {
                  const currentVal = prices.profileBarPrices[p.key] ?? 0;
                  return (
                    <tr key={p.key} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {p.label}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{p.unit}</td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="inline-flex items-center relative max-w-[130px]">
                          <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-slate-400 text-xs font-semibold">
                            {currencySymbol}
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={currentVal}
                            onChange={(e) => handleProfilePriceChange(p.key, parseFloat(e.target.value) || 0)}
                            className="w-full pl-6 pr-2 py-1 text-right font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hardware & Accessories */}
      {filteredAccessories.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                <Wrench className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Hardware, Locks, Rollers, Fasteners & Weatherstripping
                </h3>
                <p className="text-xs text-slate-500">
                  Unit purchase prices for window hardware, locking mechanisms, gaskets, and consumables.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
              {filteredAccessories.length} Items
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-y border-slate-200">
                  <th className="py-2.5 px-3">Item / Hardware Component</th>
                  <th className="py-2.5 px-3">Unit Specification</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">Unit Price ({currencySymbol})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAccessories.map((a) => {
                  const currentVal = prices.accessoryPrices[a.key] ?? 0;
                  return (
                    <tr key={a.key} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {a.label}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        <span className="font-mono text-[11px]">{a.unit}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px] max-w-xs">
                        {a.description}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="inline-flex items-center relative max-w-[130px]">
                          <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-slate-400 text-xs font-semibold">
                            {currencySymbol}
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={currentVal}
                            onChange={(e) => handleAccessoryPriceChange(a.key, parseFloat(e.target.value) || 0)}
                            className="w-full pl-6 pr-2 py-1 text-right font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Labor, Logistics & Markup Defaults */}
      {showServices && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-purple-50 text-purple-700 rounded-lg">
              <Truck className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Workshop Fabrication Labor, Site Fitting & Commercial Margins
              </h3>
              <p className="text-xs text-slate-500">
                Default production labor rates and transport costs applied to company expense summaries.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fabrication Labor Rate ({currencySymbol})
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-bold">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={prices.laborRateValue}
                  onChange={(e) => setPrices((prev) => ({ ...prev, laborRateValue: parseFloat(e.target.value) || 0 }))}
                  className="w-full pl-8 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Per fabricated window/door unit</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                On-Site Fitting Rate ({currencySymbol})
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-bold">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={prices.installationRatePerUnit}
                  onChange={(e) => setPrices((prev) => ({ ...prev, installationRatePerUnit: parseFloat(e.target.value) || 0 }))}
                  className="w-full pl-8 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Per unit on-site civil anchoring</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Site Delivery / Logistics ({currencySymbol})
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-bold">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={prices.transportationFlat}
                  onChange={(e) => setPrices((prev) => ({ ...prev, transportationFlat: parseFloat(e.target.value) || 0 }))}
                  className="w-full pl-8 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Flat transport / delivery to site</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Profit Markup (%)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 text-xs font-bold">
                  %
                </span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={prices.profitMarginPercent}
                  onChange={(e) => setPrices((prev) => ({ ...prev, profitMarginPercent: parseFloat(e.target.value) || 0 }))}
                  className="w-full pl-3 pr-8 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Direct company markup margin</p>
            </div>
          </div>
        </div>
      )}

      {/* Save Button Bottom Bar */}
      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Click "Save Material Prices" to permanently update all calculations across the system.</span>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" />
          <span>Save All Material Prices</span>
        </button>
      </div>
    </div>
  );
};
