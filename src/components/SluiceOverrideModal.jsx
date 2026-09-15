import React, { useState } from 'react';
import { X, Sliders, AlertTriangle, Check, ShieldAlert } from 'lucide-react';

export default function SluiceOverrideModal({ isOpen, onClose }) {
  const [gateOpening, setGateOpening] = useState(40);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleApply = () => {
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setAppliedSuccess(true);
      setTimeout(() => {
        setAppliedSuccess(false);
        onClose();
      }, 1000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        <div className="bg-[#9a3412] px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5" />
            <h3 className="font-bold text-base tracking-tight">
              Sluice Hydraulic Override
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-slate-800">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              Manual hydraulic override will bypass autonomous discharge algorithms for Rampur Weir #3.
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600">Gate Aperture</span>
              <span className="text-sm font-extrabold text-[#9a3412]">{gateOpening}% Open</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={gateOpening}
              onChange={(e) => setGateOpening(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#9a3412]"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0% (Closed)</span>
              <span>50%</span>
              <span>100% (Full Flood)</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 text-slate-600">
            <div className="flex justify-between">
              <span>Estimated Discharge:</span>
              <span className="font-bold text-slate-900">{(gateOpening * 31).toLocaleString()} m³/sec</span>
            </div>
            <div className="flex justify-between">
              <span>Downstream Warning:</span>
              <span className="font-bold text-red-600">{gateOpening > 50 ? 'Severe Alert' : 'Moderate'}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={isApplying || appliedSuccess}
              className="flex-1 py-3 bg-[#9a3412] hover:bg-[#7c2d12] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 active:scale-95"
            >
              {isApplying ? (
                <span>Executing...</span>
              ) : appliedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Gate Updated</span>
                </>
              ) : (
                <span>Confirm Override</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
