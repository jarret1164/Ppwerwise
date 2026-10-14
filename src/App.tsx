import React, { useState, useEffect } from 'react';
import { ApplianceItem, CurrencyCode, CurrencyConfig, EnergyAuditScenario, EnergyProvider } from './types/energy';
import { CURRENCIES, DEMO_SCENARIO, PRESET_SCENARIOS, VERIFIED_PROVIDERS } from './data/energyData';
import { Header, NavigationTab, ThemeMode } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ApplianceCalculator } from './components/ApplianceCalculator';
import { TariffCalculator } from './components/TariffCalculator';
import { SolarSizingCalculator } from './components/SolarSizingCalculator';
import { GeneratorComparison } from './components/GeneratorComparison';
import { ProviderDirectory } from './components/ProviderDirectory';
import { QuoteRequestModal } from './components/QuoteRequestModal';
import { EnergyReportModal } from './components/EnergyReportModal';
import { calculateTotalMonthlyKWh } from './utils/energyMath';

const STORAGE_KEY_APPLIANCES = 'pwa_appliances_v1';
const STORAGE_KEY_TARIFF = 'pwa_tariff_v1';
const STORAGE_KEY_THEME = 'pwa_theme_v1';
const STORAGE_KEY_CURRENCY = 'pwa_currency_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    return (saved as ThemeMode) || 'modern';
  });
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CURRENCY);
    return (saved as CurrencyCode) || 'NGN';
  });

  const [appliances, setAppliances] = useState<ApplianceItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_APPLIANCES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEMO_SCENARIO.appliances;
      }
    }
    return DEMO_SCENARIO.appliances;
  });

  const [tariffRateNGN, setTariffRateNGN] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TARIFF);
    return saved ? Number(saved) : 150.0;
  });

  const [activeScenarioId, setActiveScenarioId] = useState<string>('demo-benchmark');

  // Modals state
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedProviderForQuote, setSelectedProviderForQuote] = useState<EnergyProvider | undefined>(undefined);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_APPLIANCES, JSON.stringify(appliances));
  }, [appliances]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TARIFF, tariffRateNGN.toString());
  }, [tariffRateNGN]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CURRENCY, currencyCode);
  }, [currencyCode]);

  const currency: CurrencyConfig =
    CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];

  const handleSelectScenario = (scenario: EnergyAuditScenario) => {
    setAppliances(scenario.appliances);
    setTariffRateNGN(scenario.customRateNGN);
    setActiveScenarioId(scenario.id);
  };

  const handleOpenQuoteModal = (provider?: EnergyProvider) => {
    setSelectedProviderForQuote(provider);
    setIsQuoteModalOpen(true);
  };

  const isDark = theme === 'dark';
  const isSolar = theme === 'solar';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${
        isDark
          ? 'bg-neutral-950 text-neutral-100'
          : isSolar
          ? 'bg-emerald-950/20 text-neutral-900'
          : 'bg-neutral-50/70 text-neutral-900'
      }`}
    >
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currency={currency}
        onSelectCurrency={setCurrencyCode}
        theme={theme}
        onSelectTheme={setTheme}
        onOpenReport={() => setIsReportModalOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'overview' && (
          <DashboardView
            appliances={appliances}
            tariffRateNGN={tariffRateNGN}
            onSetTariffRate={setTariffRateNGN}
            currency={currency}
            theme={theme}
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectScenario={handleSelectScenario}
            activeScenarioId={activeScenarioId}
          />
        )}

        {activeTab === 'appliances' && (
          <ApplianceCalculator
            appliances={appliances}
            onUpdateAppliances={setAppliances}
            tariffRateNGN={tariffRateNGN}
            currency={currency}
            theme={theme}
            onNavigateToSolar={() => setActiveTab('solar')}
          />
        )}

        {activeTab === 'tariff' && (
          <TariffCalculator
            currentTariffRateNGN={tariffRateNGN}
            onSelectTariffRate={(rate) => setTariffRateNGN(rate)}
            currency={currency}
            theme={theme}
            totalMonthlyKWh={calculateTotalMonthlyKWh(appliances)}
            onNavigateToSolar={() => setActiveTab('solar')}
          />
        )}

        {activeTab === 'solar' && (
          <SolarSizingCalculator
            appliances={appliances}
            currency={currency}
            theme={theme}
            onNavigateToDirectory={() => setActiveTab('directory')}
            onRequestQuote={() => handleOpenQuoteModal()}
          />
        )}

        {activeTab === 'generator' && (
          <GeneratorComparison
            currency={currency}
            theme={theme}
            onNavigateToSolar={() => setActiveTab('solar')}
            onRequestQuote={() => handleOpenQuoteModal()}
          />
        )}

        {activeTab === 'directory' && (
          <ProviderDirectory
            theme={theme}
            onRequestQuoteWithProvider={(prov) => handleOpenQuoteModal(prov)}
          />
        )}
      </main>

      {/* Clean Footer (Compliant with Anti-Slop Discipline) */}
      <footer
        className={`border-t py-8 mt-auto text-xs transition-colors ${
          isDark
            ? 'bg-neutral-950 border-neutral-800 text-neutral-400'
            : isSolar
            ? 'bg-emerald-950/40 border-emerald-900 text-neutral-400'
            : 'bg-white border-neutral-200 text-neutral-500'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-800 dark:text-neutral-200">PowerWise Africa</span>
            <span aria-hidden="true">·</span>
            <span>Understand your power. Reduce your costs.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>NERC Band Tariffs</span>
            <span aria-hidden="true">·</span>
            <span>Solar & Battery Engineering</span>
            <span aria-hidden="true">·</span>
            <span>Vetted Providers</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <QuoteRequestModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        selectedProvider={selectedProviderForQuote}
        appliances={appliances}
        currency={currency}
        theme={theme}
      />

      <EnergyReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        appliances={appliances}
        tariffRateNGN={tariffRateNGN}
        currency={currency}
        theme={theme}
      />
    </div>
  );
}
