import React, { useState } from 'react';
import { CurrencyConfig, GeneratorModelPreset } from '../types/energy';
import { GENERATOR_PRESETS } from '../data/energyData';
import { formatCurrency } from '../utils/energyMath';
import {
  Flame,
  Sun,
  TrendingDown,
  Clock,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Info,
  DollarSign,
  Leaf,
} from 'lucide-react';
import { ThemeMode } from './Header';

interface GeneratorComparisonProps {
  currency: CurrencyConfig;
  theme: ThemeMode;
  onNavigateToSolar: () => void;
  onRequestQuote: () => void;
}

export const GeneratorComparison: React.FC<GeneratorComparisonProps> = ({
  currency,
  theme,
  onNavigateToSolar,
  onRequestQuote,
}) => {
  const isDark = theme === 'dark';

  const [selectedGenerator, setSelectedGenerator] = useState<GeneratorModelPreset>(
    GENERATOR_PRESETS[2] // 3.5 kVA standard
  );
  const [runningHoursPerDay, setRunningHoursPerDay] = useState<number>(6);
  const [fuelPricePerLiterNGN, setFuelPricePerLiterNGN] = useState<number>(1050); // PMS current ~₦1,050/L
  const [solarSystemCostNGN, setSolarSystemCostNGN] = useState<number>(2950000); // 3.5kVA turnkey solar system ~₦2.95m

  // Calculations
  const dailyFuelLiters = selectedGenerator.litersPerHour * runningHoursPerDay;
  const dailyFuelCostNGN = dailyFuelLiters * fuelPricePerLiterNGN;
  const monthlyFuelCostNGN = dailyFuelCostNGN * 30;
  const monthlyMaintenanceCostNGN = selectedGenerator.typicalMaintenanceCostPerMonthNGN;
  const totalMonthlyGenCostNGN = monthlyFuelCostNGN + monthlyMaintenanceCostNGN;
  const annualGenCostNGN = totalMonthlyGenCostNGN * 12;
  const threeYearGenCostNGN = annualGenCostNGN * 3;

  // Payback period
  const paybackMonths = totalMonthlyGenCostNGN > 0 ? solarSystemCostNGN / totalMonthlyGenCostNGN : 0;

  // CO2 Emissions (approx 2.31 kg CO2 per liter of gasoline, 2.68 per liter of diesel)
  const co2Factor = selectedGenerator.fuelType === 'diesel' ? 2.68 : 2.31;
  const annualCO2Kg = Math.round(dailyFuelLiters * 365 * co2Factor);

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase opacity-70">
          <span>Economic Payback Model</span>
          <span aria-hidden="true">·</span>
          <span>PMS & AGO Fuel Displacement</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
          Generator vs Solar Cost Comparison
        </h1>
        <p className="text-sm opacity-80 mt-1 max-w-3xl">
          Compare the recurring expense of fueling and maintaining a petrol/diesel generator against a one-time solar investment. See your exact breakeven month.
        </p>
      </div>

      {/* Preset Generator Selectors */}
      <div
        className={`p-6 sm:p-8 rounded-xl border ${
          isDark
            ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
            : 'bg-white border-neutral-200 shadow-xs text-neutral-900'
        }`}
      >
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-4">
          1. Select Generator Capacity & Type
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {GENERATOR_PRESETS.map((gen) => {
            const isSelected = selectedGenerator.id === gen.id;
            return (
              <button
                key={gen.id}
                type="button"
                onClick={() => {
                  setSelectedGenerator(gen);
                  if (gen.fuelType === 'diesel') {
                    setFuelPricePerLiterNGN(1250);
                    setSolarSystemCostNGN(6500000);
                  } else if (gen.ratingKVA <= 1.0) {
                    setFuelPricePerLiterNGN(1050);
                    setSolarSystemCostNGN(1250000);
                  } else if (gen.ratingKVA <= 3.5) {
                    setFuelPricePerLiterNGN(1050);
                    setSolarSystemCostNGN(2950000);
                  } else {
                    setFuelPricePerLiterNGN(1050);
                    setSolarSystemCostNGN(4800000);
                  }
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? isDark
                      ? 'bg-emerald-950/50 border-emerald-500 ring-1 ring-emerald-500'
                      : 'bg-emerald-50 border-emerald-600 ring-1 ring-emerald-600'
                    : isDark
                    ? 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                    : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div>
                  <div className="font-bold text-xs leading-snug">{gen.name}</div>
                  <div className="text-[11px] text-neutral-500 mt-1 capitalize">
                    {gen.fuelType} · {gen.litersPerHour} L/hr
                  </div>
                </div>
                <div className="mt-3 text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {gen.ratingKVA} kVA
                </div>
              </button>
            );
          })}
        </div>

        {/* Sliders for runtime & fuel price */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-inherit">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Daily Generator Runtime</span>
              </span>
              <span className="font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                {runningHoursPerDay} hrs/day
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="24"
              value={runningHoursPerDay}
              onChange={(e) => setRunningHoursPerDay(Number(e.target.value))}
              className="w-full accent-emerald-500 h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
              <span>2h (Evening)</span>
              <span>6h (Night)</span>
              <span>18h (Heavy)</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span>Fuel Price per Liter ({currency.symbol})</span>
              <span className="font-mono tabular-nums font-bold">
                {formatCurrency(fuelPricePerLiterNGN, currency)}/L
              </span>
            </div>
            <input
              type="number"
              min="500"
              max="3000"
              step="10"
              value={fuelPricePerLiterNGN}
              onChange={(e) => setFuelPricePerLiterNGN(Number(e.target.value))}
              className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs font-mono tabular-nums focus:outline-none focus:border-emerald-500"
            />
            <div className="text-[10px] text-neutral-400">
              Current Nigerian pump rate benchmark (~₦1,050/L petrol, ₦1,250/L diesel)
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span>Solar System Benchmark Cost</span>
              <span className="font-mono tabular-nums font-bold">
                {formatCurrency(solarSystemCostNGN, currency)}
              </span>
            </div>
            <input
              type="number"
              min="500000"
              max="25000000"
              step="50000"
              value={solarSystemCostNGN}
              onChange={(e) => setSolarSystemCostNGN(Number(e.target.value))}
              className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs font-mono tabular-nums focus:outline-none focus:border-emerald-500"
            />
            <div className="text-[10px] text-neutral-400">
              Equivalent hybrid inverter + LiFePO4 battery installation
            </div>
          </div>
        </div>
      </div>

      {/* The Big Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Monthly Fuel Spent */}
        <div
          className={`p-6 rounded-xl border ${
            isDark
              ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
              : 'bg-white border-neutral-200 shadow-xs text-neutral-900'
          }`}
        >
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold uppercase tracking-wider">
            <span>Monthly Generator Drain</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-3xl font-extrabold font-mono tabular-nums text-red-500">
            {formatCurrency(totalMonthlyGenCostNGN, currency)}
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            {dailyFuelLiters.toFixed(1)}L/day ({formatCurrency(dailyFuelCostNGN, currency)}/day) + maintenance
          </p>
        </div>

        {/* 1-Year Cumulative Burn */}
        <div
          className={`p-6 rounded-xl border ${
            isDark
              ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
              : 'bg-white border-neutral-200 shadow-xs text-neutral-900'
          }`}
        >
          <div className="text-neutral-500 text-xs font-semibold uppercase tracking-wider">
            1-Year Generator Expense
          </div>
          <div className="mt-2 text-3xl font-extrabold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
            {formatCurrency(annualGenCostNGN, currency)}
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Pure operational loss burned in generator fumes
          </p>
        </div>

        {/* Breakeven Timeline */}
        <div
          className={`p-6 rounded-xl border ${
            isDark
              ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
              : 'bg-white border-neutral-200 shadow-xs text-neutral-900'
          }`}
        >
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold uppercase tracking-wider">
            <span>Solar Breakeven</span>
            <TrendingDown className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-3xl font-extrabold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {paybackMonths < 1 ? '< 1' : paybackMonths.toFixed(1)}{' '}
            <span className="text-lg font-sans font-normal text-neutral-400">Months</span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            After this point, your electricity is virtually free
          </p>
        </div>

        {/* 3-Year Net Profit / Savings */}
        <div
          className={`p-6 rounded-xl border ${
            isDark
              ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
              : 'bg-white border-neutral-200 shadow-xs text-neutral-900'
          }`}
        >
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold uppercase tracking-wider">
            <span>3-Year Net Savings</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-3xl font-extrabold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatCurrency(Math.max(0, threeYearGenCostNGN - solarSystemCostNGN), currency)}
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Cash retained in your bank account over 36 months
          </p>
        </div>
      </div>

      {/* 3-Year Cumulative Cashflow Comparison Bar */}
      <div
        className={`p-6 sm:p-8 rounded-xl border ${
          isDark
            ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
            : 'bg-white border-neutral-200 shadow-xs text-neutral-900'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-inherit">
          <div>
            <h3 className="text-base font-bold">3-Year Cumulative Cash Outflow</h3>
            <p className="text-xs text-neutral-500">
              Visualizing the difference between burning petrol vs owning an asset
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
            <Leaf className="w-4 h-4" />
            <span>Eliminates {annualCO2Kg.toLocaleString()} kg CO2 emissions annually</span>
          </div>
        </div>

        <div className="space-y-6 mt-6">
          {/* Generator cumulative bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-red-500">
                <Flame className="w-4 h-4" />
                <span>Generator (Fuel + Oil changes + Servicing):</span>
              </span>
              <span className="font-mono tabular-nums text-red-500 text-sm">
                {formatCurrency(threeYearGenCostNGN, currency)}
              </span>
            </div>
            <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-6 rounded-lg overflow-hidden flex">
              <div
                className="bg-red-500 h-full flex items-center justify-end pr-2 text-white text-[11px] font-bold font-mono"
                style={{ width: '100%' }}
              >
                100% Sunk Cost
              </div>
            </div>
          </div>

          {/* Solar cumulative bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Sun className="w-4 h-4" />
                <span>Solar-Inverter System (One-time capital cost):</span>
              </span>
              <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400 text-sm">
                {formatCurrency(solarSystemCostNGN, currency)}
              </span>
            </div>
            <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-6 rounded-lg overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full flex items-center justify-end pr-2 text-white text-[11px] font-bold font-mono"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((solarSystemCostNGN / (threeYearGenCostNGN || 1)) * 100)
                  )}%`,
                }}
              >
                {Math.round((solarSystemCostNGN / (threeYearGenCostNGN || 1)) * 100)}%
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-inherit flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs text-neutral-500 max-w-xl">
            You will spend more than the price of a complete solar installation on petrol within{' '}
            <strong className="text-neutral-800 dark:text-neutral-200">
              {paybackMonths.toFixed(0)} months
            </strong>. After that, your power is clean, silent, and virtually free for the 10+ year lifespan of your lithium battery.
          </p>

          <button
            onClick={onRequestQuote}
            className="px-4 py-2.5 rounded-md font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <span>Request Solar Quote & Stop Fueling</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
