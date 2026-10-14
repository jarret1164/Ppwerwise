import React, { useState } from 'react';
import { CurrencyConfig, DisCoTariffBand } from '../types/energy';
import { DISCO_BANDS } from '../data/energyData';
import { calculateMonthlyCost, formatCurrency } from '../utils/energyMath';
import {
  Zap,
  Calculator,
  ArrowRight,
  Info,
  CheckCircle,
  Clock,
  Coins,
  ShieldAlert,
} from 'lucide-react';
import { ThemeMode } from './Header';

interface TariffCalculatorProps {
  currentTariffRateNGN: number;
  onSelectTariffRate: (rate: number, bandName?: string) => void;
  currency: CurrencyConfig;
  theme: ThemeMode;
  totalMonthlyKWh: number;
  onNavigateToSolar: () => void;
}

export const TariffCalculator: React.FC<TariffCalculatorProps> = ({
  currentTariffRateNGN,
  onSelectTariffRate,
  currency,
  theme,
  totalMonthlyKWh,
  onNavigateToSolar,
}) => {
  const isDark = theme === 'dark';

  // Calculator Mode
  const [activeCalculatorTab, setActiveCalculatorTab] = useState<'token' | 'meter' | 'disco'>('token');

  // Token Purchase Simulator
  const [tokenAmountNGN, setTokenAmountNGN] = useState<number>(30000);
  const [meterFixedChargeNGN, setMeterFixedChargeNGN] = useState<number>(0);

  // Meter Reading Mode
  const [prevMeterReading, setPrevMeterReading] = useState<number>(14250);
  const [currentMeterReading, setCurrentMeterReading] = useState<number>(14550);

  // Custom tariff rate input
  const [customRateInput, setCustomRateInput] = useState<number>(currentTariffRateNGN);

  // Reverse Token Calculation
  const vatRate = 0.075;
  const netTokenForEnergy = Math.max(0, tokenAmountNGN - meterFixedChargeNGN);
  const effectiveBaseCost = netTokenForEnergy / (1 + vatRate);
  const estimatedTokenUnitsKWh = currentTariffRateNGN > 0 ? effectiveBaseCost / currentTariffRateNGN : 0;
  const actualVAT = netTokenForEnergy - effectiveBaseCost;

  // Meter Reading Calculation
  const unitsConsumedFromMeter = Math.max(0, currentMeterReading - prevMeterReading);
  const meterCalculatedCost = calculateMonthlyCost(unitsConsumedFromMeter, currentTariffRateNGN, true);

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase opacity-70">
          <span>Tariffs & Bill Verification</span>
          <span aria-hidden="true">·</span>
          <span>NERC Approved Bands</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
          Electricity Cost & Tariff Calculator
        </h1>
        <p className="text-sm opacity-80 mt-1 max-w-3xl">
          Enter your tariff band, simulate prepaid meter token purchases, or input your meter readings to verify your electricity distribution company (DisCo) billing.
        </p>
      </div>

      {/* DisCo Band Selection Matrix */}
      <div
        className={`p-6 sm:p-8 rounded-xl border ${
          isDark
            ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
            : 'bg-white border-neutral-200 shadow-xs text-neutral-900'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-inherit">
          <div>
            <h2 className="text-lg font-bold">Select Your DisCo Service Band</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Approved NERC tariff bands determined by guaranteed daily hours of power supply
            </p>
          </div>
          <div className="text-xs font-medium opacity-80">
            Active Rate:{' '}
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              {formatCurrency(currentTariffRateNGN, currency)}/kWh
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
          {DISCO_BANDS.map((band) => {
            const isSelected = Math.abs(currentTariffRateNGN - band.ratePerKWh) < 0.1;
            const monthlyCostForAudit = calculateMonthlyCost(totalMonthlyKWh, band.ratePerKWh, true).totalCost;

            return (
              <div
                key={band.band}
                onClick={() => onSelectTariffRate(band.ratePerKWh, band.band)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? isDark
                      ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500'
                      : 'bg-emerald-50/70 border-emerald-600 ring-1 ring-emerald-600'
                    : isDark
                    ? 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                    : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{band.band}</span>
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  <div className="mt-2 text-2xl font-extrabold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(band.ratePerKWh, currency)}
                    <span className="text-xs font-sans font-normal text-neutral-400">/kWh</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-neutral-500 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{band.minHours}-{band.maxHours} hrs daily grid</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2 leading-snug">
                    {band.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-inherit/60 text-[11px]">
                  <span className="text-neutral-400 block">Your {Math.round(totalMonthlyKWh)} kWh load:</span>
                  <span className="font-bold font-mono tabular-nums text-xs">
                    {formatCurrency(monthlyCostForAudit, currency)}/mo
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Rate Input */}
        <div className="mt-6 pt-6 border-t border-inherit flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium text-neutral-600 dark:text-neutral-400">Or custom rate:</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.5"
                min="1"
                max="1000"
                value={customRateInput}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCustomRateInput(val);
                  onSelectTariffRate(val, 'Custom');
                }}
                className="w-24 p-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono tabular-nums text-right font-bold focus:outline-none focus:border-emerald-500"
              />
              <span className="font-mono">{currency.symbol}/kWh</span>
            </div>
          </div>

          <div className="text-neutral-500 text-[11px] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-neutral-400" />
            <span>NERC Band A revised tariff standard in Nigeria: ₦209.50/kWh.</span>
          </div>
        </div>
      </div>

      {/* Two interactive modules: Token Purchase Simulator & Meter Readings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Module 1: Token Purchase Reverse Simulator */}
        <div
          className={`p-6 sm:p-8 rounded-xl border ${
            isDark
              ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
              : 'bg-white border-neutral-200 shadow-xs text-neutral-900'
          }`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-inherit">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold">Prepaid Token Purchase Simulator</h3>
                <p className="text-xs text-neutral-500">How many units will I get for my recharge?</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-6 text-xs">
            <div>
              <label className="font-semibold block mb-1">Recharge Amount ({currency.symbol})</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="1000"
                  min="500"
                  value={tokenAmountNGN}
                  onChange={(e) => setTokenAmountNGN(Math.max(0, Number(e.target.value)))}
                  className="flex-1 p-2.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono tabular-nums text-lg font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex gap-2 mt-2">
                {[10000, 20000, 30000, 50000, 100000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTokenAmountNGN(amt)}
                    className="px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-mono text-[11px]"
                  >
                    ₦{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <label className="font-semibold block mb-1">
                Fixed / Outstanding Maintenance Debt Deduction ({currency.symbol})
              </label>
              <input
                type="number"
                min="0"
                value={meterFixedChargeNGN}
                onChange={(e) => setMeterFixedChargeNGN(Math.max(0, Number(e.target.value)))}
                className="w-full p-2.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono tabular-nums focus:outline-none focus:border-emerald-500"
                placeholder="0"
              />
            </div>

            {/* Calculated Breakdown Box */}
            <div className="mt-4 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                <span>Gross Payment:</span>
                <span className="font-mono tabular-nums font-semibold">
                  {formatCurrency(tokenAmountNGN, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                <span>VAT (7.5%):</span>
                <span className="font-mono tabular-nums font-semibold">
                  -{formatCurrency(actualVAT, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                <span>Net Energy Credit:</span>
                <span className="font-mono tabular-nums font-semibold">
                  {formatCurrency(effectiveBaseCost, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-inherit text-sm font-bold text-neutral-900 dark:text-neutral-100">
                <span>Estimated Units Credited:</span>
                <span className="font-mono tabular-nums text-lg text-emerald-600 dark:text-emerald-400">
                  {estimatedTokenUnitsKWh.toFixed(1)} kWh
                </span>
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              At your household daily consumption rate of {(totalMonthlyKWh / 30).toFixed(1)} kWh/day, this token will last approximately{' '}
              <strong className="text-neutral-800 dark:text-neutral-200">
                {Math.max(1, Math.round(estimatedTokenUnitsKWh / (totalMonthlyKWh / 30 || 1)))} days
              </strong>.
            </p>
          </div>
        </div>

        {/* Module 2: Meter Reading Delta Calculator */}
        <div
          className={`p-6 sm:p-8 rounded-xl border ${
            isDark
              ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
              : 'bg-white border-neutral-200 shadow-xs text-neutral-900'
          }`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-inherit">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold">Meter Reading & DisCo Bill Auditor</h3>
                <p className="text-xs text-neutral-500">Verify estimated bills vs physical reading</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-6 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block mb-1">Previous Reading (kWh)</label>
                <input
                  type="number"
                  value={prevMeterReading}
                  onChange={(e) => setPrevMeterReading(Math.max(0, Number(e.target.value)))}
                  className="w-full p-2.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono tabular-nums focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Current Reading (kWh)</label>
                <input
                  type="number"
                  value={currentMeterReading}
                  onChange={(e) => setCurrentMeterReading(Math.max(0, Number(e.target.value)))}
                  className="w-full p-2.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono tabular-nums focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Difference & Cost */}
            <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                <span>Units Consumed in Period:</span>
                <span className="font-mono tabular-nums font-bold text-neutral-900 dark:text-neutral-100">
                  {unitsConsumedFromMeter} kWh
                </span>
              </div>
              <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                <span>Base Energy Charge ({formatCurrency(currentTariffRateNGN, currency)}/kWh):</span>
                <span className="font-mono tabular-nums font-semibold">
                  {formatCurrency(meterCalculatedCost.energyCost, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                <span>VAT (7.5%):</span>
                <span className="font-mono tabular-nums font-semibold">
                  {formatCurrency(meterCalculatedCost.vat, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-inherit text-sm font-bold text-neutral-900 dark:text-neutral-100">
                <span>Total Expected Bill:</span>
                <span className="font-mono tabular-nums text-lg text-sky-600 dark:text-sky-400">
                  {formatCurrency(meterCalculatedCost.totalCost, currency)}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-neutral-600 dark:text-neutral-300 text-[11px] leading-relaxed flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                Estimated post-paid bills: If your DisCo bill exceeds this calculated figure significantly, submit an official dispute with photos of your physical meter register to your DisCo Customer Care.
              </span>
            </div>

            <button
              onClick={onNavigateToSolar}
              className="w-full py-2.5 px-4 rounded-md font-semibold text-xs text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
            >
              <span>Explore Solar Backup to Cut Grid Bills</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
