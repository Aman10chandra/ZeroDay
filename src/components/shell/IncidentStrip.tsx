import React from 'react';
import { useStore } from '../../store/useStore';
import { ChevronRight } from 'lucide-react';

export const IncidentStrip: React.FC = () => {
  const { wards, selectWard, navigateScreen, activeScreen } = useStore();

  // Find if any ward is critical
  const criticalWard = wards.find(w => w.riskLevel === 'critical');

  // Display only when there is a critical ward and on the overview screen to avoid cognitive overload on detailed sub-screens
  if (!criticalWard || activeScreen !== 'overview') return null;

  return (
    <div
      style={{ gridArea: 'strip' }}
      className="h-9 w-full bg-sev-critical-dim border-b border-sev-critical/30 text-zd-text px-5 flex items-center justify-between select-none z-20 shrink-0"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center gap-2.5 text-xs font-sans truncate">
        {/* 6px Red Dot */}
        <span className="w-2 h-2 rounded-full bg-sev-critical shrink-0 animate-soft-pulse" />
        <span className="font-semibold text-sev-critical">Critical incident</span>
        <span className="text-zd-dim">·</span>
        <span className="font-medium text-zd-text">{criticalWard.name}</span>
        <span className="text-zd-dim">·</span>
        <span className="text-zd-muted font-sans">
          River <span className="font-mono tabular-nums font-semibold text-zd-text">{criticalWard.riverLevelM} m</span> ({criticalWard.datumBreachM > 0 ? (
            <span className="font-mono tabular-nums text-sev-critical font-medium">+{criticalWard.datumBreachM} m above danger</span>
          ) : 'at danger mark'})
        </span>
        <span className="text-zd-dim hidden sm:inline">·</span>
        <span className="text-zd-muted hidden sm:inline font-sans">
          <span className="font-mono tabular-nums text-zd-text">{criticalWard.householdsAtRisk.toLocaleString()}</span> households at risk
        </span>
      </div>

      <button
        onClick={() => {
          selectWard(criticalWard.id);
          navigateScreen('region_detail');
        }}
        className="flex items-center gap-1 text-xs font-sans font-medium text-sev-critical hover:text-white transition-colors shrink-0 pl-3 focus:outline-none"
      >
        <span>Open region</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
