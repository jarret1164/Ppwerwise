import React, { useState } from 'react';
import { EnergyProvider } from '../types/energy';
import { VERIFIED_PROVIDERS } from '../data/energyData';
import {
  ShieldCheck,
  Search,
  Star,
  Phone,
  Mail,
  MapPin,
  Clock,
  Award,
  CheckCircle,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { ThemeMode } from './Header';

interface ProviderDirectoryProps {
  theme: ThemeMode;
  onRequestQuoteWithProvider: (provider?: EnergyProvider) => void;
}

export const ProviderDirectory: React.FC<ProviderDirectoryProps> = ({
  theme,
  onRequestQuoteWithProvider,
}) => {
  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');

  const states = ['All', 'Lagos', 'Abuja (FCT)', 'Rivers', 'Oyo', 'Kano'];
  const specialties = [
    'All',
    'Residential Hybrid Solar',
    'LiFePO4 Lithium Upgrades',
    'Commercial Rooftop',
    'Prepaid Metering Protection',
    'Solar Water Pumping',
  ];

  const filteredProviders = VERIFIED_PROVIDERS.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesState = selectedState === 'All' || p.state === selectedState;
    const matchesSpecialty =
      selectedSpecialty === 'All' || p.specialties.includes(selectedSpecialty);

    return matchesSearch && matchesState && matchesSpecialty;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase opacity-70">
            <span>Trusted Partner Network</span>
            <span aria-hidden="true">·</span>
            <span>Vetted Clean Energy Providers</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
            Verified Solar & Energy Directory
          </h1>
          <p className="text-sm opacity-80 mt-1 max-w-3xl">
            Discover accredited solar installers, battery suppliers, and licensed electrical technicians across Nigeria. All listings are verified for professional standards, tax registration, and written warranties.
          </p>
        </div>

        <button
          onClick={() => onRequestQuoteWithProvider()}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-md shadow-xs transition-colors whitespace-nowrap shrink-0 ${
            isDark
              ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>General Sizing Quote Request</span>
        </button>
      </div>

      {/* Directory Trust Banner & Image Strip */}
      <div
        className={`rounded-xl border overflow-hidden ${
          isDark
            ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
            : 'bg-white border-neutral-200 shadow-xs text-neutral-900'
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-8 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>The PowerWise Africa Verification Standard</span>
            </div>
            <h2 className="text-xl font-bold">
              Protecting African Consumers From Counterfeit Panels & Substandard Inverters
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Nigeria loses millions annually to improperly sized batteries and uncertified technicians who wire motors directly into unbuffered pure sine wave inverters. Every listed provider undergoes rigorous verification:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
              <div className="space-y-1">
                <div className="font-bold flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>COREN / NEMSA Vetted</span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Certified electrical engineers and accredited solar technicians.
                </p>
              </div>

              <div className="space-y-1">
                <div className="font-bold flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Written Warranties</span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Minimum 3-year warranty on inverters and 5–10 years on solar panels.
                </p>
              </div>

              <div className="space-y-1">
                <div className="font-bold flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Tier-1 Hardware</span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Authorized distributors of Victron, Deye, SunSynk, Felicity & Jinko Solar.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 relative min-h-[180px] bg-neutral-900">
            <img
              src="/src/assets/images/solar_technician_service_1791980869012.jpg"
              alt="Certified solar installation technician in Nigeria"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:hidden" />
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div
        className={`p-4 sm:p-5 rounded-xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 ${
          isDark
            ? 'bg-neutral-900 border-neutral-800'
            : 'bg-white border-neutral-200 shadow-xs'
        }`}
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search installers by company name, city, or equipment brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 shrink-0">State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 shrink-0">Specialty:</span>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs focus:outline-none focus:border-emerald-500 cursor-pointer max-w-[180px]"
            >
              {specialties.map((sp) => (
                <option key={sp} value={sp}>
                  {sp}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProviders.length === 0 ? (
          <div className="col-span-full py-16 text-center text-neutral-400">
            No energy providers match your search criteria. Try clearing filters or expanding to all states.
          </div>
        ) : (
          filteredProviders.map((provider) => (
            <div
              key={provider.id}
              className={`p-6 rounded-xl border flex flex-col justify-between transition-all ${
                isDark
                  ? 'bg-neutral-900 border-neutral-800 text-neutral-100 hover:border-neutral-700'
                  : 'bg-white border-neutral-200 shadow-xs text-neutral-900 hover:border-neutral-300'
              }`}
            >
              <div>
                {/* Header: Name + Verified Marker */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base leading-snug">{provider.name}</h3>
                    {/* Zero-pill metadata */}
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{provider.city}, {provider.state}</span>
                      <span aria-hidden="true">·</span>
                      <span>{provider.yearsInBusiness} yrs exp</span>
                    </div>
                  </div>

                  {provider.verified && (
                    <div
                      className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0"
                      title="Verified Provider: COREN/NEMSA credentialed with physical office audit"
                    >
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-2 mt-3 text-xs">
                  <div className="flex items-center text-amber-500 font-mono font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                    {provider.rating.toFixed(1)}
                  </div>
                  <span className="text-neutral-400 font-mono">({provider.reviewCount} customer reviews)</span>
                  <span aria-hidden="true" className="text-neutral-400">·</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    {provider.warrantyYears} Yr Warranty
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-3 leading-relaxed">
                  {provider.description}
                </p>

                {/* Specialties rendered as clean text (no pill enclosures) */}
                <div className="mt-4 pt-3 border-t border-inherit/60">
                  <div className="text-[11px] font-semibold text-neutral-500 mb-1.5">Specializations:</div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-700 dark:text-neutral-300">
                    {provider.specialties.map((spec, i) => (
                      <span key={spec} className="inline-flex items-center">
                        {i > 0 && <span className="mr-2 text-neutral-400">/</span>}
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact & CTA */}
              <div className="mt-6 pt-4 border-t border-inherit/60 space-y-3">
                <div className="space-y-1 text-xs font-mono">
                  <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                    <Phone className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{provider.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                    <Mail className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="truncate">{provider.email}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRequestQuoteWithProvider(provider)}
                  className={`w-full py-2 px-3 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    isDark
                      ? 'bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-neutral-700'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Request Site Inspection Quote</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
