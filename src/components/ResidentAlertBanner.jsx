import React from 'react';
import { AlertOctagon, Navigation, ArrowRight, X, ShieldAlert } from 'lucide-react';

export default function ResidentAlertBanner({ 
  alertData, 
  onViewRoute, 
  onDismiss 
}) {
  if (!alertData) return null;

  return (
    <div className="fixed top-12 left-4 right-4 z-50 animate-in slide-in-from-top duration-300">
      <div className="bg-[#991b1b] text-white rounded-2xl p-3.5 shadow-2xl border-2 border-red-400/80 flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 animate-pulse">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider bg-red-800 px-2 py-0.5 rounded-full border border-red-400/40">
                  ADMIN EVACUATION DISPATCH
                </span>
                <span className="text-[10px] text-red-200">
                  {alertData.timestamp || 'Just now'}
                </span>
              </div>
              <h4 className="text-[14.5px] font-extrabold tracking-tight mt-0.5">
                Safe Escape Route Dispatched
              </h4>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="p-1 rounded-lg hover:bg-white/10 text-red-200 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[12px] text-red-100 font-medium leading-snug">
          {alertData.note || `Rampur Ward flood risk escalated. Move towards designated high ground: ${alertData.shelter?.name || "Govt. School"}. Avoid submerged Rampur bridge.`}
        </p>

        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] font-bold text-red-200">
            Shelter: <span className="text-white underline">{alertData.shelter?.name || "Govt. School, Rampur"}</span>
          </div>

          <button
            onClick={() => {
              onViewRoute();
              onDismiss();
            }}
            className="bg-white hover:bg-red-50 text-[#991b1b] font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1 shadow-md active:scale-95 transition-all"
          >
            <span>View Escape Route</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
