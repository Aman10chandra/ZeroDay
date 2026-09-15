import React from 'react';
import { Home, Map, TriangleAlert, Radio, Settings } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'map', label: 'Map', icon: Map },
    { id: 'alerts', label: 'Alerts', icon: TriangleAlert, hasBadge: true },
    { id: 'sensors', label: 'Sensors', icon: Radio },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="sticky bottom-0 left-0 right-0 bg-white border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around z-30 select-none shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 min-w-[58px] transition-all ${
              isActive ? 'text-[#a83210]' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="relative">
              <Icon 
                className="w-5 h-5 transition-transform active:scale-90" 
                strokeWidth={isActive ? 2.3 : 1.9} 
              />
              {tab.hasBadge && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#dc2626] rounded-full border border-white" />
              )}
            </div>
            <span className={`text-[11px] mt-1 tracking-tight ${
              isActive ? 'font-bold text-[#a83210]' : 'font-medium text-slate-600'
            }`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
