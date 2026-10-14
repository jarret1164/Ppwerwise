import { ApplianceItem, BatteryChemistry, CurrencyConfig, SolarRegionData } from '../types/energy';

export function calculateApplianceDailyKWh(appliance: ApplianceItem): number {
  return (appliance.watts * appliance.hoursPerDay * appliance.quantity * appliance.dutyCycle) / 1000;
}

export function calculateApplianceMonthlyKWh(appliance: ApplianceItem): number {
  return calculateApplianceDailyKWh(appliance) * 30;
}

export function calculateTotalDailyKWh(appliances: ApplianceItem[]): number {
  return appliances.reduce((sum, item) => sum + calculateApplianceDailyKWh(item), 0);
}

export function calculateTotalMonthlyKWh(appliances: ApplianceItem[]): number {
  return calculateTotalDailyKWh(appliances) * 30;
}

export function calculateMonthlyCost(
  monthlyKWh: number,
  ratePerKWhNGN: number,
  includeVAT: boolean = true
): { energyCost: number; vat: number; totalCost: number } {
  const energyCost = monthlyKWh * ratePerKWhNGN;
  const vat = includeVAT ? energyCost * 0.075 : 0;
  const totalCost = energyCost + vat;
  return { energyCost, vat, totalCost };
}

export interface SolarSizingResult {
  dailyTotalWh: number;
  essentialDailyWh: number;
  essentialHourlyWh: number;
  peakRunningWatts: number;
  peakSurgeWatts: number;
  recommendedInverterKVA: number;
  recommendedInverterKW: number;
  systemVoltage: 24 | 48 | 12;
  batteryCapacityKWh: number;
  batteryCapacityAh: number;
  recommendedBatteryUnits: string;
  solarArrayWatts: number;
  panelsCount: number;
  panelWattage: number;
  estimatedSystemCostNGN: {
    min: number;
    max: number;
    inverterCost: number;
    batteryCost: number;
    solarPanelsCost: number;
    accessoriesAndInstall: number;
  };
}

