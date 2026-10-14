import React, { useState } from 'react';
import { ApplianceItem, CurrencyConfig, EnergyProvider } from '../types/energy';
import { calculateSolarSizing, calculateTotalDailyKWh, formatCurrency } from '../utils/energyMath';
import { BATTERY_CHEMISTRIES, SOLAR_REGIONS } from '../data/energyData';
import { CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { ThemeMode } from './Header';

interface QuoteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProvider?: EnergyProvider;
  appliances: ApplianceItem[];
  currency: CurrencyConfig;
  theme: ThemeMode;
}

export const QuoteRequestModal: React.FC<QuoteRequestModalProps> = ({
  isOpen,
  onClose,
  selectedProvider,
  appliances,
  currency,
  theme,
}) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState(selectedProvider ? selectedProvider.city : 'Lagos');
  const [roofType, setRoofType] = useState('Long-span Aluminium');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Compute sizing numbers to send to the installer
  const sizing = calculateSolarSizing(
    appliances,
    10,
    BATTERY_CHEMISTRIES[0],
    SOLAR_REGIONS[2]
  );
  const totalDailyKWh = calculateTotalDailyKWh(appliances);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div
        className={`w-full max-w-lg p-6 sm:p-8 rounded-xl border shadow-2xl my-8 ${
          isDark
            ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-inherit">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-lg font-bold">
              {selectedProvider ? `Request Quote: ${selectedProvider.name}` : 'Request Certified Solar Sizing Quote'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold">Inspection Request Submitted!</h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
              Your load audit of <strong className="text-neutral-800 dark:text-neutral-200">{sizing.recommendedInverterKVA} kVA / {sizing.batteryCapacityKWh} kWh</strong> has been forwarded to {selectedProvider ? selectedProvider.name : 'our verified solar engineering network'}. A certified engineer will reach you at <span className="font-mono font-semibold">{phone || 'your phone'}</span> within 2 business hours.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 px-6 py-2 text-xs font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
            {/* Load Audit Summary Strip */}
            <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-1">
              <div className="font-semibold text-neutral-700 dark:text-neutral-300">
                Audited Power Package to be Quoted:
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-neutral-500 dark:text-neutral-400 font-mono">
                <span>Load: {totalDailyKWh.toFixed(1)} kWh/day</span>
                <span>·</span>
                <span>Inverter: {sizing.recommendedInverterKVA} kVA</span>
                <span>·</span>
                <span>Battery: {sizing.batteryCapacityKWh} kWh</span>
                <span>·</span>
                <span>Solar: {(sizing.solarArrayWatts / 1000).toFixed(1)} kWp</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Babatunde Adeyemi"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">WhatsApp / Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+234 800 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">City / Neighborhood</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ikeja GRA, Lekki Phase 1, Gwarinpa"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Roof Type / Property Structure</label>
              <select
                value={roofType}
                onChange={(e) => setRoofType(e.target.value)}
                className="w-full p-2.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Long-span Aluminium">Long-span Aluminium Roof</option>
                <option value="Stone-coated Steeltiles">Stone-coated Steeltiles (Gerard)</option>
                <option value="Corrugated Zinc">Corrugated Zinc Roof</option>
                <option value="Concrete Flat Deck">Concrete Flat Deck Roof</option>
                <option value="Ground Mount / Yard">Ground Mount in Yard / Compound</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Additional Notes (Optional)</label>
              <textarea
                rows={2}
                placeholder="e.g. Looking to phase out 3.5kVA generator completely. Need automatic changeover switch."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-inherit">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded border border-neutral-300 dark:border-neutral-700 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Submit Sizing Package</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
