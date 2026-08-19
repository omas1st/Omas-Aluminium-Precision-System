import React, { useState } from 'react';
import {
  FabricationType,
  FabricationKind,
  WindowType,
  DoorType,
  FabricationItemInput,
  ConstantProfilesConfig,
} from '../types';
import { TapeRuleHelperModal } from './TapeRuleHelperModal';
import {
  Plus,
  Trash2,
  ArrowRight,
  Ruler,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  Calculator,
  ChevronDown,
  Edit2,
  FolderOpen,
  X,
} from 'lucide-react';
import './MeasurementInput.css';

interface MeasurementInputProps {
  initialProjectName?: string;
  initialItems?: FabricationItemInput[];
  constants: ConstantProfilesConfig;
  onContinue: (projectName: string, items: FabricationItemInput[]) => void;
  onBackToHome: () => void;
}

export const MeasurementInput: React.FC<MeasurementInputProps> = ({
  initialProjectName = '',
  initialItems = [],
  constants,
  onContinue,
  onBackToHome,
}) => {
  const [projectName, setProjectName] = useState(
    initialProjectName || `Residence_LivingRoom_North_${Math.floor(100 + Math.random() * 900)}`
  );
  const [itemsList, setItemsList] = useState<FabricationItemInput[]>(initialItems);

  // Current active form inputs:
  const [fabType, setFabType] = useState<FabricationType>('window');
  const [windowSubtype, setWindowSubtype] = useState<WindowType>('sliding_2_panel');
  const [doorSubtype, setDoorSubtype] = useState<DoorType>('sliding_door_2_panel');

  const [inputWidth, setInputWidth] = useState<string>('1200');
  const [inputHeight, setInputHeight] = useState<string>('1500');
  const [inputQuantity, setInputQuantity] = useState<number>(1);
  const [inputTag, setInputTag] = useState<string>('W1');
  const [inputNotes, setInputNotes] = useState<string>('');

  // Editing state for previously added item
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Tape modal helper
  const [isTapeModalOpen, setIsTapeModalOpen] = useState(false);

  // Helper text for kind
  const activeKind: FabricationKind = fabType === 'window' ? windowSubtype : doorSubtype;

  const getReadableKindName = (k: FabricationKind) => {
    switch (k) {
      case 'sliding_2_panel':
        return 'Sliding 2-Panel Window';
      case 'sliding_3_panel':
        return 'Sliding 3-Panel Window';
      case 'sliding_4_panel':
        return 'Sliding 4-Panel Window';
      case 'sliding_fixed_window':
        return 'Sliding Fixed Window (1-Pane Picture)';
      case 'sliding_1_fixed_1_sliding':
        return 'Sliding Window (1 Fixed + 1 Sliding Sash)';
      case 'casement_1_panel':
        return 'Casement 1-Panel (Single Sash)';
      case 'casement_2_panel':
        return 'Casement 2-Panel Operable';
      case 'casement_3_panel':
        return 'Casement 3-Panel Operable';
      case 'casement_4_panel':
        return 'Casement 4-Panel Operable';
      case 'casement_fixed_window':
        return 'Casement Fixed Window (Picture Light)';
      case 'casement_1_fixed_1_open':
        return 'Casement 2-Bay (1 Fixed + 1 Openable Sash)';
      case 'fixed_window':
        return 'Fixed Window';
      case 'transom_window':
        return 'Transom Window / Highlight (1-Panel)';
      case 'transom_2_panel':
        return 'Transom 2-Panel Window (Dual Operable / Mullion)';
      case 'sliding_door_2_panel':
        return 'Sliding Door 2-Panel';
      case 'sliding_door_3_panel':
        return 'Sliding Door 3-Panel';
      case 'sliding_door_4_panel':
        return 'Sliding Door 4-Panel';
      case 'casement_door_single':
        return 'Swing Casement Door (Single)';
      case 'casement_door_double':
        return 'Swing Casement Door (Double Leaf)';
      default:
        return k;
    }
  };

  const handleAddMore = () => {
    const widthNum = parseFloat(inputWidth);
    const heightNum = parseFloat(inputHeight);

    if (isNaN(widthNum) || widthNum <= 50) {
      alert('Please enter a valid Width in mm (minimum 50mm).');
      return;
    }
    if (isNaN(heightNum) || heightNum <= 50) {
      alert('Please enter a valid Height in mm (minimum 50mm).');
      return;
    }

    if (editingItemId) {
      // Update existing
      setItemsList((prev) =>
        prev.map((item) =>
          item.id === editingItemId
            ? {
                ...item,
                type: fabType,
                kind: activeKind,
                width: Math.round(widthNum),
                height: Math.round(heightNum),
                quantity: Math.max(1, inputQuantity),
                tag: inputTag || `Unit #${item.id.slice(-3)}`,
                notes: inputNotes,
              }
            : item
        )
      );
      setEditingItemId(null);
    } else {
      // Add new
      const newItem: FabricationItemInput = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: fabType,
        kind: activeKind,
        width: Math.round(widthNum),
        height: Math.round(heightNum),
        quantity: Math.max(1, inputQuantity),
        tag: inputTag || `Unit #${itemsList.length + 1}`,
        notes: inputNotes,
      };
      setItemsList((prev) => [...prev, newItem]);
    }

    // Auto-advance default tag for next entry
    const nextIndex = itemsList.length + (editingItemId ? 1 : 2);
    setInputTag(fabType === 'window' ? `W${nextIndex}` : `D${nextIndex}`);
    setInputNotes('');
  };

  const handleEditItem = (item: FabricationItemInput) => {
    setEditingItemId(item.id);
    setFabType(item.type);
    if (item.type === 'window') {
      setWindowSubtype(item.kind as WindowType);
    } else {
      setDoorSubtype(item.kind as DoorType);
    }
    setInputWidth(item.width.toString());
    setInputHeight(item.height.toString());
    setInputQuantity(item.quantity);
    setInputTag(item.tag);
    setInputNotes(item.notes || '');
  };

  const handleDeleteItem = (id: string) => {
    setItemsList((prev) => prev.filter((i) => i.id !== id));
    if (editingItemId === id) {
      setEditingItemId(null);
    }
  };

  const handleContinueClick = () => {
    // If form has unsaved item and list is empty, add it automatically
    let finalItems = [...itemsList];
    if (finalItems.length === 0) {
      const widthNum = parseFloat(inputWidth);
      const heightNum = parseFloat(inputHeight);
      if (widthNum > 50 && heightNum > 50) {
        finalItems.push({
          id: `item-${Date.now()}`,
          type: fabType,
          kind: activeKind,
          width: Math.round(widthNum),
          height: Math.round(heightNum),
          quantity: Math.max(1, inputQuantity),
          tag: inputTag || 'Unit #1',
          notes: inputNotes,
        });
      } else {
        alert('Please enter at least one valid measurement and click "Add More".');
        return;
      }
    }

    if (!projectName.trim()) {
      alert('Please enter a project name to save the data with.');
      return;
    }

    onContinue(projectName.trim(), finalItems);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Tape Rule Guide Modal */}
      <TapeRuleHelperModal
        isOpen={isTapeModalOpen}
        onClose={() => setIsTapeModalOpen(false)}
        onApplyMm={(wMm, hMm) => {
          setInputWidth(wMm.toString());
          setInputHeight(hMm.toString());
        }}
      />

      {/* Professional Split Layout: Left Summary Sidebar & Right Input Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Input Summary Schedule List */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <h2 className="font-bold text-xs uppercase tracking-widest text-slate-500">
                Input Summary Schedule
              </h2>
            </div>
            <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-bold font-mono">
              {itemsList.length} Item{itemsList.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="p-4 space-y-3 max-h-[460px] overflow-y-auto bg-[#F8FAFC]">
            {itemsList.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-lg border border-dashed border-slate-300">
                <p className="text-xs text-slate-400 font-medium">No items queued yet.</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Fill the measurement details on the right and click <b>"+ Add More Measurements"</b>.
                </p>
              </div>
            ) : (
              itemsList.map((it, idx) => (
                <div
                  key={it.id}
                  className="p-3.5 border rounded-lg bg-white shadow-xs flex justify-between items-center border-l-4 border-l-blue-500 hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        #{String(idx + 1).padStart(2, '0')}
                      </span>
                      {it.tag && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold">
                          {it.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                      {getReadableKindName(it.kind)}
                    </p>
                    <p className="text-xs font-mono font-bold text-blue-600">
                      {it.width} × {it.height} mm
                      <span className="text-slate-500 font-normal ml-1.5 font-sans">
                        (Qty: {it.quantity})
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEditItem(it)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded transition-colors"
                      title="Edit Item"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(it.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
            <button
              type="button"
              onClick={handleContinueClick}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-md uppercase text-xs tracking-wider transition-colors flex items-center justify-center gap-2"
            >
              <span>Continue to Calculation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-700 font-medium pt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Auto-saves job to local storage on continue</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: New Measurement Input Form */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                New Measurement Input
              </h2>

              <button
                type="button"
                onClick={() => setIsTapeModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Tape Rule Converter Guide (×10 rule)</span>
              </button>
            </div>

            {/* Grid Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Form Controls */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Project Identification
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. Residence_LivingRoom_North"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium text-xs text-slate-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Fabrication Category
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFabType('window');
                        setInputTag(`W${itemsList.length + 1}`);
                      }}
                      className={`px-4 py-2.5 rounded-lg text-xs font-bold border transition-all ${
                        fabType === 'window'
                          ? 'bg-blue-50 text-blue-700 border-blue-400 ring-1 ring-blue-400 font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Window
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFabType('door');
                        setInputTag(`D${itemsList.length + 1}`);
                      }}
                      className={`px-4 py-2.5 rounded-lg text-xs font-bold border transition-all ${
                        fabType === 'door'
                          ? 'bg-blue-50 text-blue-700 border-blue-400 ring-1 ring-blue-400 font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Door
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Fabrication Subtype Configuration
                  </label>
                  {fabType === 'window' ? (
                    <select
                      value={windowSubtype}
                      onChange={(e) => setWindowSubtype(e.target.value as WindowType)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 text-xs font-semibold text-slate-800 focus:outline-hidden"
                    >
                      <optgroup label="Sliding Windows">
                        <option value="sliding_2_panel">Sliding Window (2-Panel Slider)</option>
                        <option value="sliding_3_panel">Sliding Window (3-Panel Slider)</option>
                        <option value="sliding_4_panel">Sliding Window (4-Panel Slider)</option>
                        <option value="sliding_1_fixed_1_sliding">Sliding Window (1 Fixed + 1 Sliding Sash - "OX")</option>
                        <option value="sliding_fixed_window">Sliding Fixed Window (1-Pane Picture in Sliding Frame)</option>
                      </optgroup>
                      <optgroup label="Casement Windows">
                        <option value="casement_1_panel">Casement (1 Panel Single Operable)</option>
                        <option value="casement_2_panel">Casement (2 Panel Operable Window)</option>
                        <option value="casement_3_panel">Casement (3 Panel Operable Window)</option>
                        <option value="casement_4_panel">Casement (4 Panel Operable Window)</option>
                        <option value="casement_1_fixed_1_open">Casement 2-Bay (1 Fixed Light + 1 Openable Sash)</option>
                        <option value="casement_fixed_window">Casement Fixed Window (Picture Light with Snap Bead)</option>
                      </optgroup>
                      <optgroup label="Transom & Highlight Windows">
                        <option value="transom_2_panel">Transom 2-Panel Window (Dual Operable Top-Hung)</option>
                        <option value="transom_window">Transom Window (1-Panel Top-Hung / Vent)</option>
                        <option value="fixed_window">Fixed Picture Window (Standard 1-Pane)</option>
                      </optgroup>
                    </select>
                  ) : (
                    <select
                      value={doorSubtype}
                      onChange={(e) => setDoorSubtype(e.target.value as DoorType)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 text-xs font-semibold text-slate-800 focus:outline-hidden"
                    >
                      <optgroup label="Sliding Doors">
                        <option value="sliding_door_2_panel">Sliding Door (2-Panel Heavy Duty)</option>
                        <option value="sliding_door_3_panel">Sliding Door (3-Panel Triple Track)</option>
                        <option value="sliding_door_4_panel">Sliding Door (4-Panel Center Meeting)</option>
                      </optgroup>
                      <optgroup label="Casement / Swing Doors">
                        <option value="casement_door_single">Hinged Swing Door (Single Leaf)</option>
                        <option value="casement_door_double">Hinged Swing Door (Double French Leaf)</option>
                      </optgroup>
                    </select>
                  )}
                </div>
              </div>

              {/* Right Form Controls */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Width (mm)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={inputWidth}
                        onChange={(e) => setInputWidth(e.target.value)}
                        placeholder="0.0"
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono text-base font-bold text-slate-900"
                      />
                      <span className="absolute right-3.5 top-2.5 text-slate-400 font-bold text-xs">
                        W
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Height (mm)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={inputHeight}
                        onChange={(e) => setInputHeight(e.target.value)}
                        placeholder="0.0"
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono text-base font-bold text-slate-900"
                      />
                      <span className="absolute right-3.5 top-2.5 text-slate-400 font-bold text-xs">
                        H
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Quantity (Units)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={inputQuantity}
                      onChange={(e) => setInputQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Unit Tag / Label
                    </label>
                    <input
                      type="text"
                      value={inputTag}
                      onChange={(e) => setInputTag(e.target.value)}
                      placeholder="e.g. W1"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                    />
                  </div>
                </div>

                {/* Professional Polish Note Box */}
                <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2.5 text-xs text-blue-700 leading-relaxed">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <p>
                    Note: Calculations use active <b>Admin Constants</b> with 5800mm market profile stock lengths and 4mm chopsaw kerf deduction applied.
                  </p>
                </div>

                {/* Add More Measurements Button */}
                <button
                  type="button"
                  onClick={handleAddMore}
                  className="w-full py-3.5 border-2 border-dashed border-blue-400 text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-colors uppercase tracking-widest text-xs flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{editingItemId ? 'Update This Item' : '+ Add More Measurements'}</span>
                </button>
              </div>
            </div>

            {/* Back to Home Link */}
            <div className="pt-2 flex justify-between items-center text-xs text-slate-500">
              <button
                type="button"
                onClick={onBackToHome}
                className="hover:text-slate-900 font-semibold underline"
              >
                &larr; Return to Home Dashboard
              </button>
              <span>Auto-converts and validates dimensions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
