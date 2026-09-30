import React from 'react';
import { useStore } from '../../store/useStore';
import { AlertOctagon, ChevronRight } from 'lucide-react';

export const IncidentStrip: React.FC = () => {
  const { wards, selectWard, navigateScreen } = useStore();

  // Find if any ward is critical
  const criticalWard = wards.find(w => w.riskLevel === 'critical');

  if (!criticalWard) return null;

  return (
    <div
      onClick={() => {
        selectWard(criticalWard.id);
        navigateScreen('region_detail');
      }}
      className="h-9 w-full bg-sev-critical text-white px-4 flex items-center justify-between cursor-pointer select-none z-20 shrink-0 shadow-sm"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center gap-2.5 text-xs font-sans font-medium truncate">
        <span className="w-2 h-2 rounded-full bg-white shrink-0 animate-soft-pulse" />
        <span className="font-bold tracking-tight">Critical</span>
        <span className="opacity-70">·</span>
        <span>{criticalWard.name}</span>
        <span className="opacity-70">·</span>
        <span>
          River {criticalWard.riverLevelM} m ({criticalWard.datumBreachM > 0 ? `${criticalWard.datumBreachM} m above danger` : 'at danger mark'})
        </span>
      </div>

      <div className="flex items-center gap-1 text-xs font-sans font-semibold shrink-0 hover:underline">
        <span>Open sector</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </div>
  );
};
