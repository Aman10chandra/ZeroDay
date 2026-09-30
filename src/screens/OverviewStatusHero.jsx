import React from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * OverviewStatusHero:
 * Refined single hero block for immediate 2-second comprehension.
 * - Single subtle tint (~6% opacity).
 * - 3px top border in critical, 8px radius, 16px padding.
 * - No inner divider lines.
 * - Headline on ONE line: "Rampur Ward is critical".
 * - One muted sentence under headline.
 * - 3-column readings with 28px mono numbers, 13px muted units, 12px muted labels beneath.
 * - Stacked full-width actions: 48px primary button + 44px text link with Lucide ArrowRight.
 * - Tappable card container to Region Detail.
 */
export default function OverviewStatusHero({
  criticalWard,
  warningWard,
  onOpenWard,
  onDispatchRoute,
  userRole = 'admin',
  isOffline = false,
  offlineTime = '14:02'
}) {
  const hasCritical = Boolean(criticalWard);
  const hasWarning = !hasCritical && Boolean(warningWard);

  // Fallback neutral state when all wards are safe
  if (!hasCritical && !hasWarning) {
    return (
      <section
        onClick={() => onOpenWard && onOpenWard('rampur')}
        className="cursor-pointer border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] bg-[#FAF9F6] dark:bg-[#171B19] p-4 flex flex-col gap-3 transition-colors hover:border-[#1A1D1B] dark:hover:border-[#ECEAE4]"
        aria-label="District operational status"
      >
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2E7D4F] dark:bg-[#3FA66A] flex-shrink-0" />
            <span className="text-[12px] font-sans font-semibold text-[#2E7D4F] dark:text-[#3FA66A]">
              All territories nominal
            </span>
          </div>
          <span className="text-[12px] font-sans text-[#5C635E] dark:text-[#8A928D]">
            Updated 5s ago
          </span>
        </div>

        <div>
          <h1 className="text-[20px] font-sans font-semibold text-[#1A1D1B] dark:text-[#ECEAE4] leading-snug">
            All territories within limits
          </h1>
          <p className="text-[14px] font-sans text-[#5C635E] dark:text-[#8A928D] mt-1 leading-normal">
            River discharge rates and telemetry sensors operating within seasonal baselines.
          </p>
        </div>
      </section>
    );
  }

  // Critical Incident State
  if (hasCritical) {
    return (
      <section
        onClick={() => onOpenWard && onOpenWard(criticalWard.id || 'rampur')}
        className="cursor-pointer border-t-[3px] border-t-[#C1271D] dark:border-t-[#D9382E] border-x border-b border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] bg-[#C1271D]/[0.06] dark:bg-[#D9382E]/[0.08] p-4 flex flex-col gap-3 transition-colors"
        aria-label="Critical incident directive"
      >
        {/* Row 1: Status dot + Critical incident (left) | Last updated (right) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C1271D] dark:bg-[#D9382E] animate-slow-pulse flex-shrink-0" />
            <span className="text-[12px] font-sans font-semibold text-[#C1271D] dark:text-[#D9382E]">
              Critical incident
            </span>
          </div>

          <div>
            {isOffline ? (
              <span className="text-[12px] font-sans text-[#5C635E] dark:text-[#8A928D]">
                Offline. Showing data from <span className="font-mono">{offlineTime}</span>
              </span>
            ) : (
              <span className="text-[12px] font-sans text-[#5C635E] dark:text-[#8A928D]">
                Updated 3s ago
              </span>
            )}
          </div>
        </div>

        {/* Headline on ONE line */}
        <h1 className="text-[20px] font-sans font-semibold text-[#1A1D1B] dark:text-[#ECEAE4] truncate leading-snug">
          Rampur Ward is critical
        </h1>

        {/* One muted sentence under headline (tabular numbers in sans) */}
        <p className="text-[14px] font-sans text-[#5C635E] dark:text-[#8A928D] leading-normal tabular-nums -mt-1">
          River 4.8 m, 1.6 m above danger level. Evacuation route is ready.
        </p>

        {/* Key Readings: 3 columns, 28px mono number, 13px muted unit, 12px muted label beneath */}
        <div className="grid grid-cols-3 gap-2 pt-1 pb-1">
          {/* Column 1: River level */}
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-[28px] font-mono font-semibold text-[#1A1D1B] dark:text-[#ECEAE4] tabular-nums leading-none">
                4.8
              </span>
              <span className="text-[13px] font-sans text-[#5C635E] dark:text-[#8A928D]">
                m
              </span>
            </div>
            <div className="text-[12px] font-sans text-[#5C635E] dark:text-[#8A928D] mt-1 leading-tight">
              River level
            </div>
          </div>

          {/* Column 2: Rainfall */}
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-[28px] font-mono font-semibold text-[#1A1D1B] dark:text-[#ECEAE4] tabular-nums leading-none">
                62
              </span>
              <span className="text-[13px] font-sans text-[#5C635E] dark:text-[#8A928D]">
                mm/h
              </span>
            </div>
            <div className="text-[12px] font-sans text-[#5C635E] dark:text-[#8A928D] mt-1 leading-tight">
              Rainfall
            </div>
          </div>

          {/* Column 3: Households at risk */}
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-[28px] font-mono font-semibold text-[#1A1D1B] dark:text-[#ECEAE4] tabular-nums leading-none">
                1,240
              </span>
            </div>
            <div className="text-[12px] font-sans text-[#5C635E] dark:text-[#8A928D] mt-1 leading-tight">
              Households at risk
            </div>
          </div>
        </div>

        {/* Actions: Stacked full-width, no button text wrapping */}
        <div 
          className="flex flex-col gap-1.5 pt-1"
          onClick={(e) => e.stopPropagation()}
        >
          {userRole === 'admin' ? (
            <>
              {/* Primary action: Solid critical background, 48px tall */}
              <button
                type="button"
                onClick={() => onDispatchRoute ? onDispatchRoute() : (onOpenWard && onOpenWard('rampur'))}
                className="w-full min-h-[48px] h-12 rounded-[8px] bg-[#C1271D] dark:bg-[#D9382E] text-white font-sans font-semibold text-sm px-4 flex items-center justify-center whitespace-nowrap transition-opacity hover:opacity-90 active:opacity-75 focus:outline-none"
              >
                Dispatch evacuation route
              </button>

              {/* Secondary text-only link: 44px tap area */}
              <button
                type="button"
                onClick={() => onOpenWard && onOpenWard(criticalWard.id || 'rampur')}
                className="min-h-[44px] flex items-center justify-center sm:justify-start gap-1 text-sm font-sans font-medium text-[#1A1D1B] dark:text-[#ECEAE4] hover:underline focus:outline-none"
              >
                <span>Open Rampur Ward</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </>
          ) : (
            <>
              {/* Resident primary action: Ink background, 48px tall */}
              <button
                type="button"
                onClick={() => onOpenWard && onOpenWard('rampur')}
                className="w-full min-h-[48px] h-12 rounded-[8px] bg-[#1A1D1B] dark:bg-[#ECEAE4] text-[#FAF9F6] dark:text-[#171B19] font-sans font-semibold text-sm px-4 flex items-center justify-center whitespace-nowrap transition-opacity hover:opacity-90 active:opacity-75 focus:outline-none"
              >
                View escape route
              </button>

              {/* Secondary text-only link */}
              <button
                type="button"
                onClick={() => onOpenWard && onOpenWard(criticalWard.id || 'rampur')}
                className="min-h-[44px] flex items-center justify-center sm:justify-start gap-1 text-sm font-sans font-medium text-[#1A1D1B] dark:text-[#ECEAE4] hover:underline focus:outline-none"
              >
                <span>Open Rampur Ward</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </>
          )}
        </div>
      </section>
    );
  }

  // Warning Incident State Fallback
  return (
    <section
      onClick={() => onOpenWard && onOpenWard(warningWard.id || 'kosi')}
      className="cursor-pointer border-t-[3px] border-t-[#D2620A] dark:border-t-[#E6731B] border-x border-b border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] bg-[#D2620A]/[0.06] dark:bg-[#E6731B]/[0.08] p-4 flex flex-col gap-3 transition-colors"
      aria-label="Warning incident directive"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#D2620A] dark:bg-[#E6731B] flex-shrink-0" />
          <span className="text-[12px] font-sans font-semibold text-[#D2620A] dark:text-[#E6731B]">
            Territory warning
          </span>
        </div>
        <span className="text-[12px] font-sans text-[#5C635E] dark:text-[#8A928D]">
          Updated 5s ago
        </span>
      </div>

      <h1 className="text-[20px] font-sans font-semibold text-[#1A1D1B] dark:text-[#ECEAE4] truncate leading-snug">
        {warningWard.name} is on watch
      </h1>

      <p className="text-[14px] font-sans text-[#5C635E] dark:text-[#8A928D] leading-normal tabular-nums -mt-1">
        Precipitation reached {warningWard.telemetry}. Sluice gates monitored continuously.
      </p>

      <div 
        className="flex flex-col gap-1.5 pt-1"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onOpenWard && onOpenWard(warningWard.id)}
          className="w-full min-h-[48px] h-12 rounded-[8px] bg-[#1A1D1B] dark:bg-[#ECEAE4] text-[#FAF9F6] dark:text-[#171B19] font-sans font-semibold text-sm px-4 flex items-center justify-center whitespace-nowrap transition-opacity hover:opacity-90 active:opacity-75 focus:outline-none"
        >
          Open {warningWard.name}
        </button>
      </div>
    </section>
  );
}
