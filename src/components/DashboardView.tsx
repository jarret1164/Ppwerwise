import React from 'react';
import { ApplianceItem, CurrencyConfig, EnergyAuditScenario } from '../types/energy';
import {
  calculateApplianceMonthlyKWh,
  calculateMonthlyCost,
  calculateTotalDailyKWh,
  calculateTotalMonthlyKWh,
  formatCurrency,
} from '../utils/energyMath';
import { PRESET_SCENARIOS, DISCO_BANDS } from '../data/energyData';
import {
  Zap,
  TrendingDown,
  Sun,
  Flame,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Info,
  Layers,
  Check,
} from 'lucide-react';
import { ThemeMode } from './Header';

interface DashboardViewProps {
  appliances: ApplianceItem[];
  tariffRateNGN: number;
  onSetTariffRate: (rate: number) => void;
  currency: CurrencyConfig;
  theme: ThemeMode;
  onNavigate: (tab: 'appliances' | 'tariff' | 'solar' | 'generator' | 'directory') => void;
  onSelectScenario: (scenario: EnergyAuditScenario) => void;
  activeScenarioId: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  appliances,
  tariffRateNGN,
  onSetTariffRate,
  currency,
  theme,
  onNavigate,
  onSelectScenario,
  activeScenarioId,
}) => {
  const isDark = theme === 'dark';
  const isSolar = theme === 'solar';

  const totalMonthlyKWh = calculateTotalMonthlyKWh(appliances);
  const totalDailyKWh = calculateTotalDailyKWh(appliances);
  const { totalCost: monthlyCostNGN, vat } = calculateMonthlyCost(totalMonthlyKWh, tariffRateNGN, true);
  const dailyCostNGN = monthlyCostNGN / 30;

  // Group appliances by common category buckets
  const categoryBreakdown = appliances.reduce<Record<string, number>>((acc, item) => {
    const kwh = calculateApplianceMonthlyKWh(item);
    let key: string = item.category;
    if (item.category === 'Cooling') key = 'Air conditioner';
    else if (item.category === 'Refrigeration') key = 'Refrigerator';
    else if (item.category === 'Lighting & Fans') key = 'Lighting and fans';
    else key = 'Other appliances';

    acc[key] = (acc[key] || 0) + kwh;
    return acc;
  }, {});

  // Standard category display list matching the prompt brief:
  // Air conditioner, Refrigerator, Lighting and fans, Other appliances
  const standardCategories = [
    { name: 'Air conditioner', key: 'Air conditioner', color: 'bg-sky-500' },
    { name: 'Refrigerator', key: 'Refrigerator', color: 'bg-emerald-500' },
    { name: 'Lighting and fans', key: 'Lighting and fans', color: 'bg-amber-500' },
    { name: 'Other appliances', key: 'Other appliances', color: 'bg-violet-500' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Strip with Scenario Presets */}
      <div
        className={`p-6 sm:p-8 rounded-xl border transition-all ${
          isDark
            ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
            : isSolar
            ? 'bg-gradient-to-br from-emerald-950 via-emerald-900 to-neutral-950 border-emerald-800 text-white'
            : 'bg-white border-neutral-200 shadow-xs'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-inherit">
          <div className="space-y-1">
            {/* Zero-pill metadata text */}
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase opacity-75">
              <span>PowerWise Africa</span>
              <span aria-hidden="true">·</span>
              <span>Energy Overview</span>
              <span aria-hidden="true">·</span>
              <span>Interactive Model</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Understand your power. Reduce your costs.
            </h1>
            <p className="text-sm opacity-80 max-w-2xl">
              Estimate your monthly consumption, spot the biggest power-draining appliances, and size a reliable solar backup solution tailored for African grid realities.
            </p>
          </div>

          {/* Quick preset selector buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
            <span className="text-xs opacity-70">Load preset:</span>
            <div
              className={`flex items-center gap-1 p-1 rounded-lg border text-xs ${
                isDark
                  ? 'bg-neutral-950 border-neutral-800'
                  : isSolar
                  ? 'bg-emerald-900/60 border-emerald-700'
                  : 'bg-neutral-100 border-neutral-200'
              }`}
            >
              {PRESET_SCENARIOS.map((scenario) => {
                const isSelected = activeScenarioId === scenario.id;
                return (
                  <button
                    key={scenario.id}
                    onClick={() => onSelectScenario(scenario)}
                    className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                      isSelected
                        ? isDark
                          ? 'bg-neutral-800 text-emerald-400 shadow-xs'
                          : isSolar
                          ? 'bg-amber-400 text-emerald-950 shadow-xs font-semibold'
                          : 'bg-white text-neutral-900 shadow-xs font-semibold'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {scenario.id === 'demo-benchmark' ? 'Demo Benchmark' : scenario.title.split(':')[0]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2 Big Primary KPIs matching Section 3: "Monthly cost ₦45,000" and "Energy used 300 kWh" */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
          <div className="space-y-1">
            <div className="text-xs font-medium opacity-70 flex items-center justify-between">
              <span>Monthly cost</span>
              <span className="text-[11px] opacity-60">Illustrative estimate</span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatCurrency(monthlyCostNGN, currency)}
            </div>
            <div className="text-xs opacity-60">
              ~{formatCurrency(dailyCostNGN, currency)}/day (incl. 7.5% VAT)
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-medium opacity-70 flex items-center justify-between">
              <span>Energy used</span>
              <span className="text-[11px] opacity-60">Illustrative estimate</span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono tabular-nums text-sky-600 dark:text-sky-400">
              {Math.round(totalMonthlyKWh)} <span className="text-xl font-medium font-sans">kWh</span>
            </div>
            <div className="text-xs opacity-60">
              Avg. <span className="font-mono tabular-nums">{totalDailyKWh.toFixed(1)}</span> kWh daily load
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-medium opacity-70">
              <span>Current Tariff Rate</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight font-mono tabular-nums">
              {formatCurrency(tariffRateNGN, currency)}
              <span className="text-xs font-sans font-normal opacity-70">/kWh</span>
            </div>
            <div className="text-xs opacity-60 flex items-center gap-1.5">
              <span>DisCo grid rate</span>
              <button
                onClick={() => onNavigate('tariff')}
                className="underline hover:opacity-100 text-emerald-500 cursor-pointer"
              >
                Change band
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-medium opacity-70">
              <span>Audited Appliances</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight font-mono tabular-nums">
              {appliances.reduce((s, a) => s + a.quantity, 0)} <span className="text-xs font-sans font-normal opacity-70">units</span>
            </div>
            <div className="text-xs opacity-60 flex items-center gap-1.5">
              <span>{appliances.length} distinct devices</span>
              <button
                onClick={() => onNavigate('appliances')}
                className="underline hover:opacity-100 text-emerald-500 cursor-pointer"
              >
                Manage list
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Breakdown Section (Exactly as styled in the brief mockup) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Estimated monthly consumption card */}
        <div
          className={`lg:col-span-7 p-6 sm:p-8 rounded-xl border transition-all ${
            isDark
              ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
              : 'bg-white border-neutral-200 shadow-xs text-neutral-900'
          }`}
        >
          <div className="flex items-center justify-between pb-6 border-b border-inherit">
            <div>
              <h2 className="text-lg font-bold tracking-tight">Estimated monthly consumption</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Breakdown of where your electrical units are consumed every 30 days
              </p>
            </div>
            <button
              onClick={() => onNavigate('appliances')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Add / Edit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Category Rows matching the brief mockup */}
          <div className="divide-y divide-inherit mt-4">
            {standardCategories.map((cat) => {
              const kwh = Math.round(categoryBreakdown[cat.key] || 0);
              const percentage = totalMonthlyKWh > 0 ? Math.round((kwh / totalMonthlyKWh) * 100) : 0;
              const cost = (kwh * tariffRateNGN * 1.075);

              return (
                <div key={cat.key} className="py-4 first:pt-2 last:pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{cat.name}</span>
                      <span className="text-base font-bold font-mono tabular-nums">
                        {kwh} <span className="text-xs font-sans font-normal text-neutral-500">kWh</span>
                      </span>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${cat.color} transition-all duration-500`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                      <span>{percentage}% of monthly bill</span>
                      <span className="font-mono tabular-nums">{formatCurrency(cost, currency)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footnote matching Section 3 in user request */}
          <div className="mt-6 pt-4 border-t border-inherit flex items-start gap-2 text-xs text-neutral-400 dark:text-neutral-500">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              Illustrative figures only, not actual customer readings or current electricity prices. Actual consumption varies based on ambient room temperature, duty cycle, appliance energy star rating, and voltage fluctuation.
            </p>
          </div>
        </div>

        {/* Right Column (5 cols): Solar Visual Spotlight & Quick Sizing Teaser */}
        <div className="lg:col-span-5 space-y-6">
          <div
            className={`rounded-xl border overflow-hidden ${
              isDark
                ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
                : 'bg-white border-neutral-200 shadow-xs text-neutral-900'
            }`}
          >
            <div className="relative h-44 overflow-hidden bg-neutral-900">
              <img
                src="/src/assets/images/solar_installation_rooftop_1791980866882.jpg"
                alt="Solar rooftop installation in Africa"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <div className="text-[11px] font-semibold tracking-wider uppercase text-emerald-300">
                  Solar Alternative
                </div>
                <div className="text-base font-bold">Cut Grid & Generator Dependence</div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                With escalating grid tariffs (Band A up to ₦209.50/kWh) and fuel prices exceeding ₦1,050/L, an appropriately sized solar-inverter system offers complete immunity from blackout disruptions.
              </p>

              <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Essential Backup Load:</span>
                  <span className="font-mono font-semibold">
                    {(totalDailyKWh * 0.6).toFixed(1)} kWh/day
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Estimated Payback Period:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    10 - 14 Months vs Generator
                  </span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('solar')}
                className="w-full py-2.5 px-4 rounded-md font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Sun className="w-4 h-4" />
                <span>Size My Solar & Battery System</span>
              </button>
            </div>
          </div>

          {/* Quick Generator Fuel Comparison Card */}
          <div
            className={`p-6 rounded-xl border ${
              isDark
                ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
                : 'bg-white border-neutral-200 shadow-xs text-neutral-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-bold">The Generator Fuel Trap</span>
              </div>
              <button
                onClick={() => onNavigate('generator')}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                Calculator
              </button>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-3 leading-relaxed">
              Running a standard 3.5kVA petrol generator for 6 hours/day burns ~9.6 liters of PMS daily (₦10,080/day or over ₦300,000 every month). A 3.5kVA solar setup pays for itself in under a year.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Domain Nav Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => onNavigate('appliances')}
          className={`p-6 rounded-xl border cursor-pointer hover:border-emerald-500 transition-all ${
            isDark
              ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
              : 'bg-white border-neutral-200 shadow-xs text-neutral-900'
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold">1. Appliance Consumption Audit</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
            Audit fridges, air conditioners, fans, pumping machines, and TVs. Discover peak watts and duty cycles.
          </p>
          <div className="mt-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span>Audit appliances</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('solar')}
          className={`p-6 rounded-xl border cursor-pointer hover:border-emerald-500 transition-all ${
            isDark
              ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
              : 'bg-white border-neutral-200 shadow-xs text-neutral-900'
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
            <Sun className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold">2. Solar & Battery Sizing</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
            Compute exact inverter kVA, lithium LiFePO4 vs tubular gel battery storage, and 550W panel requirements.
          </p>
          <div className="mt-4 text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <span>Calculate sizing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('directory')}
          className={`p-6 rounded-xl border cursor-pointer hover:border-emerald-500 transition-all ${
            isDark
              ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
              : 'bg-white border-neutral-200 shadow-xs text-neutral-900'
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold">3. Verified Energy Directory</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
            Connect with COREN-certified solar installers, battery suppliers, and technicians with verifiable warranties.
          </p>
          <div className="mt-4 text-xs font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1">
            <span>Browse directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
