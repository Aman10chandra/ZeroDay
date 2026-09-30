import React from 'react';
import clsx from 'clsx';

interface GaugeProps {
  currentLevelM: number;
  dangerMarkM: number;
  maxLevelM?: number;
  className?: string;
}

export const Gauge: React.FC<GaugeProps> = ({
  currentLevelM,
  dangerMarkM,
  maxLevelM = 7.0,
  className,
}) => {
  const isBreached = currentLevelM >= dangerMarkM;
  const pct = Math.min(100, Math.max(0, (currentLevelM / maxLevelM) * 100));
  const dangerPct = Math.min(100, Math.max(0, (dangerMarkM / maxLevelM) * 100));

  return (
    <div className={clsx("flex items-center gap-3 font-mono", className)}>
      {/* Vertical Gauge Bar */}
      <div className="relative w-8 h-40 bg-zd-base border border-zd-border rounded-[6px] overflow-hidden flex flex-col justify-end p-0.5">
        {/* Fill with eased wave top */}
        <div
          style={{ height: `${pct}%`, transition: 'height 0.8s cubic-bezier(0.22, 1, 0.36, 1)' }}
          className={clsx(
            "w-full rounded-b-[4px] relative overflow-hidden",
            isBreached ? "bg-sev-critical" : "bg-[#3882A8]"
          )}
        >
          {/* Animated wave sheen */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/30 animate-pulse" />
        </div>

        {/* Danger Threshold Line */}
        <div
          style={{ bottom: `${dangerPct}%` }}
          className="absolute left-0 right-0 h-[1.5px] border-b border-dashed border-sev-critical z-10"
        />
      </div>

      {/* Numerical readouts */}
      <div className="flex flex-col justify-between h-40 text-xs">
        <div>
          <span className="text-micro font-sans text-zd-muted block">Maximum Datum</span>
          <span className="text-zd-dim text-[11px]">{maxLevelM.toFixed(1)} m</span>
        </div>

        <div className="py-1">
          <span className="text-micro font-sans text-sev-critical font-medium block">
            Danger Mark
          </span>
          <span className="text-sev-critical text-xs font-bold">
            {dangerMarkM.toFixed(1)} m
          </span>
        </div>

        <div>
          <span className="text-micro font-sans text-zd-muted block">Current Stage</span>
          <span className={clsx(
            "text-base font-bold",
            isBreached ? "text-sev-critical font-bold" : "text-zd-text"
          )}>
            {currentLevelM.toFixed(2)} m
          </span>
        </div>
      </div>
    </div>
  );
};
