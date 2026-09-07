import React, { useState } from 'react';
import {
  ClientWorkPricingRule,
  getStoredPricingRules,
  saveStoredPricingRules,
  resetStoredPricingRules,
} from '../utils/workPricingCalculator';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  Sliders,
  ShieldAlert,
  Save,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface PricingRulesEditorProps {
  isAdmin?: boolean;
  currencySymbol?: string;
  onRulesChanged?: (rules: ClientWorkPricingRule[]) => void;
}

export const PricingRulesEditor: React.FC<PricingRulesEditorProps> = ({
  isAdmin = false,
  currencySymbol = '₦',
  onRulesChanged,
}) => {
  const [rules, setRules] = useState<ClientWorkPricingRule[]>(getStoredPricingRules());
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ClientWorkPricingRule>>({});
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [newRuleData, setNewRuleData] = useState<Partial<ClientWorkPricingRule>>({
    category: 'sliding',
    label: '',
    minWidth: 900,
    maxWidth: 1200,
    minHeight: 900,
    maxHeight: 1200,
    priceWithoutExtra: 60000,
    priceWithExtra: 65000,
    extraDescription: 'Net / Burglary',
  });
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleStartEdit = (rule: ClientWorkPricingRule) => {
    setEditingRuleId(rule.id);
    setEditFormData({ ...rule });
  };

  const handleCancelEdit = () => {
    setEditingRuleId(null);
    setEditFormData({});
  };

  const handleSaveEdit = () => {
    if (!editingRuleId) return;
    const updated = rules.map((r) =>
      r.id === editingRuleId ? ({ ...r, ...editFormData } as ClientWorkPricingRule) : r
    );
    setRules(updated);
    saveStoredPricingRules(updated);
    onRulesChanged?.(updated);
    setEditingRuleId(null);
    setEditFormData({});
    showNotification('Pricing range rule updated successfully.');
  };

  const handleDeleteRule = (id: string) => {
    if (window.confirm('Are you sure you want to delete this pricing range rule?')) {
      const updated = rules.filter((r) => r.id !== id);
      setRules(updated);
      saveStoredPricingRules(updated);
      onRulesChanged?.(updated);
      showNotification('Pricing range rule deleted.');
    }
  };

  const handleAddNewRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleData.label || !newRuleData.minWidth || !newRuleData.maxWidth) {
      alert('Please fill in rule label and valid dimension ranges.');
      return;
    }

    const newRule: ClientWorkPricingRule = {
      id: `custom-rule-${Date.now()}`,
      category: (newRuleData.category as any) || 'sliding',
      label: newRuleData.label,
      minWidth: Number(newRuleData.minWidth) || 0,
      maxWidth: Number(newRuleData.maxWidth) || 1200,
      minHeight: Number(newRuleData.minHeight) || 0,
      maxHeight: Number(newRuleData.maxHeight) || 1200,
      priceWithoutExtra: Number(newRuleData.priceWithoutExtra) || 0,
      priceWithExtra: Number(newRuleData.priceWithExtra) || 0,
      extraDescription: newRuleData.extraDescription || 'Net / Burglary',
      notes: newRuleData.notes || 'User configured custom size range',
    };

    const updated = [...rules, newRule];
    setRules(updated);
    saveStoredPricingRules(updated);
    onRulesChanged?.(updated);
    setIsAddingNew(false);
    setNewRuleData({
      category: 'sliding',
      label: '',
      minWidth: 900,
      maxWidth: 1200,
      minHeight: 900,
      maxHeight: 1200,
      priceWithoutExtra: 60000,
      priceWithExtra: 65000,
      extraDescription: 'Net / Burglary',
    });
    showNotification('New pricing range rule created successfully.');
  };

  const handleResetDefaults = () => {
    if (
      window.confirm(
        'Reset all window/door size range pricing rules to standard factory specifications?'
      )
    ) {
      const defaults = resetStoredPricingRules();
      setRules(defaults);
      onRulesChanged?.(defaults);
      showNotification('Pricing rules reset to standard system defaults.');
    }
  };

  const filteredRules = rules.filter((r) => {
    if (activeCategoryFilter === 'all') return true;
    return r.category === activeCategoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header Info & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <Sliders className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-800">
              {isAdmin ? 'Admin: Client Work Pricing & Size Range Rules' : 'Window & Door Size Range Pricing Rules'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Configure dimension boundaries (width × height mm) and standard unit prices for Sliding, Casement, Door, and Transom fabrications. Works exceeding logic limits prompt for manual pricing on client bills.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Size Range</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            title="Reset rules to default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 text-xs">
        {[
          { id: 'all', label: 'All Openings' },
          { id: 'sliding', label: 'Sliding Windows' },
          { id: 'casement', label: 'Casement Windows' },
          { id: 'transom', label: 'Transom Windows' },
          { id: 'door', label: 'Doors' },
          { id: 'fixed', label: 'Fixed Glazing' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveCategoryFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeCategoryFilter === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Add New Rule Modal / Expanded Form */}
      {isAddingNew && (
        <form
          onSubmit={handleAddNewRule}
          className="bg-blue-50/70 border-2 border-blue-200 rounded-2xl p-5 space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-blue-200/60 pb-3">
            <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Define New Window / Door Size Range & Unit Price</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Fabrication Type</label>
              <select
                value={newRuleData.category}
                onChange={(e) => setNewRuleData({ ...newRuleData, category: e.target.value as any })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="sliding">Sliding Window</option>
                <option value="casement">Casement Window</option>
                <option value="transom">Transom Window</option>
                <option value="door">Door</option>
                <option value="fixed">Fixed Window</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Rule Label / Identifier</label>
              <input
                type="text"
                value={newRuleData.label || ''}
                onChange={(e) => setNewRuleData({ ...newRuleData, label: e.target.value })}
                placeholder="e.g. Standard Large 2-Panel Slider (950-1200)"
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Width Range (Min - Max mm)</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={newRuleData.minWidth || ''}
                  onChange={(e) => setNewRuleData({ ...newRuleData, minWidth: Number(e.target.value) })}
                  placeholder="Min mm"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                />
                <span className="text-slate-400 font-bold">-</span>
                <input
                  type="number"
                  value={newRuleData.maxWidth || ''}
                  onChange={(e) => setNewRuleData({ ...newRuleData, maxWidth: Number(e.target.value) })}
                  placeholder="Max mm"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Height Range (Min - Max mm)</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={newRuleData.minHeight || ''}
                  onChange={(e) => setNewRuleData({ ...newRuleData, minHeight: Number(e.target.value) })}
                  placeholder="Min mm"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                />
                <span className="text-slate-400 font-bold">-</span>
                <input
                  type="number"
                  value={newRuleData.maxHeight || ''}
                  onChange={(e) => setNewRuleData({ ...newRuleData, maxHeight: Number(e.target.value) })}
                  placeholder="Max mm"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Standard Price (Without Net/Burglary) {currencySymbol}
              </label>
              <input
                type="number"
                value={newRuleData.priceWithoutExtra || ''}
                onChange={(e) =>
                  setNewRuleData({ ...newRuleData, priceWithoutExtra: Number(e.target.value) })
                }
                placeholder="60000"
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Price With Net / Burglary {currencySymbol}
              </label>
              <input
                type="number"
                value={newRuleData.priceWithExtra || ''}
                onChange={(e) =>
                  setNewRuleData({ ...newRuleData, priceWithExtra: Number(e.target.value) })
                }
                placeholder="65000"
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-semibold text-emerald-700"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Extra Option Description</label>
              <input
                type="text"
                value={newRuleData.extraDescription || ''}
                onChange={(e) => setNewRuleData({ ...newRuleData, extraDescription: e.target.value })}
                placeholder="e.g. Net Screen / Burglary"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded-xl hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Size Range Rule</span>
            </button>
          </div>
        </form>
      )}

      {/* Rules Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Size Range / Label</th>
                <th className="py-3 px-4">Width Range (mm)</th>
                <th className="py-3 px-4">Height Range (mm)</th>
                <th className="py-3 px-4 text-right">Price (Base)</th>
                <th className="py-3 px-4 text-right">Price (With Net/Burglary)</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRules.map((rule) => {
                const isEditing = editingRuleId === rule.id;

                if (isEditing) {
                  return (
                    <tr key={rule.id} className="bg-amber-50/60">
                      <td className="py-2.5 px-4">
                        <select
                          value={editFormData.category || rule.category}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, category: e.target.value as any })
                          }
                          className="px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                        >
                          <option value="sliding">Sliding</option>
                          <option value="casement">Casement</option>
                          <option value="transom">Transom</option>
                          <option value="door">Door</option>
                          <option value="fixed">Fixed</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          value={editFormData.label ?? rule.label}
                          onChange={(e) => setEditFormData({ ...editFormData, label: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editFormData.minWidth ?? rule.minWidth}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, minWidth: Number(e.target.value) })
                            }
                            className="w-16 px-1.5 py-1 bg-white border border-slate-300 rounded text-xs"
                          />
                          <span>-</span>
                          <input
                            type="number"
                            value={editFormData.maxWidth ?? rule.maxWidth}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, maxWidth: Number(e.target.value) })
                            }
                            className="w-16 px-1.5 py-1 bg-white border border-slate-300 rounded text-xs"
                          />
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editFormData.minHeight ?? rule.minHeight}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, minHeight: Number(e.target.value) })
                            }
                            className="w-16 px-1.5 py-1 bg-white border border-slate-300 rounded text-xs"
                          />
                          <span>-</span>
                          <input
                            type="number"
                            value={editFormData.maxHeight ?? rule.maxHeight}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, maxHeight: Number(e.target.value) })
                            }
                            className="w-16 px-1.5 py-1 bg-white border border-slate-300 rounded text-xs"
                          />
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <input
                          type="number"
                          value={editFormData.priceWithoutExtra ?? rule.priceWithoutExtra}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              priceWithoutExtra: Number(e.target.value),
                            })
                          }
                          className="w-24 px-1.5 py-1 bg-white border border-slate-300 rounded text-xs font-mono text-right"
                        />
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <input
                          type="number"
                          value={editFormData.priceWithExtra ?? rule.priceWithExtra}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              priceWithExtra: Number(e.target.value),
                            })
                          }
                          className="w-24 px-1.5 py-1 bg-white border border-slate-300 rounded text-xs font-mono text-right text-emerald-700"
                        />
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            className="p-1 text-emerald-600 hover:text-emerald-800 cursor-pointer"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                            title="Cancel"
                          >
                            ×
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold capitalize text-slate-700">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          rule.category === 'sliding'
                            ? 'bg-blue-100 text-blue-800'
                            : rule.category === 'casement'
                            ? 'bg-indigo-100 text-indigo-800'
                            : rule.category === 'transom'
                            ? 'bg-purple-100 text-purple-800'
                            : rule.category === 'door'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {rule.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{rule.label}</div>
                      {rule.notes && <div className="text-[10px] text-slate-400">{rule.notes}</div>}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {rule.minWidth} – {rule.maxWidth} mm
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {rule.minHeight} – {rule.maxHeight} mm
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {currencySymbol} {rule.priceWithoutExtra.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                      {currencySymbol} {rule.priceWithExtra.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(rule)}
                          className="p-1 text-slate-500 hover:text-blue-600 cursor-pointer rounded hover:bg-slate-100"
                          title="Edit this rule"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-1 text-slate-400 hover:text-red-600 cursor-pointer rounded hover:bg-slate-100"
                          title="Delete rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>
            Total configured rules: <strong>{filteredRules.length}</strong>
          </span>
          <span className="text-[11px] text-slate-400">
            Dimension ranges and pricing take effect immediately across all Client Quotations
          </span>
        </div>
      </div>
    </div>
  );
};
