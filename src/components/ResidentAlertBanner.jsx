import React from 'react';
import { ShieldAlert, ArrowRight, X, Radio, MapPin } from 'lucide-react';

export default function ResidentAlertBanner({ 
  alertData, 
  onViewRoute, 
  onDismiss 
}) {
  if (!alertData) return null;

  return (
    <div className="fixed top-12 left-4 right-4 z-50 animate-in slide-in-from-top duration-300">
      <div className="bg-[#881337] text-white rounded-2xl p-4 shadow-2xl border border-rose-400/30 flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-4 h-4 text-rose-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-500/30 text-rose-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                  SDRF DIRECTIVE · CAP V1.2
                </span>
                <span className="text-[10px] text-rose-300 font-mono">
                  {alertData.timestamp || 'Live'}
                </span>
              </div>
              <h4 className="text-[14px] font-bold tracking-tight mt-0.5 text-white">
                Evacuation Corridor Dispatched
              </h4>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="p-1 rounded-lg hover:bg-white/10 text-rose-200 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[12px] text-rose-100 font-normal leading-relaxed">
          {alertData.note || `Rampur Ward retention gauge exceeded safe datum by 1.6m. Immediate evacuation ordered toward designated high-ground refuge: ${alertData.shelter?.name || "Govt. Senior Secondary School"}. Do not attempt bridge transit.`}
        </p>

        <div className="flex items-center justify-between pt-1 border-t border-rose-800/60">
          <div className="text-[11px] text-rose-200 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-300" />
            <span>Refuge: <strong className="text-white font-semibold">{alertData.shelter?.name || "Govt. Senior Secondary School"}</strong></span>
          </div>

          <button
            onClick={() => {
              onViewRoute();
              onDismiss();
            }}
            className="bg-white hover:bg-rose-50 text-[#881337] font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm active:scale-95 transition-all"
          >
            <span>Open Evacuation Path</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
