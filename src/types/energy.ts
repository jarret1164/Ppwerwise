export type CurrencyCode = 'NGN' | 'USD' | 'KES' | 'GHS' | 'ZAR';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToNGN: number; // 1 unit in NGN
}

export interface ApplianceItem {
  id: string;
  name: string;
  category: 'Cooling' | 'Refrigeration' | 'Entertainment & Work' | 'Kitchen & Cooking' | 'Lighting & Fans' | 'Pumping & Water' | 'Other';
  watts: number;
  hoursPerDay: number;
  quantity: number;
  dutyCycle: number; // e.g. 0.6 for fridge compressor cycling
  isBackupEssential: boolean; // whether included in inverter/battery sizing
  surgeMultiplier: number; // e.g. 3x for compressors/pumps
}

export interface DisCoTariffBand {
  band: 'Band A' | 'Band B' | 'Band C' | 'Band D' | 'Band E';
  minHours: number;
  maxHours: number;
  ratePerKWh: number; // in NGN
  description: string;
}

export type SolarRegion = 'Northern (Sahel / High Sun)' | 'Middle Belt / Central' | 'Southern / Coastal (Lagos / PH)';

export interface SolarRegionData {
  region: SolarRegion;
  peakSunHours: number;
  description: string;
}

export interface BatteryChemistry {
  id: 'lifepo4' | 'tubular_gel';
  name: string;
  depthOfDischarge: number; // 0.85 vs 0.50
  lifespanYears: number;
  efficiency: number; // 0.95 vs 0.82
  costPerKWhNGN: number;
}

export interface GeneratorModelPreset {
  id: string;
  name: string;
  ratingKVA: number;
  fuelType: 'petrol' | 'diesel';
  litersPerHour: number;
  typicalMaintenanceCostPerMonthNGN: number;
}

export interface EnergyProvider {
  id: string;
  name: string;
  state: string;
  city: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  yearsInBusiness: number;
  verified: boolean;
  warrantyYears: number;
  phone: string;
  email: string;
  description: string;
}

export interface EnergyAuditScenario {
  id: string;
  title: string;
  description: string;
  discoBand: 'Band A' | 'Band B' | 'Band C' | 'Band D' | 'Band E' | 'Custom';
  customRateNGN: number;
  appliances: ApplianceItem[];
}
