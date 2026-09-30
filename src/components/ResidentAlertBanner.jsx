import React from 'react';
import { X, ArrowRight } from 'lucide-react';

export default function ResidentAlertBanner({ 
  alertData, 
  onViewRoute, 
  onDismiss 
}) {
  if (!alertData) return null;

  const shelterName = alertData.shelter?.name || "Govt. School Rampur";
  const shelterDist = alertData.shelter?.dist || "1.8 km";

  return (
    <aside 
      role="alert"
      className="sticky top-0 left-0 right-0 z-50 bg-[#FAF9F6] dark:bg-[#171B19] border-b border-[#D8D4CA] dark:border-[#2A302D] shadow-subtle"
    >
      {/* 3px full-width top border in severity-critical */}
      <div className="h-[3px] bg-[#C1271D] dark:bg-[#D9382E]" />

      <div className="bg-[#C1271D]/10 dark:bg-[#D9382E]/15">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              {/* Single 2s slow pulse status dot */}
              <span className="w-2 h-2 rounded-full bg-[#C1271D] dark:bg-[#D9382E] animate-slow-pulse mt-1 flex-shrink-0" />
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono tracking-[0.06em] uppercase font-semibold text-[#C1271D] dark:text-[#D9382E]">
                    CRITICAL DIRECTIVE
                  </span>
                  <span className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D]">
                    {alertData.timestamp || 'Active'}
                  </span>
                </div>

                {/* Plain-language action sentence */}
                <p className="text-sm font-semibold text-[#1A1D1B] dark:text-[#ECEAE4] leading-snug">
                  Move to {shelterName}. {shelterDist}, 24 min walk. Do not use river bridge.
                </p>
              </div>
            </div>

            <button
              onClick={onDismiss}
              className="p-1 text-[#5C635E] dark:text-[#8A928D] hover:text-[#1A1D1B] dark:hover:text-[#ECEAE4] transition-colors"
              title="Dismiss directive"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* Action Button */}
          <div className="mt-2.5 flex justify-end">
            <button
              onClick={() => {
                onViewRoute();
                onDismiss();
              }}
              className="h-9 px-3 bg-[#1A1D1B] dark:bg-[#ECEAE4] text-[#FAF9F6] dark:text-[#0F1211] text-xs font-semibold rounded-[8px] flex items-center gap-1.5 transition-calm hover:opacity-90"
            >
              <span>Open evacuation route</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
