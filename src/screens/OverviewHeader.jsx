import React, { useState } from 'react';
import { ChevronDown, Bell, Settings } from 'lucide-react';

/**
 * OverviewHeader: Overview-specific variant of the top header.
 * - Shows territory switcher with dropdown.
 * - Plain muted text for user role (Admin / Resident) without bordered pill.
 * - Bell icon without duplicate alert badge (since Alerts tab already highlights it).
 * - Settings shortcut icon.
 */
export default function OverviewHeader({
  currentRegion = "All Territories",
  onSelectRegion,
  userRole = 'admin',
  onOpenSettings
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const regions = [
    "All Territories",
    "Rampur Ward",
    "Kosi Nagar",
    "Barauni East",
    "Darbhanga Block",
    "Samastipur Central",
    "Patna Canal Sector 3"
  ];

  return (
    <header className="relative flex items-center justify-between px-4 py-3 bg-[#FAF9F6] dark:bg-[#171B19] border-b border-[#D8D4CA] dark:border-[#2A302D] select-none text-[#1A1D1B] dark:text-[#ECEAE4] transition-colors">
      {/* Territory / Region Selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="min-h-[44px] flex items-center gap-1.5 text-base font-sans font-semibold tracking-tight hover:opacity-80 transition-opacity focus:outline-none"
          aria-expanded={dropdownOpen}
          aria-label="Select territory filter"
        >
          <span>{currentRegion}</span>
          <ChevronDown className="w-4 h-4 text-[#5C635E] dark:text-[#8A928D]" strokeWidth={1.5} />
        </button>

        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute left-0 mt-1 w-60 bg-[#FAF9F6] dark:bg-[#171B19] rounded-[8px] shadow-modal border border-[#D8D4CA] dark:border-[#2A302D] py-1 z-50">
              <div className="px-3 py-1.5 text-[11px] font-sans uppercase tracking-[0.06em] text-[#5C635E] dark:text-[#8A928D]">
                Territory
              </div>
              {regions.map((reg) => (
                <button
                  key={reg}
                  type="button"
                  onClick={() => {
                    if (onSelectRegion) onSelectRegion(reg);
                    setDropdownOpen(false);
                  }}
                  className={`w-full min-h-[40px] text-left px-3 py-2 text-sm font-sans flex items-center justify-between transition-colors ${
                    currentRegion === reg
                      ? 'bg-[#ECE9E2] dark:bg-[#2A302D] font-semibold text-[#1A1D1B] dark:text-[#ECEAE4]'
                      : 'text-[#5C635E] dark:text-[#8A928D] hover:bg-[#ECE9E2]/60 dark:hover:bg-[#2A302D]/60'
                  }`}
                >
                  <span className="truncate">{reg}</span>
                  {currentRegion === reg && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1A1D1B] dark:bg-[#ECEAE4] flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right controls: Role label (plain muted text), Bell (no dot), Settings */}
      <div className="flex items-center gap-3">
        {/* Role indicator: plain muted text with no bordered pill */}
        <span className="text-xs font-sans text-[#5C635E] dark:text-[#8A928D]">
          {userRole === 'admin' ? 'Admin' : 'Resident'}
        </span>

        {/* Bell Icon: No duplicate alert badge */}
        <div 
          className="p-1.5 text-[#5C635E] dark:text-[#8A928D] flex items-center justify-center"
          title="Alerts notification center"
        >
          <Bell className="w-5 h-5" strokeWidth={1.5} />
        </div>

        {/* Settings button */}
        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="min-h-[44px] min-w-[32px] flex items-center justify-center text-[#5C635E] dark:text-[#8A928D] hover:text-[#1A1D1B] dark:hover:text-[#ECEAE4] transition-colors focus:outline-none"
            title="Settings and system diagnostics"
            aria-label="Open settings and diagnostics"
          >
            <Settings className="w-4 h-4" strokeWidth={1.5} />
          </button>
        )}
      </div>
    </header>
  );
}
