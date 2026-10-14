import React, { useState } from 'react';
import { ApplianceItem, CurrencyConfig } from '../types/energy';
import {
  calculateApplianceDailyKWh,
  calculateApplianceMonthlyKWh,
  calculateMonthlyCost,
  formatCurrency,
} from '../utils/energyMath';
import { DEFAULT_APPLIANCES_LIBRARY } from '../data/energyData';
import {
  Plus,
  Trash2,
  Tv,
  Wind,
  Refrigerator,
  Zap,
  Lightbulb,
  Droplets,
  HelpCircle,
  AlertTriangle,
  Sparkles,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { ThemeMode } from './Header';

interface ApplianceCalculatorProps {
  appliances: ApplianceItem[];
  onUpdateAppliances: (items: ApplianceItem[]) => void;
  tariffRateNGN: number;
  currency: CurrencyConfig;
  theme: ThemeMode;
  onNavigateToSolar: () => void;
}

export const ApplianceCalculator: React.FC<ApplianceCalculatorProps> = ({
  appliances,
  onUpdateAppliances,
  tariffRateNGN,
  currency,
  theme,
  onNavigateToSolar,
}) => {
  const isDark = theme === 'dark';
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New appliance custom state
  const [newAppliance, setNewAppliance] = useState<Omit<ApplianceItem, 'id'>>({
    name: '',
    category: 'Lighting & Fans',
    watts: 75,
    hoursPerDay: 8,
    quantity: 1,
    dutyCycle: 1.0,
    isBackupEssential: true,
    surgeMultiplier: 1.0,
  });

  const categories = [
    'All',
    'Cooling',
    'Refrigeration',
    'Lighting & Fans',
    'Entertainment & Work',
    'Kitchen & Cooking',
    'Pumping & Water',
    'Other',
  ];

  const filteredAppliances =
    selectedCategoryFilter === 'All'
      ? appliances
      : appliances.filter((a) => a.category === selectedCategoryFilter);

  const handleUpdateItem = (id: string, updates: Partial<ApplianceItem>) => {
    onUpdateAppliances(
      appliances.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    onUpdateAppliances(appliances.filter((item) => item.id !== id));
  };

  const handleAddPreset = (preset: Omit<ApplianceItem, 'id'>) => {
    const newItem: ApplianceItem = {
      ...preset,
      id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    onUpdateAppliances([...appliances, newItem]);
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppliance.name.trim()) return;
    const newItem: ApplianceItem = {
      ...newAppliance,
      id: `app-${Date.now()}`,
    };
    onUpdateAppliances([...appliances, newItem]);
    setNewAppliance({
      name: '',
      category: 'Lighting & Fans',
      watts: 75,
      hoursPerDay: 8,
      quantity: 1,
      dutyCycle: 1.0,
      isBackupEssential: true,
      surgeMultiplier: 1.0,
    });
    setShowAddModal(false);
  };

  // Find top energy consuming appliance
  const sortedByMonthlyKWh = [...appliances].sort(
    (a, b) => calculateApplianceMonthlyKWh(b) - calculateApplianceMonthlyKWh(a)
  );
  const topGuzzler = sortedByMonthlyKWh[0];
  const topGuzzlerKWh = topGuzzler ? calculateApplianceMonthlyKWh(topGuzzler) : 0;
  const totalMonthlyKWh = appliances.reduce(
    (sum, a) => sum + calculateApplianceMonthlyKWh(a),
    0
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Title & Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* Zero-pill metadata text */}
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase opacity-70">
            <span>Appliance Load Audit</span>
            <span aria-hidden="true">·</span>
            <span>Accurate Watts & Duty Cycles</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
            Appliance Consumption Calculator
          </h1>
          <p className="text-sm opacity-80 mt-1 max-w-3xl">
            Audit your household or business devices. Toggle which appliances stay active during grid blackouts to compute exact battery storage requirements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md shadow-xs transition-colors whitespace-nowrap shrink-0 ${
              isDark
                ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Appliance</span>
          </button>
        </div>
      </div>

      {/* Top Guzzler & Optimization Insight Bar */}
      {topGuzzler && totalMonthlyKWh > 0 && (
        <div
          className={`p-4 sm:p-5 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
            isDark
              ? 'bg-neutral-900 border-neutral-800 text-neutral-200'
              : 'bg-emerald-50/70 border-emerald-200 text-neutral-900'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Primary Power Consumer Detected
              </div>
              <div className="text-sm font-bold mt-0.5">
                {topGuzzler.name} consumes {Math.round(topGuzzlerKWh)} kWh/mo (
                {Math.round((topGuzzlerKWh / totalMonthlyKWh) * 100)}% of your monthly bill)
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                Costing roughly {formatCurrency(topGuzzlerKWh * tariffRateNGN * 1.075, currency)} every 30 days. Reducing running time by just 2 hours/day saves ~
                {formatCurrency((topGuzzlerKWh * 2 / topGuzzler.hoursPerDay) * tariffRateNGN * 1.075, currency)}/mo.
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToSolar}
            className="text-xs font-semibold px-3 py-1.5 rounded-md border border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 transition-colors whitespace-nowrap shrink-0"
          >
            Check Solar Compatibility
          </button>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedCategoryFilter === cat
                ? isDark
                  ? 'bg-emerald-500 text-neutral-950 font-semibold'
                  : 'bg-neutral-900 text-white font-semibold'
                : isDark
                ? 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Appliances Table / Grid */}
      <div
        className={`rounded-xl border overflow-hidden ${
          isDark
            ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
            : 'bg-white border-neutral-200 shadow-xs text-neutral-900'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-inherit bg-neutral-50/50 dark:bg-neutral-950/40 font-semibold text-neutral-500 dark:text-neutral-400">
                <th className="py-3 px-4">Appliance</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Power (Watts)</th>
                <th className="py-3 px-3">Qty</th>
                <th className="py-3 px-4">Hours / Day</th>
                <th className="py-3 px-3">Duty Cycle</th>
                <th className="py-3 px-3 text-center">Solar Backup?</th>
                <th className="py-3 px-4 text-right">Monthly (kWh)</th>
                <th className="py-3 px-4 text-right">Monthly Cost</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {filteredAppliances.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-neutral-400">
                    No appliances found in this category. Add from the quick library below or create a custom one.
                  </td>
                </tr>
              ) : (
                filteredAppliances.map((item) => {
                  const monthlyKWh = calculateApplianceMonthlyKWh(item);
                  const { totalCost } = calculateMonthlyCost(monthlyKWh, tariffRateNGN, true);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-neutral-500/5 transition-colors group"
                    >
                      {/* Name */}
                      <td className="py-3.5 px-4 font-medium">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                          className="bg-transparent border-b border-transparent hover:border-neutral-300 dark:hover:border-neutral-600 focus:border-emerald-500 focus:outline-none w-full max-w-xs font-medium"
                        />
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 text-neutral-500 dark:text-neutral-400">
                        {item.category}
                      </td>

                      {/* Watts */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1 font-mono tabular-nums">
                          <input
                            type="number"
                            min="1"
                            max="20000"
                            value={item.watts}
                            onChange={(e) =>
                              handleUpdateItem(item.id, { watts: Math.max(1, Number(e.target.value)) })
                            }
                            className="w-16 py-1 px-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent text-right focus:outline-none focus:border-emerald-500"
                          />
                          <span className="text-neutral-400">W</span>
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateItem(item.id, { quantity: Math.max(1, item.quantity - 1) })
                            }
                            className="w-5 h-5 rounded border border-neutral-300 dark:border-neutral-700 flex items-center justify-center font-bold hover:bg-neutral-200 dark:hover:bg-neutral-800"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-mono tabular-nums font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateItem(item.id, { quantity: item.quantity + 1 })}
                            className="w-5 h-5 rounded border border-neutral-300 dark:border-neutral-700 flex items-center justify-center font-bold hover:bg-neutral-200 dark:hover:bg-neutral-800"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Hours / Day */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 w-36">
                          <div className="flex justify-between text-[11px] font-mono tabular-nums">
                            <span>{item.hoursPerDay} hrs</span>
                            <span className="text-neutral-400">/24h</span>
                          </div>
                          <input
                            type="range"
                            min="0.5"
                            max="24"
                            step="0.5"
                            value={item.hoursPerDay}
                            onChange={(e) =>
                              handleUpdateItem(item.id, { hoursPerDay: Number(e.target.value) })
                            }
                            className="w-full accent-emerald-500 h-1.5 cursor-pointer"
                          />
                        </div>
                      </td>

                      {/* Duty Cycle */}
                      <td className="py-3.5 px-3 font-mono tabular-nums text-neutral-600 dark:text-neutral-300">
                        {Math.round(item.dutyCycle * 100)}%
                        {item.dutyCycle < 1.0 && (
                          <span className="text-[10px] block text-neutral-400">Thermostat</span>
                        )}
                      </td>

                      {/* Essential Backup toggle */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateItem(item.id, {
                              isBackupEssential: !item.isBackupEssential,
                            })
                          }
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                            item.isBackupEssential
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border border-neutral-200 dark:border-neutral-700'
                          }`}
                          title="Click to toggle whether this device should be sustained by battery inverter during blackouts"
                        >
                          {item.isBackupEssential ? 'Active' : 'Grid-Only'}
                        </button>
                      </td>

                      {/* Monthly kWh */}
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold">
                        {monthlyKWh.toFixed(1)}{' '}
                        <span className="text-[10px] font-sans font-normal text-neutral-400">kWh</span>
                      </td>

                      {/* Monthly Cost */}
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(totalCost, currency)}
                      </td>

                      {/* Delete */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 rounded text-neutral-400 hover:text-red-500 transition-colors"
                          title="Remove appliance"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredAppliances.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-inherit font-bold bg-neutral-50/70 dark:bg-neutral-950/70">
                  <td colSpan={7} className="py-3.5 px-4 text-right">
                    Total Filtered Load:
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                    {filteredAppliances
                      .reduce((sum, a) => sum + calculateApplianceMonthlyKWh(a), 0)
                      .toFixed(1)}{' '}
                    kWh
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(
                      filteredAppliances.reduce(
                        (sum, a) =>
                          sum +
                          calculateMonthlyCost(
                            calculateApplianceMonthlyKWh(a),
                            tariffRateNGN,
                            true
                          ).totalCost,
                        0
                      ),
                      currency
                    )}
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Quick Add Presets Library */}
      <div
        className={`p-6 rounded-xl border ${
          isDark
            ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
            : 'bg-white border-neutral-200 shadow-xs text-neutral-900'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-inherit">
          <div>
            <h3 className="text-base font-bold">Quick-Add Common African Appliances</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Click any device below to instantly add it to your household load audit.
            </p>
          </div>
          <span className="text-xs text-neutral-400">{DEFAULT_APPLIANCES_LIBRARY.length} presets</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
          {DEFAULT_APPLIANCES_LIBRARY.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAddPreset(preset)}
              className={`p-3 rounded-lg border text-left transition-all hover:border-emerald-500 flex flex-col justify-between cursor-pointer ${
                isDark
                  ? 'bg-neutral-950 border-neutral-800 hover:bg-neutral-800/50'
                  : 'bg-neutral-50 border-neutral-200 hover:bg-emerald-50/50'
              }`}
            >
              <div>
                <div className="text-xs font-semibold leading-snug">{preset.name}</div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                  {preset.category} · {preset.watts}W
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px]">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  +{preset.hoursPerDay}h/day
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <Plus className="w-3 h-3" /> Add
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Add Custom Appliance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md p-6 rounded-xl border shadow-xl ${
              isDark
                ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
                : 'bg-white border-neutral-200 text-neutral-900'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-inherit">
              <h3 className="text-lg font-bold">Add Custom Appliance</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-neutral-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustom} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Appliance Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Deep Freezer 300L, Blender, Starlink Mini"
                  value={newAppliance.name}
                  onChange={(e) =>
                    setNewAppliance({ ...newAppliance, name: e.target.value })
                  }
                  className="w-full p-2.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Category</label>
                  <select
                    value={newAppliance.category}
                    onChange={(e) =>
                      setNewAppliance({
                        ...newAppliance,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full p-2.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {categories
                      .filter((c) => c !== 'All')
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Rated Power (Watts)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newAppliance.watts}
                    onChange={(e) =>
                      setNewAppliance({
                        ...newAppliance,
                        watts: Math.max(1, Number(e.target.value)),
                      })
                    }
                    className="w-full p-2.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Daily Run Hours</label>
                  <input
                    type="number"
                    min="0.1"
                    max="24"
                    step="0.5"
                    required
                    value={newAppliance.hoursPerDay}
                    onChange={(e) =>
                      setNewAppliance({
                        ...newAppliance,
                        hoursPerDay: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={newAppliance.quantity}
                    onChange={(e) =>
                      setNewAppliance({
                        ...newAppliance,
                        quantity: Math.max(1, Number(e.target.value)),
                      })
                    }
                    className="w-full p-2.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer mt-2">
                  <input
                    type="checkbox"
                    checked={newAppliance.isBackupEssential}
                    onChange={(e) =>
                      setNewAppliance({
                        ...newAppliance,
                        isBackupEssential: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">
                    Include in Inverter / Battery Sizing
                  </span>
                </label>
                <p className="text-[11px] text-neutral-400 pl-6 mt-0.5">
                  Check this if you require this device to stay powered on during grid outages.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-inherit">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded border border-neutral-300 dark:border-neutral-700 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Save Appliance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
