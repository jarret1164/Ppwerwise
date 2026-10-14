import React from 'react';
import { ApplianceItem, CurrencyConfig } from '../types/energy';
import {
  calculateApplianceMonthlyKWh,
  calculateMonthlyCost,
  calculateSolarSizing,
  calculateTotalDailyKWh,
  calculateTotalMonthlyKWh,
  formatCurrency,
} from '../utils/energyMath';
import { BATTERY_CHEMISTRIES, SOLAR_REGIONS } from '../data/energyData';
import { Printer, X, Zap, Sun, ShieldCheck, Download, CheckCircle2 } from 'lucide-react';
import { ThemeMode } from './Header';

interface EnergyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  appliances: ApplianceItem[];
  tariffRateNGN: number;
  currency: CurrencyConfig;
  theme: ThemeMode;
}

export const EnergyReportModal: React.FC<EnergyReportModalProps> = ({
  isOpen,
  onClose,
  appliances,
  tariffRateNGN,
  currency,
  theme,
}) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const totalMonthlyKWh = calculateTotalMonthlyKWh(appliances);
  const totalDailyKWh = calculateTotalDailyKWh(appliances);
  const { totalCost: monthlyCostNGN, energyCost, vat } = calculateMonthlyCost(totalMonthlyKWh, tariffRateNGN, true);

  const solarSizing = calculateSolarSizing(
    appliances,
    10,
    BATTERY_CHEMISTRIES[0],
    SOLAR_REGIONS[2]
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div
        className={`w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-xl border shadow-2xl p-6 sm:p-10 my-4 ${
          isDark
            ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between pb-6 border-b border-inherit no-print">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-sm tracking-tight">Executive Energy Audit & Solar Proposal</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="space-y-8 pt-6">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-inherit">
            <div>
              <div className="text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                <span>PowerWise Africa</span>
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                Household & Business Energy Audit Assessment Report
              </div>
              <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                Report Reference: PWA-AUDIT-{Date.now().toString().slice(-6)} · Generated on {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>

            <div className="text-right sm:text-right text-xs space-y-1">
              <div className="font-semibold text-neutral-700 dark:text-neutral-300">Target Benchmark</div>
              <div className="font-mono text-neutral-500">Tariff: {formatCurrency(tariffRateNGN, currency)}/kWh</div>
              <div className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Status: Completed Audit</div>
            </div>
          </div>

          {/* Section 1: Executive Key Metrics */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
              1. Monthly Consumption & Utility Expenditure
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
              <div>
                <div className="text-xs text-neutral-500">Monthly Utility Cost</div>
                <div className="text-2xl font-black font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatCurrency(monthlyCostNGN, currency)}
                </div>
                <div className="text-[10px] text-neutral-400">incl. 7.5% VAT</div>
              </div>

              <div>
                <div className="text-xs text-neutral-500">Total Consumption</div>
                <div className="text-2xl font-black font-mono tabular-nums text-sky-600 dark:text-sky-400 mt-1">
                  {Math.round(totalMonthlyKWh)} <span className="text-xs font-normal">kWh</span>
                </div>
                <div className="text-[10px] text-neutral-400">{totalDailyKWh.toFixed(1)} kWh/day</div>
              </div>

              <div>
                <div className="text-xs text-neutral-500">Peak Running Load</div>
                <div className="text-2xl font-black font-mono tabular-nums text-neutral-800 dark:text-neutral-200 mt-1">
                  {solarSizing.peakRunningWatts} <span className="text-xs font-normal">Watts</span>
                </div>
                <div className="text-[10px] text-neutral-400">Surge: {Math.round(solarSizing.peakSurgeWatts)}W</div>
              </div>

              <div>
                <div className="text-xs text-neutral-500">Essential Backup</div>
                <div className="text-2xl font-black font-mono tabular-nums text-amber-500 mt-1">
                  {(solarSizing.essentialDailyWh / 1000).toFixed(1)} <span className="text-xs font-normal">kWh/day</span>
                </div>
                <div className="text-[10px] text-neutral-400">during grid cuts</div>
              </div>
            </div>
          </div>

          {/* Section 2: Appliance Inventory Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
              2. Detailed Appliance Load Inventory
            </h3>
            <div className="border border-inherit rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 dark:bg-neutral-950 border-b border-inherit font-semibold text-neutral-600 dark:text-neutral-300">
                  <tr>
                    <th className="py-2.5 px-3">Appliance</th>
                    <th className="py-2.5 px-2">Watts</th>
                    <th className="py-2.5 px-2">Qty</th>
                    <th className="py-2.5 px-2">Hrs/Day</th>
                    <th className="py-2.5 px-2 text-right">Daily kWh</th>
                    <th className="py-2.5 px-3 text-right">Monthly kWh</th>
                    <th className="py-2.5 px-3 text-right">Monthly Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-inherit">
                  {appliances.map((item) => {
                    const monthlyKWh = calculateApplianceMonthlyKWh(item);
                    const { totalCost } = calculateMonthlyCost(monthlyKWh, tariffRateNGN, true);
                    return (
                      <tr key={item.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 font-mono">
                        <td className="py-2 px-3 font-sans font-medium text-neutral-900 dark:text-neutral-100">
                          {item.name}
                        </td>
                        <td className="py-2 px-2 text-neutral-500">{item.watts}W</td>
                        <td className="py-2 px-2">{item.quantity}</td>
                        <td className="py-2 px-2">{item.hoursPerDay}h</td>
                        <td className="py-2 px-2 text-right">{(monthlyKWh / 30).toFixed(2)}</td>
                        <td className="py-2 px-3 text-right font-bold">{monthlyKWh.toFixed(1)}</td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(totalCost, currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Recommended Solar & Battery Architecture */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
              3. Recommended Solar & Storage Architecture (10h Blackout Immunity)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-inherit">
                <div className="text-xs text-neutral-500 font-semibold">Hybrid Inverter</div>
                <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  {solarSizing.recommendedInverterKVA} kVA Pure Sine Wave
                </div>
                <div className="text-xs text-neutral-500 mt-1">
                  {solarSizing.systemVoltage}V DC bus · {solarSizing.recommendedInverterKW.toFixed(1)} kW capacity
                </div>
              </div>

              <div className="p-4 rounded-xl border border-inherit">
                <div className="text-xs text-neutral-500 font-semibold">Lithium Storage</div>
                <div className="text-xl font-bold font-mono text-sky-600 dark:text-sky-400 mt-1">
                  {solarSizing.batteryCapacityKWh} kWh LiFePO4
                </div>
                <div className="text-xs text-neutral-500 mt-1">
                  {solarSizing.recommendedBatteryUnits}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-inherit">
                <div className="text-xs text-neutral-500 font-semibold">Solar PV Array</div>
                <div className="text-xl font-bold font-mono text-amber-500 mt-1">
                  {(solarSizing.solarArrayWatts / 1000).toFixed(2)} kWp
                </div>
                <div className="text-xs text-neutral-500 mt-1">
                  {solarSizing.panelsCount}x 550W Tier-1 Mono PERC panels
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-emerald-800 dark:text-emerald-300">
                  Estimated Turnkey System Investment:
                </span>
                <span className="font-mono font-extrabold text-sm ml-2">
                  {formatCurrency(solarSizing.estimatedSystemCostNGN.min, currency)} -{' '}
                  {formatCurrency(solarSizing.estimatedSystemCostNGN.max, currency)}
                </span>
              </div>
              <span className="text-[11px] text-neutral-500">Includes cabling, surge protection, rails & installation</span>
            </div>
          </div>

          {/* Section 4: Efficiency & Survival Recommendations */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
              4. Immediate Actionable Energy Saving Tips
            </h3>
            <div className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Convert Standard ACs to Dual-Inverter Models:</strong> Non-inverter compressor cycling draws up to 1400W–1800W repeatedly. Inverter ACs dial down to 350W once room temperature is reached, saving up to 40% monthly.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Schedule Water Pumping During High Grid or Solar Hours:</strong> Run borehole / sumo pumps between 11:00 AM – 2:00 PM when solar generation is at maximum peak, avoiding battery deep-discharge.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Eliminate Vampire Standby Loads:</strong> Decoders, audio systems, and microwaves consume 30W–50W continuously in phantom power. Use a switched surge bar to turn off completely when retiring for the night.
                </span>
              </div>
            </div>
          </div>

          {/* Document Footer */}
          <div className="pt-6 border-t border-inherit text-center text-[11px] text-neutral-400">
            PowerWise Africa · Sustainable Energy Intelligence for African Homes & Small Businesses · www.powerwise.africa
          </div>
        </div>
      </div>
    </div>
  );
};
