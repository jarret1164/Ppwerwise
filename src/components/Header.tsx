import React from 'react';
import { CurrencyCode, CurrencyConfig } from '../types/energy';
import { CURRENCIES } from '../data/energyData';
import { Zap, SunMedium, Moon, Sun, Printer, FileText } from 'lucide-react';

export type NavigationTab =
  | 'overview'
  | 'appliances'
  | 'tariff'
  | 'solar'
  | 'generator'
  | 'directory';

export type ThemeMode = 'modern' | 'solar' | 'dark';

interface HeaderProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  currency: CurrencyConfig;
  onSelectCurrency: (code: CurrencyCode) => void;
  theme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
  onOpenReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  currency,
  onSelectCurrency,
  theme,
  onSelectTheme,
  onOpenReport,
}) => {
  const isDark = theme === 'dark';

  return (
    <header
      className={`border-b sticky top-0 z-40 backdrop-blur-md transition-colors ${
        isDark
          ? 'bg-neutral-950/90 border-neutral-800 text-neutral-100'
          : theme === 'solar'
          ? 'bg-emerald-950/90 border-emerald-800 text-emerald-50'
          : 'bg-white/95 border-neutral-200 text-neutral-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#overview"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('overview');
            }}
            className="flex items-center gap-2.5 text-xl font-bold tracking-tight whitespace-nowrap shrink-0 group focus:outline-none"
          >
            <div className={`p-1.5 rounded-md ${isDark ? 'bg-emerald-500/10 text-emerald-400' : theme === 'solar' ? 'bg-amber-400/20 text-amber-300' : 'bg-emerald-50 text-emerald-600'}`}>
              <Zap className="w-5 h-5" />
            </div>
            <span>PowerWise Africa</span>
          </a>

          {/* Zone 2: Single-line clean text navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => onSelectTab('overview')}
              className={`hover:opacity-100 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 text-left ${
                activeTab === 'overview'
                  ? 'border-emerald-500 font-semibold opacity-100'
                  : 'border-transparent opacity-75 hover:border-neutral-300'
              }`}
            >
              Energy Overview
            </button>
            <button
              onClick={() => onSelectTab('appliances')}
              className={`hover:opacity-100 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 text-left ${
                activeTab === 'appliances'
                  ? 'border-emerald-500 font-semibold opacity-100'
                  : 'border-transparent opacity-75 hover:border-neutral-300'
              }`}
            >
              Appliance Audit
            </button>
            <button
              onClick={() => onSelectTab('tariff')}
              className={`hover:opacity-100 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 text-left ${
                activeTab === 'tariff'
                  ? 'border-emerald-500 font-semibold opacity-100'
                  : 'border-transparent opacity-75 hover:border-neutral-300'
              }`}
            >
              Electricity Bills
            </button>
            <button
              onClick={() => onSelectTab('solar')}
              className={`hover:opacity-100 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 text-left ${
                activeTab === 'solar'
                  ? 'border-emerald-500 font-semibold opacity-100'
                  : 'border-transparent opacity-75 hover:border-neutral-300'
              }`}
            >
              Solar & Battery Sizing
            </button>
            <button
              onClick={() => onSelectTab('generator')}
              className={`hover:opacity-100 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 text-left ${
                activeTab === 'generator'
                  ? 'border-emerald-500 font-semibold opacity-100'
                  : 'border-transparent opacity-75 hover:border-neutral-300'
              }`}
            >
              Generator vs Solar
            </button>
            <button
              onClick={() => onSelectTab('directory')}
              className={`hover:opacity-100 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 text-left ${
                activeTab === 'directory'
                  ? 'border-emerald-500 font-semibold opacity-100'
                  : 'border-transparent opacity-75 hover:border-neutral-300'
              }`}
            >
              Verified Installers
            </button>
          </nav>

          {/* Zone 3: Controls & 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Currency selector */}
            <div className="relative">
              <label htmlFor="currency-select" className="sr-only">Currency</label>
              <select
                id="currency-select"
                value={currency.code}
                onChange={(e) => onSelectCurrency(e.target.value as CurrencyCode)}
                className={`text-xs font-semibold py-1.5 px-2.5 rounded-md border cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  isDark
                    ? 'bg-neutral-900 border-neutral-700 text-neutral-200'
                    : theme === 'solar'
                    ? 'bg-emerald-900 border-emerald-700 text-emerald-100'
                    : 'bg-neutral-100 border-neutral-200 text-neutral-800'
                }`}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Design theme selector */}
            <div
              className={`flex items-center p-0.5 rounded-md border text-xs ${
                isDark
                  ? 'bg-neutral-900 border-neutral-800'
                  : theme === 'solar'
                  ? 'bg-emerald-900 border-emerald-800'
                  : 'bg-neutral-100 border-neutral-200'
              }`}
              title="Switch design theme"
            >
              <button
                type="button"
                onClick={() => onSelectTheme('modern')}
                className={`px-2 py-1 rounded transition-colors ${
                  theme === 'modern'
                    ? 'bg-white text-neutral-900 shadow-xs font-medium'
                    : 'opacity-70 hover:opacity-100'
                }`}
                title="Modern Professional"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onSelectTheme('solar')}
                className={`px-2 py-1 rounded transition-colors ${
                  theme === 'solar'
                    ? 'bg-amber-400 text-neutral-950 shadow-xs font-medium'
                    : 'opacity-70 hover:opacity-100'
                }`}
                title="Solar & Clean Energy"
              >
                <SunMedium className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onSelectTheme('dark')}
                className={`px-2 py-1 rounded transition-colors ${
                  theme === 'dark'
                    ? 'bg-neutral-800 text-emerald-400 shadow-xs font-medium'
                    : 'opacity-70 hover:opacity-100'
                }`}
                title="Dark Tech Dashboard"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={onOpenReport}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md shadow-xs transition-colors whitespace-nowrap shrink-0 ${
                isDark
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950'
                  : theme === 'solar'
                  ? 'bg-amber-400 hover:bg-amber-300 text-emerald-950'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Energy Report</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2.5 border-t border-inherit text-xs scrollbar-none">
          <button
            onClick={() => onSelectTab('overview')}
            className={`px-3 py-1.5 rounded whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-emerald-500/20 font-semibold text-emerald-500'
                : 'opacity-70'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onSelectTab('appliances')}
            className={`px-3 py-1.5 rounded whitespace-nowrap ${
              activeTab === 'appliances'
                ? 'bg-emerald-500/20 font-semibold text-emerald-500'
                : 'opacity-70'
            }`}
          >
            Appliances
          </button>
          <button
            onClick={() => onSelectTab('tariff')}
            className={`px-3 py-1.5 rounded whitespace-nowrap ${
              activeTab === 'tariff'
                ? 'bg-emerald-500/20 font-semibold text-emerald-500'
                : 'opacity-70'
            }`}
          >
            Bills & Tariffs
          </button>
          <button
            onClick={() => onSelectTab('solar')}
            className={`px-3 py-1.5 rounded whitespace-nowrap ${
              activeTab === 'solar'
                ? 'bg-emerald-500/20 font-semibold text-emerald-500'
                : 'opacity-70'
            }`}
          >
            Solar Sizing
          </button>
          <button
            onClick={() => onSelectTab('generator')}
            className={`px-3 py-1.5 rounded whitespace-nowrap ${
              activeTab === 'generator'
                ? 'bg-emerald-500/20 font-semibold text-emerald-500'
                : 'opacity-70'
            }`}
          >
            Generator vs Solar
          </button>
          <button
            onClick={() => onSelectTab('directory')}
            className={`px-3 py-1.5 rounded whitespace-nowrap ${
              activeTab === 'directory'
                ? 'bg-emerald-500/20 font-semibold text-emerald-500'
                : 'opacity-70'
            }`}
          >
            Installers
          </button>
        </div>
      </div>
    </header>
  );
};
