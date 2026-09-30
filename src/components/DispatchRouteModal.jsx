import React, { useState } from 'react';
import { X } from 'lucide-react';

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
  const [customNote, setCustomNote] = useState("Avoid submerged Rampur Bridge. Follow Upper Ridge Track to Govt. School Rampur.");
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
        targetUsers: "1,240 nodes · Sector 4B",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 transition-calm">
      <div 
        role="dialog"
        aria-labelledby="dispatch-dialog-title"
        className="w-full sm:max-w-md bg-[#FAF9F6] dark:bg-[#171B19] border border-[#D8D4CA] dark:border-[#2A302D] rounded-t-[8px] sm:rounded-[8px] shadow-modal overflow-hidden text-[#1A1D1B] dark:text-[#ECEAE4]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#D8D4CA] dark:border-[#2A302D] flex items-center justify-between">
          <div>
            <h3 id="dispatch-dialog-title" className="text-sm font-semibold tracking-tight">
              Dispatch evacuation route
            </h3>
            <p className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D] mt-0.5">
              Target: {wardName} · 1,240 nodes
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded text-[#5C635E] dark:text-[#8A928D] hover:text-[#1A1D1B] dark:hover:text-[#ECEAE4] transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 text-xs">
          {/* Designated Shelter Spec (Data rows) */}
          <div className="border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] p-3 space-y-1.5 bg-[#ECE9E2]/30 dark:bg-[#121514]/40">
            <div className="flex justify-between items-baseline">
              <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-[#5C635E] dark:text-[#8A928D]">
                Designated haven
              </span>
              <span className="font-semibold text-sm text-[#1A1D1B] dark:text-[#ECEAE4]">
                {selectedShelter?.name || "Govt. School, Rampur"}
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-1 border-t border-[#D8D4CA]/60 dark:border-[#2A302D]/60 text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D]">
              <span>Distance: <strong className="text-[#1A1D1B] dark:text-[#ECEAE4]">{selectedShelter?.dist || "1.8 km"}</strong></span>
              <span>Elevation: <strong className="text-[#1A1D1B] dark:text-[#ECEAE4]">{selectedShelter?.elevation || "+14m"}</strong></span>
              <span>Capacity: <strong className="text-[#1A1D1B] dark:text-[#ECEAE4]">{selectedShelter?.capacity || "200"}</strong></span>
            </div>
          </div>

          {/* Route Instruction */}
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-[#5C635E] dark:text-[#8A928D] block mb-1.5">
              Routing instructions
            </span>
            <textarea
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              rows={2}
              className="w-full p-2.5 bg-[#FAF9F6] dark:bg-[#171B19] border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] text-xs font-mono text-[#1A1D1B] dark:text-[#ECEAE4] leading-relaxed resize-none focus:outline-none focus:border-[#1A1D1B] dark:focus:border-[#ECEAE4]"
            />
          </div>

          {/* Delivery Channels */}
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-[#5C635E] dark:text-[#8A928D] block mb-1.5">
              Broadcast channels
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'push', name: 'App push', state: includePush, toggle: () => setIncludePush(!includePush) },
                { key: 'sms', name: 'SMS cell', state: includeSms, toggle: () => setIncludeSms(!includeSms) },
                { key: 'mesh', name: 'BLE mesh', state: includeMesh, toggle: () => setIncludeMesh(!includeMesh) },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={item.toggle}
                  className={`h-10 rounded-[8px] border text-xs font-mono font-medium transition-calm ${
                    item.state 
                      ? 'bg-[#1A1D1B] text-[#FAF9F6] border-[#1A1D1B] dark:bg-[#ECEAE4] dark:text-[#0F1211] dark:border-[#ECEAE4]' 
                      : 'border-[#D8D4CA] dark:border-[#2A302D] text-[#5C635E] dark:text-[#8A928D]'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="h-11 px-4 rounded-[8px] border border-[#D8D4CA] dark:border-[#2A302D] font-medium text-xs text-[#5C635E] dark:text-[#8A928D] hover:text-[#1A1D1B] transition-calm"
            >
              Cancel
            </button>
            <button
              onClick={handleDispatch}
              disabled={isSubmitting}
              className="h-11 px-5 rounded-[8px] font-semibold text-xs text-white bg-[#C1271D] hover:bg-[#A81E15] transition-calm"
            >
              {isSubmitting ? 'Transmitting...' : 'Dispatch evacuation route'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