export function calculateSolarSizing(
  appliances: ApplianceItem[],
  backupHours: number,
  batteryType: BatteryChemistry,
  solarRegion: SolarRegionData
): SolarSizingResult {
  const essentialAppliances = appliances.filter((a) => a.isBackupEssential);
  const activeAppliances = essentialAppliances.length > 0 ? essentialAppliances : appliances;

  // Running and surge loads
  const peakRunningWatts = appliances.reduce((sum, a) => sum + a.watts * a.quantity, 0);
  const essentialRunningWatts = activeAppliances.reduce((sum, a) => sum + a.watts * a.quantity, 0);
  
  // Surge load for starting motor loads
  const peakSurgeWatts = activeAppliances.reduce((sum, a) => {
    return sum + a.watts * a.quantity * Math.max(1, a.surgeMultiplier);
  }, 0);

  // Daily Wh
  const dailyTotalWh = calculateTotalDailyKWh(appliances) * 1000;
  const essentialDailyWh = activeAppliances.reduce((sum, a) => sum + calculateApplianceDailyKWh(a) * 1000, 0);
  
  // Hourly average essential consumption
  const essentialHourlyWh = activeAppliances.reduce((sum, a) => {
    return sum + (a.watts * a.quantity * a.dutyCycle);
  }, 0);

  // Required backup energy during grid failure (Wh)
  const targetBackupWh = essentialHourlyWh * backupHours;

  // Battery capacity needed considering depth of discharge and inverter/wiring loss (~90%)
  const batteryLossFactor = batteryType.efficiency * 0.92;
  const effectiveBatteryCapacityKWh = targetBackupWh > 0 
    ? (targetBackupWh / (batteryType.depthOfDischarge * batteryLossFactor)) / 1000
    : 1.5;

  // Recommended Inverter size with 30% continuous headroom
  const continuousWattsNeeded = Math.max(800, essentialRunningWatts * 1.35);
  let recommendedInverterKVA = 1.0;
  let systemVoltage: 12 | 24 | 48 = 12;

  if (continuousWattsNeeded <= 1000 && peakSurgeWatts < 2200) {
    recommendedInverterKVA = 1.2;
    systemVoltage = 12;
  } else if (continuousWattsNeeded <= 2000 && peakSurgeWatts < 4500) {
    recommendedInverterKVA = 2.5;
    systemVoltage = 24;
  } else if (continuousWattsNeeded <= 3200 && peakSurgeWatts < 7500) {
    recommendedInverterKVA = 3.5;
    systemVoltage = 24;
  } else if (continuousWattsNeeded <= 5000) {
    recommendedInverterKVA = 5.0;
    systemVoltage = 48;
  } else if (continuousWattsNeeded <= 7500) {
    recommendedInverterKVA = 8.0;
    systemVoltage = 48;
  } else {
    recommendedInverterKVA = Math.ceil(continuousWattsNeeded / 1000);
    systemVoltage = 48;
  }

  const recommendedInverterKW = recommendedInverterKVA * 0.85;

  // Battery Ah at system voltage
  const batteryCapacityAh = Math.round((effectiveBatteryCapacityKWh * 1000) / systemVoltage);

  // Modular battery recommendation string
  let recommendedBatteryUnits = '';
  if (batteryType.id === 'lifepo4') {
    const modulesOf5kWh = Math.ceil(effectiveBatteryCapacityKWh / 5.12);
    recommendedBatteryUnits = `${modulesOf5kWh}x 5.12kWh 100Ah Rackmount / Wall Battery (${(modulesOf5kWh * 5.12).toFixed(1)} kWh total)`;
  } else {
    const countOf200Ah = Math.ceil(batteryCapacityAh / 200);
    const roundedSeries = Math.max(systemVoltage / 12, countOf200Ah);
    recommendedBatteryUnits = `${roundedSeries}x 200Ah 12V Tubular Deep Cycle Batteries in series/parallel`;
  }

  // Solar array requirement: to replenish daytime load and charge battery
  const solarSystemEfficiency = 0.78; // dust, heat derating in African climates, controller losses
  const solarEnergyNeededWh = (essentialDailyWh * 0.9) / solarSystemEfficiency;
  const solarArrayWatts = Math.round(solarEnergyNeededWh / solarRegion.peakSunHours);
  
  const panelWattage = 550; // Standard Mono PERC 550W Tier-1 panel
  const panelsCount = Math.max(2, Math.ceil(solarArrayWatts / panelWattage));
  const finalSolarWatts = panelsCount * panelWattage;

  // Turnkey price estimation based on current Nigerian renewable market (2025/2026)
  const inverterCost = recommendedInverterKVA * 260000;
  const batteryCost = effectiveBatteryCapacityKWh * batteryType.costPerKWhNGN;
  const solarPanelsCost = panelsCount * 135000; // ~₦135,000 per 550W Tier 1 panel
  const accessoriesAndInstall = (inverterCost + batteryCost + solarPanelsCost) * 0.16; // MPPT, surge protectors, rails, cables, installation labor
  const totalMin = Math.round((inverterCost + batteryCost + solarPanelsCost + accessoriesAndInstall) * 0.92);
  const totalMax = Math.round((inverterCost + batteryCost + solarPanelsCost + accessoriesAndInstall) * 1.12);

  return {
    dailyTotalWh,
    essentialDailyWh,
    essentialHourlyWh,
    peakRunningWatts,
    peakSurgeWatts,
    recommendedInverterKVA,
    recommendedInverterKW,
    systemVoltage,
    batteryCapacityKWh: Number(effectiveBatteryCapacityKWh.toFixed(2)),
    batteryCapacityAh,
    recommendedBatteryUnits,
    solarArrayWatts: finalSolarWatts,
    panelsCount,
    panelWattage,
    estimatedSystemCostNGN: {
      min: totalMin,
      max: totalMax,
      inverterCost: Math.round(inverterCost),
      batteryCost: Math.round(batteryCost),
      solarPanelsCost: Math.round(solarPanelsCost),
      accessoriesAndInstall: Math.round(accessoriesAndInstall),
    },
  };
}

export function formatCurrency(amountInNGN: number, currency: CurrencyConfig): string {
  const converted = amountInNGN / currency.rateToNGN;
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: converted < 100 && currency.code !== 'NGN' ? 2 : 0,
    minimumFractionDigits: 0,
  }).format(converted);
  return `${currency.symbol}${formatted}`;
}
