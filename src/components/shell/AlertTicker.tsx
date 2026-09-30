import React from 'react';
import { AlertTriangle, AlertOctagon, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const AlertTicker: React.FC = () => {
  const { wards, selectWard, navigateScreen, strobeEnabled, sirenActive } = useStore();

  // Find wards in critical or warning
  const criticalWards = wards.filter(w => w.riskLevel === 'critical');
  const warningWards = wards.filter(w => w.riskLevel === 'warning');
  const activeAlertWards = [...criticalWards, ...warningWards];

  if (activeAlertWards.length === 0) return null;

  const topWard = activeAlertWards[0];
  const isCritical = topWard.riskLevel === 'critical';

  return (
    <div
      onClick={() => {
        selectWard(topWard.id);
        navigateScreen('region_detail');
      }}
      className={`h-8 w-full border-b flex items-center justify-between px-3 cursor-pointer select-none transition-colors duration-150 ${
        isCritical 
          ? (sirenActive && strobeEnabled ? 'animate-siren-strobe border-sev-critical/60 bg-sev-critical-dim text-sev-critical' : 'border-sev-critical/40 bg-sev-critical-dim text-sev-critical')
          : 'border-sev-warning/40 bg-sev-warning-dim text-sev-warning'
      }`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center gap-2.5 overflow-hidden">
        <span className={`w-2 h-2 rounded-full shrink-0 ${isCritical ? 'bg-sev-critical animate-live-pulse' : 'bg-sev-warning'}`} />
        
        {isCritical ? (
          <AlertOctagon className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
        ) : (
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
        )}

        <div className="flex items-center gap-2 text-xs truncate font-mono">
          <span className="font-bold uppercase tracking-wider">
            {isCritical ? 'CRITICAL EVACUATION DIRECTIVE' : 'ELEVATED HAZARD ADVISORY'}:
          </span>
          <span className="text-zd-text font-semibold truncate">
            {topWard.name} ({topWard.code})
          </span>
          <span className="opacity-40">|</span>
          <span className="text-zd-muted truncate">
            Datum Breach: +{topWard.datumBreachM > 0 ? topWard.datumBreachM : 0}m · Rain: {topWard.rainfall1h} mm/h · 1,240 households threatened
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 text-[11px] font-mono shrink-0 pl-2 text-zd-text font-semibold hover:underline">
        <span>Open Sector Console</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </div>
  );
};
