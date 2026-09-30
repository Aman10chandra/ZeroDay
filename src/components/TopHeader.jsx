import React, { useState } from 'react';
import { ChevronDown, Bell, Settings } from 'lucide-react';

export default function TopHeader({ 
  currentRegion = "All Regions", 
  onSelectRegion,
  unreadAlerts = 2,
  userRole = 'admin',
  onOpenSettings
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const regions = ["All Regions", "Rampur Ward", "Kosi Nagar", "Barauni East", "Darbhanga Block", "Samastipur Central", "Patna Canal"];

  return (
    <header className="relative w-full bg-[#FAF9F6] dark:bg-[#171B19] border-b border-[#D8D4CA] dark:border-[#2A302D] select-none text-[#1A1D1B] dark:text-[#ECEAE4] transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between">
        {/* Territory / Region Selector */}
        <div className="relative">
        <button 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-1.5 text-base font-semibold tracking-tight hover:opacity-80 transition-opacity"
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
            <div className="absolute left-0 mt-1.5 w-56 bg-[#FAF9F6] dark:bg-[#171B19] rounded-[8px] shadow-modal border border-[#D8D4CA] dark:border-[#2A302D] py-1 z-50">
              <div className="px-3 py-1 text-[11px] font-mono uppercase tracking-[0.06em] text-[#5C635E] dark:text-[#8A928D]">
                Territory
              </div>
              {regions.map((reg) => (
                <button
                  key={reg}
                  onClick={() => {
                    if (onSelectRegion) onSelectRegion(reg);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${
                    currentRegion === reg 
                      ? 'bg-[#ECE9E2] dark:bg-[#2A302D] font-semibold text-[#1A1D1B] dark:text-[#ECEAE4]' 
                      : 'text-[#5C635E] dark:text-[#8A928D] hover:bg-[#ECE9E2]/60 dark:hover:bg-[#2A302D]/60'
                  }`}
                >
                  <span>{reg}</span>
                  {currentRegion === reg && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1A1D1B] dark:bg-[#ECEAE4]" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right: Role indicator label, Notifications, Settings */}
      <div className="flex items-center gap-3">
        {/* Role indicator: small text label */}
        <span className="text-[11px] font-mono tracking-wider uppercase text-[#5C635E] dark:text-[#8A928D] px-1.5 py-0.5 border border-[#D8D4CA] dark:border-[#2A302D] rounded-[4px]">
          {userRole === 'admin' ? 'Admin' : 'Resident'}
        </span>

        {/* Alert Bell */}
        <div className="relative">
          <Bell className="w-5 h-5 text-[#5C635E] dark:text-[#8A928D]" strokeWidth={1.5} />
          {unreadAlerts > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#C1271D] dark:bg-[#D9382E]" />
          )}
        </div>

        {/* Settings button */}
        {onOpenSettings && (
          <button 
            onClick={onOpenSettings}
            className="p-1 rounded text-[#5C635E] dark:text-[#8A928D] hover:text-[#1A1D1B] dark:hover:text-[#ECEAE4] transition-colors"
            title="Settings and system diagnostics"
          >
            <Settings className="w-4 h-4" strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  </header>
  );
}
