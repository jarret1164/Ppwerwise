import React, { useState } from 'react';
import {
  ApplianceItem,
  BatteryChemistry,
  CurrencyConfig,
  SolarRegionData,
} from '../types/energy';
import {
  BATTERY_CHEMISTRIES,
  SOLAR_REGIONS,
} from '../data/energyData';
import {
  calculateSolarSizing,
  formatCurrency,
} from '../utils/energyMath';
import {
  Sun,
  Battery,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { ThemeMode } from './Header';

interface SolarSizingCalculatorProps {
  appliances: ApplianceItem[];
  currency: CurrencyConfig;
  theme: ThemeMode;
  onNavigateToDirectory: () => void;
  onRequestQuote: () => void;
}

export const SolarSizingCalculator: React.FC<SolarSizingCalculatorProps> = ({
  appliances,
  currency,
  theme,
  onNavigateToDirectory,
  onRequestQuote,
}) => {
  const isDark = theme === 'dark';
  const isSolar = theme === 'solar';

  // Configurable sliders
  const [backupHours, setBackupHours] = useState<number>(10);
  const [selectedBatteryType, setSelectedBatteryType] = useState<BatteryChemistry>(
    BATTERY_CHEMISTRIES[0] // LiFePO4 default
  );
  const [selectedRegion, setSelectedRegion] = useState<SolarRegionData>(
    SOLAR_REGIONS[2] // Southern / Coastal default (Lagos/PH)
  );

  const sizing = calculateSolarSizing(
    appliances,
    backupHours,
    selectedBatteryType,
    selectedRegion
  );

  const roofAreaM2 = Math.round(sizing.panelsCount * 2.5);

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase opacity-70">
            <span>Engineering Sizing Engine</span>
            <span aria-hidden="true">·</span>
            <span>Inverters, Solar PV & Storage</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
            Solar & Battery Sizing Calculator
          </h1>
          <p className="text-sm opacity-80 mt-1 max-w-3xl">
            Calculated directly from your active appliances. Tailored for African solar irradiance levels and ambient temperature derating.
          </p>
        </div>

        <button
          onClick={onRequestQuote}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-md shadow-xs transition-colors whitespace-nowrap shrink-0 ${
            isDark
              ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Request Installer Sizing Quote</span>
        </button>
      </div>

      {/* Sizing Controls Grid */}
      <div
        className={`p-6 sm:p-8 rounded-xl border ${
          isDark
            ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
            : 'bg-white border-neutral-200 shadow-xs text-neutral-900'
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 1. Backup Hours Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>Desired Blackout Backup Duration</span>
              </label>
              <span className="font-mono tabular-nums font-bold text-sm text-emerald-600 dark:text-emerald-400">
                {backupHours} Hours
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="24"
              step="1"
              value={backupHours}
              onChange={(e) => setBackupHours(Number(e.target.value))}
              className="w-full accent-emerald-500 h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-neutral-400 font-mono">
              <span>2 hrs (Quick Cut)</span>
              <span>12 hrs (Overnight)</span>
              <span>24 hrs (Off-Grid)</span>
            </div>
          </div>

          {/* 2. Battery Chemistry */}
          <div className="space-y-2">
            <label className="text-xs font-bold flex items-center gap-1.5">
              <Battery className="w-4 h-4 text-emerald-500" />
              <span>Battery Chemistry & Technology</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {BATTERY_CHEMISTRIES.map((chem) => {
                const isSelected = selectedBatteryType.id === chem.id;
                return (
                  <button
                    key={chem.id}
                    type="button"
                    onClick={() => setSelectedBatteryType(chem)}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? isDark
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-semibold'
                          : 'bg-emerald-50 border-emerald-600 text-emerald-900 font-semibold'
                        : isDark
                        ? 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    <div className="font-bold">{chem.id === 'lifepo4' ? 'Lithium LiFePO4' : 'Tubular Gel'}</div>
                    <div className="text-[10px] opacity-75 mt-0.5">
                      {Math.round(chem.depthOfDischarge * 100)}% DOD · {chem.lifespanYears} yr lifespan
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Solar Geographic Region */}
          <div className="space-y-2">
            <label className="text-xs font-bold flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span>Solar Irradiance Zone</span>
            </label>
            <select
              value={selectedRegion.region}
              onChange={(e) => {
                const found = SOLAR_REGIONS.find((r) => r.region === e.target.value);
                if (found) setSelectedRegion(found);
              }}
              className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {SOLAR_REGIONS.map((r) => (
                <option key={r.region} value={r.region}>
                  {r.region} ({r.peakSunHours}h Peak Sun)
                </option>
              ))}
            </select>
            <p className="text-[11px] text-neutral-400 leading-snug">
              {selectedRegion.description}
            </p>
          </div>
        </div>
      </div>

      {/* 4 Recommended Hardware Sizing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Inverter Capacity */}
        <div
          className={`p-6 rounded-xl border relative overflow-hidden ${
            isDark
              ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
              : 'bg-white border-neutral-200 shadow-xs text-neutral-900'
          }`}
        >
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Inverter Sizing
          </div>
          <div className="mt-2 text-3xl font-extrabold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {sizing.recommendedInverterKVA}{' '}
            <span className="text-lg font-sans font-normal text-neutral-500">kVA</span>
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Pure Sine Wave ({sizing.recommendedInverterKW.toFixed(1)} kW output)
          </div>

          <div className="mt-4 pt-3 border-t border-inherit/60 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-500">System DC Voltage:</span>
              <span className="font-mono font-semibold">{sizing.systemVoltage}V DC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Peak Surge Capacity:</span>
              <span className="font-mono font-semibold">
                {Math.round(sizing.peakSurgeWatts)} W
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Battery Storage */}
        <div
          className={`p-6 rounded-xl border relative overflow-hidden ${
            isDark
              ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
              : 'bg-white border-neutral-200 shadow-xs text-neutral-900'
          }`}
        >
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Battery Capacity
          </div>
          <div className="mt-2 text-3xl font-extrabold font-mono tabular-nums text-sky-600 dark:text-sky-400">
            {sizing.batteryCapacityKWh}{' '}
            <span className="text-lg font-sans font-normal text-neutral-500">kWh</span>
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            ~{sizing.batteryCapacityAh} Ah @ {sizing.systemVoltage}V
          </div>

          <div className="mt-4 pt-3 border-t border-inherit/60 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-500">Usable DoD:</span>
              <span className="font-mono font-semibold">
                {Math.round(selectedBatteryType.depthOfDischarge * 100)}% ({selectedBatteryType.name.split(' ')[0]})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Target Backup:</span>
              <span className="font-mono font-semibold">{backupHours} hours continuously</span>
            </div>
          </div>
        </div>

        {/* Card 3: Solar PV Panels */}
        <div
          className={`p-6 rounded-xl border relative overflow-hidden ${
            isDark
              ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
              : 'bg-white border-neutral-200 shadow-xs text-neutral-900'
          }`}
        >
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Solar PV Array
          </div>
          <div className="mt-2 text-3xl font-extrabold font-mono tabular-nums text-amber-500">
            {(sizing.solarArrayWatts / 1000).toFixed(2)}{' '}
            <span className="text-lg font-sans font-normal text-neutral-500">kWp</span>
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            {sizing.panelsCount}x {sizing.panelWattage}W Mono PERC Panels
          </div>

          <div className="mt-4 pt-3 border-t border-inherit/60 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-500">Roof Area Required:</span>
              <span className="font-mono font-semibold">~{roofAreaM2} m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Daily Generation:</span>
              <span className="font-mono font-semibold">
                {((sizing.solarArrayWatts * selectedRegion.peakSunHours * 0.78) / 1000).toFixed(1)} kWh/day
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Estimated Turnkey Investment */}
        <div
          className={`p-6 rounded-xl border relative overflow-hidden ${
            isDark
              ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
              : 'bg-white border-neutral-200 shadow-xs text-neutral-900'
          }`}
        >
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Turnkey System Cost
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 leading-tight">
            {formatCurrency(sizing.estimatedSystemCostNGN.min, currency)} -{' '}
            {formatCurrency(sizing.estimatedSystemCostNGN.max, currency)}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Hardware, cabling, protection & labor
          </div>

          <div className="mt-4 pt-3 border-t border-inherit/60 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-500">Estimated Payback:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                10-14 Months vs Gen
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Warranty:</span>
              <span className="font-semibold">5 - 10 Years Panels</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hardware & Bill of Materials Breakdown + System Photo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left (7 cols): Bill of Materials */}
        <div
          className={`lg:col-span-7 p-6 sm:p-8 rounded-xl border ${
            isDark
              ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
              : 'bg-white border-neutral-200 shadow-xs text-neutral-900'
          }`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-inherit">
            <h3 className="text-base font-bold">Estimated Bill of Materials (BOM)</h3>
            <span className="text-xs text-neutral-400">Commercial grade pricing</span>
          </div>

          <div className="divide-y divide-inherit mt-4 text-xs">
            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">{sizing.recommendedInverterKVA} kVA Pure Sine Wave Hybrid Inverter</div>
                <div className="text-neutral-400 text-[11px]">
                  Built-in MPPT solar charge controller, AC grid bypass & transfer switch
                </div>
              </div>
              <div className="font-mono font-bold">
                {formatCurrency(sizing.estimatedSystemCostNGN.inverterCost, currency)}
              </div>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">{sizing.recommendedBatteryUnits}</div>
                <div className="text-neutral-400 text-[11px]">
                  {selectedBatteryType.name} bank ({selectedBatteryType.lifespanYears} years anticipated life)
                </div>
              </div>
              <div className="font-mono font-bold">
                {formatCurrency(sizing.estimatedSystemCostNGN.batteryCost, currency)}
              </div>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">
                  {sizing.panelsCount}x {sizing.panelWattage}W Mono PERC Half-Cell Solar Panels
                </div>
                <div className="text-neutral-400 text-[11px]">
                  Tier-1 high efficiency modules (Total {(sizing.solarArrayWatts / 1000).toFixed(2)} kWp)
                </div>
              </div>
              <div className="font-mono font-bold">
                {formatCurrency(sizing.estimatedSystemCostNGN.solarPanelsCost, currency)}
              </div>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">Protection, Aluminum Railing & Certified Installation</div>
                <div className="text-neutral-400 text-[11px]">
                  DC/AC circuit breakers, lightning surge arrestor, 6mm solar cables, earthing rod & labor
                </div>
              </div>
              <div className="font-mono font-bold">
                {formatCurrency(sizing.estimatedSystemCostNGN.accessoriesAndInstall, currency)}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-inherit flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-neutral-500">
              Need quotes from verified local solar companies in your state?
            </div>
            <button
              onClick={onNavigateToDirectory}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View Verified Solar Installers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right (5 cols): System Visual & Technical Advice */}
        <div className="lg:col-span-5 space-y-6">
          <div
            className={`rounded-xl border overflow-hidden ${
              isDark
                ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
                : 'bg-white border-neutral-200 shadow-xs text-neutral-900'
            }`}
          >
            <div className="h-44 overflow-hidden bg-neutral-900 relative">
              <img
                src="/src/assets/images/smart_energy_meter_display_1791980869119.jpg"
                alt="Solar inverter and lithium storage battery system"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <div className="text-[11px] font-semibold tracking-wider uppercase text-emerald-300">
                  Clean Tech Sizing
                </div>
                <div className="text-sm font-bold">Lithium Battery & Hybrid Inverter</div>
              </div>
            </div>

            <div className="p-6 space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-neutral-600 dark:text-neutral-300">
                  <strong>Zero Fumes & Noise:</strong> Unlike petrol generators that produce noxious carbon monoxide and require night refueling, solar systems operate silently 24/7.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-neutral-600 dark:text-neutral-300">
                  <strong>Inverter AC Compatibility:</strong> With {sizing.recommendedInverterKVA} kVA, you can run inverter-based energy star air conditioners safely without motor tripping.
                </p>
              </div>

              <button
                onClick={onRequestQuote}
                className="w-full mt-4 py-2 px-3 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
              >
                Send Audit Specs to Verified Engineers
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
