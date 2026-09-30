import React, { useState } from 'react';
import { ChevronDown, WifiOff } from 'lucide-react';
import OverviewHeader from './OverviewHeader';
import OverviewStatusHero from './OverviewStatusHero';
import OverviewWardRow from './OverviewWardRow';

/**
 * HomeScreen (Overview Screen):
 * Calmer, more spacious, easy-to-scan mountain field instrument.
 * - Single focal hero with 6% subtle tint and no inner dividers.
 * - One-line summary strip with tabular numerals and wifi-off offline indicator.
 * - Unified territories list in ONE container with 1px dividers and 8px radius.
 * - Sort dropdown menu replacing the segmented control.
 * - Severity color strictly reserved for meaning.
 */
export default function HomeScreen({
  onSelectRegionDetail,
  onOpenSettings,
  userRole = 'admin'
}) {
  // Territory filter from header
  const [selectedTerritoryFilter, setSelectedTerritoryFilter] = useState('All Territories');

  // Sorting mode: 'severity' | 'name' | 'rainfall'
  const [sortMode, setSortMode] = useState('severity');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  // Diagnostic states
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [errorState, setErrorState] = useState(null);

  // Monitored territories dataset
  const territories = [
    {
      id: 'rampur',
      name: 'Rampur Ward',
      sector: 'Sector 4B Basin',
      telemetry: '62 mm/h',
      rainValue: 62,
      reason: 'River datum exceeded +1.6m',
      severity: 'critical',
      trend: '+18%/h',
      trendDirection: 'rising',
      isHeroAlert: true,
    },
    {
      id: 'kosi',
      name: 'Kosi Nagar',
      sector: 'Sector 2 Ridge',
      telemetry: '48 mm/h',
      rainValue: 48,
      reason: 'Lowland inundation warning',
      severity: 'warning',
      trend: '+11%/h',
      trendDirection: 'rising',
    },
    {
      id: 'barauni',
      name: 'Barauni East',
      sector: 'Sector 1 Inflow',
      telemetry: '31 mm/h',
      rainValue: 31,
      reason: 'Gauge rising steadily',
      severity: 'advisory',
      trend: '+6%/h',
      trendDirection: 'rising',
    },
    {
      id: 'darbhanga',
      name: 'Darbhanga Block',
      sector: 'Sector 5 Valley',
      telemetry: '24 mm/h',
      rainValue: 24,
      reason: 'Drainage watch active',
      severity: 'advisory',
      trend: '0%/h',
      trendDirection: 'steady',
    },
    {
      id: 'samastipur',
      name: 'Samastipur Central',
      sector: 'Sector 3 Plateau',
      telemetry: '11 mm/h',
      rainValue: 11,
      reason: 'Stream velocity nominal',
      severity: 'safe',
      trend: '-4%/h',
      trendDirection: 'falling',
    },
    {
      id: 'patna',
      name: 'Patna Canal Sector 3',
      sector: 'Sector 6 Outlet',
      telemetry: '04 mm/h',
      rainValue: 4,
      reason: 'Within seasonal baseline',
      severity: 'safe',
      trend: '-2%/h',
      trendDirection: 'falling',
    },
  ];

  // Primary critical and warning items for hero calculation
  const criticalWard = territories.find(t => t.severity === 'critical');
  const warningWard = territories.find(t => t.severity === 'warning');

  // Filter territories if single territory is picked from the header
  const filteredTerritories = selectedTerritoryFilter === 'All Territories'
    ? territories
    : territories.filter(t => t.name.toLowerCase().includes(selectedTerritoryFilter.toLowerCase()));

  // Sorting
  const getSortedList = () => {
    const list = [...filteredTerritories];
    if (sortMode === 'name') {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortMode === 'rainfall') {
      return list.sort((a, b) => b.rainValue - a.rainValue);
    }
    // Default 'severity' sort: critical first, then warning, advisory, safe
    const order = { critical: 0, warning: 1, advisory: 2, safe: 3 };
    return list.sort((a, b) => order[a.severity] - order[b.severity]);
  };

  const sortedTerritories = getSortedList();

  const sortLabels = {
    severity: 'Severity',
    name: 'Name',
    rainfall: 'Rainfall'
  };

  return (
    <div className="flex flex-col min-h-full bg-[#FAF9F6] dark:bg-[#171B19] text-[#1A1D1B] dark:text-[#ECEAE4] pb-24 pb-[calc(5rem+env(safe-area-inset-bottom))] transition-colors">
      {/* Overview-specific Header: territory filter, plain role, no duplicate bell dot */}
      <OverviewHeader
        currentRegion={selectedTerritoryFilter}
        onSelectRegion={(reg) => setSelectedTerritoryFilter(reg)}
        userRole={userRole}
        onOpenSettings={onOpenSettings}
      />

      <div className="p-4">
        {/* Error State */}
        {errorState ? (
          <section className="p-4 border border-[#C1271D] dark:border-[#D9382E] rounded-[8px] bg-[#C1271D]/[0.06] dark:bg-[#D9382E]/[0.08] flex flex-col gap-3">
            <div>
              <h2 className="text-base font-sans font-semibold text-[#C1271D] dark:text-[#D9382E]">
                Telemetry stream unavailable
              </h2>
              <p className="text-sm font-sans text-[#1A1D1B] dark:text-[#ECEAE4] mt-0.5">
                {errorState}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setErrorState(null);
                setIsLoading(true);
                setTimeout(() => setIsLoading(false), 400);
              }}
              className="min-h-[44px] px-4 py-2 bg-[#1A1D1B] dark:bg-[#ECEAE4] text-[#FAF9F6] dark:text-[#171B19] rounded-[8px] font-sans font-semibold text-sm self-start transition-opacity hover:opacity-90"
            >
              Retry gateway sync
            </button>
          </section>
        ) : (
          <>
            {/* Hero Block (16px rhythm below header) */}
            <OverviewStatusHero
              criticalWard={criticalWard}
              warningWard={warningWard}
              onOpenWard={onSelectRegionDetail}
              onDispatchRoute={() => onSelectRegionDetail && onSelectRegionDetail('rampur')}
              userRole={userRole}
              isOffline={isOffline}
              offlineTime="14:02"
            />

            {/* Summary Strip (12px gap below hero, 14px sans with tabular numerals) */}
            <section
              aria-label="Telemetry summary counts"
              className="mt-3 min-h-[44px] flex items-center justify-between text-[14px] font-sans text-[#5C635E] dark:text-[#8A928D] tabular-nums px-1"
            >
              {/* Left: Active alerts link (44px tap target) */}
              <button
                type="button"
                onClick={() => onSelectRegionDetail && onSelectRegionDetail('rampur')}
                className="min-h-[44px] flex items-center gap-1.5 text-[14px] font-sans text-[#5C635E] dark:text-[#8A928D] hover:text-[#1A1D1B] dark:hover:text-[#ECEAE4] transition-colors focus:outline-none"
              >
                <span className="font-semibold text-[#1A1D1B] dark:text-[#ECEAE4]">5</span>
                <span>active alerts</span>
              </button>

              {/* Right: Sensor telemetry online / offline count with WifiOff icon */}
              <div className="min-h-[44px] flex items-center gap-1.5 text-[14px] font-sans text-[#5C635E] dark:text-[#8A928D]">
                <span>42 of 45 sensors online</span>
                <span className="text-[#5C635E] dark:text-[#8A928D]">·</span>
                <span className="flex items-center gap-1 text-[#D2620A] dark:text-[#E6731B] font-medium">
                  <WifiOff className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>3 offline</span>
                </span>
              </div>
            </section>

            {/* Territories Section (24px gap above) */}
            <section aria-label="Monitored territories" className="mt-6">
              {/* Section Header: "Territories 6" + sort dropdown button */}
              <div className="flex items-center justify-between px-1 relative">
                <div className="text-[14px] font-sans font-semibold text-[#1A1D1B] dark:text-[#ECEAE4]">
                  Territories <span className="text-[#5C635E] dark:text-[#8A928D] font-normal ml-0.5">{sortedTerritories.length}</span>
                </div>

                {/* Sort selector button with chevron */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSortMenuOpen(!sortMenuOpen)}
                    className="min-h-[44px] flex items-center gap-1 text-[13px] font-sans text-[#5C635E] dark:text-[#8A928D] hover:text-[#1A1D1B] dark:hover:text-[#ECEAE4] transition-colors focus:outline-none"
                    aria-expanded={sortMenuOpen}
                    aria-label="Sort territories"
                  >
                    <span>{sortLabels[sortMode]}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#5C635E] dark:text-[#8A928D]" strokeWidth={1.5} />
                  </button>

                  {/* Dropdown Menu */}
                  {sortMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setSortMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-1 w-36 bg-[#FAF9F6] dark:bg-[#171B19] rounded-[8px] shadow-modal border border-[#D8D4CA] dark:border-[#2A302D] py-1 z-50">
                        {['severity', 'name', 'rainfall'].map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => {
                              setSortMode(mode);
                              setSortMenuOpen(false);
                            }}
                            className={`w-full min-h-[38px] text-left px-3 py-1.5 text-xs font-sans flex items-center justify-between transition-colors ${
                              sortMode === mode
                                ? 'bg-[#ECE9E2] dark:bg-[#2A302D] font-semibold text-[#1A1D1B] dark:text-[#ECEAE4]'
                                : 'text-[#5C635E] dark:text-[#8A928D] hover:bg-[#ECE9E2]/60 dark:hover:bg-[#2A302D]/60'
                            }`}
                          >
                            <span>{sortLabels[mode]}</span>
                            {sortMode === mode && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#1A1D1B] dark:bg-[#ECEAE4]" />
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Single List Container (8px gap below header, 1px border, 8px radius, hairline dividers) */}
              <div className="mt-2 border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] bg-[#FAF9F6] dark:bg-[#171B19] divide-y divide-[#D8D4CA] dark:divide-[#2A302D] overflow-hidden">
                {isLoading ? (
                  /* Loading Skeletons */
                  [1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="min-h-[64px] py-3 px-4 flex items-center justify-between animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-[#D8D4CA] dark:bg-[#2A302D]" />
                        <div className="space-y-1.5">
                          <div className="w-28 h-3.5 bg-[#D8D4CA] dark:bg-[#2A302D] rounded-[4px]" />
                          <div className="w-44 h-3 bg-[#D8D4CA] dark:bg-[#2A302D] rounded-[4px]" />
                        </div>
                      </div>
                      <div className="w-16 h-4 bg-[#D8D4CA] dark:bg-[#2A302D] rounded-[4px]" />
                    </div>
                  ))
                ) : (
                  sortedTerritories.map((t) => (
                    <OverviewWardRow
                      key={t.id}
                      territory={t}
                      onSelect={onSelectRegionDetail}
                    />
                  ))
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
