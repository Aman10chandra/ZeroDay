import React from 'react';
import { Compass, Map, AlertTriangle, FileText, SlidersHorizontal } from 'lucide-react';

/**
 * BottomNav:
 * 5 equal-width tabs: Overview, Map, Alerts, Reports, Tools.
 * - Flat full-width bar with 1px top border, no rounded bottom outline.
 * - 56px height + env(safe-area-inset-bottom) inside.
 * - Full-width 2px top active indicator line.
 * - 44px+ touch targets with non-wrapping 11px labels.
 * - Tools tab highlighted on Tools and its sub-screens.
 * - Alerts dot and Tools critical status dot.
 */
export default function BottomNav({ 
  activeTab, 
  onTabChange,
  toolsSeverity = 'critical' // 'critical' | 'warning' | 'safe'
}) {
  const tabs = [
    { id: 'home', label: 'Overview', icon: Compass },
    { id: 'map', label: 'Map', icon: Map },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, hasBadge: true, badgeColor: 'bg-[#C1271D] dark:bg-[#D9382E]' },
    { id: 'reports', label: 'Reports', icon: FileText },
    { 
      id: 'tools', 
      label: 'Tools', 
      icon: SlidersHorizontal, 
      hasBadge: toolsSeverity === 'critical' || toolsSeverity === 'warning',
      badgeColor: toolsSeverity === 'critical' 
        ? 'bg-[#C1271D] dark:bg-[#D9382E]' 
        : 'bg-[#D2620A] dark:bg-[#E6731B]'
    },
  ];

  return (
    <nav 
      aria-label="Primary navigation"
      className="sticky bottom-0 left-0 right-0 w-full h-14 bg-[#FAF9F6] dark:bg-[#171B19] border-t border-[#D8D4CA] dark:border-[#2A302D] flex items-stretch z-30 select-none box-content pb-[env(safe-area-inset-bottom)] transition-colors"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 h-full min-w-0 relative flex flex-col items-center justify-center transition-colors duration-150 focus:outline-none ${
              isActive 
                ? 'text-[#1A1D1B] dark:text-[#ECEAE4]' 
                : 'text-[#5C635E] dark:text-[#8A928D] hover:text-[#1A1D1B] dark:hover:text-[#ECEAE4]'
            }`}
          >
            {/* Active state = 2px top indicator line spanning FULL slot width */}
            {isActive && (
              <span className="absolute top-0 left-0 right-0 h-[2px] bg-[#1A1D1B] dark:bg-[#ECEAE4]" />
            )}

            <div className="relative flex items-center justify-center">
              <Icon 
                className="w-5 h-5" 
                strokeWidth={1.5} 
              />
              {tab.hasBadge && (
                <span className={`absolute -top-0.5 -right-1 w-2 h-2 rounded-full ${tab.badgeColor}`} />
              )}
            </div>
            
            <span className={`text-[11px] leading-none mt-1 font-sans whitespace-nowrap tracking-tight ${
              isActive ? 'font-semibold' : 'font-normal'
            }`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
