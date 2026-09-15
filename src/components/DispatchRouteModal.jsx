import React, { useState } from 'react';
import { X, Send, ShieldCheck, Radio, MessageSquare, Bell, CheckCircle2, AlertTriangle, MapPin } from 'lucide-react';

export default function DispatchRouteModal({ 
  isOpen, 
  onClose, 
  onConfirmDispatch,
  selectedShelter,
  totalShelters = 3,
  wardName = "Rampur Ward"
}) {
  const [includeSms, setIncludeSms] = useState(true);
  const [includePush, setIncludePush] = useState(true);
  const [includeMesh, setIncludeMesh] = useState(true);
  const [customNote, setCustomNote] = useState("Avoid submerged Rampur Bridge. Follow Upper Ridge Track to Govt School.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleDispatch = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onConfirmDispatch({
        shelter: selectedShelter,
        note: customNote,
        channels: { push: includePush, sms: includeSms, mesh: includeMesh },
        targetUsers: "1,240 Residents in Zone 04",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 flex flex-col gap-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#fee2e2] text-[#b91c1c] flex items-center justify-center font-bold">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-slate-900 leading-tight">
                Dispatch Escape Route
              </h3>
              <p className="text-[11.5px] text-slate-500 font-medium">
                Admin Broadcast to Affected Residents
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target & Designated Shelter Overview */}
        <div className="bg-[#fef3eb] border border-[#fed7aa] rounded-2xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#9a3412]">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#c2410c]" />
              Target: {wardName}
            </span>
            <span className="bg-[#ffedd5] px-2 py-0.5 rounded-md text-[10.5px]">
              1,240 Residents
            </span>
          </div>
          <div className="text-[12.5px] text-slate-800 font-medium leading-snug">
            Designated Shelter: <strong className="text-slate-950 font-bold">{selectedShelter?.name || "Govt. School, Rampur"}</strong>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <span>Elevation: {selectedShelter?.elevation || "+14m"}</span>
            <span>•</span>
            <span>Capacity: {selectedShelter?.capacity || "200"} people</span>
            <span>•</span>
            <span className="text-[#16a34a] font-bold">{totalShelters} Pins Active</span>
          </div>
        </div>

        {/* Evacuation Instruction Note */}
        <div>
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
            Evacuation Instructions
          </label>
          <textarea
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            rows={2}
            className="w-full text-xs text-slate-800 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none leading-relaxed"
          />
        </div>

        {/* Broadcast Channels Selection */}
        <div>
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">
            Broadcast Channels
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setIncludePush(!includePush)}
              className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                includePush 
                  ? 'bg-orange-50/80 border-[#9a3412] text-[#9a3412]' 
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span className="text-[10.5px] font-bold">App Push</span>
            </button>

            <button
              type="button"
              onClick={() => setIncludeSms(!includeSms)}
              className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                includeSms 
                  ? 'bg-orange-50/80 border-[#9a3412] text-[#9a3412]' 
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-[10.5px] font-bold">SMS (Hindi)</span>
            </button>

            <button
              type="button"
              onClick={() => setIncludeMesh(!includeMesh)}
              className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                includeMesh 
                  ? 'bg-orange-50/80 border-[#9a3412] text-[#9a3412]' 
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span className="text-[10.5px] font-bold">BLE Mesh</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleDispatch}
            className="flex-1 py-2.5 rounded-xl bg-[#9a3412] hover:bg-[#7c2d12] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-900/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Broadcasting...</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Route</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
