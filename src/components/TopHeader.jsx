import React from 'react';
import { MapPin, ChevronDown, Bell, User } from 'lucide-react';

export default function TopHeader({ 
  currentRegion = "All Regions", 
  onSelectRegion,
  unreadAlerts = 2 
}) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const regions = ["All Regions", "Rampur Ward", "Kosi Nagar", "Barauni East", "Darbhanga Block", "Samastipur Central", "Patna Canal"];

  return (
    <header className="relative flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 select-none">
      {/* Region Selector */}
      <div className="relative">
        <button 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-1.5 text-[#1e293b] font-bold text-[18px] tracking-tight hover:opacity-80 transition-opacity"
        >
          <MapPin className="w-5 h-5 text-[#c2410c]" strokeWidth={2.4} />
          <span>{currentRegion}</span>
          <ChevronDown className="w-4 h-4 text-slate-700 ml-0.5" strokeWidth={2.6} />
        </button>

        {dropdownOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setDropdownOpen(false)} 
            />
            <div className="absolute left-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Select Territory
              </div>
              {regions.map((reg) => (
                <button
                  key={reg}
                  onClick={() => {
                    if (onSelectRegion) onSelectRegion(reg);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-sm flex items-center justify-between transition-colors ${
                    currentRegion === reg 
                      ? 'bg-orange-50 font-semibold text-[#c2410c]' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{reg}</span>
                  {currentRegion === reg && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c]" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right Icons: Bell, RK, User avatar */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button 
          className="relative p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
          title="Alert Notifications"
        >
          <Bell className="w-5 h-5 text-slate-700" strokeWidth={2} />
          {unreadAlerts > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#dc2626] rounded-full border-2 border-white" />
          )}
        </button>

        {/* User initials badge "RK" */}
        <div className="w-8 h-8 rounded-full bg-[#ffedd5] flex items-center justify-center text-[#9a3412] font-semibold text-xs border border-[#fed7aa] cursor-pointer hover:scale-105 transition-transform">
          RK
        </div>

        {/* Deep burnt-orange profile circle */}
        <button className="w-8 h-8 rounded-full bg-[#9a3412] text-white flex items-center justify-center shadow-sm hover:opacity-90 transition-opacity">
          <User className="w-4 h-4 fill-white text-white" />
        </button>
      </div>
    </header>
  );
}
